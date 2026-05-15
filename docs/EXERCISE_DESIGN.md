# Guided Prompt Exercise — Design Document

## 1. TypeScript Interface

### New content block type

```ts
// Add to lessonContent.ts alongside the existing union members

interface EvaluationCriterion {
  id: string;          // machine key, e.g. "has_context"
  label: string;       // human label, e.g. "Includes relevant context"
  description: string; // what the evaluator looks for in the user's prompt
}

interface PromptExerciseBlock {
  type: 'promptExercise';
  id: string;                        // unique, stable identifier for logging, e.g. "ex-1-2-trip-planning"
  label: string;                     // displayed heading, e.g. "Exercise: Trip Planning"
  scenario: string;                  // plain text describing the real-world task
  template: string;                  // prompt scaffold using {{blank_name}} placeholders
  criteria: EvaluationCriterion[];   // what the evaluator grades against
  referenceSolution: string;         // the "good" example prompt, hidden until user reveals it
}
```

### Extended content union in `lessonContent.ts`

```ts
interface LessonContent {
  title: string;
  duration: string;
  lastReviewed?: string;
  volatility?: 'low' | 'medium' | 'high';
  reviewIntervalDays?: number;
  content: (
    | { type: 'text' | 'tip' | 'example' | 'exercise'; content: string }
    | { type: 'snapshotRef'; snapshotId: string; label: string; style: 'callout' | 'inline' }
    | PromptExerciseBlock
  )[];
}
```

### Placeholder syntax

`{{blank_name}}` — double curly braces with a snake_case descriptor. Each unique
placeholder in the template string becomes one editable text input in the UI.
Named (not positional) so authors can reorder or reuse blanks without renumbering,
and so error messages can reference the blank by name.

Example template:

```
Help my friend plan a {{trip_duration}} trip to {{destination}}.
They want to focus on {{interest_1}} and {{interest_2}}.
Please give the itinerary in {{output_format}}.
```

---

## 2. Evaluation Prompt Template

Exercise submission is a two-step sequential Gemini call:

**Step 1 — Prompt execution**: the user's completed prompt is sent to Gemini
via the existing `lab-ai-chat` edge function (with `labId: "exercise-lab"`),
using the existing streaming SSE pattern. The response renders token-by-token
in the UI as it arrives. Step 2 does not begin until the stream completes.

**Step 2 — Evaluation**: once streaming finishes, the new `lab-exercise-feedback`
function sends a non-streaming evaluator request that combines user prompt,
AI response, criteria, and reference solution, and returns a JSON feedback object.

### Evaluator system prompt

```
You are an expert prompt-writing coach evaluating a student's AI prompt.
You will receive: the student's prompt, the AI's actual response to it,
evaluation criteria, and a reference solution.

Respond ONLY with valid JSON matching this exact schema — no prose, no markdown:
{
  "strengths": ["<what the prompt did well>", ...],
  "improvements": [
    { "criterion": "<criterion id>", "suggestion": "<specific, actionable suggestion>" },
    ...
  ],
  "score": <integer 1–5>,
  "summary": "<one or two sentences summarizing the overall quality>"
}

Rules:
- strengths: 1–3 items; be specific about what language or structure worked
- improvements: one item per criterion that was not fully met; omit met criteria
- score: 1 = missing most criteria, 3 = meets basics, 5 = matches or exceeds reference
- summary: constructive, not discouraging; focus on the most impactful improvement
```

### Evaluator user message (constructed at runtime)

```
STUDENT'S PROMPT:
{{userPrompt}}

AI'S RESPONSE TO THAT PROMPT:
{{aiResponse}}

EVALUATION CRITERIA:
{{criteria as numbered list: "1. [label]: [description]"}}

REFERENCE SOLUTION (a strong example prompt for this scenario):
{{referenceSolution}}
```

### Structured output schema (what the function returns to the client)

```ts
interface ExerciseFeedback {
  strengths: string[];
  improvements: { criterion: string; suggestion: string }[];
  score: number;      // 1–5; captured and logged, not displayed in pilot UI
  summary: string;
}
```

`score` is captured and logged but not displayed in the pilot UI. Qualitative
feedback (strengths + improvements + summary) ships first; score display is a
post-pilot decision once we know how students react to numeric grades.

---

## 3. UI States

The exercise component (`PromptExerciseBlock.tsx`) moves through these states:

| State | What's visible | User actions |
|---|---|---|
| `idle` | Scenario text, template with empty blanks, Submit disabled | Start typing |
| `filling` | Scenario, template with partial/complete blanks, Submit enabled when all blanks non-empty | Edit blanks, Submit |
| `submitting` | Template locked (inputs disabled), spinner on Submit, "Generating response…" | — |
| `streaming` | Template locked, AI response renders token-by-token below template; transitions to `response_received` on final SSE chunk | — |
| `response_received` | Full AI response shown, "Evaluating your prompt…" spinner | — |
| `complete` | AI response + feedback card (strengths, improvements, summary); "Try again" + "Show reference solution" buttons | Try again, reveal reference |
| `error_api` | Inline error: "Something went wrong. Try submitting again." | Retry |
| `error_rate_limit` | Inline error: "You've hit the request limit. Try again in a minute." | Wait, retry |
| `error_parse` | Auto-retries evaluation once silently; if retry also fails, shows: "We couldn't generate detailed feedback this time. Your prompt and the AI's response are above — feel free to revise and try again." | Try again |
| `revealed` | Reference solution shown in a callout below feedback; "Hide reference" toggle | Hide reference, Try again |

**State transition: `streaming` → `response_received`**: triggered by receipt
of the final SSE chunk from `lab-ai-chat` (the `[DONE]` sentinel or stream
close). The full accumulated response string is then passed as `aiResponse`
to the step 2 evaluation call.

**"Try again"** clears all blank inputs and resets to `idle`. The scenario and
template scaffold remain visible — the user doesn't need to re-read the setup.
Each "Try again" submission creates a new `exercise_attempts` row (see §8).

**"Show reference solution"** is available from `complete` state onward. It
requires no API call — the reference solution is in the block definition and
is toggled into view client-side.

**Parse error recovery**: on a parse failure in step 2, the function retries
the evaluation call once automatically with the same inputs, with no user
action required. If the retry also fails, the friendly message above is shown.
The raw model output that failed to parse is logged server-side (see §7) and
never surfaced to the user.

**Retry behaviour for API errors**: shows a retry button that re-submits from
step 1. Rate-limit errors show the retry button disabled with an estimated wait
time derived from the `429` response, matching the existing `lab-ai-chat`
pattern.

---

## 4. Edge Function Changes

### Recommendation: new function `lab-exercise-feedback`

Do **not** extend `lab-ai-chat` for evaluation. The reasons:

1. **Streaming vs. JSON**: `lab-ai-chat` uses `streamGenerateContent` with SSE,
   which is the correct pattern for step 1 (token-by-token response rendering).
   The evaluation step needs a complete JSON object before the client can render
   feedback — parsing structured JSON from a stream is fragile. Step 2 uses
   Gemini's non-streaming `generateContent` endpoint.

2. **Different request shape**: `lab-ai-chat` accepts `{ prompt, labId, mode,
   conversationHistory }`. The evaluator needs `{ exerciseId, userPrompt,
   aiResponse, criteria, referenceSolution }` — forcing these into the existing
   shape would require undocumented field overloading.

3. **Different billing semantics**: in the future, exercise evaluation calls
   may be priced or rate-limited differently from chat. Keeping them in separate
   functions preserves that option without a refactor.

**Step 1** (running the user's prompt) reuses `lab-ai-chat` with a new
`labId: "exercise-lab"`. A corresponding entry is added to `labSystemPrompts`
in that function, with the same plain-text formatting rules as the existing
lab prompts.

### New function: `lab-exercise-feedback`

```
POST /functions/v1/lab-exercise-feedback
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

Request body:
```ts
{
  exerciseId: string;
  userPrompt: string;
  aiResponse: string;           // full accumulated text from the completed stream
  criteria: EvaluationCriterion[];
  referenceSolution: string;
}
```

Success response `200`:
```ts
{
  strengths: string[];
  improvements: { criterion: string; suggestion: string }[];
  score: number;
  summary: string;
}
```

Error responses mirror `lab-ai-chat` conventions:
- `401` invalid/missing JWT
- `400` missing required fields
- `429` rate limit (same in-memory rate limiter pattern)
- `500` Gemini call failed; `{ error: "parse_error" }` if JSON parse failed
  after both attempts (raw output is logged, not returned)

The function calls Gemini's non-streaming `generateContent` endpoint, parses
the JSON response, validates the shape, and returns it. On a parse failure it
retries once. If the retry also fails, it logs the raw output to
`evaluator_failures` (see §7) and returns `500` with `error: "parse_error"`.

Token counts from the Gemini response's `usageMetadata` field are written to
`ai_usage_log` before returning (see §7).

---

## 5. Authoring Workflow

A content author adds a `promptExercise` block to a lesson in
`src/data/lessonContent.ts` using the following shape:

```ts
{
  type: 'promptExercise',
  id: 'ex-1-2-trip-planning',
  label: 'Exercise: Trip Planning',
  scenario: `Your friend is planning their first solo trip and has asked for your help. ` +
    `They want specific recommendations, not vague suggestions. ` +
    `Use what you've learned about the CONTEXT + TASK + FORMAT structure to write a prompt ` +
    `that will give your friend an actually useful itinerary.`,
  template: `I'm helping a friend plan a {{trip_duration}} trip to {{destination}}. ` +
    `They're most interested in {{interest_1}} and {{interest_2}}. ` +
    `Please create an itinerary in {{output_format}} format.`,
  criteria: [
    {
      id: 'has_context',
      label: 'Includes relevant context',
      description: 'The prompt gives the AI enough background to personalise the response — duration, destination, interests.',
    },
    {
      id: 'has_task',
      label: 'States a clear task',
      description: 'The prompt explicitly asks for an itinerary, not just general advice.',
    },
    {
      id: 'specifies_format',
      label: 'Specifies output format',
      description: 'The prompt tells the AI how to structure the response.',
    },
  ],
  referenceSolution: `My friend is taking a 7-day solo trip to Lisbon. ` +
    `They love food, walking neighbourhoods, and free or low-cost cultural experiences — ` +
    `not nightlife or beaches. Please create a day-by-day itinerary in a simple table ` +
    `with columns for morning, afternoon, and evening.`,
}
```

No tooling required. The TypeScript type system catches missing required fields
at `typecheck` time once the type is added to the content union.

---

## 6. Open Questions and Recommended Decisions

**Q1: Should both AI calls (step 1 + step 2) count against the user's existing
daily usage quota tracked in `ai_usage_daily`?**

Recommended: **yes**, increment `ai_usage_daily` for each call (step 1 via
`lab-ai-chat`, step 2 via the new function). Each is a real Gemini call.
Revisit if exercises need a separate budget post-pilot.

**Q2: Should exercise attempts be persisted across sessions?**

Recommended: **yes, persist in the pilot**. Alpha testers will close the tab
and return; without persistence they either redo exercises (wasting tokens) or
skip them. Persisted attempts are also free analytics for product decisions.
See §8 for the schema.

**Q3: Should the score (1–5) be shown in the UI?**

Recommended: **no for pilot**. Show strengths, improvements, and summary only.
Numeric scores introduce grade anxiety that may discourage experimentation.
The score field stays in the schema for logging; display it only after piloting
with real users.

**Q4: What happens if the user leaves a blank empty and submits?**

Recommended: **block submission** — Submit is disabled until all `{{blank_name}}`
placeholders have non-empty values. The blank input highlights on attempted
submission. This keeps evaluation quality high.

**Q5: Should `lab-exercise-feedback` share the same rate limit as `lab-ai-chat`?**

Recommended: **separate rate limit, same threshold for pilot** (20 req/min).
In-memory rate limiter in the new function, same pattern as `lab-ai-chat`.
They're separate Deno processes; shared state would require a database-backed
counter, adding complexity not needed for the pilot.

**Q6: Where does LessonViewer render the new block?**

Recommended: **same `if (block.type === 'promptExercise')` dispatch pattern**
used for `snapshotRef` in `LessonViewer.tsx`. The block renders a standalone
`PromptExerciseBlock` component that owns all its own state. No props need to
flow up to `LessonViewer` except the user's `lessonId` (needed for attempt
persistence scoping).

---

## 7. Cost Considerations

### Token estimates per exercise submission

| Step | Input tokens | Output tokens |
|---|---|---|
| Step 1: exercise system prompt | ~200 | — |
| Step 1: user's completed prompt | ~80 | — |
| Step 1: AI response | — | ~300 |
| Step 2: evaluator system prompt | ~250 | — |
| Step 2: user prompt + AI response + criteria + reference | ~700 | — |
| Step 2: JSON feedback | — | ~180 |
| **Total** | **~1,230 input** | **~480 output** |

### Approximate cost at Gemini 1.5 Flash pricing

Gemini 1.5 Flash: $0.075 / 1M input tokens, $0.30 / 1M output tokens.

- Input: 1,230 × ($0.075 / 1,000,000) ≈ **$0.000092**
- Output: 480 × ($0.30 / 1,000,000) ≈ **$0.000144**
- **Total per submission: ~$0.00024 (roughly 4,200 submissions per dollar)**

Verify pricing before launch — Flash pricing has changed in 2024–2025.

### `ai_usage_log` table (new)

```sql
CREATE TABLE ai_usage_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id    text        NOT NULL,  -- 'exercise_response' | 'exercise_evaluation' | 'lab_chat'
  exercise_id   text,                  -- null for non-exercise calls
  model         text        NOT NULL,
  input_tokens  integer     NOT NULL,
  output_tokens integer     NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own usage" ON ai_usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins read all usage" ON ai_usage_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );

-- All writes come from the service role inside edge functions; no client insert policy
```

### `evaluator_failures` table (new)

Stores raw model output when JSON parsing fails, for debugging only. Never
read by the client.

```sql
CREATE TABLE evaluator_failures (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id    text        NOT NULL,
  raw_output     text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evaluator_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read failures" ON evaluator_failures
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );

-- No client read or write policy; service role only
```

### What gets logged and where

- **`lab-ai-chat`** (step 1): writes one `ai_usage_log` row with
  `feature_id = 'exercise_response'` and `exercise_id` from the request body.
  Token counts come from `usageMetadata` in the Gemini REST response (available
  in the final SSE chunk).
- **`lab-exercise-feedback`** (step 2): writes one row with
  `feature_id = 'exercise_evaluation'`. On parse failure after both attempts,
  writes the raw output to `evaluator_failures` before returning the error.

Both functions write using the `supabaseAdmin` (service-role) client, bypassing
RLS. No client-side write path is opened.

---

## 8. Persistence Schema

### `exercise_attempts` table

```sql
CREATE TABLE exercise_attempts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     text        NOT NULL,
  lesson_id       text        NOT NULL,
  user_prompt     text        NOT NULL,   -- the filled-in template the user submitted
  ai_response     text        NOT NULL,   -- full streamed response from step 1
  feedback_json   jsonb       NOT NULL,   -- the ExerciseFeedback object from step 2
  score           integer,               -- extracted from feedback_json for easy querying
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own attempts" ON exercise_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users insert own attempts" ON exercise_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read all attempts" ON exercise_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );
```

### Component behaviour

**On mount**: the component queries `exercise_attempts` for the most recent row
matching `(user_id, exercise_id)`, ordered by `created_at DESC`. If a row
exists, the component restores to `complete` state: the saved `user_prompt` is
parsed back into blank values, `ai_response` is rendered, and `feedback_json`
is displayed as feedback. The user sees their last submission immediately, with
"Try again" available.

**On submit**: after both step 1 and step 2 complete successfully, a new row is
inserted into `exercise_attempts`. This happens client-side using the user's
Supabase session (the RLS insert policy permits it). Each submission is a
separate row — previous attempts are never overwritten, preserving the full
attempt history for analytics.

**"Try again"**: clears blank inputs and resets to `idle`. The component does
not delete any existing `exercise_attempts` rows. The next successful submission
will insert a new row and become the row restored on the next mount.

**Failure handling**: if the insert fails (network error, RLS violation), the
UI remains in `complete` state with feedback visible. The failure is logged to
the console but not surfaced to the user — a failed persist is better than a
broken feedback screen.
