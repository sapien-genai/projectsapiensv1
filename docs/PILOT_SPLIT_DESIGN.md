# Pilot Split Candidate: `lesson-1-3` — The 3 Types of AI You Use Every Day

## 1) Selected lesson

- **Lesson ID:** `lesson-1-3`
- **Title:** The 3 Types of AI You Use Every Day
- **Current word count:** ~384 words (current implementation text)
- **Current classification:** **TANGLED**
- **Current snapshot share:** **34.3%**

## 2) Rationale for selection

This lesson is the strongest pilot candidate even though it does not perfectly hit the 40–70% snapshot target.

Why it still wins:

1. **Meets the must-have criterion (TANGLED):** it is explicitly classified as TANGLED in the audit.
2. **Closest beginner-path fit among top tangled options:** it lives in **AI for Everyday Life** and introduces core mental models for first-time learners.
3. **Substantial (but not dominant) snapshot content:** at 34.3%, it already contains enough named-tool references to demonstrate the split pattern in a meaningful way.
4. **Self-contained structure:** the lesson teaches a standalone framework (predictive vs conversational vs generative AI) and can be consumed without strong dependence on downstream lessons.

Why not alternatives:

- Lessons in the exact 40–70% range are mostly **PURE SNAPSHOT**, not TANGLED (fails criterion #1).
- Higher-tangled business/productivity candidates are less aligned with beginner-first goals.
- `mastery-lesson-*` options are less beginner-oriented than `ai-everyday-life`.

> Note: The audit currently shows **no TANGLED beginner-track lesson in the 40–70% band**. This makes `lesson-1-3` the best compromise for the pilot.

## 3) Proposed concept lesson (evergreen)

- **New title:** The 3 Types of AI You Use Every Day (Concepts)
- **Summary (3–5 sentences):**
  This lesson introduces the three durable AI interaction patterns users encounter in daily life: predictive, conversational, and generative AI. It teaches how each type works at a conceptual level, what kinds of tasks each is best suited for, and how to identify overlap in modern tools. Learners practice classifying real-world AI interactions so they can choose the right interaction mode for a given goal. The lesson stays evergreen by removing product-specific recommendations and focusing on decision frameworks and usage heuristics.
- **Volatility tier / review interval:** **low / 365 days**
- **Proposed section outline:**
  1. Why AI “types” matter for better outcomes
  2. Predictive AI: pattern recognition and ranking
  3. Conversational AI: intent understanding and iterative dialogue
  4. Generative AI: synthesis and creation from constraints
  5. Hybrid systems: when one product spans all three types
  6. Mini exercise: classify your last 5 AI interactions
- **Snapshot companion anchor points (where links should appear):**
  - In the **Conversational AI examples** paragraph (currently names specific chat assistants)
  - In the **Generative AI examples** paragraph (currently names image-generation products)
  - In the **“modern tools combine all three” tip** callout
  - In the **real-world combo example** that currently names a specific assistant

Suggested inline link label: **“See Current AI Tool Landscape →”**

## 4) Proposed snapshot companion (volatile)

- **Proposed file location:** `src/data/snapshots/everyday-ai-types-landscape.ts`
  - Proposed structure:
    - exported metadata (`id`, `title`, `lastReviewed`, `volatility`, `reviewIntervalDays`)
    - exported section blocks mirroring lesson anchors
    - array-based recommendations with fields like `toolName`, `bestFor`, `strengths`, `limitations`, `starterPrompt`, `notes`
- **Title pattern:**
  - **Current AI Tool Landscape for AI Types (Reviewed 2026-05-03)**
- **Sections:**
  1. Conversational assistants (general-purpose)
  2. Voice assistants and embedded conversational interfaces
  3. Generative image/video tools
  4. Hybrid tools spanning predictive + conversational + generative behavior
  5. “How to choose this week” quick rubric
- **Example entries (restructured from current inline recommendations):**
  - **ChatGPT / Claude class (conversational):**
    - Best for Q&A, brainstorming, drafting, iterative refinement
    - Starter prompt template for follow-up questioning
    - Caveat: output quality depends heavily on prompt context
  - **Siri / Alexa / Google Assistant class (voice conversational):**
    - Best for quick commands, reminders, and low-friction utility tasks
    - Caveat: less suitable for long-form reasoning/writing workflows
  - **DALL·E / Midjourney class (generative image):**
    - Best for rapid visual ideation, concept art, and style exploration
    - Caveat: prompt specificity and iteration are required for precise results
  - **“All-in-one assistant” category:**
    - Maps where a single product combines predictive suggestions, dialogue, and generation
    - Includes short “when to use one tool vs specialized stack” guidance
- **Volatility tier / review interval:** **high / 90 days**

## 5) Open questions / decisions needed (human approval required before Prompt 3)

### Decision A — Snapshot storage format
- **Question:** Should snapshots live as `.ts` data files (parallel to lessons) or as `.md/.mdx` content files?
- **Recommendation:** Use **`.ts` files** for pilot speed and predictable rendering in the existing content pipeline; revisit MDX once authoring workflows mature.
- **Status:** **Needs human approval**.

### Decision B — Snapshot link UX in lesson
- **Question:** Should the lesson link render inline (“see Current AI Tool Landscape →”) or in sidebar/callout UI?
- **Recommendation:** Use **inline links at each relevant anchor + one summary callout** near the top for discoverability without overloading the sidebar.
- **Status:** **Needs human approval**.

### Decision C — Snapshot artifact visibility in app
- **Question:** Should snapshots be first-class standalone pages or only referenced from lessons?
- **Recommendation:** Make snapshot docs **standalone viewable artifacts** with stable URLs, while still deep-linking from lessons; this improves reuse and update transparency.
- **Status:** **Needs human approval**.
