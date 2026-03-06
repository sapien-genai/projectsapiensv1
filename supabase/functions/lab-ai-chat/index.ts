import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";
const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-1.5-flash";

type LabRunStatus = "pending" | "success" | "error";

const PLAN_LIMITS: Record<string, number> = {
  free: 15,
  pro: 120,
};

const writingModePrompts: Record<string, string> = {
  rewrite_clearer: "Rewrite the user's text to be clearer while preserving the original meaning.",
  rewrite_shorter: "Rewrite the user's text to be shorter and more concise while preserving key points.",
  rewrite_more_professional: "Rewrite the user's text with a more professional tone and polished language.",
  rewrite_more_persuasive: "Rewrite the user's text to be more persuasive while staying credible and specific.",
  summarize: "Summarize the user's text with key points and actionable takeaways.",
  title_suggestions: "Generate multiple clear, compelling title suggestions for the user's text.",
};

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
  return now.toISOString().split("T")[0];
}

function getNextMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isConversationHistory(
  value: unknown,
): value is Array<{ role: string; content: string }> {
  if (value === undefined) {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((entry) => {
    return (
      entry &&
      typeof entry === "object" &&
      isNonEmptyString((entry as { role?: unknown }).role) &&
      isNonEmptyString((entry as { content?: unknown }).content)
    );
  });
}

function getGeminiEndpoint(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
}

function shouldFallbackModel(status: number, providerText: string): boolean {
  if (status === 404) {
    return true;
  }

  const lowered = providerText.toLowerCase();
  return (
    lowered.includes("invalid model") ||
    lowered.includes("model not found") ||
    lowered.includes("not found") && lowered.includes("models/")
  );
}

function parseProviderErrorText(providerText: string): string {
  try {
    const parsed = JSON.parse(providerText);
    return parsed?.error?.message || providerText;
  } catch {
    return providerText;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 20000,
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
  maxRetries: number = 2,
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
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error("Request failed");
}

function extractTextFromSseData(data: string): string {
  if (!data || data === "[DONE]") {
    return "";
  }

  try {
    const parsed = JSON.parse(data) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
    return isNonEmptyString(text) ? text : "";
  } catch {
    return "";
  }
}

interface RequestBody {
  prompt: string;
  labId: string;
  mode?: string;
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

function buildSystemPrompt(labId: string, mode?: string): string {
  const basePrompt = labSystemPrompts[labId] || labSystemPrompts["writing-lab"];

  if (labId !== "writing-lab" || !mode) {
    return basePrompt;
  }

  const modePrompt = writingModePrompts[mode];
  if (!modePrompt) {
    return basePrompt;
  }

  return `${basePrompt}\n\nWRITING MODE INSTRUCTION:\n${modePrompt}`;
}

async function createLabRun(
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: {
    userId: string;
    labId: string;
    mode: string | null;
    prompt: string;
    provider: string;
    model: string;
  },
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("lab_runs")
    .insert({
      user_id: payload.userId,
      lab_id: payload.labId,
      mode: payload.mode,
      input_text: payload.prompt,
      status: "pending",
      provider: payload.provider,
      model: payload.model,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("lab_runs insert skipped:", error.message);
    return null;
  }

  return data.id;
}

async function updateLabRun(
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: {
    runId: string | null;
    status: LabRunStatus;
    outputText?: string;
    model?: string;
    errorMessage?: string;
  },
): Promise<void> {
  if (!payload.runId) {
    return;
  }

  const updates: Record<string, unknown> = {
    status: payload.status,
    completed_at: new Date().toISOString(),
  };

  if (payload.outputText !== undefined) {
    updates.output_text = payload.outputText;
  }

  if (payload.model !== undefined) {
    updates.model = payload.model;
  }

  if (payload.errorMessage !== undefined) {
    updates.error_message = payload.errorMessage;
  }

  const { error } = await supabaseAdmin
    .from("lab_runs")
    .update(updates)
    .eq("id", payload.runId);

  if (error) {
    console.warn("lab_runs update skipped:", error.message);
  }
}

Deno.serve(async (req: Request) => {
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
        },
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
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("JWT validation failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
        },
      );
    }

    // Fetch or create billing profile
    const { data: initialBillingProfile, error: billingError } = await supabaseAdmin
      .from("billing_profiles")
      .select("plan, plan_override")
      .eq("user_id", userId)
      .maybeSingle();

    if (billingError) {
      console.error("Error fetching billing profile:", billingError);
      return new Response(
        JSON.stringify({ error: "Unable to verify account status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let billingProfile = initialBillingProfile;

    if (!billingProfile) {
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("billing_profiles")
        .insert({ user_id: userId, plan: "free" })
        .select("plan, plan_override")
        .single();

      if (insertError) {
        console.error("Error creating billing profile:", insertError);
        return new Response(
          JSON.stringify({ error: "Unable to initialize account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      billingProfile = newProfile;
    }

    const effectivePlan = billingProfile.plan_override || billingProfile.plan;
    const dailyLimit = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;
    const todayUTC = getTodayUTC();

    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("ai_usage_daily")
      .select("count")
      .eq("user_id", userId)
      .eq("day", todayUTC)
      .maybeSingle();

    if (usageError) {
      console.error("Error fetching usage data:", usageError);
      return new Response(
        JSON.stringify({ error: "Unable to verify usage limits" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
          plan: effectivePlan,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: unknown = await req.json();
    const { prompt, labId, mode, conversationHistory = [] } = (body || {}) as RequestBody;

    if (!isNonEmptyString(prompt) || !isNonEmptyString(labId) || !isConversationHistory(conversationHistory)) {
      return new Response(
        JSON.stringify({
          error: "invalid_request",
          message: "Request must include a non-empty prompt, labId, and optional valid conversationHistory.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (mode !== undefined && !isNonEmptyString(mode)) {
      return new Response(
        JSON.stringify({
          error: "invalid_request",
          message: "mode must be a non-empty string when provided.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const geminiModel = Deno.env.get("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL;
    const geminiFallbackModel = Deno.env.get("GEMINI_FALLBACK_MODEL") || DEFAULT_GEMINI_FALLBACK_MODEL;

    if (!geminiApiKey) {
      console.error("Gemini API key not configured");
      return new Response(
        JSON.stringify({
          error: "ai_model_unavailable",
          message: "The AI model is temporarily unavailable.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const normalizedMode = mode?.trim();
    const systemPrompt = buildSystemPrompt(labId.trim(), normalizedMode);

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm ready to assist you with that focus." }],
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt.trim() }],
      },
    ];

    console.log(
      `lab-ai-chat request start userId=${userId} labId=${labId.trim()} mode=${normalizedMode || "none"} plan=${effectivePlan} usage=${currentCount + 1}/${dailyLimit} primaryModel=${geminiModel} fallbackModel=${geminiFallbackModel}`,
    );

    let modelUsed = geminiModel;
    const runId: string | null = await createLabRun(supabaseAdmin, {
      userId,
      labId: labId.trim(),
      mode: normalizedMode || null,
      prompt: prompt.trim(),
      provider: "gemini",
      model: modelUsed,
    });

    let geminiResponseStream: Response | null = null;

    const modelCandidates = geminiModel === geminiFallbackModel
      ? [geminiModel]
      : [geminiModel, geminiFallbackModel];

    let lastProviderStatus = 0;
    let lastProviderError = "";

    for (let index = 0; index < modelCandidates.length; index++) {
      modelUsed = modelCandidates[index];
      const endpoint = getGeminiEndpoint(modelUsed, geminiApiKey);

      try {
        const geminiResponse = await fetchWithRetry(
          endpoint,
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
          2,
        );

        if (!geminiResponse.ok) {
          const providerText = await geminiResponse.text();
          lastProviderStatus = geminiResponse.status;
          lastProviderError = providerText;

          console.error("Gemini API error", {
            status: geminiResponse.status,
            model: modelUsed,
            providerResponseText: providerText,
          });

          const canFallback =
            index === 0 &&
            modelCandidates.length > 1 &&
            shouldFallbackModel(geminiResponse.status, providerText);

          if (canFallback) {
            console.warn(`Retrying Gemini with fallback model=${geminiFallbackModel}`);
            continue;
          }

          await updateLabRun(supabaseAdmin, {
            runId,
            status: "error",
            model: modelUsed,
            errorMessage: parseProviderErrorText(providerText).slice(0, 1000),
          });

          const providerErrorCode = shouldFallbackModel(geminiResponse.status, providerText)
            ? "ai_model_unavailable"
            : "ai_provider_error";
          const providerErrorMessage = shouldFallbackModel(geminiResponse.status, providerText)
            ? "The AI model is temporarily unavailable."
            : "The AI provider returned an error.";

          return new Response(
            JSON.stringify({
              error: providerErrorCode,
              message: providerErrorMessage,
            }),
            {
              status: 503,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        geminiResponseStream = geminiResponse;
        break;
      } catch (error) {
        const isTimeoutError = error instanceof Error && error.message === "Request timeout";
        console.error("Upstream AI call failed", {
          model: modelUsed,
          timeout: isTimeoutError,
          error: error instanceof Error ? error.message : String(error),
        });

        if (isTimeoutError) {
          await updateLabRun(supabaseAdmin, {
            runId,
            status: "error",
            model: modelUsed,
            errorMessage: "Request timeout",
          });

          return new Response(
            JSON.stringify({
              error: "ai_timeout",
              message: "The AI request timed out.",
            }),
            {
              status: 504,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        const canFallback = index === 0 && modelCandidates.length > 1;
        if (canFallback) {
          console.warn(`Primary model call failed, trying fallback model=${geminiFallbackModel}`);
          continue;
        }

        await updateLabRun(supabaseAdmin, {
          runId,
          status: "error",
          model: modelUsed,
          errorMessage: error instanceof Error ? error.message.slice(0, 1000) : "Unknown AI error",
        });

        return new Response(
          JSON.stringify({
            error: "ai_provider_error",
            message: "The AI provider returned an error.",
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    if (!geminiResponseStream) {
      await updateLabRun(supabaseAdmin, {
        runId,
        status: "error",
        model: modelUsed,
        errorMessage: parseProviderErrorText(lastProviderError || "Empty provider response").slice(0, 1000),
      });

      return new Response(
        JSON.stringify({
          error: lastProviderStatus === 404 ? "ai_model_unavailable" : "ai_provider_error",
          message: lastProviderStatus === 404
            ? "The AI model is temporarily unavailable."
            : "The AI provider returned an error.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!geminiResponseStream.body) {
      await updateLabRun(supabaseAdmin, {
        runId,
        status: "error",
        model: modelUsed,
        errorMessage: "Empty AI response stream",
      });

      return new Response(
        JSON.stringify({
          error: "ai_empty_response",
          message: "The AI returned an empty response.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: upsertError } = await supabaseAdmin
      .from("ai_usage_daily")
      .upsert(
        {
          user_id: userId,
          day: todayUTC,
          count: currentCount + 1,
          last_request_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,day",
        },
      );

    if (upsertError) {
      console.error("Error updating usage count:", upsertError);
    }

    const [clientStream, loggingStream] = geminiResponseStream.body.tee();

    (async () => {
      const reader = loggingStream.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let sseBuffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data: ")) {
              continue;
            }

            accumulatedText += extractTextFromSseData(line.slice(6).trim());
          }
        }

        sseBuffer += decoder.decode();

        const finalLine = sseBuffer.trim();
        if (finalLine.startsWith("data: ")) {
          accumulatedText += extractTextFromSseData(finalLine.slice(6).trim());
        }

        if (!isNonEmptyString(accumulatedText)) {
          await updateLabRun(supabaseAdmin, {
            runId,
            status: "error",
            model: modelUsed,
            errorMessage: "Empty AI response",
          });
          return;
        }

        await updateLabRun(supabaseAdmin, {
          runId,
          status: "success",
          model: modelUsed,
          outputText: accumulatedText,
        });

        console.log(
          `lab-ai-chat request complete userId=${userId} labId=${labId.trim()} mode=${normalizedMode || "none"} plan=${effectivePlan} modelUsed=${modelUsed}`,
        );
      } catch (streamError) {
        console.error("Failed while reading Gemini stream", streamError);
        await updateLabRun(supabaseAdmin, {
          runId,
          status: "error",
          model: modelUsed,
          errorMessage: streamError instanceof Error ? streamError.message.slice(0, 1000) : "Stream processing error",
        });
      } finally {
        reader.releaseLock();
      }
    })();

    return new Response(clientStream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Unexpected error in lab-ai-chat:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
