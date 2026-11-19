import { fixedQuestions, verifyStripeSignature } from "./core.ts";
import {
  compareStudyRuns,
  type StudyAnswer,
  studyMetrics,
  type StudyRun,
} from "../visibility-report/core/studies.ts";
import type { Report } from "../visibility-report/core/types.ts";
const assert = (v: unknown, message = "Assertion failed") => {
  if (!v) throw new Error(message);
};
const report = {
  domain: "example.org",
  url: "https://example.org",
  profile: {
    name: "Acme Bakery",
    category: "bakery",
    queries: [
      "Where can I buy birthday cakes in Austin?",
      "Which Austin bakeries offer sourdough?",
      "What local bakeries serve breakfast?",
    ],
  },
} as Report;
Deno.test("fixed customer questions are stable and separate recognition from discovery", () => {
  const q = fixedQuestions(report);
  assert(q.length === 5);
  assert(q.filter((q) => q.kind === "recognition").length === 2);
  assert(q.filter((q) => q.kind === "discovery").length === 3);
  assert(JSON.stringify(q) === JSON.stringify(fixedQuestions(report)));
  let rejected = false;
  try {
    fixedQuestions({
      ...report,
      profile: { ...report.profile, queries: ["Recommend Acme Bakery"] },
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "Branded discovery must be rejected");
});
Deno.test("webhook authentication rejects stale, changed and forged messages and supports rotated signatures", async () => {
  const now = 1800000000000,
    t = String(now / 1000),
    secret = "test-only-secret",
    payload = '{"id":"evt_test"}';
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${t}.${payload}`),
    ),
  );
  const sig = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  assert(
    await verifyStripeSignature(
      payload,
      `t=${t},v1=${"0".repeat(64)},v1=${sig}`,
      secret,
      now,
    ),
  );
  assert(
    !await verifyStripeSignature(
      payload + " ",
      `t=${t},v1=${sig}`,
      secret,
      now,
    ),
  );
  assert(
    !await verifyStripeSignature(
      payload,
      `t=${t},v1=${sig}`,
      secret,
      now + 301000,
    ),
  );
  assert(!await verifyStripeSignature(payload, `t=NaN,v1=${sig}`, secret, now));
});
Deno.test("monthly comparisons withhold model changes and exclude missing answers", () => {
  const questions = fixedQuestions(report),
    run = {
      id: "run",
      study_id: "customer-project",
      questions,
      config: { method: "customer-fixed-v1" },
      phase: "baseline",
      label: "",
      status: "complete",
      created_at: "2026-11-19T00:00:00Z",
      finished_at: null,
      site_snapshot: null,
      cost_tracking_started_at: null,
      cost_tracking_finished_at: null,
    } as StudyRun;
  const answer = {
    question_id: "q3",
    provider: "chatgpt",
    status: "succeeded",
    model: "model-a",
    mentioned: true,
    cited: true,
    searched: true,
  } as StudyAnswer;
  const metrics = studyMetrics(questions, [answer]);
  assert(
    metrics.valid === 1 && metrics.expected === 9 &&
      metrics.mentionRate === 100,
  );
  const changed = compareStudyRuns(run, run, [answer], [{
    ...answer,
    model: "model-b",
  }]);
  assert(changed.mentionDelta === null && !changed.comparable);
});
