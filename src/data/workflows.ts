import { PenLine, ListTodo, Scale, Eye, Video as LucideIcon } from 'lucide-react';

export type WorkflowId = 'write' | 'plan' | 'decide' | 'review';

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
        id: 'shorter_plan',
        label: 'Shorter',
        promptTemplate: o => `Condense this plan to the 3 highest-leverage steps. Return only the plan:\n\n${o}`,
      },
      {
        id: 'deeper_plan',
        label: 'More detail',
        promptTemplate: o => `Expand each step of this plan with one concrete sub-action and the first thing to do. Return only the plan:\n\n${o}`,
      },
      {
        id: 'this_week',
        label: 'This week only',
        promptTemplate: o => `Rewrite this plan as only what the user should do this week, with days assigned. Return only the plan:\n\n${o}`,
      },
      {
        id: 'risks_plan',
        label: 'Add risks',
        promptTemplate: o => `Keep this plan but append a short "Risks & mitigations" section at the end. Return only the plan:\n\n${o}`,
      },
    ],
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
        id: 'steelman',
        label: 'Steelman other side',
        promptTemplate: o => `Add a short "Strongest case for the alternative" paragraph to this analysis. Return the full analysis:\n\n${o}`,
      },
      {
        id: 'sharper',
        label: 'Be sharper',
        promptTemplate: o => `Rewrite this decision analysis to be shorter and more direct. Cut hedging. Return only the analysis:\n\n${o}`,
      },
      {
        id: 'next_step',
        label: 'Next step',
        promptTemplate: o => `Given this analysis, state the single next action the user should take in the next 24 hours. Return only that action:\n\n${o}`,
      },
      {
        id: 'reversible',
        label: 'Reversibility check',
        promptTemplate: o => `Append a short paragraph on how reversible this decision is and what to watch for before committing. Return the full analysis:\n\n${o}`,
      },
    ],
  },

  review: {
    id: 'review',
    label: 'Review',
    tagline: 'Get sharp feedback on your work',
    icon: Eye,
    intent: 'I want feedback on something.',
    inputPlaceholder: 'Paste the draft, idea, or plan you want reviewed…',
    promptTemplate: input =>
      `You are a sharp, kind reviewer. Give feedback on the following in three short sections: Strengths, Weaknesses, Specific improvements. Be concrete — point to exact lines or ideas. Return only the review.\n\nContent:\n${input}`,
    improveActions: [
      {
        id: 'harsher',
        label: 'Be tougher',
        promptTemplate: o => `Rewrite this review to be tougher and more honest. Keep it specific. Return only the review:\n\n${o}`,
      },
      {
        id: 'apply',
        label: 'Apply fixes',
        promptTemplate: o => `Based on this review, produce a rewritten version of the original content that applies the feedback. Return only the rewritten content:\n\n${o}`,
      },
      {
        id: 'one_thing',
        label: 'One thing to fix',
        promptTemplate: o => `Collapse this review into the single most important change the user should make. Return only that recommendation:\n\n${o}`,
      },
      {
        id: 'audience',
        label: 'Audience check',
        promptTemplate: o => `Add a short section to this review: who this is for, and whether it will land with that audience. Return the full review:\n\n${o}`,
      },
    ],
  },
};

export const workflowList: Workflow[] = [
  workflows.write,
  workflows.plan,
  workflows.decide,
  workflows.review,
];
