import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, labId, conversationHistory = [] }: RequestBody = await req.json();

    if (!prompt || !labId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt and labId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
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

    // Call Gemini API with gemini-2.0-flash-exp (latest available model)
    const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

    console.log("Calling Gemini API with model: gemini-2.0-flash-exp");

    const geminiResponse = await fetch(
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
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error response:", {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        error: errorText
      });

      let errorMessage = "Failed to generate response from AI";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          status: geminiResponse.status
        }),
        {
          status: geminiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received successfully");

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("No response text in Gemini data:", JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({
          error: "AI response was empty",
          details: "The model returned an empty response"
        }),
        {
          status: 500,
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
    console.error("Error in lab-ai-chat:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});