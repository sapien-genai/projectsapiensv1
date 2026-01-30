import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://YOUR_PRODUCTION_DOMAIN_HERE",
];

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

async function createStripeCustomer(
  stripeSecretKey: string,
  email: string | null,
  userId: string
): Promise<string> {
  const body = new URLSearchParams();
  if (email) {
    body.append("email", email);
  }
  body.append("metadata[user_id]", userId);

  const response = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe customer creation failed: ${errorText}`);
  }

  const data = await response.json();
  return data.id as string;
}

async function createCheckoutSession(
  stripeSecretKey: string,
  payload: URLSearchParams
): Promise<{ url: string; id: string }> {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe checkout session failed: ${errorText}`);
  }

  const data = await response.json();
  return { url: data.url as string, id: data.id as string };
}

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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");
    const successUrl = Deno.env.get("STRIPE_SUCCESS_URL");
    const cancelUrl = Deno.env.get("STRIPE_CANCEL_URL");

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

    if (!stripeSecretKey || !stripePriceId || !successUrl || !cancelUrl) {
      console.error("Stripe configuration missing");
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);

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

    const { data: billingProfile, error: billingError } = await supabaseAdmin
      .from("billing_profiles")
      .select("stripe_customer_id, plan_override, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (billingError) {
      console.error("Failed to fetch billing profile:", billingError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch billing profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let stripeCustomerId = billingProfile?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(stripeSecretKey, user.email, user.id);

      const { error: upsertError } = await supabaseAdmin
        .from("billing_profiles")
        .upsert({
          user_id: user.id,
          plan: billingProfile?.plan ?? "free",
          stripe_customer_id: stripeCustomerId,
        });

      if (upsertError) {
        console.error("Failed to update billing profile:", upsertError.message);
        return new Response(
          JSON.stringify({ error: "Failed to update billing profile" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer", stripeCustomerId);
    params.append("line_items[0][price]", stripePriceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("allow_promotion_codes", "true");
    params.append("client_reference_id", user.id);
    params.append("metadata[user_id]", user.id);
    params.append("subscription_data[metadata][user_id]", user.id);

    const session = await createCheckoutSession(stripeSecretKey, params);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
