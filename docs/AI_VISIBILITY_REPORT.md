# Instant AI visibility report

The `/ai-visibility/` page lets a visitor enter a website and get a scored report on how AI assistants see that business. Scores are shown free; the answers, competitors, issues, technical checks and recommendations unlock when the visitor enters an email.

## How it works

`src/components/VisibilityChecker.tsx` calls one Supabase Edge Function, `visibility-report`, with three actions:

| Action | What it does |
| --- | --- |
| `start` | Validates the address, applies limits, creates a row in `visibility_reports`, and runs the report in the background. Returns the report id. |
| `status` | Returns progress while running, then the preview (scores and counts). Returns the full report only if that row has been unlocked. |
| `unlock` | Stores the email on the row and returns the full report. |

A run does four things (`supabase/functions/visibility-report/core/`):

1. **Reads the site** (`site.ts`): fetches the page without JavaScript plus `robots.txt`, `sitemap.xml` and `llms.txt`, and scores nine readability checks.
2. **Builds a profile** (`pipeline.ts`): a low-cost model extracts the business name, category and two questions a customer might ask.
3. **Asks each assistant** (`providers.ts`): "What is {name}?" plus the two category questions, with the provider's own web search turned on. That is three calls per assistant.
4. **Grades the answers**: a low-cost model scores recognition and accuracy against the site's own facts and lists gaps and competitors. Whether the business was mentioned in a category answer is decided by string match, not by a model.

Overall score = recognition 30% + discovery 30% + accuracy 20% + site readability 20%. Missing extraction, grading, or discovery measurements produce an unavailable overall score; the HTML score is never substituted for AI visibility. The report states how many assistants returned answers.

The full report never reaches the browser before unlock: the server sends `toPreview(report)` only.

## Deploying

The site change is inert until these are done in the Supabase project the academy already uses:

1. **Apply both migrations**, in order: `supabase/migrations/20261118120000_create_visibility_reports.sql` and `supabase/migrations/20261118130000_harden_visibility_reports.sql` (Dashboard SQL editor or `supabase db push`). The second migration adds atomic quota reservation and notification delivery tracking.
2. **Set secrets** (Dashboard → Edge Functions → Secrets). `GEMINI_API_KEY` already exists.
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (web search must also be enabled for the organization in the Anthropic Console)
3. **Deploy the function**: `supabase functions deploy visibility-report`
4. **Confirm Vercel has** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the production build. The academy already needs them.
5. Run one report, unlock it with a test email, and confirm the contact notification reaches Tony. Check `notification_status` and `notified_at` on the row. Test a second request for the same domain: it should immediately show a locked preview with a new report id.
6. Inspect provider coverage and web search flags before launch; missing keys are shown as unavailable assistants. Do not interpret a partial run as verification of all three providers.

## Settings (all optional secrets)

| Secret | Default | Purpose |
| --- | --- | --- |
| `VISIBILITY_OPENAI_MODEL` | `gpt-5.5` | Model used as "ChatGPT" |
| `VISIBILITY_ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model used as "Claude" |
| `VISIBILITY_GEMINI_MODEL` | `gemini-3.5-flash` | Model used as "Gemini" |
| `VISIBILITY_GRADER_MODEL` | same as the Gemini model | Model for extraction and grading |
| `VISIBILITY_WEB_SEARCH` | `on` | Set `off` to skip provider web search (cheaper, less like the consumer apps) |
| `VISIBILITY_IP_DAILY_LIMIT` | `3` | New reports per visitor per 24 hours |
| `VISIBILITY_DAILY_CAP` | `100` | New reports across all visitors per 24 hours. This is the spending ceiling. |
| `VISIBILITY_CACHE_DAYS` | `7` | A finished report for the same domain is reused for this long without new AI calls |
| `VISIBILITY_ALLOWED_ORIGINS` | none | Extra allowed origins, comma separated. The production domains, localhost and `*.vercel.app` are already allowed. |
| `VISIBILITY_LEAD_FORWARD_URL` | `https://tonymarks.com/` | Each unlock posts to the same existing Netlify contact intake used by `/api/client-inquiry`. Override only to another compatible intake. |
| `VISIBILITY_LEAD_FORM_NAME` | `contact` | Form name used with the setting above |

If a default model name is not available on your account, the assistant shows as "could not be tested"; set the matching secret to a model you have.

## Cost and abuse

With all three providers configured, each new report makes nine search-enabled assistant calls plus one extraction and three grading calls. Search fallback can add requests. Providers bill web search per search on top of tokens, so check current pricing and set `VISIBILITY_DAILY_CAP` to a number you are comfortable multiplying by. Reused reports cost nothing.

Protections: origin check, honeypot field, per-visitor limit, global daily cap, and domain reuse. Quota checks and insertion execute under one transaction-level database lock; database errors fail closed before paid work starts. There is no CAPTCHA. The origin check and per-visitor limit can be bypassed by a determined script; the global cap is what bounds spend.

The fetcher only requests public http(s) hosts on standard ports, re-validates every redirect hop, resolves DNS and refuses private addresses, and caps response size. It does not pin the resolved address for the request itself.

## Leads

Unlocks automatically forward the lead email, domain, score and report link to the existing contact intake. A database claim prevents simultaneous requests from sending the same notification; the original lead email cannot be overwritten by a later unlock. HTTP failures are checked, with up to three attempts for transient errors. The durable row tracks `pending`, `sending`, `sent`, or `failed`; `sent` means the intake accepted the submission, not proof that the downstream email arrived.

Failed or interrupted delivery retries when an unlocked report is reopened (or unlocked again), after a two-minute lease. Operators can retry a failed row by opening its report link. There is no independent scheduled retry worker yet, so monitor unsent leads; do not treat a successful report unlock as email delivery confirmation. The same lead may be delivered twice if the intake accepts it but the response is lost; the report id in the message supports deduplication.

Unlocked rows are the leads:

```sql
select email, domain, (report->>'overall')::int as score, unlocked_at,
       notification_status, notification_attempts, notified_at
from visibility_reports where email is not null order by unlocked_at desc;
```

RLS is on with no public policies; only the function (service role) and academy admins can read the table.

## Limits worth knowing

- Results come from developer APIs, not the consumer apps, and each question is asked once. The report says so. Answers vary between runs.
- Perplexity is not included.
- Sites that block automated requests will score low on readability even if AI crawlers are allowed through.
- The privacy policy section "Instant AI visibility report" describes this data flow. Review it before launch.

## Testing

`npm run check:visibility` runs the engine against simulated websites and providers (no real API calls). It covers address validation, page parsing, scoring, the locked preview, provider fallbacks and redirect handling. `deno test --node-modules-dir=none --allow-env supabase/functions/visibility-report/handler_test.ts` exercises cached start, preview gating, unlock, first-email preservation, quota errors and origin checks against a simulated database HTTP API. No live services are called.

`scripts/verify-visibility-database.py` checks concurrent global/IP quota reservations and notification leases against an empty, disposable local PostgreSQL database with both migrations applied. It refuses non-local database hosts. Do not run it against production.

Default model ids were checked against official documentation on November 18, 2026: [OpenAI](https://developers.openai.com/api/docs/models/gpt-5.5), [Anthropic](https://platform.claude.com/docs/en/models/sonnet-5-5/overview), [Google](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash). Account access and live responses still need verification. Operators can use the Supabase function Test panel with the service-role Authorization header and `GET ?check=providers` to inspect Gemini model availability without exposing credentials. Ordinary callers receive 403.
