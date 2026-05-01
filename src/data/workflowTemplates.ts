import type { WorkflowId } from './workflows';

export interface WorkflowTemplate {
  id: string;
  workflowId: WorkflowId;
  label: string;
  description: string;
  inputText: string;
  autoRun?: boolean;
  sortOrder: number;
}

export const workflowTemplates: WorkflowTemplate[] = [
  // Write
  {
    id: 'write.followup_email',
    workflowId: 'write',
    label: 'Follow-up email',
    description: 'Nudge without sounding pushy',
    inputText:
      'Follow-up email after a meeting last week. Goal: confirm next step and get a reply by Friday. Context: discussed pricing and timeline. Tone: warm and direct.',
    sortOrder: 1,
  },
  {
    id: 'write.product_description',
    workflowId: 'write',
    label: 'Product description',
    description: 'Turn features into benefits that sell',
    inputText:
      'Product description for: [product name]. Audience: [who it is for]. Key features: [3–5 bullets]. What problem it solves: [one sentence]. Desired tone: confident, specific.',
    sortOrder: 2,
  },
  {
    id: 'write.announcement',
    workflowId: 'write',
    label: 'Launch announcement',
    description: 'Short post that drives action',
    inputText:
      'Launch announcement post. What we\'re launching: [thing]. Who it\'s for: [audience]. Why it matters now: [one reason]. Where to send people: [link]. Keep it under 120 words.',
    sortOrder: 3,
  },
  {
    id: 'write.tough_message',
    workflowId: 'write',
    label: 'Say something hard',
    description: 'Honest message without burning the room',
    inputText:
      'I need to tell [person] that [hard truth]. I care about the relationship but can\'t avoid this any longer. Help me say it clearly, kindly, and without hedging.',
    sortOrder: 4,
  },
  {
    id: 'write.linkedin_post',
    workflowId: 'write',
    label: 'LinkedIn post',
    description: 'A post people actually read',
    inputText:
      'LinkedIn post about: [topic / lesson]. One specific story: [brief]. One takeaway: [one line]. Audience: [who]. Tone: human, not corporate. Aim for 120–180 words.',
    sortOrder: 5,
  },

  // Plan
  {
    id: 'plan.weekly_plan',
    workflowId: 'plan',
    label: 'Weekly plan',
    description: 'A focused 5-day plan, not a wishlist',
    inputText:
      'Plan my week. Big goal: [goal]. Fixed commitments: [meetings/deadlines]. Energy level: [high/medium/low]. I want the one thing that must ship and a realistic path to it by Friday.',
    sortOrder: 1,
  },
  {
    id: 'plan.launch_plan',
    workflowId: 'plan',
    label: 'Product launch plan',
    description: '30-day launch, sequenced and shippable',
    inputText:
      'Plan a 30-day launch for: [product]. Audience: [who]. Channels I have: [list]. Must include: pre-launch warm-up, launch day, and a post-launch follow-through week.',
    sortOrder: 2,
  },
  {
    id: 'plan.project_kickoff',
    workflowId: 'plan',
    label: 'Project kickoff',
    description: 'Turn a vague project into step one',
    inputText:
      'Kick off a new project: [project]. Desired outcome in 6 weeks: [outcome]. Unknowns: [what I don\'t know yet]. Time I have per week: [hours]. What\'s the first week look like?',
    sortOrder: 3,
  },
  {
    id: 'plan.habit_change',
    workflowId: 'plan',
    label: 'Build a habit',
    description: 'Small, daily, repeatable',
    inputText:
      'Help me build this habit: [habit]. Current reality: [how often I do it now]. Obstacle: [what gets in the way]. I want a 14-day plan that I can actually stick to.',
    sortOrder: 4,
  },

  // Decide
  {
    id: 'decide.decision_framework',
    workflowId: 'decide',
    label: 'Decision framework',
    description: 'Clear criteria, scored options, one recommendation',
    inputText:
      'Decision to make: [decision]. Options on the table: [2–4 options]. Criteria that matter most to me: [list]. Constraints: [time/budget/people]. I want a structured comparison and a clear recommendation.',
    sortOrder: 1,
  },
  {
    id: 'decide.hire_or_not',
    workflowId: 'decide',
    label: 'Hire or wait',
    description: 'Weigh bringing someone on now vs. later',
    inputText:
      'Should I hire for [role] now? Current workload: [context]. Budget runway: [months]. Cost of delay: [what\'s slipping]. Skills I\'d offload: [tasks]. Compare hire-now vs. wait-3-months.',
    sortOrder: 2,
  },
  {
    id: 'decide.stay_or_leave',
    workflowId: 'decide',
    label: 'Stay or leave',
    description: 'Clarify a career crossroads',
    inputText:
      'I\'m deciding whether to stay in my current role or leave for [alternative]. What\'s working now: [list]. What\'s draining me: [list]. What I\'d gain by leaving: [list]. What I\'d give up: [list].',
    sortOrder: 3,
  },
  {
    id: 'decide.pricing_change',
    workflowId: 'decide',
    label: 'Change pricing',
    description: 'Raise, lower, or leave it',
    inputText:
      'Considering a pricing change for [product]. Current price: [x]. Proposed price: [y]. Customer signals: [feedback]. Competitors: [context]. Risk: [churn / positioning]. Compare raise vs. hold vs. restructure.',
    sortOrder: 4,
  },

  // Review
  {
    id: 'review.email_draft',
    workflowId: 'review',
    label: 'Review an email draft',
    description: 'Make sure it lands the way you want',
    inputText:
      'Review this email before I send it. Audience: [who]. Goal: [what I want them to do]. Concern: [what I\'m worried about].\n\nDraft:\n[paste draft here]',
    sortOrder: 1,
  },
  {
    id: 'review.pitch_deck',
    workflowId: 'review',
    label: 'Review a pitch or proposal',
    description: 'Sharp feedback on structure and claims',
    inputText:
      'Review this pitch/proposal. Audience: [investor / client]. Ask: [what I want]. Worry: [weakest part].\n\nContent:\n[paste content here]',
    sortOrder: 2,
  },
  {
    id: 'review.project_retro',
    workflowId: 'review',
    label: 'Project retrospective',
    description: 'Honest look at what worked and what didn\'t',
    inputText:
      'Retrospective on this project: [project name]. Outcome vs. intention: [result]. What went well: [list]. What didn\'t: [list]. Surprises: [list]. I want the pattern, not a victory lap.',
    sortOrder: 3,
  },
  {
    id: 'review.week_review',
    workflowId: 'review',
    label: 'Weekly review',
    description: 'End the week with one real lesson',
    inputText:
      'Review of my week. Wins: [list]. Drags: [list]. Surprises: [list]. Energy pattern: [high/low moments]. What I avoided: [one honest answer]. Give me the pattern and one thing to try next week.',
    sortOrder: 4,
  },

  // Plan day
  {
    id: 'plan_day.focus_day',
    workflowId: 'plan_day',
    label: 'Focus day',
    description: 'One deep-work block, everything else around it',
    inputText:
      'Plan a focus day. Peak energy hours: [e.g. 9–12]. Fixed meetings: [list]. The one thing that must ship: [task]. Low-energy admin to batch: [list].',
    sortOrder: 1,
  },
  {
    id: 'plan_day.recovery_day',
    workflowId: 'plan_day',
    label: 'Low-energy day',
    description: 'Get the right small things done',
    inputText:
      'Today I\'m running at maybe 40%. I still want to move the needle without burning out. Fixed things: [list]. Low-friction tasks I\'ve been avoiding: [list]. Help me choose 3, no more.',
    sortOrder: 2,
  },
  {
    id: 'plan_day.meeting_heavy',
    workflowId: 'plan_day',
    label: 'Meeting-heavy day',
    description: 'Protect what matters between meetings',
    inputText:
      'Today is meeting-heavy. Meetings: [list with times]. Gaps I have: [windows]. One non-meeting outcome I need: [task]. Plan realistic use of the gaps.',
    sortOrder: 3,
  },

  // Manage tasks
  {
    id: 'manage_tasks.inbox_triage',
    workflowId: 'manage_tasks',
    label: 'Inbox triage',
    description: 'Turn an overflowing list into next actions',
    inputText:
      'Triage my task list into Do now / This week / Later / Drop. For each remaining item, name the true next action in a verb phrase.\n\nTasks:\n[paste list]',
    sortOrder: 1,
  },
  {
    id: 'manage_tasks.top_three',
    workflowId: 'manage_tasks',
    label: 'Top 3 only',
    description: 'Collapse the noise into what actually moves things',
    inputText:
      'Collapse this list into the 3 tasks that will move things forward the most this week. One-line reason for each. Everything else — tell me which to drop, delegate, or defer.\n\nTasks:\n[paste list]',
    sortOrder: 2,
  },

  // Review day
  {
    id: 'review_day.honest_review',
    workflowId: 'review_day',
    label: 'Honest day review',
    description: 'What drained me, what I\'m avoiding',
    inputText:
      'End-of-day review. Wins: [list]. What drained me: [list]. What I avoided: [one honest answer]. Energy curve: [notes]. Give me one pattern and one thing to try tomorrow.',
    sortOrder: 1,
  },
  {
    id: 'review_day.tomorrow_plan',
    workflowId: 'review_day',
    label: 'Plan tomorrow from today',
    description: 'Let today\'s reality shape tomorrow\'s plan',
    inputText:
      'Here\'s how today went: [notes]. Based on this, draft a short focused plan for tomorrow — the one must-do and 2 support tasks. Keep it realistic given my energy.',
    sortOrder: 2,
  },

  // Organize life
  {
    id: 'organize_life.brain_dump',
    workflowId: 'organize_life',
    label: 'Brain dump → map',
    description: 'Turn mental noise into clear life areas',
    inputText:
      'Brain dump:\n[projects, worries, ideas, open loops — in any order]\n\nMap this into clear life areas (Work, Health, Relationships, Money, Home, Learning). For each area, list open items and flag up to 3 things that need attention this week.',
    sortOrder: 1,
  },
  {
    id: 'organize_life.what_to_drop',
    workflowId: 'organize_life',
    label: 'What to drop',
    description: 'Name what\'s worth letting go of',
    inputText:
      'Here\'s everything I\'m carrying right now:\n[list]\n\nTell me what I should stop doing or let go of, with a short honest reason each. Be direct.',
    sortOrder: 2,
  },
];

export function getTemplatesForWorkflow(
  workflowId: WorkflowId,
  limit = 5
): WorkflowTemplate[] {
  return workflowTemplates
    .filter(t => t.workflowId === workflowId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit);
}
