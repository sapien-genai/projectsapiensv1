# Client inquiries

The company homepage submits JSON to `/api/client-inquiry`, a Vercel Node function. Keep its explicit rewrite ahead of the SPA fallback in `vercel.json`.

The function validates and forwards the existing field names to the `contact` form on `https://tonymarks.com/` using URL-encoded POST. The project field is prefixed with `[Project Sapiens inquiry]` so these inquiries can be distinguished from personal-site submissions. This reuses the existing Netlify form storage, spam handling, and configured notifications; it requires no new browser secrets or database changes. Keep the personal site's contact form registration active and preserve its field names: name, email, company, project, stage, budget, timeline, website.

Only name, email, and project are required. Optional fields are stage, budget, timeline, and company. The browser keeps entered values on failure and only displays success after receiving `{ok:true}` from the function. The function checks method, origin, content type, field sizes, required values and email shape; a filled honeypot is discarded. Inquiry bodies are not logged. Netlify's spam filtering remains the downstream abuse control; origin validation is not a general-purpose bot limiter.

Run `node scripts/verify-client-inquiry.mjs` to exercise validation, honeypot, forwarding and upstream failures without sending live submissions. `npm run build`, `npm run typecheck`, and targeted ESLint check the UI. Plain Vite preview does not run Vercel functions; use a Vercel preview for real delivery testing. Local browser tests use simulated intake responses.

Before production rollout, submit one clearly labeled test through the Vercel preview and verify it appears in the tonymarks-github Netlify `contact` submissions and notification inbox (check spam). An upstream HTTP success confirms intake acceptance, not inbox delivery. Existing notifications are configured on the personal site; this change does not alter recipients. If the intake service is unavailable, the form retains details and offers the existing company email as a fallback.
