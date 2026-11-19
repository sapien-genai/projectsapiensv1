# Self-service AI visibility

## Scope and launch status

Customer routes `/ai-visibility/dashboard/` and `/ai-visibility/login/` use the company website's header, footer, typography and colors. They do not mount AcademyApp, its onboarding, or its billing. The existing free checker links to the customer dashboard with a report ID. Google or email magic-link sign-in preserves that ID in both redirect URL and session storage. A verified email is required by the customer API.

The implementation is prepared for review, **not an activated paid service**. At the November 19 readiness check, email signup was enabled, Google was disabled, and the dedicated visibility Stripe configuration was absent. The user approved a $299 one-time package; the recommended tracking launch price is $29/month. Both live Stripe prices have been created. Checkout defaults closed. Do not advertise the product as available until activation and the end-to-end checks below pass.

A fix package is generated draft copy and an action plan based on a saved report. It does not publish changes, validate every business claim, or guarantee visibility. Failed package generation requires recovery/refund support. Monthly tracking runs the saved question set once per paid monthly period: two recognition questions and up to three unbranded discovery questions across three assistants. It is not daily monitoring or the 20-question Hotline pilot.

## Isolation

No changes to `visibility-report`, provider adapters, existing study tables/functions, the Hotline question set or its automation. New tables, functions, jobs and cost rows use a separate customer namespace. Stripe uses the existing account key when a dedicated visibility key is absent; the legacy secret name includes a trailing newline. The worker's daily call cap is separate (300 task claims by default); it does not consume or rewrite the pilot's reservation counters. No production AI calls were made to test this flow.

Only the signed-in owner can read projects and their orders/jobs/answers/notes through RLS. All writes require server-side authentication or a verified Stripe webhook. API service-role queries independently filter owner IDs; arbitrary project IDs do not grant access. Original public reports remain shareable; saving one does not claim verified domain ownership.

## Activate after review

1. Apply `20261119170000_visibility_customers.sql`, then `20261119171000_visibility_customer_scheduler.sql`. Enable Supabase Cron/pg_net and Vault in the target project. Apply only these migrations; do not blindly push unrelated historical migrations.
2. Configure Supabase Google OAuth with the company's Google OAuth client. Authorize `https://rlptteyefuojgaotulyx.supabase.co/auth/v1/callback` in Google. In Supabase redirect allowlist, allow `https://www.projectsapiens.ai/ai-visibility/dashboard/**` and the exact dashboard URL, including the report query string. Keep existing academy redirects. Configure/verify production email delivery and rate limits; test magic links across devices and Google callbacks.
3. In a Stripe sandbox first, create one USD one-time Price and one USD monthly Price (interval_count=1), with the agreed deliverables. Configure the customer portal for payment methods, invoices, and cancellation, without switching customers to unrelated academy prices.
4. Set Edge Function secrets: `VISIBILITY_STRIPE_SECRET_KEY` (optional override of the existing `STRIPE_SECRET_KEY`, including its legacy trailing-newline name), `VISIBILITY_FIX_PRICE_ID`, `VISIBILITY_TRACKING_PRICE_ID`, `VISIBILITY_STRIPE_WEBHOOK_SECRET`, `VISIBILITY_WORKER_SECRET`. Never commit keys. Optional `VISIBILITY_SITE_ORIGIN` defaults to `https://www.projectsapiens.ai`; `VISIBILITY_DEV_ORIGIN` is only for isolated testing. Existing AI provider keys/model overrides are reused read-only.
5. Deploy ONLY `visibility-customer`, `visibility-customer-webhook`, and `visibility-customer-worker` with `--no-verify-jwt`. The first verifies Supabase user tokens itself; webhook verifies Stripe HMAC and timestamp; worker requires its dedicated secret. Do not redeploy `visibility-report` for this feature.
6. Register Stripe webhook URL `https://rlptteyefuojgaotulyx.supabase.co/functions/v1/visibility-customer-webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, and `charge.refunded`. Store this endpoint's signing secret, not the academy webhook's.
7. Store Vault secrets `visibility_customer_worker_url` (the worker function URL) and `visibility_customer_worker_secret` (same value as its function secret). The new `visibility-customer-worker` cron job runs every minute; it does nothing until Vault secrets and eligible jobs exist. It does not depend on an open browser. Set `VISIBILITY_WORKER_ENABLED=true` only once the worker is verified. Disable it to stop new task claims.
8. Once sandbox tests pass, configure live Stripe products/secrets and set `VISIBILITY_CHECKOUT_ENABLED=true`. The server fetches authoritative amounts from Stripe; frontend cannot choose price IDs or amounts. No hardcoded proposed price appears in checkout. Set checkout false to pause sales without removing customer history.
9. Deploy the frontend through the usual PR/Vercel workflow. Catch-all app routing already handles the customer routes; no Vercel rewrite changes required. Private dashboard includes noindex.

Official references: [Supabase Google auth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [magic links](https://supabase.com/docs/reference/javascript/auth-signinwithotp), [scheduled functions](https://supabase.com/docs/guides/functions/schedule-functions), [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment), [subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks).

## Payment and work semantics

Checkout redirects never unlock purchases. Stripe payment state is fetched server-side. One-time purchases require a succeeded payment; fully refunded charges are rejected. Tracking is fulfilled by a paid subscription invoice, using its paid period, including the initial invoice. Repeated deliveries are deduplicated atomically by event ID and order/period. Monthly invoices queue future runs automatically; this also prevents a separate cron from accidentally running unpaid months. Cancellation stops new claims on canceled orders; paid-through dates prevent execution after expiry. Results already delivered remain available.

A worker claims one task atomically and records usage before a paid provider call. Interrupted tasks become failed, not automatically retried, because they might already have been billed. History excludes failures from percentages and displays coverage. Numerical comparisons require identical definitions/configuration and matching returned models. Actual search changes are disclosed. Monthly dates follow the subscription billing period, not a fixed 30-day timer.

Customer task usage is stored in `visibility_customer_usage.entry`, with original pricing version, actual model, tokens, searches and unknown costs. It is service-only; do not leak internal costs or another customer's usage into dashboard responses. The UI does not currently send completion emails; customers see saved results in their dashboard. Stripe receipts and account email delivery are configured separately.

## Validation and launch gates

Local checks: frontend typecheck, changed-file ESLint, production/prerender build, existing `check:visibility` regression suite, Deno checks and `core_test.ts`. `scripts/verify-visibility-customer-database.py` refuses a nonempty target and runs only in a named disposable local database. It exercises payment entitlement, duplicate invoices/events, concurrent claims, RLS owner isolation, write denial, interrupted work, monthly renewal, daily limits and cancellation.

Chrome verified login styling and mobile customer history/change notes using a separate local fixture. Fixture files are not shipped. This is not proof of live authentication, payment processing, or cron delivery.

Before opening sales, verify: Google and email login/return report, two real test users' isolation, paid one-time checkout, asynchronous payment failure/success, duplicate webhook delivery, subscription initial/renewal invoice, failed renewal and cancellation, full refund, package generation, monthly worker completion with browser closed, downloadable evidence, and billing portal. Test Stripe webhooks end to end in sandbox; direct DB tests do not replace those checks. Confirm expected recovery/refund support and final pricing before collecting money.

## Pricing research, November 19

The launch package is $299, approved November 19. Recommended monthly tracking is $29. [Otterly](https://otterly.ai/pricing?hubspot_post-cta=anchor) lists $29/month for 15 daily prompts and $189/month for 100, with additional assistants as add-ons. [WebFX](https://www.webfx.com/seo/pricing/ai-seo/) starts at $3,000/month with hands-on optimization. These differ materially from a draft-only package and a small monthly API panel. Suggested testing range for this draft package: $199–$299; a $1,000 offer should include implemented, verified changes. Do not imply this implementation delivers that larger service.

## Activation progress — November 19

The two customer migrations are applied and recorded. The three customer functions are deployed. The worker secret is configured in Edge Function secrets and Vault. The customer cron exists, with worker execution disabled. The live Stripe products are $299 once and $29/month. A separate six-event visibility webhook is active and its signing secret is stored. The company dashboard redirect is allowed. Checkout remains disabled pending successful price lookup, authentication, and payment validation. Google OAuth setup is in progress.
