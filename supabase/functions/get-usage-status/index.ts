import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PLAN_LIMITS: Record<string, number> = {
  free: 15,
  pro: 120,
};

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
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

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

    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('plan, features, token_balance, monthly_token_allowance, token_reset_at')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    const effectivePlan = entitlement?.plan || 'free';
    const dailyLimit = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;
    const todayUTC = getTodayUTC();

    const { data: usageData } = await supabase
      .from('ai_usage_daily')
      .select('count')
      .eq('user_id', userId)
      .eq('day', todayUTC)
      .maybeSingle();

    const used = usageData?.count || 0;
    const remaining = Math.max(0, dailyLimit - used);
    const resetsAt = getNextMidnightUTC();

    return new Response(
      JSON.stringify({
        plan: effectivePlan,
        limit: dailyLimit,
        used: used,
        remaining: remaining,
        resets_at: resetsAt,
        token_balance: entitlement?.token_balance || 0,
        monthly_token_allowance: entitlement?.monthly_token_allowance || 0,
        token_reset_at: entitlement?.token_reset_at || null,
        features: entitlement?.features || { labs: true, exports: false, priority_support: false, network: false },
        subscription_status: subscription?.status || null,
        current_period_end: subscription?.current_period_end || null,
        cancel_at_period_end: subscription?.cancel_at_period_end || false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in get-usage-status:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
