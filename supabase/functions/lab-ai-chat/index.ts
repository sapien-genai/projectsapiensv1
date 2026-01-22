import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://YOUR_PRODUCTION_DOMAIN_HERE",
];

const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const PLAN_LIMITS: Record<string, number> = {
  free: 15,
  pro: 120,
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

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

function getTodayUTC(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getNextMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
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

      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      lastError = error as Error;

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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

    // Fetch or create billing profile
    let { data: billingProfile, error: billingError } = await supabaseAdmin
      .from('billing_profiles')
      .select('plan, plan_override')
      .eq('user_id', userId)
      .maybeSingle();

    if (billingError) {
      console.error("Error fetching billing profile:", billingError);
      return new Response(
        JSON.stringify({ error: "Unable to verify account status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!billingProfile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('billing_profiles')
        .insert({ user_id: userId, plan: 'free' })
        .select('plan, plan_override')
        .single();

      if (insertError) {
        console.error("Error creating billing profile:", insertError);
        return new Response(
          JSON.stringify({ error: "Unable to initialize account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      billingProfile = newProfile;
    }

    const effectivePlan = billingProfile.plan_override || billingProfile.plan;
    const dailyLimit = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;
    const todayUTC = getTodayUTC();

    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('ai_usage_daily')
      .select('count')
      .eq('user_id', userId)
      .eq('day', todayUTC)
      .maybeSingle();

    if (usageError) {
      console.error("Error fetching usage data:", usageError);
      return new Response(
        JSON.stringify({ error: "Unable to verify usage limits" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentCount = usageData?.count || 0;

    if (currentCount >= dailyLimit) {
      const resetsAt = getNextMidnightUTC();
      console.warn(`Daily limit reached for user ${userId}: ${currentCount}/${dailyLimit}`);
      return new Response(
        JSON.stringify({
          error: "limit_reached",
          message: "You've reached today's AI practice limit.",
          limit: dailyLimit,
          used: currentCount,
          resets_at: resetsAt,
          plan: effectivePlan
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const systemPrompt = labSystemPrompts[labId] || labSystemPrompts["writing-lab"];

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

    const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

    console.log(`Processing request for user ${userId} (${effectivePlan} plan: ${currentCount + 1}/${dailyLimit})`);

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
        2
      );
    } catch (error) {
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

    const { error: upsertError } = await supabaseAdmin
      .from('ai_usage_daily')
      .upsert(
        {
          user_id: userId,
          day: todayUTC,
          count: currentCount + 1,
          last_request_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,day',
        }
      );

    if (upsertError) {
      console.error("Error updating usage count:", upsertError);
    }

    return new Response(
      JSON.stringify({ response: responseText }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
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
