import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://YOUR_PRODUCTION_DOMAIN_HERE", // Replace with actual production domain
];

// Simple in-memory rate limiter (reset on function cold start)
// For production, consider using Redis or Supabase tables
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is in allowlist
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // Default to localhost for dev

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset window
    rateLimiter.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 20000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, 20000);

      // Only retry on transient errors (5xx)
      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);

      // Exponential backoff: 1s, 2s
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      lastError = error as Error;

      // Only retry on network errors, not on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Request failed');
}

interface RequestBody {
  prompt: string;
  labId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

const labSystemPrompts: Record<string, string> = {
  "writing-lab": `You are an expert writing assistant. Help users create, edit, and refine written content including emails, marketing copy, articles, and more. Provide clear, compelling, and well-structured responses.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for bold or emphasis
- NEVER use underscores (_) for italics
- NEVER use hashtags (#) for headers
- NEVER use markdown formatting of any kind
- Write in plain text only
- For emphasis, use UPPERCASE letters or quotation marks
- For section headers, use simple text followed by a colon
- For lists, use simple dashes or numbers

Example of CORRECT formatting:
Important Notes:

Reservations: Make reservations for restaurants
Flexibility: This is just a suggested itinerary
Local Experiences: Talk to locals and visit smaller shops

Example of INCORRECT formatting (DO NOT DO THIS):
**Important Notes:**

* **Reservations:** Make reservations for restaurants
* **Flexibility:** This is just a suggested itinerary`,
  "analysis-lab": `You are a data analysis expert. Help users analyze data, identify patterns and trends, compare datasets, and extract meaningful insights. Provide structured, actionable analysis.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for bold or emphasis
- NEVER use underscores (_) for italics
- NEVER use hashtags (#) for headers
- NEVER use markdown formatting of any kind
- Write in plain text only
- For emphasis, use UPPERCASE letters or quotation marks
- For section headers, use simple text followed by a colon
- For lists, use simple dashes or numbers`,
  "creative-lab": `You are a creative brainstorming partner. Help users generate innovative ideas, develop brand concepts, create marketing campaigns, and explore creative possibilities. Think outside the box and provide unique, actionable suggestions.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for bold or emphasis
- NEVER use underscores (_) for italics
- NEVER use hashtags (#) for headers
- NEVER use markdown formatting of any kind
- Write in plain text only
- For emphasis, use UPPERCASE letters or quotation marks
- For section headers, use simple text followed by a colon
- For lists, use simple dashes or numbers`,
  "strategy-lab": `You are a strategic thinking consultant. Help users build frameworks, make decisions, solve complex problems, and develop strategic plans. Provide structured, logical approaches with clear reasoning.

CRITICAL FORMATTING RULES:
- NEVER use asterisks (*) for bold or emphasis
- NEVER use underscores (_) for italics
- NEVER use hashtags (#) for headers
- NEVER use markdown formatting of any kind
- Write in plain text only
- For emphasis, use UPPERCASE letters or quotation marks
- For section headers, use simple text followed by a colon
- For lists, use simple dashes or numbers`,
  "code-lab": `You are an experienced software engineer. Help users write, debug, and optimize code. Explain technical concepts clearly, provide well-commented code examples, and suggest best practices.

CRITICAL FORMATTING RULES:
- Code blocks and comments are acceptable
- Outside of code blocks: NEVER use asterisks (*) for bold or emphasis
- NEVER use underscores (_) for italics
- NEVER use hashtags (#) for headers
- NEVER use markdown formatting in explanatory text
- Write explanations in plain text only
- For emphasis, use UPPERCASE letters or quotation marks
- For section headers, use simple text followed by a colon
- For lists, use simple dashes or numbers`,
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // A) Require and validate Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Initialize Supabase client to verify JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("JWT validation failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // C) Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { prompt, labId, conversationHistory = [] }: RequestBody = await req.json();

    if (!prompt || !labId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("Gemini API key not configured");
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the conversation with system context
    const systemPrompt = labSystemPrompts[labId] || labSystemPrompts["writing-lab"];

    // Format conversation for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm ready to assist you with that focus." }]
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })),
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];

    // E) Call Gemini API with timeout and retries
    const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

    console.log(`Processing request for user ${userId} with model: gemini-2.0-flash-exp`);

    let geminiResponse: Response;
    try {
      geminiResponse = await fetchWithRetry(
        modelEndpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
        2 // max 2 retries
      );
    } catch (error) {
      // D) Reduce error leakage - generic error to client, detailed log server-side
      console.error("Upstream AI call failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process request. Please try again." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", {
        status: geminiResponse.status,
        error: errorText
      });

      // D) Generic error to client
      return new Response(
        JSON.stringify({ error: "Failed to generate response. Please try again." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("Empty AI response for user:", userId);
      return new Response(
        JSON.stringify({ error: "Received empty response. Please try again." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ response: responseText }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // D) Reduce error leakage
    console.error("Unexpected error in lab-ai-chat:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" },
      }
    );
  }
});
