import {
  checked,
  config,
  db,
  env,
  stripe,
} from "../visibility-customer/shared.ts";
import { verifyStripeSignature } from "../visibility-customer/core.ts";
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const secret = env("VISIBILITY_STRIPE_WEBHOOK_SECRET");
  if (!secret) return new Response("Not configured", { status: 503 });
  const raw = await req.text();
  if (
    !await verifyStripeSignature(
      raw,
      req.headers.get("stripe-signature") || "",
      secret,
    )
  ) return new Response("Invalid signature", { status: 400 });
  try {
    const event = JSON.parse(raw), object = event.data.object, admin = db();
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const id = object.metadata?.visibility_order_id;
      if (!id) return Response.json({ received: true });
      // Re-fetch authoritative payment state. Never fulfill from the success redirect.
      const session = await stripe(
        `checkout/sessions/${encodeURIComponent(object.id)}`,
      );
      if (session.payment_status !== "paid") {
        return Response.json({ received: true });
      }
      const order = checked(
        await admin.from("visibility_orders").select("*").eq("id", id).single(),
      );
      const customer = checked(
        await admin.from("visibility_customers").select("stripe_customer_id")
          .eq("user_id", order.user_id).single(),
      );
      if (
        !customer || session.customer !== customer.stripe_customer_id ||
        session.metadata?.visibility_product !== order.product
      ) throw new Error("Payment ownership mismatch");
      if (order.product === "fix") {
        const intent = await stripe(
          `payment_intents/${
            encodeURIComponent(session.payment_intent)
          }?expand[]=latest_charge`,
        );
        if (intent.status !== "succeeded") {
          return Response.json({ received: true });
        }
        if (intent.latest_charge?.refunded) {
          checked(
            await admin.from("visibility_orders").update({
              status: "refunded",
              stripe_payment_intent_id: intent.id,
            }).eq("id", id),
          );
          return Response.json({ received: true });
        }
        checked(
          await admin.rpc("fulfill_visibility_order", {
            p_event: event.id,
            p_order: id,
            p_session: session.id,
            p_payment: session.payment_intent,
            p_subscription: null,
            p_until: null,
            p_config: config(),
          }),
        );
      }
      // Tracking is granted only by invoice.paid, including the initial invoice.
    }
    if (event.type === "invoice.paid") {
      const invoice = await stripe(`invoices/${encodeURIComponent(object.id)}`);
      const subscriptionId = invoice.subscription ??
        invoice.parent?.subscription_details?.subscription;
      if (!subscriptionId || invoice.status !== "paid") {
        return Response.json({ received: true });
      }
      const sub = await stripe(
        `subscriptions/${encodeURIComponent(subscriptionId)}`,
      );
      const orderId = sub.metadata?.visibility_order_id;
      if (!orderId || sub.metadata?.visibility_product !== "tracking") {
        return Response.json({ received: true });
      }
      const order = checked(
        await admin.from("visibility_orders").select("*").eq("id", orderId)
          .single(),
      );
      const customer = checked(
        await admin.from("visibility_customers").select("stripe_customer_id")
          .eq("user_id", order.user_id).single(),
      );
      if (
        !customer || sub.customer !== customer.stripe_customer_id ||
        order.product !== "tracking"
      ) throw new Error("Subscription ownership mismatch");
      // Invoice lines describe the paid period, unlike a subscription that may already have advanced.
      const lines = invoice.lines?.data ?? [];
      const periods = lines.filter((l: any) =>
        l.price?.id === env("VISIBILITY_TRACKING_PRICE_ID") ||
        l.pricing?.price_details?.price === env("VISIBILITY_TRACKING_PRICE_ID")
      ).map((l: any) => l.period?.end).filter((v: any) => Number.isFinite(v));
      const end = Math.max(...periods);
      if (!Number.isFinite(end)) throw new Error("Missing paid period");
      checked(
        await admin.rpc("fulfill_visibility_order", {
          p_event: event.id,
          p_order: orderId,
          p_session: null,
          p_payment: null,
          p_subscription: sub.id,
          p_until: new Date(end * 1000).toISOString(),
          p_config: config(),
        }),
      );
    }
    if (
      ["customer.subscription.updated", "customer.subscription.deleted"]
        .includes(event.type)
    ) {
      const sub = await stripe(
        `subscriptions/${encodeURIComponent(object.id)}`,
      );
      if (sub.metadata?.visibility_product === "tracking") {
        const updates: Record<string, unknown> = {
          cancel_at_period_end: !!sub.cancel_at_period_end,
        };
        if (["canceled", "unpaid", "incomplete_expired"].includes(sub.status)) {
          updates.status = "canceled";
          updates.paid_until = new Date().toISOString();
        }
        checked(
          await admin.from("visibility_orders").update(updates).eq(
            "stripe_subscription_id",
            sub.id,
          ),
        );
      }
    }
    if (event.type === "charge.refunded") {
      const charge = await stripe(`charges/${encodeURIComponent(object.id)}`);
      if (charge.refunded && charge.payment_intent) {
        checked(
          await admin.from("visibility_orders").update({ status: "refunded" })
            .eq("stripe_payment_intent_id", charge.payment_intent),
        );
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error(
      "visibility payment processing failed",
      error instanceof Error ? error.message : "unknown",
    );
    return new Response("Please retry", { status: 500 });
  }
});
