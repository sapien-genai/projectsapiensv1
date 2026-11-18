import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { anthropic, gemini, openai, type Provider } from "./core/providers.ts";
import { runReport, toPreview } from "./core/pipeline.ts";
import { InputError, normalizeUrl } from "./core/url.ts";
import type { ProgressStep, Report } from "./core/types.ts";

/**
 * Public endpoint behind the instant AI visibility report on /ai-visibility.
 * No sign-in: abuse is limited by an origin check, a per-visitor daily limit,
 * a global daily cap on new runs, and reuse of recent results for the same domain.
 * Reads and writes visibility_reports with the service role only.
 */

const env = (name: string, fallback = "") => Deno.env.get(name)?.trim() || fallback;
const numberEnv = (name: string, fallback: number) => { const value = Number(env(name)); return Number.isFinite(value) && value > 0 ? value : fallback; };

const DAILY_CAP = numberEnv("VISIBILITY_DAILY_CAP", 100);
const IP_DAILY_LIMIT = numberEnv("VISIBILITY_IP_DAILY_LIMIT", 3);
const CACHE_DAYS = numberEnv("VISIBILITY_CACHE_DAYS", 7);
const STALE_AFTER_MS = 4 * 60 * 1000;
const ALLOWED_ORIGINS = new Set(["https://www.projectsapiens.ai", "https://projectsapiens.ai", "http://localhost:5173", "http://localhost:4173",
  ...env("VISIBILITY_ALLOWED_ORIGINS").split(",").map(origin => origin.trim()).filter(Boolean)]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

function originAllowed(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try { return new URL(origin).protocol === "https:" && new URL(origin).hostname.endsWith(".vercel.app"); } catch { return false; }
}

function buildProviders(): Provider[] {
  const webSearch = env("VISIBILITY_WEB_SEARCH", "on").toLowerCase() !== "off";
  const list: Provider[] = [];
  if (env("OPENAI_API_KEY")) list.push(openai({ apiKey: env("OPENAI_API_KEY"), model: env("VISIBILITY_OPENAI_MODEL", "gpt-5.5"), webSearch }));
  if (env("ANTHROPIC_API_KEY")) list.push(anthropic({ apiKey: env("ANTHROPIC_API_KEY"), model: env("VISIBILITY_ANTHROPIC_MODEL", "claude-sonnet-5-5"), webSearch }));
  if (env("GEMINI_API_KEY")) list.push(gemini({ apiKey: env("GEMINI_API_KEY"), model: env("VISIBILITY_GEMINI_MODEL", "gemini-3.5-flash"), webSearch }));
  return list;
}

/** Extraction and grading run on one inexpensive model, Gemini first because the project already pays for it. */
function buildGrader(): Provider | null {
  const override = env("VISIBILITY_GRADER_MODEL");
  if (env("GEMINI_API_KEY")) return gemini({ apiKey: env("GEMINI_API_KEY"), model: override || env("VISIBILITY_GEMINI_MODEL", "gemini-3.5-flash"), webSearch: false, timeoutMs: 45000 });
  if (env("OPENAI_API_KEY")) return openai({ apiKey: env("OPENAI_API_KEY"), model: override || env("VISIBILITY_OPENAI_MODEL", "gpt-5.5"), webSearch: false, timeoutMs: 45000 });
  if (env("ANTHROPIC_API_KEY")) return anthropic({ apiKey: env("ANTHROPIC_API_KEY"), model: override || env("VISIBILITY_ANTHROPIC_MODEL", "claude-sonnet-5-5"), webSearch: false, timeoutMs: 45000 });
  return null;
}

async function resolveHost(host: string): Promise<string[]> {
  const lookups = await Promise.allSettled([Deno.resolveDns(host, "A"), Deno.resolveDns(host, "AAAA")]);
  return lookups.flatMap(result => result.status === "fulfilled" ? result.value : []);
}

async function hashIp(req: Request): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}|${env("SUPABASE_SERVICE_ROLE_KEY")}`));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

async function execute(id: string, domain: string, url: string) {
  const grader = buildGrader();
  try {
    if (!grader) throw new Error("No AI provider keys are configured.");
    const report = await runReport(domain, url, {
      providers: buildProviders(), complete: grader.complete, fetchOptions: { resolveHost },
      onProgress: async (step: ProgressStep) => { await supabase.from("visibility_reports").update({ progress: step }).eq("id", id); },
    });
    await supabase.from("visibility_reports").update({ status: "complete", report, completed_at: new Date().toISOString() }).eq("id", id);
  } catch (error) {
    // Log the reason for operators; visitors only ever see a generic failure.
    console.error("visibility-report failed", { id, domain, reason: error instanceof Error ? error.message : "unknown" });
    await supabase.from("visibility_reports").update({ status: "failed", error: error instanceof Error ? error.message.slice(0, 300) : "unknown", completed_at: new Date().toISOString() }).eq("id", id);
  }
}

async function start(req: Request, body: Record<string, unknown>) {
  if (typeof body.website === "string" && body.website) return { status: 200, data: { id: crypto.randomUUID(), status: "running" } }; // honeypot
  if (typeof body.url !== "string") throw new InputError("Enter a website address, such as example.com.");
  const { url, domain } = normalizeUrl(body.url);
  if (!buildProviders().length) return { status: 503, data: { error: "The live check is not available right now." } };
  const ipHash = await hashIp(req);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: cached } = await supabase.from("visibility_reports").select("id, report")
    .eq("domain", domain).eq("status", "complete").is("reused_from", null)
    .gte("created_at", new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  // Each visitor gets their own row, so one person unlocking a report does not unlock it for the next.
  if (cached?.report) {
    const { data, error } = await supabase.from("visibility_reports").insert({ domain, url, ip_hash: ipHash, status: "complete", report: cached.report, reused_from: cached.id, completed_at: new Date().toISOString() }).select("id").single();
    if (error) throw error;
    return { status: 200, data: { id: data.id, status: "complete" } };
  }

  const [{ count: mine }, { count: everyone }] = await Promise.all([
    supabase.from("visibility_reports").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).is("reused_from", null).gte("created_at", dayAgo),
    supabase.from("visibility_reports").select("id", { count: "exact", head: true }).is("reused_from", null).gte("created_at", dayAgo),
  ]);
  if ((mine ?? 0) >= IP_DAILY_LIMIT) return { status: 429, data: { error: `You have reached today's limit of ${IP_DAILY_LIMIT} new reports. Please try again tomorrow, or get in touch for a full audit.` } };
  if ((everyone ?? 0) >= DAILY_CAP) return { status: 429, data: { error: "The live check is at capacity for today. Please try again tomorrow, or get in touch and we will run it for you." } };

  const { data, error } = await supabase.from("visibility_reports").insert({ domain, url, ip_hash: ipHash, status: "running", progress: "site" }).select("id").single();
  if (error) throw error;
  EdgeRuntime.waitUntil(execute(data.id, domain, url));
  return { status: 202, data: { id: data.id, status: "running", progress: "site" } };
}

async function load(id: unknown) {
  if (typeof id !== "string" || !UUID.test(id)) throw new InputError("That report link is not valid.");
  const { data } = await supabase.from("visibility_reports").select("id, domain, status, progress, report, unlocked_at, created_at").eq("id", id).maybeSingle();
  if (!data) return null;
  if (data.status === "running" && Date.now() - new Date(data.created_at).getTime() > STALE_AFTER_MS) {
    await supabase.from("visibility_reports").update({ status: "failed", error: "timed out" }).eq("id", id).eq("status", "running");
    data.status = "failed";
  }
  return data;
}

function present(row: NonNullable<Awaited<ReturnType<typeof load>>>) {
  if (row.status === "running") return { id: row.id, status: "running", progress: row.progress, domain: row.domain };
  if (row.status !== "complete" || !row.report) return { id: row.id, status: "failed", domain: row.domain, error: "We could not finish this report. Please try again." };
  const report = row.report as Report;
  return row.unlocked_at
    ? { id: row.id, status: "complete", unlocked: true, preview: toPreview(report), report }
    : { id: row.id, status: "complete", unlocked: false, preview: toPreview(report) };
}

async function unlock(body: Record<string, unknown>) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new InputError("Enter a valid email address.");
  const row = await load(body.id);
  if (!row) return { status: 404, data: { error: "That report was not found." } };
  if (row.status !== "complete") return { status: 409, data: { error: "That report is not ready yet." } };
  if (!row.unlocked_at) {
    const unlockedAt = new Date().toISOString();
    const { error } = await supabase.from("visibility_reports").update({ email, unlocked_at: unlockedAt }).eq("id", row.id);
    if (error) throw error;
    row.unlocked_at = unlockedAt;
    EdgeRuntime.waitUntil(notify(email, row.domain, row.id, (row.report as Report).overall));
  }
  return { status: 200, data: present(row) };
}

/** Optional: tell the owner about a new lead through an existing form intake. Off unless configured. */
async function notify(email: string, domain: string, id: string, overall: number) {
  const target = env("VISIBILITY_LEAD_FORWARD_URL");
  if (!target) return;
  const form = new URLSearchParams({ "form-name": env("VISIBILITY_LEAD_FORM_NAME", "contact"), name: "AI visibility report lead", email, company: domain,
    project: `[AI visibility report] ${domain} scored ${overall}/100. Report: https://www.projectsapiens.ai/ai-visibility/?report=${id}` });
  await fetch(target, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString(), signal: AbortSignal.timeout(10000) }).catch(() => {});
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const allowed = originAllowed(origin);
  const headers: Record<string, string> = { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin",
    ...(allowed ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey" } : {}) };
  const reply = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });
  if (!allowed) return reply(403, { error: "Invalid origin." });
  if (Number(req.headers.get("content-length") ?? 0) > 4000) return reply(413, { error: "Request is too large." });
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { error: "Invalid request." });
    if (body.action === "start") { const result = await start(req, body); return reply(result.status, result.data); }
    if (body.action === "status") { const row = await load(body.id); return row ? reply(200, present(row)) : reply(404, { error: "That report was not found." }); }
    if (body.action === "unlock") { const result = await unlock(body); return reply(result.status, result.data); }
    return reply(400, { error: "Unknown action." });
  } catch (error) {
    if (error instanceof InputError) return reply(400, { error: error.message });
    console.error("visibility-report error", error instanceof Error ? error.message : "unknown");
    return reply(500, { error: "Something went wrong. Please try again." });
  }
});
