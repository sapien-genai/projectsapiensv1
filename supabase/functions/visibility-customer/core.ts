import type { Report } from "../visibility-report/core/types.ts";
import { validateStudy } from "../visibility-report/core/studies.ts";
/** Save evidence based on completed measurements, never a retired composite score. */
export function canSaveReport(status: string | undefined, report: Report | undefined): report is Report {
  return status === "complete" && !!report?.signals?.reachable &&
    !!report.profile?.name?.trim() && !!report.profile?.category?.trim() &&
    (report.profile?.queries?.length ?? 0) > 0 &&
    report.assistants?.some(a => !a.error && !!a.recognitionAnswer && a.discovery.length > 0) === true;
}
export type Product = "fix" | "tracking";
export function fixedQuestions(report: Report) {
  const queries = report.profile.queries.filter((q) => q.trim()).slice(0, 3);
  return validateStudy({
    name: "Customer tracking",
    business_name: report.profile.name,
    url: report.url,
    questions: [
      {
        kind: "recognition",
        text:
          `What is ${report.profile.name} (${report.domain}), what does it offer, and who is it for?`,
      },
      {
        kind: "recognition",
        text:
          `What should a potential customer know about ${report.profile.name} (${report.domain}) before choosing it?`,
      },
      ...queries.map((text) => ({ kind: "discovery", text })),
    ],
  }).questions;
}
export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  now = Date.now(),
) {
  const parts = header.split(",").map((p) => p.trim().split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  if (
    !timestamp || !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  ) return false;
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
      new TextEncoder().encode(`${timestamp}.${payload}`),
    ),
  );
  const expected = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("");
  return parts.filter(([k, v]) => k === "v1" && /^[a-f0-9]{64}$/.test(v)).some(
    ([, v]) => {
      let mismatch = 0;
      for (let i = 0; i < expected.length; i++) {
        mismatch |= expected.charCodeAt(i) ^ v.charCodeAt(i);
      }
      return mismatch === 0;
    },
  );
}
