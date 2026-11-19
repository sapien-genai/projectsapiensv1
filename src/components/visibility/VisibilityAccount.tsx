import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import BusinessProfile from "./BusinessProfile";

import { supabase } from "../../lib/supabase";
import {
  customerApi,
  type Dashboard,
  dashboardPath,
  download,
  type Job,
  priceLabel,
  type Product,
} from "./customer";
import {
  compareStudyRuns,
  studyMetrics,
  type StudyRun,
} from "../../../supabase/functions/visibility-report/core/studies";
import "../CompanyHome.css";
import "../CompanyPreview.css";
import "./VisibilityAccount.css";
const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const pct = (value: number | null) =>
  value === null ? "Not available" : `${value.toFixed(1)}%`;
export default function VisibilityAccount() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [data, setData] = useState<Dashboard | null>(null);
  const [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false),
    [email, setEmail] = useState("");
  const [reportId] = useState(() =>
    new URLSearchParams(window.location.search).get("report") ||
    sessionStorage.getItem("visibility-report-to-save")
  );
  const userId = user?.id;
  const refresh = useCallback(async () => {
    const next = await customerApi<Dashboard>({ action: "dashboard" });
    setData(next);
    setSelected((current) =>
      next.projects.some((p) => p.id === current)
        ? current
        : next.projects[0]?.id || ""
    );
  }, []);
  useEffect(() => {
    document.title = "Your workspace — Project Sapiens";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    if (reportId) sessionStorage.setItem("visibility-report-to-save", reportId);
    const callbackError = new URLSearchParams(window.location.hash.slice(1))
      .get("error_description");
    if (callbackError) setError(callbackError);
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setUser(data.session?.user ?? null);
      setReady(true);
    }).catch(() => {
      setError("Could not restore your session. Please try again.");
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setReady(true);
      },
    );
    return () => {
      subscription.unsubscribe();
      meta.remove();
    };
  }, [reportId]); // Never clear the return report before saving succeeds.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      if (reportId) {
        const saved = await customerApi<{ id: string }>({ action: "save_report", report_id: reportId });
        setSelected(saved.id);
        setMessage("Report saved to your workspace. Existing deliverables and fixed tracking questions are unchanged.");
        sessionStorage.removeItem("visibility-report-to-save");
        window.history.replaceState(null, "", dashboardPath);
      }
      if (active) await refresh();
    })().catch((e) => {
      if (active) setError(e.message);
    });
    return () => {
      active = false;
    };
  }, [userId, reportId, refresh]);
  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(() => refresh().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, [userId, refresh]);
  async function auth(provider: "google" | "email", event?: FormEvent) {
    event?.preventDefault();
    if (!consent) {
      setError("Please agree to the terms and privacy policy to continue.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const redirect = `${window.location.origin}${dashboardPath}${
        reportId ? `?report=${encodeURIComponent(reportId)}` : ""
      }`;
      const result = provider === "google"
        ? await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirect },
        })
        : await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: redirect },
        });
      if (result.error) throw result.error;
      if (provider === "email") {
        setMessage(
          "Check your email for a secure sign-in link. Open it to return to your workspace.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Sign-in could not start. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function act(action: "checkout" | "portal", product?: Product) {
    setBusy(true);
    setError("");
    try {
      const result = await customerApi<{ url: string }>({
        action,
        project_id: selected,
        product,
      });
      const url = new URL(result.url);
      if (
        url.protocol !== "https:" ||
        !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)
      ) throw new Error("Payment link could not be verified.");
      window.location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function note(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await customerApi({
        action: "note",
        project_id: selected,
        note: new FormData(form).get("note"),
      });
      form.reset();
      await refresh();
      setMessage(
        "Change recorded. Future comparisons will retain this context.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your note.");
    } finally {
      setBusy(false);
    }
  }
  const project = data?.projects.find((p) => p.id === selected);
  const jobs = data?.jobs.filter((j) => j.project_id === selected) ?? [];
  const tracking = jobs.filter((j) => j.kind === "tracking");
  const orders = data?.orders.filter((o) => o.project_id === selected) ?? [];
  const packageJob = jobs.find((j) => j.kind === "fix");
  const plan = orders.find((o) =>
    o.product === "tracking" && o.status === "paid"
  );
  const checkout = new URLSearchParams(window.location.search).get("checkout");
  return (
    <div className="company-site visibility-account min-h-screen bg-[#f4f2ec] text-[#172820]">
      <a href="#main" className="sp-skip">Skip to content</a>
      <header className="va-workspace-header">
        <a href="/" aria-label="Project Sapiens home"><img src="/brand/project-sapiens-wordmark.png" width="150" height="60" alt="Project Sapiens" /></a>
        <nav aria-label="Account navigation"><a href="/">Main website</a><a href="mailto:tony@projectsapiens.xyz">Support</a>{user && <button className="va-link" onClick={async () => { await supabase.auth.signOut(); setData(null); }}>Sign out</button>}</nav>
      </header>
      <main id="main">
        <header className="va-heading">
          <div>
            <p className="va-eyebrow">Project Sapiens / Customer workspace</p>
            <h1>
              {user
                ? "Your workspace."
                : "Welcome to your workspace."}
            </h1>
            <p>
              {user
                ? "Your business, reports, and deliverables in one place."
                : "Save your free report, get a website fix package, and follow how AI assistants describe your business."}
            </p>
          </div>
        </header>
        {error && (
          <div role="alert" className="va-notice va-error">
            {error}
            <button
              className="va-link"
              onClick={() => {
                setError("");
                refresh().catch((e) => setError(e.message));
              }}
            >
              Try again
            </button>
          </div>
        )}
        {message && <p className="va-notice" role="status">{message}</p>}
        {!ready
          ? <p role="status">Restoring your session…</p>
          : !user
          ? (
            <section className="va-auth">
              <div>
                <p className="va-eyebrow">Your customer account</p>
                <h2>Start with what’s free.</h2>
                <p>
                  No card required to save a report. Choose a paid service only
                  when you’re ready.
                </p>
                <ul>
                  <li>Keep your business report in one place.</li>
                  <li>Get drafts and a clear publishing checklist.</li>
                  <li>Track the same questions month after month.</li>
                </ul>
                <a className="va-link" href="/ai-visibility/#instant-report">
                  Run a free check first
                </a>
              </div>
              <div className="va-panel">
                <h2>Sign in or create an account</h2>
                <label className="va-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <a href="/terms/" target="_blank" rel="noreferrer">Terms</a>
                    {" "}
                    and{" "}
                    <a href="/privacy/" target="_blank" rel="noreferrer">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
                <button
                  className="va-button va-secondary"
                  disabled={busy || !consent}
                  onClick={() => auth("google")}
                >
                  Continue with Google
                </button>
                <p className="va-divider">or use your email</p>
                <form onSubmit={(e) => auth("email", e)}>
                  <label htmlFor="customer-email">Email address</label>
                  <input
                    id="customer-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={254}
                  />
                  <button className="va-button" disabled={busy || !consent}>
                    {busy ? "Connecting…" : "Email me a sign-in link"}
                  </button>
                </form>
                <p className="va-small">
                  A secure link, no password to remember. This is your
                  visibility account, separate from the learning platform
                  experience.
                </p>
              </div>
            </section>
          )
          : !data
          ? <p role="status">Loading your saved reports…</p>
          : (
            <>
              {checkout && (
                <p className="va-notice" role="status">
                  {checkout === "success"
                    ? "Thanks. We’re confirming your payment. Your purchase appears below when payment is verified; you do not need to pay again."
                    : "Checkout was canceled. Your saved report is still here."}
                </p>
              )}
              {data.projects.length > 0 && <nav className="va-workspace-nav" aria-label="Workspace sections"><a href="#reports">Reports</a><a href="#deliverables">Deliverables</a><a href="#tracking">Monthly tracking</a><a href="#business-profile">Business profile</a><a href="#services">Services & billing</a></nav>}
              <nav className="va-toolbar" aria-label="Your websites">
                <label>
                  Website<select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    {data.projects.length
                      ? data.projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.domain}</option>
                      ))
                      : <option>No saved websites yet</option>}
                  </select>
                </label>
                <a
                  className="va-button va-secondary"
                  href="/ai-visibility/#instant-report"
                >
                  Check another website
                </a>
                <button
                  className="va-link"
                  onClick={() => refresh().catch((e) => setError(e.message))}
                >
                  Refresh
                </button>
              </nav>
              {!project
                ? (
                  <section className="va-panel va-empty">
                    <h2>Your first report starts here.</h2>
                    <p>
                      Run a free website check, then choose “Save to my
                      workspace” on your result.
                    </p>
                    <a
                      className="va-button"
                      href="/ai-visibility/#instant-report"
                    >
                      Run a free check
                    </a>
                  </section>
                )
                : (
                  <>
                    <BusinessProfile key={project.id} project={project} onSaved={refresh} />
                    <section id="reports" className="va-overview">
                      <div>
                        <p className="va-eyebrow">
                          Latest saved check · {date(project.latest_report_generated_at || project.report.generatedAt)}
                        </p>
                        <h2>{project.business_name}</h2>
                        <p>A snapshot of business descriptions, category mentions, and page checks. Review the original questions and answers before drawing conclusions.</p>
                        <p className="va-small">
                          The instant check is a snapshot. Monthly tracking uses
                          a separate fixed set of questions, with mentions and
                          citations shown alongside coverage.
                        </p>
                      </div>
                      <div className="va-score"><a className="va-link" href={`/ai-visibility/?report=${project.latest_report_id || project.report_id || ''}`}>View report evidence</a><span>No combined visibility rating</span></div>
                    </section>
                    <section
                      id="services" className="va-products"
                      aria-label="Choose your next step"
                    >
                      <article className="va-panel">
                        <p className="va-eyebrow">One-time purchase</p>
                        <h2>A fix package you can use.</h2>
                        <p className="va-price">
                          {priceLabel(data.catalog.fix)}
                        </p>
                        <p>
                          Website-specific drafts and a prioritized plan,
                          generated from your saved report.
                        </p>
                        <ul>
                          <li>Homepage title, description, and opening copy</li>
                          <li>
                            Service page draft, factual FAQ, and structured data
                          </li>
                          <li>Publishing checklist and a measurement plan</li>
                        </ul>
                        <p className="va-small">
                          Review the facts before publishing. Website access,
                          implementation, and guaranteed placement are not
                          included.
                        </p>
                        {orders.some((o) =>
                            o.product === "fix" && o.status === "paid"
                          )
                          ? (
                            <p className="va-purchased">
                              Purchased · {packageJob?.status ?? "Preparing"}
                            </p>
                          )
                          : (
                            <button
                              className="va-button"
                              disabled={busy || !data.catalog.fix?.enabled}
                              onClick={() => act("checkout", "fix")}
                            >
                              {data.catalog.fix?.enabled
                                ? "Get my fix package"
                                : "Purchases open soon"}
                            </button>
                          )}
                      </article>
                      <article className="va-panel va-tracking-offer">
                        <p className="va-eyebrow">Monthly subscription</p>
                        <h2>See what changes.</h2>
                        <p className="va-price">
                          {priceLabel(data.catalog.tracking)}
                        </p>
                        <p>
                          One automatic measurement per paid month, starting
                          after your first payment.
                        </p>
                        <ul>
                          <li>
                            {project.questions.length}{" "}
                            fixed questions across ChatGPT, Claude, and Gemini
                          </li>
                          <li>
                            Dated answers, sources, and side-by-side comparisons
                          </li>
                          <li>
                            A change log to connect your work with results
                          </li>
                        </ul>
                        <p className="va-small">
                          Renews monthly until canceled. Cancel in billing.
                          Failed provider requests stay visible and are not
                          scored as zero.
                        </p>
                        {plan
                          ? (
                            <>
                              <p className="va-purchased">
                                {plan.cancel_at_period_end
                                  ? "Cancels at period end"
                                  : "Tracking subscribed"}
                                {plan.paid_until
                                  ? ` · paid through ${date(plan.paid_until)}`
                                  : ""}
                              </p>
                              <button
                                className="va-button va-secondary"
                                disabled={busy}
                                onClick={() => act("portal")}
                              >
                                Manage billing
                              </button>
                            </>
                          )
                          : (
                            <button
                              className="va-button"
                              disabled={busy || !data.catalog.tracking?.enabled}
                              onClick={() => act("checkout", "tracking")}
                            >
                              {data.catalog.tracking?.enabled
                                ? "Start monthly tracking"
                                : "Subscriptions open soon"}
                            </button>
                          )}
                      </article>
                    </section>
                    {!packageJob && <section id="deliverables" className="va-section"><p className="va-eyebrow">Your deliverables</p><h2>A home for your project work.</h2><p>Your purchased fix package and drafts will appear here when ready. You haven’t ordered a package for this website yet.</p><a className="va-link" href="#services">Explore the fix package</a></section>}
                    {packageJob && (
                      <section id="deliverables" className="va-section">
                        <p className="va-eyebrow">Your fix package</p>
                        <h2>From findings to publishable drafts.</h2>
                        {packageJob.result
                          ? (
                            <>
                              <button
                                className="va-button va-secondary"
                                onClick={() =>
                                  download(
                                    `${project.domain}-visibility-fix-package.md`,
                                    packageJob.result!.markdown,
                                  )}
                              >
                                Download fix package
                              </button>
                              <details className="va-details">
                                <summary>Read your package</summary>
                                <div className="va-markdown">
                                  <ReactMarkdown>
                                    {packageJob.result.markdown}
                                  </ReactMarkdown>
                                </div>
                              </details>
                            </>
                          )
                          : (
                            <p role="status">
                              {["partial", "failed", "canceled"].includes(
                                  packageJob.status,
                                )
                                ? "We could not finish your package. Contact support for recovery or a refund; please do not purchase it again."
                                : "Your package is queued. You can close this page; it will appear here when ready."}
                            </p>
                          )}
                        <a
                          className="va-link"
                          href="mailto:tony@projectsapiens.xyz?subject=Visibility%20package%20support"
                        >
                          Get help with a purchase
                        </a>
                      </section>
                    )}
                    <section id="tracking" className="va-section">
                      <p className="va-eyebrow">Monthly tracking</p>
                      <h2>Evidence over time.</h2>
                      <p>
                        Mentions are not necessarily recommendations. These API
                        tests are observations, not a guarantee of what every
                        consumer sees.
                      </p>
                      <details className="va-details">
                        <summary>
                          Your fixed questions ({project.questions.length})
                        </summary>
                        <ol>
                          {project.questions.map((q) => (
                            <li key={q.id}>
                              <span className="va-small">{q.kind}</span>
                              <p>{q.text}</p>
                            </li>
                          ))}
                        </ol>
                      </details>
                      {!tracking.length
                        ? (
                          <div className="va-empty">
                            <h3>No monthly measurements yet.</h3>
                            <p>
                              Your first paid tracking run establishes the
                              baseline. Later runs use these exact questions.
                            </p>
                          </div>
                        )
                        : tracking.map((job, index) => {
                          const answers = data.tasks.filter((t) =>
                              t.job_id === job.id
                            ),
                            metrics = studyMetrics(job.questions, answers);
                          const before = tracking.slice(index + 1).find((j) =>
                            ["complete", "partial"].includes(j.status)
                          );
                          const asRun = (j: Job) =>
                            ({
                              ...j,
                              study_id: project.id,
                              phase: "followup",
                              label: "",
                              finished_at: null,
                              site_snapshot: null,
                              cost_tracking_started_at: null,
                              cost_tracking_finished_at: null,
                            }) as StudyRun;
                          const comparison = before &&
                              ["complete", "partial"].includes(job.status)
                            ? compareStudyRuns(
                              asRun(before),
                              asRun(job),
                              data.tasks.filter((t) => t.job_id === before.id),
                              answers,
                            )
                            : null;
                          return (
                            <article className="va-run" key={job.id}>
                              <div className="va-toolbar">
                                <h3>
                                  {date(job.created_at)}{" "}
                                  <span className="va-small">{job.status}</span>
                                </h3>
                                <button
                                  className="va-link"
                                  onClick={() =>
                                    download(
                                      `${project.domain}-${job.id}.json`,
                                      JSON.stringify(
                                        {
                                          project: {
                                            domain: project.domain,
                                            questions: project.questions,
                                          },
                                          run: job,
                                          answers,
                                        },
                                        null,
                                        2,
                                      ),
                                      "application/json",
                                    )}
                                >
                                  Download evidence
                                </button>
                              </div>
                              <div className="va-metrics">
                                <p>
                                  <strong>
                                    {pct(metrics.mentionRate)}
                                  </strong>Discovery mentions
                                </p>
                                <p>
                                  <strong>
                                    {pct(metrics.citationRate)}
                                  </strong>Discovery citations
                                </p>
                                <p>
                                  <strong>
                                    {metrics.valid}/{metrics.expected}
                                  </strong>Discovery answers received
                                </p>
                              </div>
                              {comparison && (
                                <div className="va-notice">
                                  <p>
                                    {comparison.mentionDelta === null
                                      ? "Numerical change withheld."
                                      : `Matched discovery change: ${
                                        comparison.mentionDelta > 0 ? "+" : ""
                                      }${
                                        comparison.mentionDelta.toFixed(1)
                                      } percentage points.`}{" "}
                                    {comparison.matched}{" "}
                                    successful answer pairs matched.
                                  </p>
                                  {comparison.warnings.map((w) => (
                                    <p key={w}>{w}</p>
                                  ))}
                                  <p>
                                    Change alone does not prove your website
                                    edits caused it.
                                  </p>
                                </div>
                              )}
                              <details className="va-details">
                                <summary>Read answers and sources</summary>
                                {answers.map((a) => (
                                  <article className="va-answer" key={a.id}>
                                    <h4>{a.provider} · {a.prompt}</h4>
                                    <p className="va-small">
                                      {a.status} ·{" "}
                                      {a.model || "Model unavailable"} ·{" "}
                                      {a.searched
                                        ? "Search used"
                                        : "Search not observed"}
                                    </p>
                                    {a.status === "succeeded"
                                      ? (
                                        <>
                                          <p className="va-answer-text">
                                            {a.answer}
                                          </p>
                                          <ul>
                                            {a.citations.filter((c) =>
                                              /^https?:\/\//.test(c.url)
                                            ).map((c) => (
                                              <li key={c.url}>
                                                <a
                                                  href={c.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                >
                                                  {c.title || c.url}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </>
                                      )
                                      : (
                                        <p>
                                          {a.error || "Waiting for an answer."}
                                        </p>
                                      )}
                                  </article>
                                ))}
                              </details>
                            </article>
                          );
                        })}
                    </section>
                    <section className="va-section">
                      <p className="va-eyebrow">Your change log</p>
                      <h2>Record what you publish.</h2>
                      <p>
                        Keep a dated note of website edits, new coverage, or
                        campaigns so future comparisons have context.
                      </p>
                      <form onSubmit={note}>
                        <label htmlFor="visibility-change">What changed?</label>
                        <textarea
                          id="visibility-change"
                          name="note"
                          required
                          maxLength={2000}
                          rows={3}
                          placeholder="Updated the service page with a clear description and customer FAQ."
                        />
                        <button
                          className="va-button va-secondary"
                          disabled={busy}
                        >
                          Save change
                        </button>
                      </form>
                      <ul className="va-changes">
                        {data.changes.filter((c) => c.project_id === selected)
                          .map((c) => (
                            <li key={c.id}>
                              <time>{date(c.created_at)}</time>
                              <p>{c.note}</p>
                            </li>
                          ))}
                      </ul>
                    </section>
                  </>
                )}
            </>
          )}
      </main>
      <footer className="va-workspace-footer"><span>Project Sapiens · Your customer workspace</span><nav aria-label="Workspace footer"><a href="mailto:tony@projectsapiens.xyz">Support</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer>
    </div>
  );
}
