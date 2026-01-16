interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface PathInfo {
  id: string;
  title: string;
  description: string;
  level: string;
  totalTime: string;
  finalProject: string;
  modules: Module[];
}

export const paths: Record<string, PathInfo> = {
  'ai-everyday-life': {
    id: 'ai-everyday-life',
    title: 'AI FOR EVERYDAY LIFE',
    description: 'Use AI for personal growth, daily decisions, and life optimization. No technical background needed.',
    level: 'Beginner',
    totalTime: '~8 hours',
    finalProject: 'By the end of this path, you\'ll have created your own Personal AI Dashboard — a custom collection of AI workflows that help you with meal planning, scheduling, learning, decision-making, and more.',
    modules: [
      {
        id: 'module-1',
        title: 'MODULE 1: AI FUNDAMENTALS',
        description: 'Understanding AI in your daily context',
        lessons: [
          { id: 'lesson-1-1', title: 'What AI Actually Is (No Jargon)', duration: '10 min' },
          { id: 'lesson-1-2', title: 'Your First Prompt: Talk to AI Like a Human', duration: '15 min' },
          { id: 'lesson-1-3', title: 'The 3 Types of AI You Use Every Day', duration: '12 min' },
          { id: 'lesson-1-4', title: 'Practice Lab: Write 5 Different Prompts', duration: '20 min' },
        ],
      },
      {
        id: 'module-2',
        title: 'MODULE 2: PERSONAL PRODUCTIVITY',
        description: 'Use AI to organize, plan, and decide',
        lessons: [
          { id: 'lesson-2-1', title: 'Meal Planning with AI', duration: '15 min' },
          { id: 'lesson-2-2', title: 'Travel Itinerary Generator', duration: '18 min' },
          { id: 'lesson-2-3', title: 'Daily Schedule Optimizer', duration: '20 min' },
          { id: 'lesson-2-4', title: 'Decision-Making Framework', duration: '25 min' },
          { id: 'lesson-2-5', title: 'Practice Lab: Plan Your Week', duration: '30 min' },
        ],
      },
      {
        id: 'module-3',
        title: 'MODULE 3: LEARNING & GROWTH',
        description: 'Accelerate your personal development',
        lessons: [
          { id: 'lesson-3-1', title: 'Create Your Personal Learning Path', duration: '20 min' },
          { id: 'lesson-3-2', title: 'AI as Your Study Partner', duration: '18 min' },
          { id: 'lesson-3-3', title: 'Skill Gap Analysis', duration: '22 min' },
          { id: 'lesson-3-4', title: 'Practice Lab: Build a Study Plan', duration: '30 min' },
        ],
      },
      {
        id: 'module-4',
        title: 'MODULE 4: CREATIVITY & EXPRESSION',
        description: 'Unlock your creative potential',
        lessons: [
          { id: 'lesson-4-1', title: 'Writing Better Emails & Messages', duration: '15 min' },
          { id: 'lesson-4-2', title: 'Storytelling with AI', duration: '20 min' },
          { id: 'lesson-4-3', title: 'Personal Journaling Assistant', duration: '18 min' },
          { id: 'lesson-4-4', title: 'Practice Lab: Write Your Story', duration: '30 min' },
        ],
      },
      {
        id: 'module-5',
        title: 'MODULE 5: FINAL PROJECT',
        description: 'Build your personal AI dashboard',
        lessons: [
          { id: 'lesson-5-1', title: 'Building Your AI Command Center', duration: '30 min' },
          { id: 'lesson-5-2', title: 'Integrating Your AI Workflows', duration: '25 min' },
          { id: 'lesson-5-3', title: 'Automation & Smart Routines', duration: '20 min' },
          { id: 'lesson-5-4', title: 'Testing & Optimization', duration: '25 min' },
          { id: 'lesson-5-5', title: 'Launch Your Command Center', duration: '30 min' },
        ],
      },
    ],
  },
  'ai-for-creators': {
    id: 'ai-for-creators',
    title: 'AI FOR CREATORS',
    description: 'Create content, art, and experiences with AI. Master the tools that amplify your creative vision.',
    level: 'Beginner to Intermediate',
    totalTime: '~10 hours',
    finalProject: 'Launch your own AI-Powered Creative Project — a portfolio piece that showcases your unique creative process enhanced by AI, whether it\'s content, art, music, or multimedia.',
    modules: [
      {
        id: 'creator-module-1',
        title: 'MODULE 1: THE CREATOR\'S MINDSET',
        description: 'AI as your creative collaborator',
        lessons: [
          { id: 'creator-lesson-1-1', title: 'AI Won\'t Replace You. Here\'s Why.', duration: '12 min' },
          { id: 'creator-lesson-1-2', title: 'Finding Your Creative Voice with AI', duration: '15 min' },
          { id: 'creator-lesson-1-3', title: 'The 5 Creative AI Tools Every Creator Needs', duration: '18 min' },
          { id: 'creator-lesson-1-4', title: 'Practice Lab: Create Your First AI-Assisted Piece', duration: '25 min' },
        ],
      },
      {
        id: 'creator-module-2',
        title: 'MODULE 2: CONTENT CREATION MASTERY',
        description: 'Write better, faster, and more consistently',
        lessons: [
          { id: 'creator-lesson-2-1', title: 'The Content Brief: Teaching AI Your Style', duration: '20 min' },
          { id: 'creator-lesson-2-2', title: 'Blog Posts That Convert', duration: '25 min' },
          { id: 'creator-lesson-2-3', title: 'Social Media Content Factory', duration: '22 min' },
          { id: 'creator-lesson-2-4', title: 'Video Scripts & Storyboards', duration: '28 min' },
          { id: 'creator-lesson-2-5', title: 'Practice Lab: 30 Days of Content in 30 Minutes', duration: '35 min' },
        ],
      },
      {
        id: 'creator-module-3',
        title: 'MODULE 3: VISUAL STORYTELLING',
        description: 'Design, illustration, and visual concepts',
        lessons: [
          { id: 'creator-lesson-3-1', title: 'Prompt Engineering for Visual Art', duration: '25 min' },
          { id: 'creator-lesson-3-2', title: 'Creating Consistent Brand Assets', duration: '30 min' },
          { id: 'creator-lesson-3-3', title: 'Concept Art & Mood Boards', duration: '28 min' },
          { id: 'creator-lesson-3-4', title: 'Combining AI Art with Traditional Tools', duration: '32 min' },
          { id: 'creator-lesson-3-5', title: 'Practice Lab: Build a Visual Identity', duration: '40 min' },
        ],
      },
      {
        id: 'creator-module-4',
        title: 'MODULE 4: ADVANCED WORKFLOWS',
        description: 'Chain AI tools for powerful results',
        lessons: [
          { id: 'creator-lesson-4-1', title: 'The Creative Workflow Stack', duration: '30 min' },
          { id: 'creator-lesson-4-2', title: 'Idea Generation to Final Product', duration: '35 min' },
          { id: 'creator-lesson-4-3', title: 'Quality Control & Human Touch', duration: '25 min' },
          { id: 'creator-lesson-4-4', title: 'Practice Lab: Build Your Signature Workflow', duration: '45 min' },
        ],
      },
      {
        id: 'creator-module-5',
        title: 'MODULE 5: LAUNCH YOUR PROJECT',
        description: 'Create and share your masterpiece',
        lessons: [
          { id: 'creator-lesson-5-1', title: 'Choosing Your Project', duration: '20 min' },
          { id: 'creator-lesson-5-2', title: 'Production Week: Build It', duration: '90 min' },
          { id: 'creator-lesson-5-3', title: 'Polish & Perfect', duration: '45 min' },
          { id: 'creator-lesson-5-4', title: 'Launch Strategy & Community Feedback', duration: '30 min' },
        ],
      },
    ],
  },
  'ai-for-small-business': {
    id: 'ai-for-small-business',
    title: 'AI FOR SMALL BUSINESS',
    description: 'Automate operations, marketing, and decisions. Scale your business without scaling your team.',
    level: 'Beginner to Intermediate',
    totalTime: '~12 hours',
    finalProject: 'Build your Mini AI Ops Stack — an integrated system of AI workflows that automate customer support, marketing, operations, and decision-making for your business.',
    modules: [
      {
        id: 'business-module-1',
        title: 'MODULE 1: AI FOR BUSINESS BASICS',
        description: 'Understanding AI ROI and business applications',
        lessons: [
          { id: 'business-lesson-1-1', title: 'Where AI Actually Saves You Money', duration: '15 min' },
          { id: 'business-lesson-1-2', title: 'The Small Business AI Stack', duration: '18 min' },
          { id: 'business-lesson-1-3', title: 'ROI Calculator: Measure AI Impact', duration: '20 min' },
          { id: 'business-lesson-1-4', title: 'Practice Lab: Audit Your Business Processes', duration: '30 min' },
        ],
      },
      {
        id: 'business-module-2',
        title: 'MODULE 2: CUSTOMER-FACING AI',
        description: 'Support, sales, and communication automation',
        lessons: [
          { id: 'business-lesson-2-1', title: 'AI-Powered Customer Support', duration: '25 min' },
          { id: 'business-lesson-2-2', title: 'Sales Email Sequences That Convert', duration: '30 min' },
          { id: 'business-lesson-2-3', title: 'Chatbots & FAQ Automation', duration: '28 min' },
          { id: 'business-lesson-2-4', title: 'Personalization at Scale', duration: '25 min' },
          { id: 'business-lesson-2-5', title: 'Practice Lab: Build Your First Support Bot', duration: '45 min' },
        ],
      },
      {
        id: 'business-module-3',
        title: 'MODULE 3: MARKETING AUTOMATION',
        description: 'Content, social media, and campaign management',
        lessons: [
          { id: 'business-lesson-3-1', title: 'Content Calendar in 30 Minutes', duration: '25 min' },
          { id: 'business-lesson-3-2', title: 'Social Media Post Factory', duration: '28 min' },
          { id: 'business-lesson-3-3', title: 'Email Marketing with AI', duration: '30 min' },
          { id: 'business-lesson-3-4', title: 'Ad Copy & Landing Page Optimization', duration: '32 min' },
          { id: 'business-lesson-3-5', title: 'Practice Lab: 90-Day Marketing Plan', duration: '45 min' },
        ],
      },
      {
        id: 'business-module-4',
        title: 'MODULE 4: OPERATIONS & ANALYTICS',
        description: 'Process automation and data-driven decisions',
        lessons: [
          { id: 'business-lesson-4-1', title: 'Automating Repetitive Tasks', duration: '30 min' },
          { id: 'business-lesson-4-2', title: 'Financial Forecasting & Budgeting', duration: '35 min' },
          { id: 'business-lesson-4-3', title: 'Inventory & Supply Chain Optimization', duration: '30 min' },
          { id: 'business-lesson-4-4', title: 'Data Analysis for Business Decisions', duration: '35 min' },
          { id: 'business-lesson-4-5', title: 'Practice Lab: Build Your Dashboard', duration: '45 min' },
        ],
      },
      {
        id: 'business-module-5',
        title: 'MODULE 5: INTEGRATION & SCALING',
        description: 'Build your complete AI operations system',
        lessons: [
          { id: 'business-lesson-5-1', title: 'Mapping Your AI Ops Stack', duration: '30 min' },
          { id: 'business-lesson-5-2', title: 'Connecting Tools & Workflows', duration: '60 min' },
          { id: 'business-lesson-5-3', title: 'Training Your Team on AI Tools', duration: '40 min' },
          { id: 'business-lesson-5-4', title: 'Measuring Success & Iterating', duration: '35 min' },
          { id: 'business-lesson-5-5', title: 'Final Project: Present Your AI Stack', duration: '45 min' },
        ],
      },
    ],
  },
  'ai-for-productivity': {
    id: 'ai-for-productivity',
    title: 'AI FOR PRODUCTIVITY',
    description: 'Master time management, focus, and personal systems. Build workflows that multiply your output.',
    level: 'Beginner',
    totalTime: '~9 hours',
    finalProject: 'Create your Personal Command Center — an AI-powered system that manages your calendar, tasks, notes, goals, and decision-making in one integrated workflow.',
    modules: [
      {
        id: 'productivity-module-1',
        title: 'MODULE 1: PRODUCTIVITY FOUNDATIONS',
        description: 'Understanding how AI amplifies your work',
        lessons: [
          { id: 'productivity-lesson-1-1', title: 'The AI Productivity Multiplier', duration: '12 min' },
          { id: 'productivity-lesson-1-2', title: 'Audit Your Time: Find Your Leaks', duration: '15 min' },
          { id: 'productivity-lesson-1-3', title: 'The 80/20 of AI Productivity', duration: '18 min' },
          { id: 'productivity-lesson-1-4', title: 'Practice Lab: Build Your Baseline', duration: '25 min' },
        ],
      },
      {
        id: 'productivity-module-2',
        title: 'MODULE 2: TASK & PROJECT MANAGEMENT',
        description: 'Organize work that actually gets done',
        lessons: [
          { id: 'productivity-lesson-2-1', title: 'The Smart Task Capture System', duration: '20 min' },
          { id: 'productivity-lesson-2-2', title: 'AI-Powered Project Planning', duration: '25 min' },
          { id: 'productivity-lesson-2-3', title: 'Priority Matrix: What to Do First', duration: '22 min' },
          { id: 'productivity-lesson-2-4', title: 'Weekly Review Automation', duration: '20 min' },
          { id: 'productivity-lesson-2-5', title: 'Practice Lab: Set Up Your Task System', duration: '30 min' },
        ],
      },
      {
        id: 'productivity-module-3',
        title: 'MODULE 3: KNOWLEDGE MANAGEMENT',
        description: 'Remember and retrieve everything',
        lessons: [
          { id: 'productivity-lesson-3-1', title: 'Building a Second Brain with AI', duration: '25 min' },
          { id: 'productivity-lesson-3-2', title: 'Smart Note-Taking Systems', duration: '22 min' },
          { id: 'productivity-lesson-3-3', title: 'AI-Powered Research & Learning', duration: '28 min' },
          { id: 'productivity-lesson-3-4', title: 'Meeting Notes to Action Items', duration: '20 min' },
          { id: 'productivity-lesson-3-5', title: 'Practice Lab: Create Your Knowledge Base', duration: '35 min' },
        ],
      },
      {
        id: 'productivity-module-4',
        title: 'MODULE 4: FOCUS & DEEP WORK',
        description: 'Eliminate distractions and multiply output',
        lessons: [
          { id: 'productivity-lesson-4-1', title: 'The Attention Management System', duration: '20 min' },
          { id: 'productivity-lesson-4-2', title: 'AI Email & Message Triage', duration: '25 min' },
          { id: 'productivity-lesson-4-3', title: 'Deep Work Blocks with AI Support', duration: '22 min' },
          { id: 'productivity-lesson-4-4', title: 'Decision Fatigue: Automate Small Choices', duration: '18 min' },
          { id: 'productivity-lesson-4-5', title: 'Practice Lab: Your Focus Protocol', duration: '30 min' },
        ],
      },
      {
        id: 'productivity-module-5',
        title: 'MODULE 5: COMMAND CENTER BUILD',
        description: 'Integrate everything into one system',
        lessons: [
          { id: 'productivity-lesson-5-1', title: 'Designing Your Command Center', duration: '30 min' },
          { id: 'productivity-lesson-5-2', title: 'Connecting Your Tools', duration: '45 min' },
          { id: 'productivity-lesson-5-3', title: 'Daily, Weekly, Monthly Routines', duration: '35 min' },
          { id: 'productivity-lesson-5-4', title: 'Optimization & Iteration', duration: '25 min' },
          { id: 'productivity-lesson-5-5', title: 'Final Project: Launch Your System', duration: '40 min' },
        ],
      },
    ],
  },
  'ai-prompting-mastery': {
    id: 'ai-prompting-mastery',
    title: 'AI PROMPTING MASTERY',
    description: 'Transform from basic user to AI expert. Master the frameworks that unlock 10x better results from any AI model.',
    level: 'Intermediate',
    totalTime: '~6 hours',
    finalProject: 'Build your Personal Prompting System — a collection of battle-tested prompt templates and frameworks that consistently deliver exceptional results across all your AI interactions.',
    modules: [
      {
        id: 'mastery-module-1',
        title: 'WEEK 1: MACHINE ENGLISH FUNDAMENTALS',
        description: 'Learn to communicate with AI at a professional level',
        lessons: [
          { id: 'mastery-lesson-1-1', title: 'Learn Machine English: The AIM Framework', duration: '18 min' },
          { id: 'mastery-lesson-1-2', title: 'Pick Your Instrument and Go Deep', duration: '15 min' },
        ],
      },
      {
        id: 'mastery-module-2',
        title: 'WEEK 2: CONTEXT & ITERATION',
        description: 'Feed AI the right context and debug your thinking',
        lessons: [
          { id: 'mastery-lesson-2-1', title: 'Feed It Context: The MAP Framework', duration: '20 min' },
          { id: 'mastery-lesson-2-2', title: 'Debug Your Thinking: Iterative Prompting', duration: '22 min' },
        ],
      },
      {
        id: 'mastery-module-3',
        title: 'WEEK 3: DEPTH & VERIFICATION',
        description: 'Move from mediocrity to mastery',
        lessons: [
          { id: 'mastery-lesson-3-1', title: 'Steer to Experts', duration: '20 min' },
          { id: 'mastery-lesson-3-2', title: 'Verify Everything: Critique, Don\'t Consume', duration: '25 min' },
        ],
      },
      {
        id: 'mastery-module-4',
        title: 'WEEK 4: DEVELOPING YOUR VOICE',
        description: 'Create your unique AI collaboration style',
        lessons: [
          { id: 'mastery-lesson-4-1', title: 'Develop Taste: The OCEAN Framework', duration: '22 min' },
          { id: 'mastery-lesson-4-2', title: 'Training Yourself Through AI', duration: '18 min' },
        ],
      },
    ],
  },
};
