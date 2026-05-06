# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server at http://localhost:5173
npm run build         # Production build
npm run lint          # ESLint all files
npm run typecheck     # TypeScript check without emitting (tsconfig.app.json)
npm run check:content # Validate lesson content freshness (tsx scripts/checkContentFreshness.ts)
npm run preview       # Preview production build locally
```

There is no test suite — rely on `typecheck` and `lint` for correctness verification.

## Architecture

**React 18 SPA + Supabase backend.** A structured AI-skills learning platform with lessons, labs, and community features.

### Frontend

`src/App.tsx` is the root router — it implements a state-machine style switch over a `currentView` string, rendering one of 20+ views. There is no React Router; navigation happens by calling `setCurrentView()` passed down as props or via Context.

State management uses four React Contexts:
- `AuthContext` — Supabase session, `signUp`/`signIn`/`signOut`, `user` object
- `BillingContext` — Subscription tier, usage quotas
- `DarkModeContext` — Theme preference
- `ToastContext` — Global notification queue

App state (current view, progress, etc.) is persisted to `localStorage` per user with a 24-hour expiry.

### Backend

Five Supabase Edge Functions (Deno/TypeScript, in `/supabase/functions/`):
- `lab-ai-chat` — Streams Google Gemini responses; rate-limited to 20 req/min per user; requires `GEMINI_API_KEY` secret
- `create-checkout-session` / `create-portal-session` / `stripe-webhook` — Stripe billing
- `get-usage-status` — Returns remaining quota per plan tier

Most Edge Functions authenticate callers by validating the Supabase JWT from the `Authorization: Bearer` header. The exception is `stripe-webhook`, which verifies the `Stripe-Signature` header cryptographically — do not add JWT auth to that function.

### Database

PostgreSQL via Supabase — no ORM, direct SQL through `@supabase/supabase-js`. All tables have Row Level Security (RLS) enabled. Migrations live in `/supabase/migrations/` (43 files, timestamp-ordered) and are applied via the Supabase Dashboard or CLI.

Security-sensitive functions use `SECURITY DEFINER` with `SET search_path = public` to prevent search path injection.

### AI Integration

`lab-ai-chat` Edge Function calls Google Gemini (`gemini-1.5-flash`). Frontend components that use AI (`LabSandbox.tsx`, `PromptPracticeChat.tsx`, `CreativeVoicePractice.tsx`, `PromptTester.tsx`) call Edge Functions via `fetch()` with the user's JWT.

### Content & Curriculum

Static lesson and path data lives in `src/data/`. The CI workflow (`.github/workflows/content-freshness.yml`) runs weekly to check content age and opens GitHub issues on staleness — `scripts/checkContentFreshness.ts` implements that logic.

## Environment Variables

Required for local development (not committed):
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

Edge Function secrets are set in the Supabase Dashboard (not in `.env`):
- `GEMINI_API_KEY`
- Stripe keys

## Key Conventions

- **No ORM** — write raw SQL via the Supabase client. Check existing migrations for table schemas before querying.
- **RLS is enforced** — every new table needs RLS policies; use `SECURITY DEFINER` functions with explicit `search_path = public` when bypassing RLS intentionally.
- **Admin portal** lives in `src/components/admin/` and is gated by `admin_roles` table; do not mix admin logic into regular user components.
- **Icons** — use Lucide React only (already optimized in Vite config).
- **Styling** — Tailwind utilities only; global styles in `src/index.css`.
