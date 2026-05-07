# Guided Prompt Exercise — Implementation Plan

Four PRs, each independently reviewable and deployable. PRs 2 and 3
depend only on PR 1 and can be developed in parallel, but both should
be merged before PR 4 is opened. PR 4 is the only PR that makes the
feature visible to users.

---

## PR 1 — Database migrations

**Title:** `Add exercise feature tables: ai_usage_log, evaluator_failures, exercise_attempts`

**Files added:**
- `supabase/migrations/20260507120000_create_ai_usage_log.sql`
- `supabase/migrations/20260507120100_create_evaluator_failures.sql`
- `supabase/migrations/20260507120200_create_exercise_attempts.sql`

**Precondition note — `ai_usage_daily`:** this table already exists, created
in `20260121165027_create_billing_and_usage_system.sql` with columns
`(user_id, day, count, last_request_at)`, composite primary key, and
server-only write RLS. Both edge functions (PRs 2 and 3) will increment it
via `supabaseAdmin` using the same upsert pattern already in `lab-ai-chat`.
No migration needed.

**Dependencies:** none — this is the foundation for all subsequent PRs.

**Estimated diff:** ~75 lines of SQL across three files.

**Verification before merge:**
- Apply locally: `supabase migration up` and confirm all three tables exist
  with correct columns and constraints.
- RLS smoke-test with two test users:
  - Authenticated user can `SELECT` own rows from `ai_usage_log` and
    `exercise_attempts`; cannot select another user's rows.
  - Authenticated user can `INSERT` into `exercise_attempts` with matching
    `user_id`; insert with a mismatched `user_id` is rejected.
  - `evaluator_failures` returns empty for any authenticated non-admin user.
  - Service-role client (simulated via `supabase_admin`) can insert into all
    three tables.
- Confirm foreign-key cascade: deleting a user cascades deletes in all three
  tables.

---

## PR 2 — lab-ai-chat: exercise-lab system prompt + usage logging

**Title:** `lab-ai-chat: add exercise-lab system prompt and ai_usage_log writes`

**Files modified:**
- `supabase/functions/lab-ai-chat/index.ts`

**What changes inside the file (~45 lines added to an 884-line function):**
1. New `"exercise-lab"` entry in `labSystemPrompts` — plain-text formatting
   rules identical to the existing lab prompts, with an instruction set suited
   to responding to user prompts as a practice subject (not as a writing or
   analysis assistant).
2. After a successful Gemini stream completes, write one row to `ai_usage_log`
   using `supabaseAdmin`, with `feature_id = 'exercise_response'`. Token counts
   come from `usageMetadata` in the final SSE chunk. Write failure logs a
   warning and does not affect the streamed response — same defensive pattern
   as the existing `createLabRun` / `updateLabRun` calls.
3. Also increment `ai_usage_daily` for the `exerciseId`-carrying request, same
   upsert path already used for lab chat calls.
4. The `ai_usage_log` write only fires when `exerciseId` is present in the
   request body; all existing non-exercise lab calls are unaffected.

**Dependencies:** PR 1 (`ai_usage_log` table must exist before deploying).

**Estimated diff:** ~45 lines added, 0 deleted.

**Verification before merge:**
- Deploy to Supabase staging.
- POST `{ prompt: "...", labId: "exercise-lab", exerciseId: "test-ex" }` with a
  valid JWT — confirm a coherent plain-text formatted response returns.
- Query `ai_usage_log` on staging — confirm one new row with
  `feature_id = 'exercise_response'`, correct `exercise_id`, non-zero token counts.
- POST with `labId: "writing-lab"` (no `exerciseId`) — confirm no `ai_usage_log`
  row is written and existing behaviour is unchanged.
- POST with `labId: "analysis-lab"` and `labId: "creative-lab"` — confirm
  existing labs are unaffected.

---

## PR 3 — New edge function: lab-exercise-feedback

**Title:** `Add lab-exercise-feedback edge function for structured prompt evaluation`

**Files added:**
- `supabase/functions/lab-exercise-feedback/index.ts`

**Dependencies:** PR 1 (`ai_usage_log` and `evaluator_failures` tables must
exist before deploying). PR 2 does not need to be merged first — these two
functions are independent of each other.

**Estimated diff:** ~220 lines (entirely new file). The auth, rate-limiting, and
Supabase client setup follow the `lab-ai-chat` structure; the function diverges
for the non-streaming Gemini call, JSON parsing, and retry logic.

**Key implementation notes:**
- Uses `generateContent` (non-streaming), not `streamGenerateContent`.
- Validates the response body is valid JSON matching `ExerciseFeedback` before
  returning. On parse failure, retries once with identical inputs.
- If retry also fails: writes raw output to `evaluator_failures` via
  `supabaseAdmin`, returns `500 { error: "parse_error" }`. Raw output is never
  included in the response body.
- Writes one `ai_usage_log` row on success with `feature_id = 'exercise_evaluation'`.
- Increments `ai_usage_daily` for the calling user on each attempt (including
  the retry), consistent with Q1 decision in the design doc.
- Rate limiter: in-memory, 20 req/min per user, same pattern as `lab-ai-chat`.

**Verification before merge:**
- Deploy to Supabase staging.
- POST a valid evaluation payload — confirm `ExerciseFeedback` JSON returned
  with `strengths`, `improvements`, `score`, and `summary` fields.
- POST with missing `userPrompt` — confirm `400`.
- POST without `Authorization` header — confirm `401`.
- Simulate parse failure (stub Gemini to return prose instead of JSON) — confirm
  auto-retry fires once, then a `evaluator_failures` row is written, and
  `500 { error: "parse_error" }` is returned with no raw output in the body.
- Confirm `ai_usage_log` row written on success with correct token counts.
- Confirm rate limiter fires at request 21 within a minute.

---

## PR 4 — PromptExerciseBlock component + LessonViewer integration + pilot exercise

**Title:** `Add PromptExerciseBlock with first pilot exercise on lesson-1-2`

**Files added:**
- `src/components/PromptExerciseBlock.tsx`

**Files modified:**
- `src/data/lessonContent.ts` — add `EvaluationCriterion` and `PromptExerciseBlock`
  interfaces, extend the content union, and add one `promptExercise` block to
  lesson-1-2 (the CONTEXT + TASK + FORMAT lesson — the natural home for the
  first exercise).
- `src/components/LessonViewer.tsx` — add `promptExercise` dispatch branch in
  the content-block renderer, following the existing `if (block.type === ...)`
  pattern used for `snapshotRef`. No other changes to this file.

**Why combined:** the component alone has no real content to verify against,
making its verification step depend on temporary test fixtures that would be
removed before merge. Shipping with one real exercise means the component is
reviewed against actual content and the end-to-end flow can be verified cleanly.
The combined diff (~390 lines) is still within a reviewable range.

**Dependencies:** PRs 2 and 3 must both be merged and deployed before this PR
merges to `dev`. The component calls both `lab-ai-chat` (step 1, streaming) and
`lab-exercise-feedback` (step 2, JSON); if either function is absent in the
deployed environment, submissions will error. During development both calls
can be exercised against staging.

**Estimated diff:** ~390 lines — ~310 lines for the new component, ~20 lines
in `lessonContent.ts` for the type extension, ~45 lines for the pilot exercise
definition, ~15 lines in `LessonViewer.tsx` for the dispatch branch.

**Component state machine to cover in review:**
- `idle` → `filling` → `submitting` → `streaming` → `response_received` →
  `complete`; all error branches (`error_api`, `error_rate_limit`, `error_parse`);
  `revealed` toggle.
- On mount: query `exercise_attempts` for `(user_id, exercise_id)` and restore
  to `complete` state if a prior attempt exists, pre-filling blank values from
  the saved `user_prompt`.
- On successful submit: insert new `exercise_attempts` row client-side using
  the user's Supabase session. Insert failure is swallowed — logged to console,
  UI stays in `complete` state.
- `{{blank_name}}` parsing: regex extracts unique placeholder names from
  `template`; each becomes a controlled text input; Submit is disabled until
  all inputs are non-empty.
- "Try again" resets blanks and returns to `idle`; does not delete any
  `exercise_attempts` rows.

**Verification before merge:**
- `npm run typecheck` — passes.
- `npm run build` — passes, no new chunk-size regressions beyond the existing
  pre-PR warning.
- `npm run dev` — navigate to lesson-1-2 and run the full sequence:
  - All blanks empty → Submit disabled.
  - Fill all blanks → Submit enabled.
  - Submit → streaming state; AI response renders token-by-token.
  - Stream completes → evaluation spinner; feedback card appears with
    strengths, improvements, summary. Score not rendered.
  - "Show reference solution" toggles the reference callout in; "Hide
    reference" collapses it.
  - "Try again" resets blanks and hides feedback.
  - Reload page → prior attempt restores to `complete` state with saved
    prompt values and feedback.
  - Second submission → new `exercise_attempts` row inserted; both rows
    present in DB, prior row preserved.
  - Simulate 429 from `lab-ai-chat` → rate-limit error state shown.
  - Simulate `500 { error: "parse_error" }` from `lab-exercise-feedback` →
    friendly message shown; no raw output visible to user.
- Regression: snapshot inline links in lesson-1-3 still navigate without page
  reload (PR #42 behaviour preserved).
- Navigate between lessons — no exercise state leaks from lesson-1-2 into
  another lesson's view.

---

## Merge sequence summary

```
PR 1 (migrations)
  ├── PR 2 (lab-ai-chat updates)   ─┐
  └── PR 3 (lab-exercise-feedback) ─┘ merge in either order
                                      │
                                 PR 4 (component + types +
                                       LessonViewer + pilot content)
                                       └── feature live for users
```

PRs 2 and 3 can be reviewed and merged in either order after PR 1. PR 4 must
not merge until both PR 2 and PR 3 are deployed. PR 4 is the only PR that
makes the feature visible to users; all prior PRs are inert from a user
perspective.
