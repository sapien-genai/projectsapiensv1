import LessonForm, { FormField } from './LessonForm';

// ============================================
// SMALL BUSINESS FORMS
// ============================================

// Time Inventory Form - Calculate hours saved
export function TimeInventoryForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'task1',
      label: 'Task 1',
      type: 'text',
      placeholder: 'Email responses',
      required: true
    },
    {
      id: 'task1_hours',
      label: 'Hours per week',
      type: 'number',
      placeholder: '5',
      required: true
    },
    {
      id: 'task2',
      label: 'Task 2',
      type: 'text',
      placeholder: 'Social media posts',
      required: true
    },
    {
      id: 'task2_hours',
      label: 'Hours per week',
      type: 'number',
      placeholder: '3',
      required: true
    },
    {
      id: 'task3',
      label: 'Task 3',
      type: 'text',
      placeholder: 'Customer follow-ups',
      required: true
    },
    {
      id: 'task3_hours',
      label: 'Hours per week',
      type: 'number',
      placeholder: '4',
      required: true
    },
    {
      id: 'task4',
      label: 'Task 4',
      type: 'text',
      placeholder: 'Report generation'
    },
    {
      id: 'task4_hours',
      label: 'Hours per week',
      type: 'number',
      placeholder: '2'
    },
    {
      id: 'task5',
      label: 'Task 5',
      type: 'text',
      placeholder: 'Meeting notes'
    },
    {
      id: 'task5_hours',
      label: 'Hours per week',
      type: 'number',
      placeholder: '2'
    },
    {
      id: 'total_hours',
      label: 'Total hours per week (sum)',
      type: 'number',
      helpText: 'Add up all your hours',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="time-inventory"
      fields={fields}
      title="INTERACTIVE EXERCISE 1: Your Time Inventory"
    />
  );
}

// ROI Calculator Form
export function ROICalculatorForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'hours_saved_per_week',
      label: 'Hours AI saves you per week',
      type: 'number',
      placeholder: '10',
      required: true
    },
    {
      id: 'hourly_rate',
      label: 'Your hourly rate ($)',
      type: 'number',
      placeholder: '50',
      helpText: 'What you charge or what your time is worth',
      required: true
    },
    {
      id: 'weekly_savings',
      label: 'Weekly savings ($)',
      type: 'number',
      helpText: 'Hours × Rate',
      required: true
    },
    {
      id: 'monthly_savings',
      label: 'Monthly savings ($)',
      type: 'number',
      helpText: 'Weekly × 4',
      required: true
    },
    {
      id: 'yearly_savings',
      label: 'Yearly savings ($)',
      type: 'number',
      helpText: 'Monthly × 12',
      required: true
    },
    {
      id: 'ai_cost_monthly',
      label: 'AI tool cost per month ($)',
      type: 'number',
      placeholder: '20',
      helpText: 'ChatGPT Plus, Claude Pro, etc.',
      required: true
    },
    {
      id: 'net_yearly_roi',
      label: 'Net yearly ROI ($)',
      type: 'number',
      helpText: 'Yearly savings minus annual AI cost',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="roi-calculator"
      fields={fields}
      title="INTERACTIVE EXERCISE 2: Calculate Your AI Savings"
    />
  );
}

// Business Priority List Form
export function BusinessPriorityForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'priority1',
      label: '#1 Priority Task',
      type: 'textarea',
      placeholder: 'Improve customer onboarding',
      required: true
    },
    {
      id: 'priority1_ai_help',
      label: 'How AI helps with #1',
      type: 'textarea',
      placeholder: 'Create automated welcome emails, onboarding videos, FAQ responses',
      required: true
    },
    {
      id: 'priority2',
      label: '#2 Priority Task',
      type: 'textarea',
      placeholder: 'Scale marketing content',
      required: true
    },
    {
      id: 'priority2_ai_help',
      label: 'How AI helps with #2',
      type: 'textarea',
      placeholder: 'Generate social posts, blog outlines, ad copy variations',
      required: true
    },
    {
      id: 'priority3',
      label: '#3 Priority Task',
      type: 'textarea',
      placeholder: 'Improve operational efficiency',
      required: true
    },
    {
      id: 'priority3_ai_help',
      label: 'How AI helps with #3',
      type: 'textarea',
      placeholder: 'Automate reports, streamline workflows, predict inventory needs',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="business-priority-list"
      fields={fields}
      title="INTERACTIVE EXERCISE 3: Your Priority List"
    />
  );
}

// Investment Plan Form
export function InvestmentPlanForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'tool_subscription',
      label: 'AI tool subscription',
      type: 'select',
      options: [
        'ChatGPT Plus ($20/mo)',
        'Claude Pro ($20/mo)',
        'Both ($40/mo)',
        'Free tier only ($0/mo)',
        'Custom/Enterprise'
      ],
      required: true
    },
    {
      id: 'learning_investment',
      label: 'Learning investment',
      type: 'select',
      options: [
        '2-3 hours/week (this course)',
        '5+ hours/week (intensive)',
        '1 hour/week (gradual)',
        'Just-in-time learning'
      ],
      required: true
    },
    {
      id: 'first_use_case',
      label: 'First use case to implement',
      type: 'textarea',
      placeholder: 'Customer email responses using AI templates',
      required: true
    },
    {
      id: 'first_use_deadline',
      label: 'Implementation deadline',
      type: 'date',
      required: true
    },
    {
      id: 'second_use_case',
      label: 'Second use case to implement',
      type: 'textarea',
      placeholder: 'Social media content generation',
      required: true
    },
    {
      id: 'second_use_deadline',
      label: 'Implementation deadline',
      type: 'date',
      required: true
    },
    {
      id: 'success_metric',
      label: 'How will you measure success?',
      type: 'textarea',
      placeholder: 'Save 10 hours/week, increase content output 3x, improve response time 50%',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="investment-plan"
      fields={fields}
      title="INTERACTIVE EXERCISE 4: Your Investment Plan"
    />
  );
}

// ============================================
// PRODUCTIVITY FORMS (Additional)
// ============================================

// Task Scoring Form - Extended version for current tasks
export function CurrentTasksScoringForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'task1_name',
      label: 'Task 1 Name',
      type: 'text',
      required: true
    },
    {
      id: 'task1_score',
      label: 'Task 1 Priority Score',
      type: 'number',
      helpText: '(Impact × 2) + Urgency + (10 - Effort) + Alignment',
      required: true
    },
    {
      id: 'task2_name',
      label: 'Task 2 Name',
      type: 'text',
      required: true
    },
    {
      id: 'task2_score',
      label: 'Task 2 Priority Score',
      type: 'number',
      required: true
    },
    {
      id: 'task3_name',
      label: 'Task 3 Name',
      type: 'text',
      required: true
    },
    {
      id: 'task3_score',
      label: 'Task 3 Priority Score',
      type: 'number',
      required: true
    },
    {
      id: 'task4_name',
      label: 'Task 4 Name',
      type: 'text'
    },
    {
      id: 'task4_score',
      label: 'Task 4 Priority Score',
      type: 'number'
    },
    {
      id: 'task5_name',
      label: 'Task 5 Name',
      type: 'text'
    },
    {
      id: 'task5_score',
      label: 'Task 5 Priority Score',
      type: 'number'
    },
    {
      id: 'highest_priority',
      label: 'Which task scored highest?',
      type: 'text',
      required: true
    },
    {
      id: 'tasks_to_delegate',
      label: 'Tasks to delegate (scores 15-24)',
      type: 'textarea',
      placeholder: 'List tasks that can be delegated...'
    },
    {
      id: 'tasks_to_eliminate',
      label: 'Tasks to eliminate (scores below 15)',
      type: 'textarea',
      placeholder: 'List tasks to stop doing...'
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="current-tasks-scoring"
      fields={fields}
      title="INTERACTIVE EXERCISE 3: Score Your Current Tasks"
    />
  );
}

// AI Priority Prompt Builder
export function AIPriorityPromptForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'role_context',
      label: 'Your role/context',
      type: 'text',
      placeholder: 'I\'m a product manager leading a team of 5',
      helpText: 'Who are you and what\'s your situation?',
      required: true
    },
    {
      id: 'goal1',
      label: 'Goal 1',
      type: 'text',
      placeholder: 'Ship Product V2.0 by June 30',
      required: true
    },
    {
      id: 'goal2',
      label: 'Goal 2',
      type: 'text',
      placeholder: 'Build team from 5 to 8 people',
      required: true
    },
    {
      id: 'goal3',
      label: 'Goal 3',
      type: 'text',
      placeholder: 'Increase customer retention to 95%',
      required: true
    },
    {
      id: 'task_list',
      label: 'Paste your task list (one per line)',
      type: 'textarea',
      placeholder: 'Prepare quarterly presentation\nReview budget proposal\nInterview 3 candidates\n...',
      helpText: 'List everything you could work on this week',
      required: true
    },
    {
      id: 'complete_prompt',
      label: 'Your complete AI prompt (copy this to use)',
      type: 'textarea',
      helpText: 'This combines everything above into a ready-to-use prompt',
      placeholder: 'Will be generated based on your inputs above...'
    },
    {
      id: 'prompt_saved',
      label: 'I saved this prompt for weekly use',
      type: 'checkbox'
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="ai-priority-prompt-builder"
      fields={fields}
      title="INTERACTIVE EXERCISE 4: Build Your AI Priority Prompt"
    />
  );
}

// ============================================
// CREATOR FORMS
// ============================================

// Blog Post Practice Form
export function BlogPostPracticeForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'blog_topic',
      label: 'Your blog post topic',
      type: 'text',
      placeholder: 'How to start a morning routine that sticks',
      required: true
    },
    {
      id: 'target_audience',
      label: 'Target audience',
      type: 'text',
      placeholder: 'Busy professionals ages 25-40',
      required: true
    },
    {
      id: 'outline_prompt',
      label: 'Prompt you used to generate outline',
      type: 'textarea',
      placeholder: 'Create a blog post outline about...',
      required: true
    },
    {
      id: 'ai_outline',
      label: 'AI-generated outline',
      type: 'textarea',
      placeholder: 'Paste the outline AI gave you...',
      required: true
    },
    {
      id: 'sections_to_expand',
      label: 'Which sections will you expand with AI?',
      type: 'textarea',
      placeholder: 'Section 2 (Benefits), Section 4 (Common mistakes)',
      required: true
    },
    {
      id: 'your_unique_angle',
      label: 'Your unique perspective/story',
      type: 'textarea',
      placeholder: 'I struggled with morning routines for 5 years until...',
      helpText: 'This is what YOU will add - AI can\'t write this',
      required: true
    },
    {
      id: 'first_draft_complete',
      label: 'I completed a first draft using this process',
      type: 'checkbox'
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="blog-post-practice"
      fields={fields}
      title="PRACTICE EXERCISE: Write Your Blog Post"
    />
  );
}

// Content Idea Generator Form
export function ContentIdeaForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'niche',
      label: 'Your content niche',
      type: 'text',
      placeholder: 'Personal finance for freelancers',
      required: true
    },
    {
      id: 'content_type',
      label: 'Content type',
      type: 'select',
      options: [
        'Blog posts',
        'YouTube videos',
        'Social media posts',
        'Email newsletters',
        'Podcasts',
        'Mixed/Multiple'
      ],
      required: true
    },
    {
      id: 'idea1',
      label: 'Content idea 1',
      type: 'textarea',
      placeholder: '5 tax deductions freelancers always miss',
      required: true
    },
    {
      id: 'idea1_angle',
      label: 'Your unique angle for idea 1',
      type: 'text',
      placeholder: 'Based on my experience as a CPA for 10 years',
      required: true
    },
    {
      id: 'idea2',
      label: 'Content idea 2',
      type: 'textarea',
      required: true
    },
    {
      id: 'idea2_angle',
      label: 'Your unique angle for idea 2',
      type: 'text',
      required: true
    },
    {
      id: 'idea3',
      label: 'Content idea 3',
      type: 'textarea',
      required: true
    },
    {
      id: 'idea3_angle',
      label: 'Your unique angle for idea 3',
      type: 'text',
      required: true
    },
    {
      id: 'next_action',
      label: 'Which idea will you create first?',
      type: 'select',
      options: ['Idea 1', 'Idea 2', 'Idea 3'],
      required: true
    },
    {
      id: 'creation_deadline',
      label: 'Creation deadline',
      type: 'date',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="content-idea-generator"
      fields={fields}
      title="YOUR TURN: Generate Content Ideas"
    />
  );
}

// ============================================
// EVERYDAY LIFE FORMS
// ============================================

// First Prompt Practice Form
export function FirstPromptForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'prompt1_topic',
      label: 'Prompt 1 - Topic',
      type: 'text',
      placeholder: 'Meal planning',
      required: true
    },
    {
      id: 'prompt1_text',
      label: 'Your prompt 1',
      type: 'textarea',
      placeholder: 'I need help with...',
      helpText: 'Use the formula: Context + Task + Format',
      required: true
    },
    {
      id: 'prompt1_result',
      label: 'How good was the result?',
      type: 'select',
      options: [
        'Excellent - exactly what I needed',
        'Good - useful with minor tweaks',
        'Okay - needed refinement',
        'Poor - tried again with better prompt'
      ],
      required: true
    },
    {
      id: 'prompt2_topic',
      label: 'Prompt 2 - Topic',
      type: 'text',
      placeholder: 'Study schedule',
      required: true
    },
    {
      id: 'prompt2_text',
      label: 'Your prompt 2',
      type: 'textarea',
      required: true
    },
    {
      id: 'prompt2_result',
      label: 'How good was the result?',
      type: 'select',
      options: [
        'Excellent - exactly what I needed',
        'Good - useful with minor tweaks',
        'Okay - needed refinement',
        'Poor - tried again with better prompt'
      ],
      required: true
    },
    {
      id: 'prompt3_topic',
      label: 'Prompt 3 - Topic',
      type: 'text',
      placeholder: 'Email to send',
      required: true
    },
    {
      id: 'prompt3_text',
      label: 'Your prompt 3',
      type: 'textarea',
      required: true
    },
    {
      id: 'prompt3_result',
      label: 'How good was the result?',
      type: 'select',
      options: [
        'Excellent - exactly what I needed',
        'Good - useful with minor tweaks',
        'Okay - needed refinement',
        'Poor - tried again with better prompt'
      ],
      required: true
    },
    {
      id: 'key_learning',
      label: 'What did you learn about writing prompts?',
      type: 'textarea',
      placeholder: 'The more specific I am, the better the results...',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="first-prompt-practice"
      fields={fields}
      title="PRACTICE LAB: Write Your First Three Prompts"
    />
  );
}

// Daily AI Awareness Form
export function AIAwarenessForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'ai_use1',
      label: 'Place 1 where AI helped you today',
      type: 'text',
      placeholder: 'Netflix recommended a show I loved',
      required: true
    },
    {
      id: 'ai_use2',
      label: 'Place 2 where AI helped you today',
      type: 'text',
      placeholder: 'Google search auto-completed my query',
      required: true
    },
    {
      id: 'ai_use3',
      label: 'Place 3 where AI helped you today',
      type: 'text',
      placeholder: 'Email spam filter caught junk mail',
      required: true
    },
    {
      id: 'realization',
      label: 'What did you realize about AI in daily life?',
      type: 'textarea',
      placeholder: 'I use AI way more than I thought - it\'s everywhere!',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="ai-awareness"
      fields={fields}
      title="YOUR TURN: Spot AI in Your Day"
    />
  );
}
