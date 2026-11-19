import { createClient } from "jsr:@supabase/supabase-js@2.119.0";
export const env = (name: string, fallback = "") =>
  Deno.env.get(name)?.trim() || fallback;
export const db = () =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
export const config = () => ({
  method: "customer-fixed-v1",
  webSearch: true,
  models: {
    chatgpt: env("VISIBILITY_OPENAI_MODEL", "gpt-5.5"),
    claude: env("VISIBILITY_ANTHROPIC_MODEL", "claude-sonnet-5-5"),
    gemini: env("VISIBILITY_GEMINI_MODEL", "gemini-3.5-flash"),
  },
});
export function checked<T>(result: { data: T; error: unknown }): T {
  if (result.error) {
    throw new Error("Could not save or retrieve customer data.");
  }
  return result.data;
}
export async function stripe(
  path: string,
  params?: URLSearchParams,
  key?: string,
) {
  const secret = env("VISIBILITY_STRIPE_SECRET_KEY");
  if (!secret) throw new Error("Visibility payments are not configured.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      // Never fall back to another product's key or accidentally use test mode.
      Authorization: `Bearer ${secret}`,
      ...(params
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: params,
    signal: AbortSignal.timeout(20000),
  });
  const value = await response.json();
  if (!response.ok) {
    console.error("visibility Stripe request failed", {
      status: response.status,
      code: value.error?.code,
      type: value.error?.type,
      mode: /^(sk|rk)_test_/.test(secret) ? "test" : "live",
    });
    throw new Error("Payment service unavailable. Please try again.");
  }
  return value;
}
export const siteOrigin = () =>
  env("VISIBILITY_SITE_ORIGIN", "https://www.projectsapiens.ai");
