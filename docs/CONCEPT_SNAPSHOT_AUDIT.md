# Concept vs Snapshot Audit

Method: classified each lesson using full lesson text in `lessonContent.ts` with keyword-density heuristics and manual interpretation of lesson titles/content intent. Snapshot % is a rough proxy (not exact token-level labeling).

## 1) Summary table

| Lesson ID | Classification | Snapshot % | Volatility tier |
|---|---:|---:|---|
| `business-lesson-1-1` | PURE SNAPSHOT | 35.7% | unknown |
| `business-lesson-1-2` | PURE SNAPSHOT | 98.6% | unknown |
| `business-lesson-1-3` | PURE SNAPSHOT | 92.9% | unknown |
| `business-lesson-1-4` | TANGLED | 11.4% | unknown |
| `business-lesson-2-1` | PURE CONCEPT | 2.8% | unknown |
| `business-lesson-2-2` | PURE CONCEPT | 0.0% | unknown |
| `business-lesson-2-3` | TANGLED | 24.9% | unknown |
| `business-lesson-2-4` | TANGLED | 21.3% | unknown |
| `business-lesson-2-5` | TANGLED | 8.1% | unknown |
| `business-lesson-3-1` | PURE CONCEPT | 3.1% | unknown |
| `business-lesson-3-2` | TANGLED | 9.1% | unknown |
| `business-lesson-3-3` | TANGLED | 17.6% | unknown |
| `business-lesson-3-4` | TANGLED | 11.3% | unknown |
| `business-lesson-3-5` | TANGLED | 18.9% | unknown |
| `business-lesson-4-1` | TANGLED | 18.6% | unknown |
| `business-lesson-4-2` | TANGLED | 33.9% | unknown |
| `business-lesson-4-3` | TANGLED | 32.9% | unknown |
| `business-lesson-4-4` | TANGLED | 19.9% | unknown |
| `business-lesson-4-5` | TANGLED | 31.5% | unknown |
| `business-lesson-5-1` | PURE SNAPSHOT | 57.5% | unknown |
| `business-lesson-5-2` | TANGLED | 27.9% | unknown |
| `business-lesson-5-3` | TANGLED | 11.8% | unknown |
| `business-lesson-5-4` | TANGLED | 17.5% | unknown |
| `business-lesson-5-5` | TANGLED | 28.8% | unknown |
| `creator-lesson-1-1` | PURE CONCEPT | 0.0% | unknown |
| `creator-lesson-1-2` | PURE CONCEPT | 3.7% | unknown |
| `creator-lesson-1-3` | PURE SNAPSHOT | 49.7% | unknown |
| `creator-lesson-1-4` | TANGLED | 15.8% | unknown |
| `creator-lesson-2-1` | PURE CONCEPT | 3.6% | unknown |
| `creator-lesson-2-2` | TANGLED | 6.6% | unknown |
| `creator-lesson-2-3` | TANGLED | 13.4% | unknown |
| `creator-lesson-2-4` | TANGLED | 7.0% | unknown |
| `creator-lesson-2-5` | TANGLED | 9.1% | unknown |
| `creator-lesson-3-1` | TANGLED | 7.1% | unknown |
| `creator-lesson-3-2` | TANGLED | 6.6% | unknown |
| `creator-lesson-3-3` | PURE CONCEPT | 4.4% | unknown |
| `creator-lesson-3-4` | TANGLED | 16.5% | unknown |
| `creator-lesson-3-5` | TANGLED | 9.5% | unknown |
| `creator-lesson-4-1` | TANGLED | 20.0% | unknown |
| `creator-lesson-4-2` | TANGLED | 14.4% | unknown |
| `creator-lesson-4-3` | PURE CONCEPT | 2.7% | unknown |
| `creator-lesson-4-4` | TANGLED | 7.3% | unknown |
| `creator-lesson-5-1` | TANGLED | 6.6% | unknown |
| `creator-lesson-5-2` | TANGLED | 8.9% | unknown |
| `creator-lesson-5-3` | PURE CONCEPT | 5.8% | unknown |
| `creator-lesson-5-4` | TANGLED | 13.2% | unknown |
| `lesson-1-1` | TANGLED | 6.5% | low |
| `lesson-1-2` | PURE CONCEPT | 4.4% | low |
| `lesson-1-3` | TANGLED | 34.3% | high |
| `lesson-1-4` | TANGLED | 8.5% | medium |
| `lesson-2-1` | TANGLED | 25.4% | medium |
| `lesson-2-2` | TANGLED | 25.1% | medium |
| `lesson-2-3` | TANGLED | 8.5% | medium |
| `lesson-2-4` | PURE CONCEPT | 2.5% | low |
| `lesson-2-5` | TANGLED | 25.4% | medium |
| `lesson-3-1` | PURE CONCEPT | 2.7% | low |
| `lesson-3-2` | TANGLED | 7.9% | medium |
| `lesson-3-3` | TANGLED | 14.3% | medium |
| `lesson-3-4` | TANGLED | 10.4% | medium |
| `lesson-4-1` | TANGLED | 7.2% | medium |
| `lesson-4-2` | TANGLED | 10.0% | low |
| `lesson-4-3` | PURE CONCEPT | 5.9% | low |
| `lesson-4-4` | PURE CONCEPT | 3.3% | medium |
| `lesson-5-1` | PURE CONCEPT | 4.3% | high |
| `lesson-5-2` | TANGLED | 16.2% | high |
| `lesson-5-3` | TANGLED | 18.2% | high |
| `lesson-5-4` | PURE CONCEPT | 3.7% | medium |
| `lesson-5-5` | TANGLED | 6.0% | medium |
| `mastery-lesson-1-1` | TANGLED | 10.8% | unknown |
| `mastery-lesson-1-2` | TANGLED | 33.8% | unknown |
| `mastery-lesson-2-1` | TANGLED | 10.3% | unknown |
| `mastery-lesson-2-2` | TANGLED | 12.3% | unknown |
| `mastery-lesson-3-1` | TANGLED | 21.1% | unknown |
| `mastery-lesson-3-2` | TANGLED | 12.7% | unknown |
| `mastery-lesson-4-1` | TANGLED | 6.2% | unknown |
| `productivity-lesson-1-1` | PURE CONCEPT | 0.0% | unknown |
| `productivity-lesson-1-2` | PURE CONCEPT | 3.1% | unknown |
| `productivity-lesson-1-3` | TANGLED | 32.6% | unknown |
| `productivity-lesson-1-4` | TANGLED | 15.8% | unknown |
| `productivity-lesson-2-1` | PURE CONCEPT | 5.5% | unknown |
| `productivity-lesson-2-2` | TANGLED | 32.8% | unknown |
| `productivity-lesson-2-3` | TANGLED | 7.1% | unknown |
| `productivity-lesson-2-4` | TANGLED | 10.9% | unknown |
| `productivity-lesson-2-5` | TANGLED | 11.3% | unknown |
| `productivity-lesson-3-1` | PURE CONCEPT | 0.0% | unknown |
| `productivity-lesson-3-2` | TANGLED | 8.3% | unknown |
| `productivity-lesson-3-3` | TANGLED | 16.9% | unknown |
| `productivity-lesson-3-4` | TANGLED | 6.9% | unknown |
| `productivity-lesson-3-5` | TANGLED | 12.9% | unknown |
| `productivity-lesson-4-1` | TANGLED | 7.9% | unknown |
| `productivity-lesson-4-2` | PURE CONCEPT | 5.1% | unknown |
| `productivity-lesson-4-3` | TANGLED | 6.4% | unknown |
| `productivity-lesson-4-4` | TANGLED | 15.7% | unknown |
| `productivity-lesson-4-5` | TANGLED | 8.0% | unknown |
| `productivity-lesson-5-1` | TANGLED | 17.9% | unknown |
| `productivity-lesson-5-2` | PURE SNAPSHOT | 47.2% | unknown |
| `productivity-lesson-5-3` | TANGLED | 7.9% | unknown |
| `productivity-lesson-5-4` | TANGLED | 16.4% | unknown |
| `productivity-lesson-5-5` | TANGLED | 19.0% | unknown |

## 2) Top 10 most-tangled lessons

### 1. `lesson-1-3` — The 3 Types of AI You Use Every Day (34.3% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~66% concept / ~34% snapshot.

### 2. `business-lesson-4-2` — Financial Forecasting & Budgeting (33.9% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~66% concept / ~34% snapshot.

### 3. `mastery-lesson-1-2` — Pick Your Instrument and Go Deep (33.8% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~66% concept / ~34% snapshot.

### 4. `business-lesson-4-3` — Inventory & Supply Chain Optimization (32.9% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~67% concept / ~33% snapshot.

### 5. `productivity-lesson-2-2` — AI-Powered Project Planning (32.8% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~67% concept / ~33% snapshot.

### 6. `productivity-lesson-1-3` — The 80/20 of AI Productivity (32.6% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~67% concept / ~33% snapshot.

### 7. `business-lesson-4-5` — Practice Lab: Build Your Dashboard (31.5% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~68% concept / ~32% snapshot.

### 8. `business-lesson-5-5` — Final Project: Present Your AI Stack (28.8% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~71% concept / ~29% snapshot.

### 9. `business-lesson-5-2` — Connecting Tools & Workflows (27.9% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~72% concept / ~28% snapshot.

### 10. `lesson-2-1` — Meal Planning with AI (25.4% snapshot)
This lesson blends durable concepts with current-tool references in the same walkthrough. Split suggestion: keep the framework/process in the core evergreen lesson, and move named-tool examples, model/app mentions, and any benchmark-style claims into a companion snapshot note that can be refreshed quarterly. Estimated split: ~75% concept / ~25% snapshot.

## 3) PURE SNAPSHOT lesson candidates

- `business-lesson-1-2` — **The Small Business AI Stack** (98.6% snapshot, volatility: unknown)
- `business-lesson-1-3` — **ROI Calculator: Measure AI Impact** (92.9% snapshot, volatility: unknown)
- `business-lesson-5-1` — **Mapping Your AI Ops Stack** (57.5% snapshot, volatility: unknown)
- `creator-lesson-1-3` — **The 5 Creative AI Tools Every Creator Needs** (49.7% snapshot, volatility: unknown)
- `productivity-lesson-5-2` — **Connecting Your Tools** (47.2% snapshot, volatility: unknown)
- `business-lesson-1-1` — **Where AI Actually Saves You Money** (35.7% snapshot, volatility: unknown)

## 4) Patterns observed

- Lessons with "stack", "tools", "connecting", or "ROI" in titles trend snapshot-heavy; these often include named products and implementation-specific recommendations.
- Business and productivity tracks contain the highest concentration of mixed concept+snapshot content, especially in modules focused on workflows and operations.
- Fundamentals and writing-structure lessons are mostly evergreen, but can become tangled when they include concrete app/model examples inline.
- High-volatility metadata generally aligns with snapshot-rich lessons, but there are medium-volatility lessons that are still quite snapshot-heavy and should be reviewed for re-tiering.