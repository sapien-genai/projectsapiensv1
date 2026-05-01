export interface Step {
  id: string;
  title: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  outcome: string;
  steps: Step[];
}

export interface PathInfo {
  id: string;
  title: string;
  description: string;
  level: string;
  outcome: string;
  missions: Mission[];
}

export const paths: Record<string, PathInfo> = {
  'ai-writing-systems': {
    id: 'ai-writing-systems',
    title: 'AI WRITING SYSTEMS',
    description: 'Turn rough ideas into clear, compelling, high-impact writing using AI.',
    level: 'Beginner to Intermediate',
    outcome:
      'By the end, you will have repeatable AI writing workflows for emails, content, messaging, and professional communication — and a content engine you can use every day.',
    missions: [
      {
        id: 'writing-mission-1',
        title: 'Mission 1: Turn Raw Ideas into Clear Writing',
        description: 'Turn messy thoughts into clean, organized writing.',
        outcome: 'By the end, you will have a repeatable workflow for turning scattered thoughts into polished, on-brand writing.',
        steps: [
          { id: 'writing-step-1-1', title: 'Dump Your Thoughts' },
          { id: 'writing-step-1-2', title: 'Make It Clearer' },
          { id: 'writing-step-1-3', title: 'Polish the Tone' },
        ],
      },
      {
        id: 'writing-mission-2',
        title: 'Mission 2: Rewrite for Impact',
        description: 'Learn how tone, length, and persuasion change the effect of your writing.',
        outcome: 'By the end, you will have multiple polished versions of the same message tuned for different audiences and situations.',
        steps: [
          { id: 'writing-step-2-1', title: 'Make It Clearer' },
          { id: 'writing-step-2-2', title: 'Make It Shorter' },
          { id: 'writing-step-2-3', title: 'Make It More Persuasive' },
          { id: 'writing-step-2-4', title: 'Generate Variations' },
        ],
      },
      {
        id: 'writing-mission-3',
        title: 'Mission 3: Build a Content Engine',
        description: 'Create a repeatable system for generating content at scale.',
        outcome: 'By the end, you will have a full post, social variations, title options, and a short summary — all from a single idea.',
        steps: [
          { id: 'writing-step-3-1', title: 'Start With an Idea' },
          { id: 'writing-step-3-2', title: 'Improve the Draft' },
          { id: 'writing-step-3-3', title: 'Polish the Voice' },
          { id: 'writing-step-3-4', title: 'Repurpose the Content' },
        ],
      },
    ],
  },

  'ai-everyday-life': {
    id: 'ai-everyday-life',
    title: 'AI FOR EVERYDAY LIFE',
    description: 'Use AI for personal growth, daily decisions, and life optimization. No technical background needed.',
    level: 'Beginner',
    outcome:
      'By the end, you will have your own Personal AI Dashboard — a custom collection of AI workflows for meal planning, scheduling, learning, and decision-making.',
    missions: [
      {
        id: 'module-1',
        title: 'Mission 1: AI Fundamentals',
        description: 'Understand AI in your daily context.',
        outcome: 'By the end, you will be able to talk to any AI like a human and get consistently useful responses.',
        steps: [
          { id: 'lesson-1-1', title: 'What AI Actually Is (No Jargon)' },
          { id: 'lesson-1-2', title: 'Your First Prompt: Talk to AI Like a Human' },
          { id: 'lesson-1-3', title: 'The 3 Types of AI You Use Every Day' },
          { id: 'lesson-1-4', title: 'Write 5 Different Prompts' },
        ],
      },
      {
        id: 'module-2',
        title: 'Mission 2: Personal Productivity',
        description: 'Use AI to organize, plan, and decide.',
        outcome: 'By the end, you will have AI workflows that run your meal planning, travel, schedule, and big decisions.',
        steps: [
          { id: 'lesson-2-1', title: 'Meal Planning with AI' },
          { id: 'lesson-2-2', title: 'Travel Itinerary Generator' },
          { id: 'lesson-2-3', title: 'Daily Schedule Optimizer' },
          { id: 'lesson-2-4', title: 'Decision-Making Framework' },
          { id: 'lesson-2-5', title: 'Plan Your Week' },
        ],
      },
      {
        id: 'module-3',
        title: 'Mission 3: Learning & Growth',
        description: 'Accelerate your personal development.',
        outcome: 'By the end, you will have a personalized AI study system and a custom learning plan.',
        steps: [
          { id: 'lesson-3-1', title: 'Create Your Personal Learning Path' },
          { id: 'lesson-3-2', title: 'AI as Your Study Partner' },
          { id: 'lesson-3-3', title: 'Skill Gap Analysis' },
          { id: 'lesson-3-4', title: 'Build a Study Plan' },
        ],
      },
      {
        id: 'module-4',
        title: 'Mission 4: Creativity & Expression',
        description: 'Unlock your creative potential.',
        outcome: 'By the end, you will have AI workflows for emails, storytelling, and journaling that sound like you.',
        steps: [
          { id: 'lesson-4-1', title: 'Writing Better Emails & Messages' },
          { id: 'lesson-4-2', title: 'Storytelling with AI' },
          { id: 'lesson-4-3', title: 'Personal Journaling Assistant' },
          { id: 'lesson-4-4', title: 'Write Your Story' },
        ],
      },
      {
        id: 'module-5',
        title: 'Mission 5: Launch Your Command Center',
        description: 'Build your personal AI dashboard.',
        outcome: 'By the end, you will have a live AI Command Center running your routines, decisions, and daily flow.',
        steps: [
          { id: 'lesson-5-1', title: 'Building Your AI Command Center' },
          { id: 'lesson-5-2', title: 'Integrating Your AI Workflows' },
          { id: 'lesson-5-3', title: 'Automation & Smart Routines' },
          { id: 'lesson-5-4', title: 'Testing & Optimization' },
          { id: 'lesson-5-5', title: 'Launch Your Command Center' },
        ],
      },
    ],
  },

  'ai-for-creators': {
    id: 'ai-for-creators',
    title: 'AI FOR CREATORS',
    description: 'Create content, art, and experiences with AI. Master the tools that amplify your creative vision.',
    level: 'Beginner to Intermediate',
    outcome:
      'By the end, you will have launched your own AI-powered creative project — a portfolio piece that showcases your unique creative process enhanced by AI.',
    missions: [
      {
        id: 'creator-module-1',
        title: 'Mission 1: The Creator\'s Mindset',
        description: 'AI as your creative collaborator.',
        outcome: 'By the end, you will have created your first AI-assisted piece in your own voice.',
        steps: [
          { id: 'creator-lesson-1-1', title: 'AI Won\'t Replace You. Here\'s Why.' },
          { id: 'creator-lesson-1-2', title: 'Finding Your Creative Voice with AI' },
          { id: 'creator-lesson-1-3', title: 'The 5 Creative AI Tools Every Creator Needs' },
          { id: 'creator-lesson-1-4', title: 'Create Your First AI-Assisted Piece' },
        ],
      },
      {
        id: 'creator-module-2',
        title: 'Mission 2: Content Creation Mastery',
        description: 'Write better, faster, and more consistently.',
        outcome: 'By the end, you will have 30 days of content planned and ready to ship.',
        steps: [
          { id: 'creator-lesson-2-1', title: 'The Content Brief: Teaching AI Your Style' },
          { id: 'creator-lesson-2-2', title: 'Blog Posts That Convert' },
          { id: 'creator-lesson-2-3', title: 'Social Media Content Factory' },
          { id: 'creator-lesson-2-4', title: 'Video Scripts & Storyboards' },
          { id: 'creator-lesson-2-5', title: '30 Days of Content in 30 Minutes' },
        ],
      },
      {
        id: 'creator-module-3',
        title: 'Mission 3: Visual Storytelling',
        description: 'Design, illustration, and visual concepts.',
        outcome: 'By the end, you will have a complete visual identity built with AI — logos, moodboards, and brand assets.',
        steps: [
          { id: 'creator-lesson-3-1', title: 'Prompt Engineering for Visual Art' },
          { id: 'creator-lesson-3-2', title: 'Creating Consistent Brand Assets' },
          { id: 'creator-lesson-3-3', title: 'Concept Art & Mood Boards' },
          { id: 'creator-lesson-3-4', title: 'Combining AI Art with Traditional Tools' },
          { id: 'creator-lesson-3-5', title: 'Build a Visual Identity' },
        ],
      },
      {
        id: 'creator-module-4',
        title: 'Mission 4: Advanced Workflows',
        description: 'Chain AI tools for powerful results.',
        outcome: 'By the end, you will have a signature creative workflow you can run from idea to finished product.',
        steps: [
          { id: 'creator-lesson-4-1', title: 'The Creative Workflow Stack' },
          { id: 'creator-lesson-4-2', title: 'Idea Generation to Final Product' },
          { id: 'creator-lesson-4-3', title: 'Quality Control & Human Touch' },
          { id: 'creator-lesson-4-4', title: 'Build Your Signature Workflow' },
        ],
      },
      {
        id: 'creator-module-5',
        title: 'Mission 5: Launch Your Project',
        description: 'Create and share your masterpiece.',
        outcome: 'By the end, you will have shipped a public creative project built with your AI workflow.',
        steps: [
          { id: 'creator-lesson-5-1', title: 'Choosing Your Project' },
          { id: 'creator-lesson-5-2', title: 'Production Week: Build It' },
          { id: 'creator-lesson-5-3', title: 'Polish & Perfect' },
          { id: 'creator-lesson-5-4', title: 'Launch Strategy & Community Feedback' },
        ],
      },
    ],
  },

  'ai-for-small-business': {
    id: 'ai-for-small-business',
    title: 'AI FOR SMALL BUSINESS',
    description: 'Automate operations, marketing, and decisions. Scale your business without scaling your team.',
    level: 'Beginner to Intermediate',
    outcome:
      'By the end, you will have built your Mini AI Ops Stack — integrated workflows that automate customer support, marketing, operations, and decision-making for your business.',
    missions: [
      {
        id: 'business-module-1',
        title: 'Mission 1: AI for Business Basics',
        description: 'Understand AI ROI and business applications.',
        outcome: 'By the end, you will have audited your business processes and identified where AI will save you the most time and money.',
        steps: [
          { id: 'business-lesson-1-1', title: 'Where AI Actually Saves You Money' },
          { id: 'business-lesson-1-2', title: 'The Small Business AI Stack' },
          { id: 'business-lesson-1-3', title: 'ROI Calculator: Measure AI Impact' },
          { id: 'business-lesson-1-4', title: 'Audit Your Business Processes' },
        ],
      },
      {
        id: 'business-module-2',
        title: 'Mission 2: Customer-Facing AI',
        description: 'Support, sales, and communication automation.',
        outcome: 'By the end, you will have a working AI support bot and a converting sales email sequence.',
        steps: [
          { id: 'business-lesson-2-1', title: 'AI-Powered Customer Support' },
          { id: 'business-lesson-2-2', title: 'Sales Email Sequences That Convert' },
          { id: 'business-lesson-2-3', title: 'Chatbots & FAQ Automation' },
          { id: 'business-lesson-2-4', title: 'Personalization at Scale' },
          { id: 'business-lesson-2-5', title: 'Build Your First Support Bot' },
        ],
      },
      {
        id: 'business-module-3',
        title: 'Mission 3: Marketing Automation',
        description: 'Content, social media, and campaign management.',
        outcome: 'By the end, you will have a 90-day marketing plan and a social media content engine running on AI.',
        steps: [
          { id: 'business-lesson-3-1', title: 'Content Calendar in 30 Minutes' },
          { id: 'business-lesson-3-2', title: 'Social Media Post Factory' },
          { id: 'business-lesson-3-3', title: 'Email Marketing with AI' },
          { id: 'business-lesson-3-4', title: 'Ad Copy & Landing Page Optimization' },
          { id: 'business-lesson-3-5', title: '90-Day Marketing Plan' },
        ],
      },
      {
        id: 'business-module-4',
        title: 'Mission 4: Operations & Analytics',
        description: 'Process automation and data-driven decisions.',
        outcome: 'By the end, you will have an AI-powered dashboard that turns raw data into business decisions.',
        steps: [
          { id: 'business-lesson-4-1', title: 'Automating Repetitive Tasks' },
          { id: 'business-lesson-4-2', title: 'Financial Forecasting & Budgeting' },
          { id: 'business-lesson-4-3', title: 'Inventory & Supply Chain Optimization' },
          { id: 'business-lesson-4-4', title: 'Data Analysis for Business Decisions' },
          { id: 'business-lesson-4-5', title: 'Build Your Dashboard' },
        ],
      },
      {
        id: 'business-module-5',
        title: 'Mission 5: Integration & Scaling',
        description: 'Build your complete AI operations system.',
        outcome: 'By the end, you will have a fully integrated AI Ops Stack and the team trained to run it.',
        steps: [
          { id: 'business-lesson-5-1', title: 'Mapping Your AI Ops Stack' },
          { id: 'business-lesson-5-2', title: 'Connecting Tools & Workflows' },
          { id: 'business-lesson-5-3', title: 'Training Your Team on AI Tools' },
          { id: 'business-lesson-5-4', title: 'Measuring Success & Iterating' },
          { id: 'business-lesson-5-5', title: 'Present Your AI Stack' },
        ],
      },
    ],
  },

  'ai-for-productivity': {
    id: 'ai-for-productivity',
    title: 'AI FOR PRODUCTIVITY',
    description: 'Master time management, focus, and personal systems. Build workflows that multiply your output.',
    level: 'Beginner',
    outcome:
      'By the end, you will have your Personal Command Center — an AI-powered system that manages your calendar, tasks, notes, goals, and decisions in one integrated workflow.',
    missions: [
      {
        id: 'productivity-module-1',
        title: 'Mission 1: Productivity Foundations',
        description: 'Understand how AI amplifies your work.',
        outcome: 'By the end, you will know exactly where your time goes and which AI workflows will return it to you.',
        steps: [
          { id: 'productivity-lesson-1-1', title: 'The AI Productivity Multiplier' },
          { id: 'productivity-lesson-1-2', title: 'Audit Your Time: Find Your Leaks' },
          { id: 'productivity-lesson-1-3', title: 'The 80/20 of AI Productivity' },
          { id: 'productivity-lesson-1-4', title: 'Build Your Baseline' },
        ],
      },
      {
        id: 'productivity-module-2',
        title: 'Mission 2: Task & Project Management',
        description: 'Organize work that actually gets done.',
        outcome: 'By the end, you will have a task and project system that captures, prioritizes, and reviews your work automatically.',
        steps: [
          { id: 'productivity-lesson-2-1', title: 'The Smart Task Capture System' },
          { id: 'productivity-lesson-2-2', title: 'AI-Powered Project Planning' },
          { id: 'productivity-lesson-2-3', title: 'Priority Matrix: What to Do First' },
          { id: 'productivity-lesson-2-4', title: 'Weekly Review Automation' },
          { id: 'productivity-lesson-2-5', title: 'Set Up Your Task System' },
        ],
      },
      {
        id: 'productivity-module-3',
        title: 'Mission 3: Knowledge Management',
        description: 'Remember and retrieve everything.',
        outcome: 'By the end, you will have a searchable second brain that turns notes and meetings into action.',
        steps: [
          { id: 'productivity-lesson-3-1', title: 'Building a Second Brain with AI' },
          { id: 'productivity-lesson-3-2', title: 'Smart Note-Taking Systems' },
          { id: 'productivity-lesson-3-3', title: 'AI-Powered Research & Learning' },
          { id: 'productivity-lesson-3-4', title: 'Meeting Notes to Action Items' },
          { id: 'productivity-lesson-3-5', title: 'Create Your Knowledge Base' },
        ],
      },
      {
        id: 'productivity-module-4',
        title: 'Mission 4: Focus & Deep Work',
        description: 'Eliminate distractions and multiply output.',
        outcome: 'By the end, you will have a personal focus protocol and AI-assisted email triage that protects your deep work.',
        steps: [
          { id: 'productivity-lesson-4-1', title: 'The Attention Management System' },
          { id: 'productivity-lesson-4-2', title: 'AI Email & Message Triage' },
          { id: 'productivity-lesson-4-3', title: 'Deep Work Blocks with AI Support' },
          { id: 'productivity-lesson-4-4', title: 'Decision Fatigue: Automate Small Choices' },
          { id: 'productivity-lesson-4-5', title: 'Your Focus Protocol' },
        ],
      },
      {
        id: 'productivity-module-5',
        title: 'Mission 5: Command Center Build',
        description: 'Integrate everything into one system.',
        outcome: 'By the end, you will have launched your Personal Command Center running your daily, weekly, and monthly routines.',
        steps: [
          { id: 'productivity-lesson-5-1', title: 'Designing Your Command Center' },
          { id: 'productivity-lesson-5-2', title: 'Connecting Your Tools' },
          { id: 'productivity-lesson-5-3', title: 'Daily, Weekly, Monthly Routines' },
          { id: 'productivity-lesson-5-4', title: 'Optimization & Iteration' },
          { id: 'productivity-lesson-5-5', title: 'Launch Your System' },
        ],
      },
    ],
  },

  'ai-prompting-mastery': {
    id: 'ai-prompting-mastery',
    title: 'AI PROMPTING MASTERY',
    description: 'Transform from basic user to AI expert. Master the frameworks that unlock 10x better results from any AI model.',
    level: 'Intermediate',
    outcome:
      'By the end, you will have your Personal Prompting System — battle-tested prompt templates and frameworks that consistently deliver exceptional results across all your AI interactions.',
    missions: [
      {
        id: 'mastery-module-1',
        title: 'Mission 1: Machine English Fundamentals',
        description: 'Communicate with AI at a professional level.',
        outcome: 'By the end, you will have internalized the AIM framework and be able to craft prompts that consistently land.',
        steps: [
          { id: 'mastery-lesson-1-1', title: 'Learn Machine English: The AIM Framework' },
          { id: 'mastery-lesson-1-2', title: 'Pick Your Instrument and Go Deep' },
        ],
      },
      {
        id: 'mastery-module-2',
        title: 'Mission 2: Context & Iteration',
        description: 'Feed AI the right context and debug your thinking.',
        outcome: 'By the end, you will use the MAP framework to give AI the context it needs and iterate precisely to what you want.',
        steps: [
          { id: 'mastery-lesson-2-1', title: 'Feed It Context: The MAP Framework' },
          { id: 'mastery-lesson-2-2', title: 'Debug Your Thinking: Iterative Prompting' },
        ],
      },
      {
        id: 'mastery-module-3',
        title: 'Mission 3: Depth & Verification',
        description: 'Move from mediocrity to mastery.',
        outcome: 'By the end, you will know how to steer AI toward expert-level output and verify every claim it makes.',
        steps: [
          { id: 'mastery-lesson-3-1', title: 'Steer to Experts' },
          { id: 'mastery-lesson-3-2', title: 'Verify Everything: Critique, Don\'t Consume' },
        ],
      },
      {
        id: 'mastery-module-4',
        title: 'Mission 4: Developing Your Voice',
        description: 'Create your unique AI collaboration style.',
        outcome: 'By the end, you will have your own OCEAN-based prompting voice and a training loop that sharpens it over time.',
        steps: [
          { id: 'mastery-lesson-4-1', title: 'Develop Taste: The OCEAN Framework' },
          { id: 'mastery-lesson-4-2', title: 'Training Yourself Through AI' },
        ],
      },
    ],
  },
};
