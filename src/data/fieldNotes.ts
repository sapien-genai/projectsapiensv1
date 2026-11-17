interface FieldNote {
  number: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  href: string;
}

export const FIELD_NOTES: FieldNote[] = [
  {
    number: '06',
    title: 'What We Choose to Delegate',
    excerpt:
      'The nuclear age expanded what humanity could destroy. The AI age is expanding what we can delegate. Meaningful control requires more than a human with the final say.',
    date: 'October 15, 2026 · Revised October 27, 2026',
    category: 'AI / History / Governance',
    readTime: '10 min read',
    href: '/field-notes/the-nuclear-lesson',
  },
  {
    number: '05',
    title: 'What \u201CAttention Is All You Need\u201D Actually Changed',
    excerpt:
      'The Transformer paper changed AI. More importantly, it changed how I think about building products.',
    date: 'August 2026',
    category: 'Observation',
    readTime: '~9 min read',
    href: '/field-notes/attention-is-all-you-need',
  },
  {
    number: '04',
    title: 'Why Is It So Hard to Watch Sports?',
    excerpt:
      'A deep dive into 100 years of broadcast complexity\u2014from the first radio broadcast in 1921 to the six-subscription NFL viewing experience of 2026.',
    date: 'August 2026',
    category: 'Hotline Sports Research',
    readTime: '~18 min read',
    href: '/field-notes/hotline-broadcast-deep-dive',
  },
  {
    number: '03',
    title: 'AI Has Entered Its Infrastructure Era',
    excerpt:
      'Why the biggest AI story isn\u2019t just the models anymore\u2014it\u2019s the infrastructure, capital, regulation, and businesses being built around them.',
    date: 'August 2026',
    category: 'Artificial Intelligence',
    readTime: '8 min read',
    href: '/field-notes/infrastructure-era',
  },
  {
    number: '02',
    title: 'AI Brand Visibility',
    excerpt:
      'Why AI systems are changing what it means for a company to be discoverable\u2014and why understanding may become more important than ranking.',
    date: 'August 2026',
    category: 'Artificial Intelligence',
    readTime: '~8 min read',
    href: '/field-notes/ai-brand-visibility',
  },
  {
    number: '01',
    title: 'How We Accidentally Started Building Pronunciation Intelligence',
    excerpt:
      'A small product problem during a Chicago Bears AI project turned into years of thinking about names, speech, and one of the most human problems in artificial intelligence.',
    date: 'August 2026',
    category: 'Voice AI',
    readTime: '8 min read',
    href: '/field-notes/pronunciation-intelligence',
  },
];

