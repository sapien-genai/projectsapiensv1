export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'progress' | 'consistency' | 'lab' | 'prompt' | 'network' | 'specialization' | 'achievement';
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: {
    type: string;
    threshold?: number;
    details?: string;
  };
  sort_order: number;
}

export const badgeDefinitions: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson and begin your AI fluency journey',
    category: 'progress',
    icon: 'Footprints',
    color: '#10b981',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'lessons_completed',
      threshold: 1,
      details: 'Complete 1 lesson'
    },
    sort_order: 1
  },
  {
    id: 'path-explorer',
    name: 'Path Explorer',
    description: 'Complete your first learning path',
    category: 'progress',
    icon: 'Compass',
    color: '#3b82f6',
    rarity: 'common',
    points: 50,
    criteria: {
      type: 'paths_completed',
      threshold: 1,
      details: 'Complete 1 path'
    },
    sort_order: 2
  },
  {
    id: 'multi-path-master',
    name: 'Multi-Path Master',
    description: 'Complete three learning paths',
    category: 'progress',
    icon: 'Network',
    color: '#8b5cf6',
    rarity: 'rare',
    points: 150,
    criteria: {
      type: 'paths_completed',
      threshold: 3,
      details: 'Complete 3 paths'
    },
    sort_order: 3
  },
  {
    id: 'ai-fluent',
    name: 'AI Fluent',
    description: 'Complete all five learning paths and master AI fluency',
    category: 'progress',
    icon: 'Sparkles',
    color: '#f59e0b',
    rarity: 'legendary',
    points: 500,
    criteria: {
      type: 'paths_completed',
      threshold: 5,
      details: 'Complete all 5 paths'
    },
    sort_order: 4
  },

  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    category: 'consistency',
    icon: 'Flame',
    color: '#f97316',
    rarity: 'common',
    points: 25,
    criteria: {
      type: 'streak_days',
      threshold: 7,
      details: '7 day streak'
    },
    sort_order: 1
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    category: 'consistency',
    icon: 'Calendar',
    color: '#ef4444',
    rarity: 'epic',
    points: 100,
    criteria: {
      type: 'streak_days',
      threshold: 30,
      details: '30 day streak'
    },
    sort_order: 2
  },
  {
    id: 'daily-discipline',
    name: 'Daily Discipline',
    description: 'Maintain a 100-day learning streak',
    category: 'consistency',
    icon: 'Trophy',
    color: '#dc2626',
    rarity: 'legendary',
    points: 500,
    criteria: {
      type: 'streak_days',
      threshold: 100,
      details: '100 day streak'
    },
    sort_order: 3
  },

  {
    id: 'lab-rat',
    name: 'Lab Rat',
    description: 'Complete your first lab experiment',
    category: 'lab',
    icon: 'Flask',
    color: '#14b8a6',
    rarity: 'common',
    points: 20,
    criteria: {
      type: 'lab_experiments',
      threshold: 1,
      details: 'Complete 1 experiment'
    },
    sort_order: 1
  },
  {
    id: 'experimenter',
    name: 'Experimenter',
    description: 'Complete 10 lab experiments',
    category: 'lab',
    icon: 'TestTubes',
    color: '#10b981',
    rarity: 'rare',
    points: 75,
    criteria: {
      type: 'lab_experiments',
      threshold: 10,
      details: 'Complete 10 experiments'
    },
    sort_order: 2
  },
  {
    id: 'lab-legend',
    name: 'Lab Legend',
    description: 'Complete 50 lab experiments',
    category: 'lab',
    icon: 'Beaker',
    color: '#06b6d4',
    rarity: 'epic',
    points: 250,
    criteria: {
      type: 'lab_experiments',
      threshold: 50,
      details: 'Complete 50 experiments'
    },
    sort_order: 3
  },

  {
    id: 'prompt-apprentice',
    name: 'Prompt Apprentice',
    description: 'Save 10 prompts to your library',
    category: 'prompt',
    icon: 'Bookmark',
    color: '#eab308',
    rarity: 'common',
    points: 15,
    criteria: {
      type: 'prompts_saved',
      threshold: 10,
      details: 'Save 10 prompts'
    },
    sort_order: 1
  },
  {
    id: 'prompt-collector',
    name: 'Prompt Collector',
    description: 'Save 50 prompts to your library',
    category: 'prompt',
    icon: 'Library',
    color: '#f59e0b',
    rarity: 'rare',
    points: 50,
    criteria: {
      type: 'prompts_saved',
      threshold: 50,
      details: 'Save 50 prompts'
    },
    sort_order: 2
  },
  {
    id: 'prompt-master',
    name: 'Prompt Master',
    description: 'Save 100 prompts and share 10 with the community',
    category: 'prompt',
    icon: 'ScrollText',
    color: '#d4af37',
    rarity: 'epic',
    points: 200,
    criteria: {
      type: 'combined',
      details: 'Save 100 prompts and share 10'
    },
    sort_order: 3
  },

  {
    id: 'networker',
    name: 'Networker',
    description: 'Connect with 5 fellow learners',
    category: 'network',
    icon: 'Users',
    color: '#a78bfa',
    rarity: 'common',
    points: 20,
    criteria: {
      type: 'connections',
      threshold: 5,
      details: 'Connect with 5 users'
    },
    sort_order: 1
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Connect with 25 fellow learners',
    category: 'network',
    icon: 'GitBranch',
    color: '#8b5cf6',
    rarity: 'rare',
    points: 75,
    criteria: {
      type: 'connections',
      threshold: 25,
      details: 'Connect with 25 users'
    },
    sort_order: 2
  },
  {
    id: 'community-leader',
    name: 'Community Leader',
    description: 'Connect with 100 users and share 10 prompts',
    category: 'network',
    icon: 'Crown',
    color: '#7c3aed',
    rarity: 'epic',
    points: 250,
    criteria: {
      type: 'combined',
      details: 'Connect with 100 users and share 10 prompts'
    },
    sort_order: 3
  },

  {
    id: 'foundation-scholar',
    name: 'Foundation Scholar',
    description: 'Complete all lessons in the Foundation path',
    category: 'specialization',
    icon: 'Building2',
    color: '#71717a',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'path_completed',
      details: 'Complete Foundation path'
    },
    sort_order: 1
  },
  {
    id: 'prompt-engineer',
    name: 'Prompt Engineer',
    description: 'Complete all lessons in the Prompt Engineering path',
    category: 'specialization',
    icon: 'Wrench',
    color: '#f97316',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'path_completed',
      details: 'Complete Prompt Engineering path'
    },
    sort_order: 2
  },
  {
    id: 'automation-architect',
    name: 'Automation Architect',
    description: 'Complete all lessons in the Automation path',
    category: 'specialization',
    icon: 'Cog',
    color: '#64748b',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'path_completed',
      details: 'Complete Automation path'
    },
    sort_order: 3
  },
  {
    id: 'productivity-pro',
    name: 'Productivity Pro',
    description: 'Complete all lessons in the Productivity path',
    category: 'specialization',
    icon: 'Rocket',
    color: '#10b981',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'path_completed',
      details: 'Complete Productivity path'
    },
    sort_order: 4
  },
  {
    id: 'strategy-sage',
    name: 'Strategy Sage',
    description: 'Complete all lessons in the Strategy path',
    category: 'specialization',
    icon: 'Target',
    color: '#2563eb',
    rarity: 'rare',
    points: 100,
    criteria: {
      type: 'path_completed',
      details: 'Complete Strategy path'
    },
    sort_order: 5
  },

  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Join the platform in the first month',
    category: 'achievement',
    icon: 'Sunrise',
    color: '#fbbf24',
    rarity: 'legendary',
    points: 300,
    criteria: {
      type: 'special',
      details: 'Join within first month of launch'
    },
    sort_order: 1
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 10 lessons after 10pm',
    category: 'achievement',
    icon: 'Moon',
    color: '#1e40af',
    rarity: 'rare',
    points: 50,
    criteria: {
      type: 'time_based',
      threshold: 10,
      details: 'Complete 10 lessons after 10pm'
    },
    sort_order: 2
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Complete 20 lessons on weekends',
    category: 'achievement',
    icon: 'Mountain',
    color: '#047857',
    rarity: 'rare',
    points: 50,
    criteria: {
      type: 'time_based',
      threshold: 20,
      details: 'Complete 20 lessons on weekends'
    },
    sort_order: 3
  },
  {
    id: 'speed-learner',
    name: 'Speed Learner',
    description: 'Complete a full path in under 2 weeks',
    category: 'achievement',
    icon: 'Zap',
    color: '#eab308',
    rarity: 'epic',
    points: 150,
    criteria: {
      type: 'time_based',
      details: 'Complete a path in under 14 days'
    },
    sort_order: 4
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Spend 20+ hours learning in the platform',
    category: 'achievement',
    icon: 'Waves',
    color: '#0ea5e9',
    rarity: 'epic',
    points: 150,
    criteria: {
      type: 'time_spent',
      threshold: 1200,
      details: 'Spend 20+ hours learning'
    },
    sort_order: 5
  },
  {
    id: 'command-center-master',
    name: 'Command Center Master',
    description: 'Complete your 30-day AI Command Center commitment',
    category: 'achievement',
    icon: 'Award',
    color: '#FF6A00',
    rarity: 'epic',
    points: 200,
    criteria: {
      type: 'special',
      details: 'Sign and complete your launch commitment'
    },
    sort_order: 6
  }
];

export const getBadgesByCategory = (category: Badge['category']) => {
  return badgeDefinitions.filter(badge => badge.category === category).sort((a, b) => a.sort_order - b.sort_order);
};

export const getBadgeById = (id: string) => {
  return badgeDefinitions.find(badge => badge.id === id);
};

export const getRarityColor = (rarity: Badge['rarity']) => {
  switch (rarity) {
    case 'common':
      return '#6b7280';
    case 'rare':
      return '#3b82f6';
    case 'epic':
      return '#a855f7';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

export const getRarityLabel = (rarity: Badge['rarity']) => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};
