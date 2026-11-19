import {
  collectPages,
  type Draft,
  generateDraft,
  type Inventory,
  pageLinks,
  renderPackage,
  validateDraft,
} from "./package.ts";
import type { Report } from "../visibility-report/core/types.ts";
const assert = (v: unknown, m = "Assertion failed") => {
  if (!v) throw new Error(m);
};
const report = {
  url: "https://example.org/",
  generatedAt: "2026-11-01",
  profile: { name: "Example" },
} as Report;
const inventory: Inventory = {
  checkedAt: "2026-11-19",
  pages: [{
    url: "https://example.org/agents/",
    text: "Current agent services",
  }],
  discovered: ["https://example.org/agents/"],
  unavailable: [],
};
const sentence =
  "A substantive factual description of the business and the specific improvement to its website. ";
const draft: Draft = {
  summary: sentence.repeat(2),
  priorities: Array.from(
    { length: 3 },
    () => ({ change: sentence, evidence: sentence, acceptance: sentence }),
  ),
  homepage: {
    title: sentence,
    description: sentence,
    heading: sentence,
    copy: sentence.repeat(4),
  },
  service: {
    targetUrl: inventory.pages[0].url,
    outline: sentence,
    title: sentence,
    description: sentence,
    copy: sentence.repeat(8),
  },
  faq: Array.from(
    { length: 4 },
    () => ({ question: "What services are offered?", answer: sentence }),
  ),
};
Deno.test("rejects missing FAQ, missing service copy, and duplicate invented URL", () => {
  for (
    const invalid of [{ ...draft, faq: [] }, {
      ...draft,
      service: { ...draft.service, copy: "" },
    }, {
      ...draft,
      service: {
        ...draft.service,
        targetUrl: "https://example.org/new-agents/",
      },
    }]
  ) {
    let rejected = false;
    try {
      validateDraft(invalid, inventory);
    } catch {
      rejected = true;
    }
    assert(rejected);
  }
});
Deno.test("complete rendering always includes all promised deliverables and exact measurement questions", () => {
  const result = renderPackage(report, inventory, draft, [{
    text: "Which agency builds agents?",
  }]);
  for (
    const label of [
      "Homepage copy",
      "Existing service page improvement",
      "Factual FAQ",
      "Organization structured data",
      "Publishing checklist",
      "Fixed-question measurement plan",
      "Which agency builds agents?",
      "End of complete package",
    ]
  ) assert(result.includes(label), label);
  const schema = JSON.parse(result.split("```json\n")[1].split("\n```")[0]);
  assert(schema["@type"] === "Organization");
  assert(!("review" in schema));
});
Deno.test("provider incomplete status cannot be delivered even with otherwise valid JSON and usage is retained", async () => {
  const entries: any[] = [];
  let failed = false;
  try {
    await generateDraft(report, inventory, {
      apiKey: "test",
      model: "gpt-5.5",
      onUsage: async (e) => {
        entries.push(structuredClone(e));
      },
      fetchImpl: (async () =>
        Response.json({
          status: "incomplete",
          usage: { input_tokens: 10, output_tokens: 10000 },
          output: [{
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify(draft) }],
          }],
        })) as typeof fetch,
    });
  } catch {
    failed = true;
  }
  assert(failed);
  assert(entries[0].status === "pending");
  assert(entries.at(-1).status === "failed");
  assert(entries.at(-1).output_tokens === 10000);
});
Deno.test("completed structured response passes through validation", async () => {
  const result = await generateDraft(report, inventory, {
    apiKey: "test",
    model: "gpt-5.5",
    onUsage: async () => {},
    fetchImpl: (async () =>
      Response.json({
        status: "completed",
        output: [{
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(draft) }],
        }],
      })) as typeof fetch,
  });
  assert(result.service.targetUrl === inventory.pages[0].url);
});
Deno.test("current site collection discovers and reads existing service links and excludes external/private targets", async () => {
  const html = "<html><body>" + sentence.repeat(3) +
    '<a href="/agents/">Agents</a><a href="https://evil.org/">External</a><a href="http://127.0.0.1/">Private</a></body></html>';
  assert(pageLinks(html, report.url).length === 1);
  const inv = await collectPages(report.url, {
    resolveHost: async () => ["8.8.8.8"],
    fetchImpl: (async (url) =>
      new Response(
        String(url).endsWith("sitemap.xml")
          ? "<urlset><url><loc>https://example.org/voice/</loc></url></urlset>"
          : html,
        {
          headers: {
            "content-type": String(url).endsWith(".xml")
              ? "application/xml"
              : "text/html",
          },
        },
      )) as typeof fetch,
  });
  assert(inv.pages.some((p) => p.url === "https://example.org/agents/"));
  assert(inv.pages.some((p) => p.url === "https://example.org/voice/"));
});
Deno.test("unreadable current homepage fails closed without paid generation", async () => {
  let failed = false;
  try {
    await collectPages(report.url, {
      resolveHost: async () => ["8.8.8.8"],
      fetchImpl: (async () =>
        new Response("Forbidden", { status: 403 })) as typeof fetch,
    });
  } catch {
    failed = true;
  }
  assert(failed);
});
