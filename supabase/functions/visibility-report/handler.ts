declare global { var EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }; }
import { handleStudy } from "./study-handler.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { anthropic, gemini, openai, type Provider } from "./core/providers.ts";
import { readableReport, runReport, toPreview } from "./core/pipeline.ts";
import { persistReport, storageSafeJson } from "./core/storage.ts";
import { InputError, normalizeUrl } from "./core/url.ts";
import { deliverLead } from "./core/notification.ts";
import type { UsageEntry } from './core/cost.ts';
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
const STALE_AFTER_MS = 6 * 60 * 1000;
const ALLOWED_ORIGINS = new Set(["https://www.projectsapiens.ai", "https://projectsapiens.ai", "http://localhost:5173", "http://localhost:4173",
  ...env("VISIBILITY_ALLOWED_ORIGINS").split(",").map(origin => origin.trim()).filter(Boolean)]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

function originAllowed(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try { return new URL(origin).protocol === "https:" && new URL(origin).hostname.endsWith(".vercel.app"); } catch { return false; }
}

function buildProviders(onUsage?: (entry: UsageEntry) => Promise<void>): Provider[] {
  const webSearch = env("VISIBILITY_WEB_SEARCH", "on").toLowerCase() !== "off";
  const unavailable = (id: Provider["id"], label: string): Provider => ({ id, label, model: "not configured", ask: async () => { throw new Error("Provider not configured"); }, complete: async () => { throw new Error("Provider not configured"); } });
  const list: Provider[] = [];
  if (env("OPENAI_API_KEY")) list.push(openai({ apiKey: env("OPENAI_API_KEY"), model: env("VISIBILITY_OPENAI_MODEL", "gpt-5.5"), webSearch, onUsage }));
  if (env("ANTHROPIC_API_KEY")) list.push(anthropic({ apiKey: env("ANTHROPIC_API_KEY"), model: env("VISIBILITY_ANTHROPIC_MODEL", "claude-sonnet-5-5"), webSearch, onUsage }));
  if (env("GEMINI_API_KEY")) list.push(gemini({ apiKey: env("GEMINI_API_KEY"), model: env("VISIBILITY_GEMINI_MODEL", "gemini-3.5-flash"), webSearch, onUsage }));
  if (!env("OPENAI_API_KEY")) list.push(unavailable("chatgpt", "ChatGPT"));
  if (!env("ANTHROPIC_API_KEY")) list.push(unavailable("claude", "Claude"));
  if (!env("GEMINI_API_KEY")) list.push(unavailable("gemini", "Gemini"));
  return list;
}

/** Extraction and grading run on one inexpensive model, Gemini first because the project already pays for it. */
function buildGrader(onUsage?: (entry: UsageEntry) => Promise<void>, actionPlan = false): Provider | null {
  const override = env("VISIBILITY_GRADER_MODEL");
  if (env("GEMINI_API_KEY")) return gemini({ apiKey: env("GEMINI_API_KEY"), model: override || env("VISIBILITY_GEMINI_MODEL", "gemini-3.5-flash"), webSearch: false, onUsage, purpose: "analysis", timeoutMs: actionPlan ? 90000 : 60000, completionMaxTokens: actionPlan ? 24000 : 8000 });
  if (env("OPENAI_API_KEY")) return openai({ apiKey: env("OPENAI_API_KEY"), model: override || env("VISIBILITY_OPENAI_MODEL", "gpt-5.5"), webSearch: false, onUsage, purpose: "analysis", timeoutMs: actionPlan ? 90000 : 60000, completionMaxTokens: actionPlan ? 24000 : 8000 });
  if (env("ANTHROPIC_API_KEY")) return anthropic({ apiKey: env("ANTHROPIC_API_KEY"), model: override || env("VISIBILITY_ANTHROPIC_MODEL", "claude-sonnet-5-5"), webSearch: false, onUsage, purpose: "analysis", timeoutMs: actionPlan ? 90000 : 60000, completionMaxTokens: actionPlan ? 24000 : 8000 });
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
  const onUsage = async (entry: UsageEntry) => {
    const { error } = await supabase.from('visibility_report_usage').upsert({ ...entry, report_id: id }, { onConflict: 'id' });
    if (error) throw new Error('Could not persist API usage');
  };
  const grader = buildGrader(onUsage);
  try {
    const { error: trackingError } = await supabase.from('visibility_reports').update({ cost_tracking_started_at: new Date().toISOString() }).eq('id', id);
    if (trackingError) throw new Error('Could not initialize cost tracking');
    if (!grader) throw new Error("No AI provider keys are configured.");
    const report = await runReport(domain, url, {
      providers: buildProviders(onUsage), complete: grader.complete, completePlan: buildGrader(onUsage, true)!.complete, fetchOptions: { resolveHost },
      onProgress: async (step: ProgressStep) => { await supabase.from("visibility_reports").update({ progress: step }).eq("id", id); },
    });
    await persistReport(() => supabase.from("visibility_reports").update({ status: "complete", report: storageSafeJson(report), cost_tracking_finished_at: new Date().toISOString(), completed_at: new Date().toISOString() }).eq("id", id));
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
  if (!buildGrader()) return { status: 503, data: { error: "The live check is not available right now." } };
  let ipHash = await hashIp(req);
  const fresh = body.fresh === true;
  if (fresh) {
    const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
    if (!token) return { status: 403, data: { error: "Admin sign-in is required to run a fresh report." } };
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) return { status: 403, data: { error: "Admin sign-in is required to run a fresh report." } };
    const { data: role, error: roleError } = await supabase.from("admin_roles").select("role").eq("user_id", auth.user.id).in("role", ["admin", "super_admin"]).limit(1).maybeSingle();
    if (roleError || !role) return { status: 403, data: { error: "Only admins can run a fresh report." } };
    // Server-verified admins may run paid fresh checks beyond public daily caps.
    ipHash = `admin:${auth.user.id}`;
  }
  // Only the verified fresh-admin branch bypasses reservation quotas. Public
  // requests retain the atomic database reservation and its existing accounting.
  const { data, error } = fresh
    ? await supabase.from("visibility_reports").insert({ domain, url, ip_hash: ipHash, status: "running", progress: "site" }).select().single()
    : await supabase.rpc("reserve_visibility_report", {
      p_domain: domain, p_url: url, p_ip_hash: ipHash,
      p_daily_cap: DAILY_CAP, p_ip_limit: IP_DAILY_LIMIT, p_cache_days: CACHE_DAYS,
    });
  if (error) throw error; // Fail closed: never start paid work when reservation fails.
  if (data.limit === "visitor") return { status: 429, data: { error: `You have reached today's limit of ${IP_DAILY_LIMIT} new reports. Please try again tomorrow, or get in touch for a full audit.` } };
  if (data.limit === "global") return { status: 429, data: { error: "The live check is at capacity for today. Please try again tomorrow, or get in touch and we will run it for you." } };
  if (data.status === "complete") return { status: 200, data: present(data) };
  EdgeRuntime.waitUntil(execute(data.id, domain, url));
  return { status: 202, data: present(data) };
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
  const report = readableReport(row.report as Report);
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
  // First email wins, even if two unlocks race. Delivery can retry independently.
  const { error } = await supabase.from("visibility_reports")
    .update({ email, unlocked_at: new Date().toISOString() }).eq("id", row.id).is("unlocked_at", null);
  if (error) throw error;
  const updated = await load(row.id);
  if (!updated) throw new Error("Report disappeared during unlock.");
  EdgeRuntime.waitUntil(notify(row.id));
  return { status: 200, data: present(updated) };
}

/** Deliver through the same contact intake as /api/client-inquiry. */
async function notify(id: string) {
  const { data, error } = await supabase.rpc("claim_visibility_notification", { p_id: id });
  if (error) { console.error("visibility notification claim failed", { id }); return; }
  const row = data?.[0];
  if (!row) return;
  const overall = (row.report as Report).overall;
  const target = env("VISIBILITY_LEAD_FORWARD_URL", "https://tonymarks.com/");
  const form = new URLSearchParams({ "form-name": env("VISIBILITY_LEAD_FORM_NAME", "contact"), name: "AI visibility report lead", email: row.email, company: row.domain,
    project: `[AI visibility report] ${row.domain}: ${overall === null ? "evidence and action plan available; no combined score" : `${overall}/100 (legacy rating)`}. Report: https://www.projectsapiens.ai/ai-visibility/?report=${id}` });
  const sent = await deliverLead(target, form);
  const { error: saveError } = await supabase.from("visibility_reports").update({
    notification_status: sent ? "sent" : "failed", ...(sent ? { notified_at: new Date().toISOString() } : {}),
  }).eq("id", id).eq("notification_attempted_at", row.notification_attempted_at);
  if (!sent || saveError) console.error("visibility notification needs retry", { id });
}

// Operator-only readiness check. No key or prompt contents are returned.
async function providerHealth() {
  if (!env("GEMINI_API_KEY")) return { geminiConfigured: false };
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    headers: { "x-goog-api-key": env("GEMINI_API_KEY") }, signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  return { geminiStatus: response.status, models: response.ok ? (result.models ?? []).map((model: { name: string; supportedGenerationMethods?: string[] }) => ({ name: model.name, methods: model.supportedGenerationMethods })) : [],
    openaiConfigured: Boolean(env("OPENAI_API_KEY")), anthropicConfigured: Boolean(env("ANTHROPIC_API_KEY")) };
}

export async function handleRequest(req: Request) {
  if (req.method === "GET" && new URL(req.url).searchParams.get("check") === "providers") {
    if (req.headers.get("authorization") !== `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`) return new Response("Forbidden", {status: 403});
    return Response.json(await providerHealth(), {headers: {"Cache-Control": "no-store"}});
  }
  const origin = req.headers.get("origin");
  const allowed = originAllowed(origin);
  const headers: Record<string, string> = { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin",
    ...(allowed ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey" } : {}) };
  const reply = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });
  if (!allowed) return reply(403, { error: "Invalid origin." });
  if (Number(req.headers.get("content-length") ?? 0) > 20000) return reply(413, { error: "Request is too large." });
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { error: "Invalid request." });
    if (typeof body.action === 'string' && body.action.startsWith('study_')) {
      const result = await handleStudy(supabase,req,body,resolveHost,DAILY_CAP,IP_DAILY_LIMIT);
      return reply(result.status,result.data);
    }
    if (body.action === "start") { const result = await start(req, body); return reply(result.status, result.data); }
    if (body.action === "status") { const row = await load(body.id); if (row?.unlocked_at) EdgeRuntime.waitUntil(notify(row.id)); return row ? reply(200, present(row)) : reply(404, { error: "That report was not found." }); }
    if (body.action === "unlock") { const result = await unlock(body); return reply(result.status, result.data); }
    return reply(400, { error: "Unknown action." });
  } catch (error) {
    if (error instanceof InputError) return reply(400, { error: error.message });
    console.error("visibility-report error", error instanceof Error ? error.message : "unknown");
    return reply(500, { error: "Something went wrong. Please try again." });
  }
}
