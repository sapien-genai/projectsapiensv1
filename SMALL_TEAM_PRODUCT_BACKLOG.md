# Small Team Product Backlog

This backlog turns the small-team AI fluency GTM plan into concrete product work.

## Phase 0: Trust And Demo Readiness

Goal: make the current app credible enough for a buyer demo.

- Fix TypeScript typecheck failures.
- Update lesson content block types to match actual lesson data.
- Remove unused imports, props, and mock helpers that block typecheck.
- Fix the `NetworkPage` to `ProjectDetailView` prop contract.
- Align pricing copy with the real Stripe checkout state.
- Add route-level dynamic imports to reduce the production bundle.
- Create a deterministic demo account and demo walkthrough.

Definition of done:

- `npm run typecheck` passes.
- `npm run build` passes.
- A new user can complete the demo path without explanation.
- The landing page no longer contradicts the pilot offer.

## Phase 1: Pilot Without Full Multi-Tenant Complexity

Goal: support paid pilots with minimal new infrastructure.

- Add a `cohort_id` field to user profile or progress records.
- Add a manually managed cohort config table.
- Add a cohort label to dashboard and admin views.
- Add role metadata for pilot users: manager, marketer, operator, support, general.
- Add a team prompt library category or tag convention.
- Add a manager-facing progress summary view.
- Add a static final workflow playbook template.

Definition of done:

- Admin can identify all users in a pilot cohort.
- Manager can see completion and lab usage.
- Learners can access pilot-specific prompts and assignments.
- A final team playbook can be assembled manually from user outputs.

## Phase 2: Repeatable Workflow Packs

Goal: make customization scalable.

- Create a content pack abstraction for lessons, labs, prompts, and final projects.
- Add the first workflow pack: AI for Small Teams.
- Add role-specific prompt templates.
- Add workflow lab configs for:
  - meeting notes to actions
  - customer feedback analysis
  - business communication drafts
  - project planning and prioritization
- Add a rubric for evaluating final projects.
- Add pack assignment to cohorts.

Definition of done:

- A cohort can be assigned a workflow pack.
- The assigned pack changes visible lessons, labs, or prompts.
- A non-developer can understand what belongs in a pack.

## Phase 3: Company Customization

Goal: make buyer-specific customization a product surface.

- Add organization table.
- Add organization settings.
- Add organization-approved AI use cases.
- Add organization prompt library.
- Add organization-specific examples in labs.
- Add private project sharing by organization.
- Add manager report export.

Definition of done:

- A company can have private examples, prompts, and progress reporting.
- Customization is content-driven, not custom-code-driven.

## Phase 4: Higher-Ticket Team Features

Goal: support larger accounts once pilots prove demand.

- Team invite flow.
- Branded workspace.
- Multiple cohorts per organization.
- Completion certificates.
- Usage analytics by cohort and role.
- AI policy reminders inside labs.
- Optional SSO.
- Optional LMS export.

Definition of done:

- Project Sapiens can support multiple company cohorts without manual database work.
- Managers can understand adoption and outcomes without asking support.

## First Workflow Pack: AI For Small Teams

Target learner:

- Nontechnical employees in small teams.

Core modules:

- Practical AI fundamentals
- Prompting for useful work
- Writing and communication
- Analysis and synthesis
- Planning and decision support
- Verification and responsible use

Core labs:

- Turn messy meeting notes into decisions and tasks.
- Summarize customer feedback into themes and next actions.
- Draft a customer, partner, or internal update.
- Build a weekly priority plan from scattered work.
- Create a team prompt that others can reuse.

Final project:

- Build one repeatable AI workflow for the team and document it in a shared playbook.

Manager report:

- completion rate
- confidence shift
- most-used labs
- final workflows submitted
- recommended next workflow pack
