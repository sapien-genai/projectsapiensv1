import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
};

const MONTHLY_TOKEN_ALLOWANCE = 500000;
const YEARLY_TOKEN_ALLOWANCE = 6500000;

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

async function getUserIdFromStripeCustomer(
  supabaseAdmin: ReturnType<typeof createClient>,
  stripeCustomerId: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to find user for Stripe customer:", stripeCustomerId, error);
    return null;
  }

  return data.id;
}

async function grantTokens(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  amount: number,
  source: string,
  refId: string
) {
  const { error: ledgerError } = await supabaseAdmin
    .from("token_ledger")
    .insert({
      user_id: userId,
      type: "grant",
      amount,
      source,
      ref_id: refId,
      metadata: { description: `Token grant from ${source}` },
    });

  if (ledgerError) {
    console.error("Failed to insert token ledger entry:", ledgerError.message);
    return;
  }

  const { error: balanceError } = await supabaseAdmin.rpc("increment_token_balance", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (balanceError) {
    const { data: currentEntitlement } = await supabaseAdmin
      .from("entitlements")
      .select("token_balance")
      .eq("user_id", userId)
      .single();

    const newBalance = (currentEntitlement?.token_balance || 0) + amount;

    const { error: updateError } = await supabaseAdmin
      .from("entitlements")
      .update({ token_balance: newBalance })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update token balance:", updateError.message);
    }
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
        const clientReferenceId = session.client_reference_id as string | undefined;
        const mode = session.mode as string | undefined;

        if (!stripeCustomerId || mode !== "subscription") {
          break;
        }

        const userId = clientReferenceId || await getUserIdFromStripeCustomer(supabaseAdmin, stripeCustomerId);
        if (!userId) {
          console.error("Cannot find user for checkout session");
          break;
        }

        if (!subscriptionId) {
          break;
        }

        const subscriptionData = await fetchStripeSubscription(stripeSecretKey, subscriptionId);
        if (!subscriptionData) {
          break;
        }

        const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${stripeSecretKey}` },
        });

        let priceId = "";
        if (response.ok) {
          const fullSub = await response.json();
          priceId = fullSub.items?.data?.[0]?.price?.id || "";
        }

        const tokenAllowance = priceId.includes("yearly") ? YEARLY_TOKEN_ALLOWANCE : MONTHLY_TOKEN_ALLOWANCE;

        await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscriptionData.status,
            current_period_start: toIsoStringFromUnix(subscriptionData.current_period_end - 2592000),
            current_period_end: toIsoStringFromUnix(subscriptionData.current_period_end),
            cancel_at_period_end: false,
          });

        await supabaseAdmin
          .from("entitlements")
          .update({
            plan: "pro",
            features: {
              labs: true,
              exports: true,
              priority_support: true,
              network: true,
            },
            monthly_token_allowance: tokenAllowance,
            token_reset_at: toIsoStringFromUnix(subscriptionData.current_period_end),
          })
          .eq("user_id", userId);

        await grantTokens(supabaseAdmin, userId, tokenAllowance, "subscription_start", subscriptionId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string | undefined;
        const status = subscription.status as string | undefined;
        const subscriptionId = subscription.id as string | undefined;
        const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined;

        if (!stripeCustomerId || !status || !subscriptionId) {
          break;
        }

        const userId = await getUserIdFromStripeCustomer(supabaseAdmin, stripeCustomerId);
        if (!userId) {
          break;
        }

        const isActive = status === "active" || status === "trialing";
        const tokenAllowance = priceId?.includes("yearly") ? YEARLY_TOKEN_ALLOWANCE : MONTHLY_TOKEN_ALLOWANCE;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status,
            stripe_price_id: priceId || "",
            current_period_start: toIsoStringFromUnix(subscription.current_period_start as number),
            current_period_end: toIsoStringFromUnix(subscription.current_period_end as number),
            cancel_at_period_end: subscription.cancel_at_period_end as boolean,
            canceled_at: subscription.canceled_at ? toIsoStringFromUnix(subscription.canceled_at as number) : null,
          })
          .eq("user_id", userId);

        await supabaseAdmin
          .from("entitlements")
          .update({
            plan: isActive ? "pro" : "free",
            features: isActive
              ? { labs: true, exports: true, priority_support: true, network: true }
              : { labs: true, exports: false, priority_support: false, network: false },
            monthly_token_allowance: isActive ? tokenAllowance : 0,
          })
          .eq("user_id", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string | undefined;

        if (!stripeCustomerId) {
          break;
        }

        const userId = await getUserIdFromStripeCustomer(supabaseAdmin, stripeCustomerId);
        if (!userId) {
          break;
        }

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        await supabaseAdmin
          .from("entitlements")
          .update({
            plan: "free",
            features: { labs: true, exports: false, priority_support: false, network: false },
            monthly_token_allowance: 0,
          })
          .eq("user_id", userId);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string | undefined;
        const subscriptionId = invoice.subscription as string | undefined;
        const billingReason = invoice.billing_reason as string | undefined;

        if (!stripeCustomerId || !subscriptionId) {
          break;
        }

        if (billingReason === "subscription_cycle") {
          const userId = await getUserIdFromStripeCustomer(supabaseAdmin, stripeCustomerId);
          if (!userId) {
            break;
          }

          const { data: entitlement } = await supabaseAdmin
            .from("entitlements")
            .select("monthly_token_allowance, plan")
            .eq("user_id", userId)
            .single();

          if (entitlement?.plan === "pro" && entitlement.monthly_token_allowance > 0) {
            await grantTokens(
              supabaseAdmin,
              userId,
              entitlement.monthly_token_allowance,
              "subscription_cycle",
              invoice.id as string
            );

            const { data: subscription } = await supabaseAdmin
              .from("subscriptions")
              .select("current_period_end")
              .eq("user_id", userId)
              .single();

            if (subscription) {
              await supabaseAdmin
                .from("entitlements")
                .update({ token_reset_at: subscription.current_period_end })
                .eq("user_id", userId);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string | undefined;

        if (!stripeCustomerId) {
          break;
        }

        const userId = await getUserIdFromStripeCustomer(supabaseAdmin, stripeCustomerId);
        if (!userId) {
          break;
        }

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", userId);
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
