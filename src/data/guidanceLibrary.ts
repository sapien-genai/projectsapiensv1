export type GuidanceType     = 'tip' | 'why' | 'next' | 'rule';
export type GuidanceCategory = 'writing' | 'planning' | 'decision' | 'review';

export interface GuidanceItem {
  id: string;
  type: GuidanceType;
  category: GuidanceCategory;
  content: string;
  sortOrder: number;
}

export const guidanceLibrary: GuidanceItem[] = [
  { id: 'write.tip.outcome_first', type: 'tip', category: 'writing', content: 'Start with the outcome you want — clarity beats length.', sortOrder: 1 },
  { id: 'write.tip.audience',      type: 'tip', category: 'writing', content: 'Name who this is for — tone follows audience.',           sortOrder: 2 },
  { id: 'write.tip.one_idea',      type: 'tip', category: 'writing', content: 'One message per message — split if there are two.',       sortOrder: 3 },

  { id: 'write.why.specific',  type: 'why', category: 'writing', content: 'Specific beats general — concrete words land.',                       sortOrder: 1 },
  { id: 'write.why.structure', type: 'why', category: 'writing', content: 'Clear structure lets the reader skim without losing the point.',      sortOrder: 2 },
  { id: 'write.why.verbs',     type: 'why', category: 'writing', content: 'Active verbs carry weight; passive voice hides it.',                  sortOrder: 3 },

  { id: 'write.next.persuasive', type: 'next', category: 'writing', content: 'Make it more persuasive',           sortOrder: 1 },
  { id: 'write.next.shorten',    type: 'next', category: 'writing', content: 'Shorten it',                        sortOrder: 2 },
  { id: 'write.next.adapt',      type: 'next', category: 'writing', content: 'Adapt for a different audience',    sortOrder: 3 },
  { id: 'write.next.headline',   type: 'next', category: 'writing', content: 'Tighten the opening line',          sortOrder: 4 },

  { id: 'write.rule.one_idea', type: 'rule', category: 'writing', content: 'Good writing = one idea, plainly said.', sortOrder: 1 },

  { id: 'plan.tip.constraints',  type: 'tip', category: 'planning', content: 'Include constraints — time, budget, energy — to get a usable plan.', sortOrder: 1 },
  { id: 'plan.tip.outcome',      type: 'tip', category: 'planning', content: 'State the outcome, not the activity.',                               sortOrder: 2 },
  { id: 'plan.tip.first_action', type: 'tip', category: 'planning', content: 'A plan is only real once step one fits on your calendar.',           sortOrder: 3 },

  { id: 'plan.why.sequence',      type: 'why', category: 'planning', content: 'Steps are sequenced so each one unlocks the next.', sortOrder: 1 },
  { id: 'plan.why.smallest_step', type: 'why', category: 'planning', content: 'The first step is small enough to start today.',   sortOrder: 2 },
  { id: 'plan.why.priority',      type: 'why', category: 'planning', content: 'Priorities are named, not assumed.',                sortOrder: 3 },

  { id: 'plan.next.breakdown', type: 'next', category: 'planning', content: 'Break down the first step', sortOrder: 1 },
  { id: 'plan.next.sequence',  type: 'next', category: 'planning', content: 'Resequence by priority',    sortOrder: 2 },
  { id: 'plan.next.timeline',  type: 'next', category: 'planning', content: 'Add a timeline',            sortOrder: 3 },
  { id: 'plan.next.cut',       type: 'next', category: 'planning', content: 'Cut to the top three',     sortOrder: 4 },

  { id: 'plan.rule.smallest', type: 'rule', category: 'planning', content: 'The best plan is the smallest one you will actually start.', sortOrder: 1 },

  { id: 'decide.tip.tradeoff',   type: 'tip', category: 'decision', content: 'Name the real tradeoff — what you gain and what you give up.',       sortOrder: 1 },
  { id: 'decide.tip.reversible', type: 'tip', category: 'decision', content: 'Reversible decisions deserve speed; one-way doors deserve care.',    sortOrder: 2 },
  { id: 'decide.tip.criteria',   type: 'tip', category: 'decision', content: 'Pick your criteria before you compare options.',                     sortOrder: 3 },

  { id: 'decide.why.criteria',  type: 'why', category: 'decision', content: 'Options are judged against the criteria that actually matter.',       sortOrder: 1 },
  { id: 'decide.why.tradeoffs', type: 'why', category: 'decision', content: 'Tradeoffs are made explicit, not buried.',                             sortOrder: 2 },
  { id: 'decide.why.bias',      type: 'why', category: 'decision', content: 'A recommendation beats a hedge — commitment reveals cost.',           sortOrder: 3 },

  { id: 'decide.next.simpler', type: 'next', category: 'decision', content: 'Simplify the tradeoff',     sortOrder: 1 },
  { id: 'decide.next.risks',   type: 'next', category: 'decision', content: 'Stress-test the risks',     sortOrder: 2 },
  { id: 'decide.next.reverse', type: 'next', category: 'decision', content: 'Argue the other side',      sortOrder: 3 },
  { id: 'decide.next.commit',  type: 'next', category: 'decision', content: 'Commit to a next action',   sortOrder: 4 },

  { id: 'decide.rule.reversible', type: 'rule', category: 'decision', content: 'Decide fast on reversible things. Decide slowly on one-way doors.', sortOrder: 1 },

  { id: 'review.tip.drains',   type: 'tip', category: 'review', content: "Be honest about what drained you — that's where the lesson hides.",    sortOrder: 1 },
  { id: 'review.tip.specific', type: 'tip', category: 'review', content: 'Specific beats general — one real moment teaches more than a summary.', sortOrder: 2 },
  { id: 'review.tip.pattern',  type: 'tip', category: 'review', content: 'Look for a pattern, not a verdict.',                                    sortOrder: 3 },

  { id: 'review.why.patterns',   type: 'why', category: 'review', content: 'Patterns are named, not just events.',          sortOrder: 1 },
  { id: 'review.why.actionable', type: 'why', category: 'review', content: 'Insights point to something you can do next.',  sortOrder: 2 },
  { id: 'review.why.honest',     type: 'why', category: 'review', content: 'Honest reflection beats flattering summary.',   sortOrder: 3 },

  { id: 'review.next.action_items', type: 'next', category: 'review', content: 'Turn into action items',         sortOrder: 1 },
  { id: 'review.next.lessons',      type: 'next', category: 'review', content: 'Distill the lessons',            sortOrder: 2 },
  { id: 'review.next.tomorrow',     type: 'next', category: 'review', content: 'Plan tomorrow around this',      sortOrder: 3 },
  { id: 'review.next.shorten',      type: 'next', category: 'review', content: 'Shorten it',                     sortOrder: 4 },

  { id: 'review.rule.pattern', type: 'rule', category: 'review', content: "A good review ends in one thing you'll try next.", sortOrder: 1 },
];

const byBucket = (category: GuidanceCategory, type: GuidanceType) =>
  guidanceLibrary
    .filter(g => g.category === category && g.type === type)
    .sort((a, b) => a.sortOrder - b.sortOrder);

export function getTip(category: GuidanceCategory, seed = 0): string | null {
  const items = byBucket(category, 'tip');
  if (items.length === 0) return null;
  return items[seed % items.length].content;
}

export function getWhyBullets(category: GuidanceCategory, limit = 3): string[] {
  return byBucket(category, 'why').slice(0, limit).map(g => g.content);
}

export function getNextMoves(category: GuidanceCategory, limit = 3): string[] {
  return byBucket(category, 'next').slice(0, limit).map(g => g.content);
}
