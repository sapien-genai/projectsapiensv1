import { PenLine, ListTodo, Scale, Eye, Sun, CheckSquare, Moon, FolderTree, Video as LucideIcon } from 'lucide-react';

export type WorkflowId =
  | 'write'
  | 'plan'
  | 'decide'
  | 'review'
  | 'plan_day'
  | 'manage_tasks'
  | 'review_day'
  | 'organize_life';

export type WorkflowCategory = 'thinking' | 'daily';

export interface ImproveAction {
  id: string;
  label: string;
  promptTemplate: (output: string) => string;
}

export interface Workflow {
  id: WorkflowId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  intent: string;
  inputPlaceholder: string;
  promptTemplate: (input: string) => string;
  improveActions: ImproveAction[];
  category: WorkflowCategory;
}

const REWRITE_CLEARER: ImproveAction = {
  id: 'clearer',
  label: 'Clearer',
  promptTemplate: o => `Rewrite this to be clearer and easier to understand. Return only the rewritten text:\n\n${o}`,
};
const REWRITE_SHORTER: ImproveAction = {
  id: 'shorter',
  label: 'Shorter',
  promptTemplate: o => `Rewrite this to be shorter while keeping the core message. Return only the rewritten text:\n\n${o}`,
};
const REWRITE_PROFESSIONAL: ImproveAction = {
  id: 'professional',
  label: 'Professional',
  promptTemplate: o => `Rewrite this to sound more professional and confident, while keeping the message intact. Return only the rewritten text:\n\n${o}`,
};
const REWRITE_PERSUASIVE: ImproveAction = {
  id: 'persuasive',
  label: 'Persuasive',
  promptTemplate: o => `Rewrite this to be more persuasive and compelling. Return only the rewritten text:\n\n${o}`,
};

export const workflows: Record<WorkflowId, Workflow> = {
  write: {
    id: 'write',
    label: 'Write',
    tagline: 'Turn rough thoughts into clear writing',
    icon: PenLine,
    intent: 'I want to write something clearly.',
    inputPlaceholder: 'Dump your raw thoughts here…',
    promptTemplate: input =>
      `Take the following rough thoughts and turn them into a clear, structured message. Return only the rewritten message:\n\n${input}`,
    improveActions: [REWRITE_CLEARER, REWRITE_SHORTER, REWRITE_PROFESSIONAL, REWRITE_PERSUASIVE],
    category: 'thinking',
  },

  plan: {
    id: 'plan',
    label: 'Plan',
    tagline: 'Break a goal into an actionable plan',
    icon: ListTodo,
    intent: 'I want to turn a goal into steps.',
    inputPlaceholder: 'Describe the goal or project you want to plan…',
    promptTemplate: input =>
      `You are a practical planning assistant. Turn the following goal into a concrete, numbered action plan. Keep it tight: 5 to 8 steps, each step one sentence, sequenced so the user can start today. Return only the plan.\n\nGoal:\n${input}`,
    improveActions: [
      {
        id: 'simpler',
        label: 'Simpler',
        promptTemplate: o => `Rewrite this plan so it is simpler and easier to act on. Cut complexity. Return only the plan:\n\n${o}`,
      },
      {
        id: 'more_detailed',
        label: 'More detailed',
        promptTemplate: o => `Expand each step of this plan with one concrete sub-action and the first thing to do. Return only the plan:\n\n${o}`,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        promptTemplate: o => `Rewrite this plan with a clear timeline: assign each step to a day or week so it is schedulable. Return only the plan:\n\n${o}`,
      },
      {
        id: 'next_actions',
        label: 'Next actions',
        promptTemplate: o => `Convert this plan into a list of concrete next actions, each starting with a verb and doable in under an hour. Return only the list:\n\n${o}`,
      },
    ],
    category: 'thinking',
  },

  decide: {
    id: 'decide',
    label: 'Decide',
    tagline: 'Weigh options and commit to a choice',
    icon: Scale,
    intent: 'I want to make a decision.',
    inputPlaceholder: 'Describe the decision and the options you\'re weighing…',
    promptTemplate: input =>
      `You are a decision-making coach. For the following decision, (1) restate the real question in one sentence, (2) list the options, (3) compare them with the 2-3 factors that matter most, (4) recommend one option with a clear reason. Be direct. Return only the analysis.\n\nDecision:\n${input}`,
    improveActions: [
      {
        id: 'more_analytical',
        label: 'More analytical',
        promptTemplate: o => `Rewrite this decision analysis with deeper reasoning: weigh each option across 3–4 explicit criteria and score them. Return only the analysis:\n\n${o}`,
      },
      {
        id: 'more_decisive',
        label: 'More decisive',
        promptTemplate: o => `Rewrite this analysis to be sharper and more decisive. Cut hedging and land a clear recommendation with a single next action. Return only the analysis:\n\n${o}`,
      },
      {
        id: 'risk_focused',
        label: 'Risk-focused',
        promptTemplate: o => `Rework this analysis to focus on risks: what could go wrong with each option, likelihood, and how to mitigate. End with the least-risky recommendation. Return only the analysis:\n\n${o}`,
      },
      {
        id: 'simpler',
        label: 'Simpler',
        promptTemplate: o => `Rewrite this decision analysis in plain language, half the length, so anyone can follow it. Return only the analysis:\n\n${o}`,
      },
    ],
    category: 'thinking',
  },

  review: {
    id: 'review',
    label: 'Review',
    tagline: 'Get sharp feedback on your work',
    icon: Eye,
    intent: 'I want feedback on something.',
    inputPlaceholder: 'Paste the draft, idea, or plan you want reviewed…',
    promptTemplate: input =>
      `You are a thoughtful reviewer. Read the following and produce three short sections: Summary, Key insights, Suggested next steps. Be concrete and specific. Return only the review.\n\nContent:\n${input}`,
    improveActions: [
      {
        id: 'shorter',
        label: 'Shorter',
        promptTemplate: o => `Rewrite this review to be shorter and tighter, keeping the most important points. Return only the review:\n\n${o}`,
      },
      {
        id: 'action_items',
        label: 'Action items',
        promptTemplate: o => `Convert this review into a clean list of action items, each starting with a verb and doable this week. Return only the list:\n\n${o}`,
      },
      {
        id: 'lessons_learned',
        label: 'Lessons learned',
        promptTemplate: o => `Distill this review into a short "Lessons learned" list: patterns worth remembering next time. Return only the list:\n\n${o}`,
      },
      {
        id: 'tomorrow_plan',
        label: 'Tomorrow plan',
        promptTemplate: o => `Based on this review, draft a focused plan for tomorrow: the one must-do and 2 support tasks. Return only the plan:\n\n${o}`,
      },
    ],
    category: 'thinking',
  },

  plan_day: {
    id: 'plan_day',
    label: 'Plan day',
    tagline: 'Turn today\'s noise into a focused plan',
    icon: Sun,
    intent: 'I want to plan my day.',
    inputPlaceholder: 'What\'s on your plate today? Dump meetings, tasks, energy level…',
    promptTemplate: input =>
      `You are a calm daily planning coach. Based on the following context, produce a focused plan for today: (1) the one thing that must get done, (2) a 3–5 item ordered to-do list with rough time blocks, (3) what to consciously drop. Be concrete and realistic. Return only the plan.\n\nContext:\n${input}`,
    improveActions: [
      {
        id: 'compress',
        label: 'Half the work',
        promptTemplate: o => `Rewrite this day plan assuming I only have half the time. Keep what matters most. Return only the plan:\n\n${o}`,
      },
      {
        id: 'deep_work',
        label: 'Protect deep work',
        promptTemplate: o => `Rework this day plan to protect one 90-minute deep-work block. Shift other items around it. Return only the plan:\n\n${o}`,
      },
      {
        id: 'energy',
        label: 'Match energy',
        promptTemplate: o => `Reorder this day plan so hard tasks land in peak-energy hours and admin in low-energy hours. Return only the plan:\n\n${o}`,
      },
      {
        id: 'first_hour',
        label: 'First hour',
        promptTemplate: o => `Given this plan, state exactly what I should do in the first hour. Return only that. \n\n${o}`,
      },
    ],
    category: 'daily',
  },

  manage_tasks: {
    id: 'manage_tasks',
    label: 'Manage tasks',
    tagline: 'Triage a messy task list into next actions',
    icon: CheckSquare,
    intent: 'I want to sort out my tasks.',
    inputPlaceholder: 'Paste your task list, inbox, or backlog…',
    promptTemplate: input =>
      `You are a task triage assistant. For the following list, group items into: Do now, Do this week, Do later, Drop. For each item keep it to one short line and, when useful, suggest the true next action. Return only the grouped list.\n\nTasks:\n${input}`,
    improveActions: [
      {
        id: 'one_action',
        label: 'Next actions',
        promptTemplate: o => `Rewrite this list so every remaining item starts with a verb and represents a single concrete next action. Return only the list:\n\n${o}`,
      },
      {
        id: 'delegate',
        label: 'What to delegate',
        promptTemplate: o => `From this list, flag items I should delegate or ask for help with, and suggest who or how. Return the updated list:\n\n${o}`,
      },
      {
        id: 'focus_three',
        label: 'Top 3 only',
        promptTemplate: o => `Collapse this list into the 3 tasks that will move things forward most. Return only those 3 with a one-line reason each:\n\n${o}`,
      },
      {
        id: 'calendar',
        label: 'Put on calendar',
        promptTemplate: o => `Turn this task list into rough calendar blocks across this week (days + time-of-day). Return only the schedule:\n\n${o}`,
      },
    ],
    category: 'daily',
  },

  review_day: {
    id: 'review_day',
    label: 'Review day',
    tagline: 'End-of-day reflection that actually teaches',
    icon: Moon,
    intent: 'I want to review my day.',
    inputPlaceholder: 'What happened today? Wins, drags, surprises, feelings…',
    promptTemplate: input =>
      `You are a thoughtful coach helping with an end-of-day review. From the following notes, produce: (1) What went well, (2) What drained me, (3) One pattern worth noticing, (4) One thing to try tomorrow. Keep it short and human. Return only the review.\n\nNotes:\n${input}`,
    improveActions: [
      {
        id: 'gentle',
        label: 'Kinder tone',
        promptTemplate: o => `Rewrite this review with a gentler, more compassionate tone while keeping the insights. Return only the review:\n\n${o}`,
      },
      {
        id: 'challenge',
        label: 'Challenge me',
        promptTemplate: o => `Rewrite this review to challenge me honestly on what I\'m avoiding. Be direct but fair. Return only the review:\n\n${o}`,
      },
      {
        id: 'one_lesson',
        label: 'One lesson',
        promptTemplate: o => `Distill this review into a single clear lesson I should remember this week. Return only that lesson:\n\n${o}`,
      },
      {
        id: 'tomorrow',
        label: 'Plan tomorrow',
        promptTemplate: o => `Based on this review, draft a short focused plan for tomorrow: the one must-do and 2 support tasks. Return only the plan:\n\n${o}`,
      },
    ],
    category: 'daily',
  },

  organize_life: {
    id: 'organize_life',
    label: 'Organize life',
    tagline: 'Map the noise into clear life areas',
    icon: FolderTree,
    intent: 'I want to get organized.',
    inputPlaceholder: 'Dump everything on your mind — projects, worries, ideas, open loops…',
    promptTemplate: input =>
      `You are an organizing coach. Take the following brain dump and structure it into clear life areas (e.g. Work, Health, Relationships, Money, Home, Learning). For each area list open items, and flag up to 3 things that need attention this week. Return only the structured map.\n\nDump:\n${input}`,
    improveActions: [
      {
        id: 'priorities',
        label: 'Top priorities',
        promptTemplate: o => `From this map, extract the top 5 priorities across all areas for the next 7 days. Return only the list with a one-line reason each:\n\n${o}`,
      },
      {
        id: 'drop',
        label: 'What to drop',
        promptTemplate: o => `From this map, suggest what I should stop doing or let go of, with a short reason each. Return only that list:\n\n${o}`,
      },
      {
        id: 'systems',
        label: 'Suggest systems',
        promptTemplate: o => `For the 2–3 busiest areas in this map, suggest a simple repeatable system (weekly review, checklist, etc.). Return only the suggestions:\n\n${o}`,
      },
      {
        id: 'first_move',
        label: 'First move',
        promptTemplate: o => `Given this map, state the single first move I should make today to feel less overwhelmed. Return only that move:\n\n${o}`,
      },
    ],
    category: 'daily',
  },
};

export const workflowList: Workflow[] = [
  workflows.write,
  workflows.plan,
  workflows.decide,
  workflows.review,
  workflows.plan_day,
  workflows.manage_tasks,
  workflows.review_day,
  workflows.organize_life,
];