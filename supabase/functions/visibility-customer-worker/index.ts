import { checked, db, env } from "../visibility-customer/shared.ts";
import { packagePrompt } from "../visibility-customer/core.ts";
import {
  anthropic,
  gemini,
  openai,
} from "../visibility-report/core/providers.ts";
import { measureAnswer } from "../visibility-report/core/studies.ts";
import type { UsageEntry } from "../visibility-report/core/cost.ts";
// One request per claim keeps monthly work within Edge Function runtime limits.
Deno.serve(async (req) => {
  const secret = env("VISIBILITY_WORKER_SECRET");
  if (
    req.method !== "POST" || !secret ||
    req.headers.get("x-visibility-worker") !== secret
  ) return new Response("Unauthorized", { status: 401 });
  if (env("VISIBILITY_WORKER_ENABLED") !== "true") {
    return Response.json({ paused: true });
  }
  const admin = db();
  try {
    const task = checked(
      await admin.rpc("claim_visibility_customer_task", {
        p_daily_limit: Number(env("VISIBILITY_CUSTOMER_DAILY_CALLS", "300")),
      }),
    );
    if (!task) return Response.json({ idle: true });
    const job = checked(
      await admin.from("visibility_customer_jobs").select("*").eq(
        "id",
        task.job_id,
      ).single(),
    );
    const project = checked(
      await admin.from("visibility_projects").select("*").eq(
        "id",
        job.project_id,
      ).single(),
    );
    let actualModel: string | null = null;
    const onUsage = async (entry: UsageEntry) => {
      checked(
        await admin.from("visibility_customer_usage").upsert({
          id: entry.id,
          task_id: task.id,
          entry,
        }),
      );
      if (entry.status === "succeeded") actualModel = entry.model;
    };
    try {
      const options = {
        model: job.config.models[task.provider],
        webSearch: job.kind === "tracking",
        onUsage,
        timeoutMs: 75000,
        citationLimit: 1000,
        purpose: job.kind === "fix"
          ? "analysis" as const
          : "assistant" as const,
      };
      const provider = task.provider === "chatgpt"
        ? openai({ ...options, apiKey: env("OPENAI_API_KEY") })
        : task.provider === "claude"
        ? anthropic({ ...options, apiKey: env("ANTHROPIC_API_KEY") })
        : gemini({ ...options, apiKey: env("GEMINI_API_KEY") });
      if (job.kind === "fix") {
        const text = await provider.complete(packagePrompt(project.report));
        if (text.trim().length < 500) {
          throw new Error(
            "The package could not be completed. Contact support for recovery or a refund.",
          );
        }
        checked(
          await admin.from("visibility_customer_jobs").update({
            result: {
              markdown: text,
              generatedAt: new Date().toISOString(),
              sourceReportDate: project.report.generatedAt,
            },
          }).eq("id", job.id),
        );
        checked(
          await admin.from("visibility_customer_tasks").update({
            status: "succeeded",
            answer: text,
            model: actualModel,
            finished_at: new Date().toISOString(),
          }).eq("id", task.id).eq("status", "running"),
        );
      } else {
        const answer = await provider.ask(task.prompt);
        if (!answer.text.trim()) throw new Error("No answer returned.");
        checked(
          await admin.from("visibility_customer_tasks").update({
            status: "succeeded",
            answer: answer.text,
            citations: answer.citations,
            model: actualModel ?? answer.model,
            searched: answer.searched,
            ...measureAnswer(answer.text, answer.citations, {
              business_name: project.business_name,
              domain: project.domain,
              competitors: [],
            }),
            finished_at: new Date().toISOString(),
          }).eq("id", task.id).eq("status", "running"),
        );
      }
    } catch (error) {
      checked(
        await admin.from("visibility_customer_tasks").update({
          status: "failed",
          error: error instanceof Error
            ? error.message.slice(0, 300)
            : "Request failed",
          finished_at: new Date().toISOString(),
        }).eq("id", task.id).eq("status", "running"),
      );
    }
    return Response.json({ processed: task.id });
  } catch {
    return Response.json({ error: "Worker could not persist progress." }, {
      status: 500,
    });
  }
});
