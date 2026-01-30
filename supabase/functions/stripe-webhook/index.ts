import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
};

function extractSignatureElements(signatureHeader: string): { timestamp: string; signature: string } {
  const elements = signatureHeader.split(",");
  let timestamp = "";
  let signature = "";

  for (const element of elements) {
    const [key, value] = element.split("=");
    if (key === "t") {
      timestamp = value;
    }
    if (key === "v1") {
      signature = value;
    }
  }

  if (!timestamp || !signature) {
    throw new Error("Invalid Stripe signature header");
  }

  return { timestamp, signature };
}

async function computeSignature(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const signatureBytes = new Uint8Array(signatureBuffer);
  return Array.from(signatureBytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchStripeSubscription(
  stripeSecretKey: string,
  subscriptionId: string
): Promise<{ status: string; current_period_end: number } | null> {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch Stripe subscription:", errorText);
    return null;
  }

  const data = await response.json();
  return {
    status: data.status as string,
    current_period_end: data.current_period_end as number,
  };
}

function toIsoStringFromUnix(timestamp: number | null | undefined): string | null {
  if (!timestamp) {
    return null;
  }
  return new Date(timestamp * 1000).toISOString();
}

async function updateBillingProfile(
  supabaseAdmin: ReturnType<typeof createClient>,
  stripeCustomerId: string,
  updates: Record<string, string | null>
) {
  const { error } = await supabaseAdmin
    .from("billing_profiles")
    .update(updates)
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("Failed to update billing profile:", error.message);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeWebhookSecret || !stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Webhook configuration missing");
    return new Response("Configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const signatureHeader = req.headers.get("stripe-signature");
  if (!signatureHeader) {
    return new Response("Missing Stripe signature", {
      status: 400,
      headers: corsHeaders,
    });
  }

  let payload: string;
  try {
    payload = await req.text();
  } catch (error) {
    console.error("Failed to read request body:", error);
    return new Response("Invalid payload", {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const { timestamp, signature } = extractSignatureElements(signatureHeader);
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = await computeSignature(stripeWebhookSecret, signedPayload);

    if (expectedSignature !== signature) {
      console.error("Stripe signature verification failed");
      return new Response("Invalid signature", {
        status: 400,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error("Stripe signature error:", error);
    return new Response("Invalid signature", {
      status: 400,
      headers: corsHeaders,
    });
  }

  let event: { type: string; data: { object: Record<string, any> } };
  try {
    event = JSON.parse(payload);
  } catch (error) {
    console.error("Failed to parse event:", error);
    return new Response("Invalid event payload", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const stripeCustomerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (!stripeCustomerId) {
          break;
        }

        let subscriptionData = null;
        if (subscriptionId) {
          subscriptionData = await fetchStripeSubscription(stripeSecretKey, subscriptionId);
        }

        const status = subscriptionData?.status ?? "active";
        const currentPeriodEnd = toIsoStringFromUnix(subscriptionData?.current_period_end);

        await updateBillingProfile(supabaseAdmin, stripeCustomerId, {
          subscription_status: status,
          current_period_end: currentPeriodEnd,
          plan: "pro",
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string | undefined;
        const status = subscription.status as string | undefined;
        const currentPeriodEnd = toIsoStringFromUnix(subscription.current_period_end as number | undefined);

        if (!stripeCustomerId || !status) {
          break;
        }

        const isActive = status === "active" || status === "trialing";

        await updateBillingProfile(supabaseAdmin, stripeCustomerId, {
          subscription_status: status,
          current_period_end: currentPeriodEnd,
          plan: isActive ? "pro" : "free",
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response("Webhook handler error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
