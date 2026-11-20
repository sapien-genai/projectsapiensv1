import { businessProfile } from "./profile.ts";
import { checked, db, env, siteOrigin, stripe } from "./shared.ts";
import { canSaveReport, fixedQuestions, type Product } from "./core.ts";
import type { Report } from "../visibility-report/core/types.ts";
const uuid = (v: unknown) =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
const prices = () => ({
  fix: env("VISIBILITY_FIX_PRICE_ID"),
  tracking: env("VISIBILITY_TRACKING_PRICE_ID"),
});
let catalogCache: { until: number; value: Record<string, unknown> } | null =
  null;
async function catalog() {
  if (catalogCache && catalogCache.until > Date.now()) {
    return catalogCache.value;
  }
  const result: Record<string, unknown> = {};
  for (const product of ["fix", "tracking"] as Product[]) {
    const id = prices()[product];
    if (!id) {
      result[product] = null;
      continue;
    }
    let price;
    try {
      price = await stripe(`prices/${encodeURIComponent(id)}`);
    } catch (error) {
      console.error("visibility price lookup failed", {
        product,
        errorType: error instanceof Error ? error.name : "unknown",
      });
      result[product] = null;
      continue;
    }
    const valid = price.active && price.currency === "usd" &&
      Number.isInteger(price.unit_amount) && price.unit_amount > 0 &&
      (product === "fix"
        ? !price.recurring
        : price.recurring?.interval === "month" &&
          price.recurring?.interval_count === 1);
    result[product] = valid
      ? {
        amount: price.unit_amount,
        currency: price.currency,
        interval: product === "tracking" ? "month" : null,
        enabled: env("VISIBILITY_CHECKOUT_ENABLED") === "true",
      }
      : null;
  }
  catalogCache = { until: Date.now() + 60000, value: result };
  return result;
}
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const allowed = [
    siteOrigin(),
    ...(env("VISIBILITY_DEV_ORIGIN") ? [env("VISIBILITY_DEV_ORIGIN")] : []),
  ];
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin && allowed.includes(origin)
      ? origin
      : siteOrigin(),
    "Access-Control-Allow-Headers":
      "authorization,apikey,content-type,x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST" || (origin && !allowed.includes(origin))) {
    return json({ error: "Request not allowed." }, 403);
  }
  try {
    const body = await req.json();
    if (body.action === "catalog") return json(await catalog());
    const admin = db();
    const token = req.headers.get("authorization")?.replace(/^Bearer /i, "") ||
      "";
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user?.email_confirmed_at) {
      return json({ error: "Sign in with a verified email to continue." }, 401);
    }
    if (body.action === "save_report") {
      if (!uuid(body.report_id)) {
        return json({ error: "Choose a completed report." }, 400);
      }
      const reportRow = checked(
        await admin.from("visibility_reports").select("report,status").eq(
          "id",
          body.report_id,
        ).maybeSingle(),
      );
      const report = reportRow?.report as Report | undefined;
      if (!canSaveReport(reportRow?.status, report)) {
        return json({
          error:
            "A readable website and completed report are required. Run a new free check first.",
        }, 400);
      }
      const existing = checked(
        await admin.from("visibility_projects").select("id").eq(
          "user_id",
          user.id,
        ).eq("domain", report.domain).maybeSingle(),
      );
      if (existing) {
        // Keep the original purchase snapshot and fixed tracking questions intact.
        checked(await admin.from("visibility_projects").update({
          latest_report_id: body.report_id,
          latest_report_generated_at: report.generatedAt,
        }).eq("id", existing.id).eq("user_id", user.id));
        return json(existing);
      }
      const count = await admin.from("visibility_projects").select("id", {
        count: "exact",
        head: true,
      }).eq("user_id", user.id);
      if (count.error) throw new Error("Could not check saved websites.");
      if ((count.count ?? 0) >= 5) {
        return json({ error: "You can save up to five websites." }, 400);
      }
      let questions;
      try {
        questions = fixedQuestions(report);
      } catch {
        return json({
          error:
            "This report does not contain a usable question set. Please run another free check.",
        }, 400);
      }
      const saved = await admin.from("visibility_projects").insert({
        user_id: user.id,
        report_id: body.report_id,
        domain: report.domain,
        business_name: report.profile.name,
        report,
        questions,
      }).select("id").single();
      if (saved.error?.code === "23505") {
        return json(
          checked(
            await admin.from("visibility_projects").select("id").eq(
              "user_id",
              user.id,
            ).eq("domain", report.domain).single(),
          ),
        );
      }
      return json(checked(saved));
    }
    if (body.action === "dashboard") {
      const projects = checked(
        await admin.from("visibility_projects").select("*").eq(
          "user_id",
          user.id,
        ).order("created_at", { ascending: false }),
      );
      const ids = (projects ?? []).map((p) => p.id);
      if (!ids.length) {
        return json({
          projects,
          orders: [],
          jobs: [],
          tasks: [],
          changes: [],
          catalog: await catalog(),
        });
      }
      const orders = checked(
        await admin.from("visibility_orders").select(
          "id,project_id,product,status,paid_until,cancel_at_period_end,created_at",
        ).eq("user_id", user.id),
      );
      const jobs = checked(
        await admin.from("visibility_customer_jobs").select("*").in(
          "project_id",
          ids,
        ).order("created_at", { ascending: false }).limit(100),
      );
      const tasks: Record<string, unknown>[] = [];
      if (jobs?.length) {
        // Supabase caps one page at 1,000 rows. Preserve full answer coverage.
        for (let offset = 0; offset < 2000; offset += 1000) {
          const page = checked(
            await admin.from("visibility_customer_tasks")
              .select("*").in("job_id", jobs.map((j) => j.id))
              .order("id").range(offset, offset + 999),
          ) ?? [];
          tasks.push(...page);
          if (page.length < 1000) break;
        }
      }
      const changes = checked(
        await admin.from("visibility_customer_changes").select("*").in(
          "project_id",
          ids,
        ).order("created_at", { ascending: false }).limit(100),
      );
      return json({
        projects,
        orders,
        jobs,
        tasks,
        changes,
        catalog: await catalog(),
      });
    }
    if (!uuid(body.project_id)) {
      return json({ error: "Choose a saved website." }, 400);
    }
    const project = checked(
      await admin.from("visibility_projects").select("*").eq(
        "id",
        body.project_id,
      ).eq("user_id", user.id).maybeSingle(),
    );
    if (!project) return json({ error: "Website not found." }, 404);
    if (body.action === "save_profile") {
      let profile: Record<string, string>;
      try { profile = businessProfile(body.profile); }
      catch (e) { return json({ error: e instanceof Error ? e.message : "Invalid profile." }, 400); }
      checked(await admin.from("visibility_projects").update({ business_profile: profile }).eq("id", project.id).eq("user_id", user.id));
      return json({ saved: true });
    }
    if (body.action === "note") {
      const note = typeof body.note === "string" ? body.note.trim() : "";
      if (!note || note.length > 2000) {
        return json(
          { error: "Use 1–2,000 characters for your change note." },
          400,
        );
      }
      checked(
        await admin.from("visibility_customer_changes").insert({
          project_id: project.id,
          note,
        }),
      );
      return json({ saved: true });
    }
    if (body.action === "portal") {
      const customer = checked(
        await admin.from("visibility_customers").select("stripe_customer_id")
          .eq("user_id", user.id).maybeSingle(),
      );
      if (!customer?.stripe_customer_id) {
        return json({ error: "No billing account yet." }, 400);
      }
      const session = await stripe(
        "billing_portal/sessions",
        new URLSearchParams({
          customer: customer.stripe_customer_id,
          return_url: `${siteOrigin()}/ai-visibility/dashboard/`,
        }),
      );
      return json({ url: session.url });
    }
    if (
      body.action !== "checkout" || !["fix", "tracking"].includes(body.product)
    ) return json({ error: "Choose a valid product." }, 400);
    const product = body.product as Product;
    // Existing paid draft packages still fulfill. New implementation work must
    // be scoped and approved before collecting payment through a separate quote.
    if (body.product === "fix") return json({ error: "Implementation starts with an agreed scope. Request help from your workspace; no payment has been taken." }, 409);
    const available = await catalog();
    if (!available[product] || env("VISIBILITY_CHECKOUT_ENABLED") !== "true") {
      return json({
        error: "Payments are not open yet. Your free report is saved.",
      }, 503);
    }
    const previous = checked(
      await admin.from("visibility_orders").select("*").eq(
        "project_id",
        project.id,
      ).eq("product", product).in("status", ["pending", "paid"]).maybeSingle(),
    );
    if (previous?.status === "paid") {
      return json({
        error: product === "fix"
          ? "Your fix package is already purchased."
          : "Manage your existing tracking plan in billing.",
      }, 409);
    }
    let order = previous;
    if (order?.stripe_session_id) {
      const session = await stripe(
        `checkout/sessions/${encodeURIComponent(order.stripe_session_id)}`,
      );
      if (session.status === "open") return json({ url: session.url });
      if (session.status === "complete") {
        return json({
          error: "Your payment is processing. Refresh your dashboard shortly.",
        }, 409);
      }
      checked(
        await admin.from("visibility_orders").update({ status: "canceled" }).eq(
          "id",
          order.id,
        ).eq("status", "pending"),
      );
      order = null;
    }
    let customer = checked(
      await admin.from("visibility_customers").select("*").eq(
        "user_id",
        user.id,
      ).maybeSingle(),
    );
    if (!customer?.stripe_customer_id) {
      const created = await stripe(
        "customers",
        new URLSearchParams({
          email: user.email || "",
          "metadata[visibility_user_id]": user.id,
        }),
        `visibility-customer-${user.id}`,
      );
      customer = checked(
        await admin.from("visibility_customers").upsert({
          user_id: user.id,
          stripe_customer_id: created.id,
        }).select().single(),
      );
    }
    if (!order) {
      const inserted = await admin.from("visibility_orders").insert({
        user_id: user.id,
        project_id: project.id,
        product,
      }).select().single();
      if (inserted.error?.code === "23505") {
        return json({
          error:
            "A checkout is already being prepared. Please try again shortly.",
        }, 409);
      }
      order = checked(inserted);
    }
    const metadata = {
      "metadata[visibility_order_id]": order.id,
      "metadata[visibility_product]": product,
    };
    const params = new URLSearchParams({
      mode: product === "fix" ? "payment" : "subscription",
      customer: customer!.stripe_customer_id,
      "line_items[0][price]": prices()[product],
      "line_items[0][quantity]": "1",
      success_url: `${siteOrigin()}/ai-visibility/dashboard/?checkout=success`,
      cancel_url: `${siteOrigin()}/ai-visibility/dashboard/?checkout=canceled`,
      client_reference_id: user.id,
      ...metadata,
    });
    if (product === "tracking") {
      for (const [k, v] of Object.entries(metadata)) {
        params.set(`subscription_data[${k}]`, v);
      }
    }
    const session = await stripe(
      "checkout/sessions",
      params,
      `visibility-order-${order.id}`,
    );
    checked(
      await admin.from("visibility_orders").update({
        stripe_session_id: session.id,
      }).eq("id", order.id),
    );
    return json({ url: session.url });
  } catch (error) {
    console.error(
      "visibility customer",
      error instanceof Error ? error.message : "request failed",
    );
    return json({
      error: "We could not complete that request. Please try again.",
    }, 500);
  }
});
