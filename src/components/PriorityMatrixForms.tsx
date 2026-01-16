import LessonForm, { FormField } from './LessonForm';

// Exercise 1: Current Time Allocation
export function TimeAllocationForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'quadrant1_percentage',
      label: 'Quadrant 1 (Urgent & Important) - What percentage of your time?',
      type: 'number',
      placeholder: '25',
      helpText: 'Examples: Client emergencies, deadline crunches, critical problems',
      required: true
    },
    {
      id: 'quadrant2_percentage',
      label: 'Quadrant 2 (Not Urgent but Important) - What percentage?',
      type: 'number',
      placeholder: '30',
      helpText: 'Examples: Strategic planning, skill development, relationship building',
      required: true
    },
    {
      id: 'quadrant3_percentage',
      label: 'Quadrant 3 (Urgent but Not Important) - What percentage?',
      type: 'number',
      placeholder: '35',
      helpText: 'Examples: Non-critical meetings, interruptions, other people\'s requests',
      required: true
    },
    {
      id: 'quadrant4_percentage',
      label: 'Quadrant 4 (Not Urgent & Not Important) - What percentage?',
      type: 'number',
      placeholder: '10',
      helpText: 'Examples: Busy work, excessive social media, unnecessary tasks',
      required: true
    },
    {
      id: 'biggest_opportunity',
      label: 'Based on your percentages, where\'s your biggest improvement opportunity?',
      type: 'select',
      options: [
        'Reduce Q1 (fewer crises through better Q2 planning)',
        'Increase Q2 (more strategic, important work)',
        'Reduce Q3 (delegate or eliminate urgent but unimportant)',
        'Eliminate Q4 (stop wasting time)'
      ],
      required: true
    },
    {
      id: 'shift_goal',
      label: 'Goal for next week: I will shift __% of my time from Q__ to Q__',
      type: 'text',
      placeholder: '15% from Q3 to Q2',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="exercise-1-time-allocation"
      fields={fields}
      title="INTERACTIVE EXERCISE 1: Your Current Time Allocation"
    />
  );
}

// Exercise 2: Define Goals
export function GoalsDefinitionForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'goal1',
      label: 'Goal 1',
      type: 'textarea',
      placeholder: 'Ship Product V2.0 by June 30',
      required: true
    },
    {
      id: 'goal1_metric',
      label: 'Success metric for Goal 1',
      type: 'text',
      placeholder: 'Product launched with 3 key features',
      required: true
    },
    {
      id: 'goal1_deadline',
      label: 'Deadline for Goal 1',
      type: 'date',
      required: true
    },
    {
      id: 'goal2',
      label: 'Goal 2',
      type: 'textarea',
      placeholder: 'Build team from 5 to 8 people',
      required: true
    },
    {
      id: 'goal2_metric',
      label: 'Success metric for Goal 2',
      type: 'text',
      placeholder: '3 new hires onboarded and productive',
      required: true
    },
    {
      id: 'goal2_deadline',
      label: 'Deadline for Goal 2',
      type: 'date',
      required: true
    },
    {
      id: 'goal3',
      label: 'Goal 3',
      type: 'textarea',
      placeholder: 'Increase customer retention to 95%',
      required: true
    },
    {
      id: 'goal3_metric',
      label: 'Success metric for Goal 3',
      type: 'text',
      placeholder: 'Retention rate at 95% for Q2',
      required: true
    },
    {
      id: 'goal3_deadline',
      label: 'Deadline for Goal 3',
      type: 'date',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="exercise-2-goals-definition"
      fields={fields}
      title="INTERACTIVE EXERCISE 2: Define Your Goals & Alignment Criteria"
    />
  );
}

// Exercise 3: Score Your Tasks (Repeatable for multiple tasks)
export function TaskScoringForm({ pathId, lessonId, taskNumber }: { pathId: string; lessonId: string; taskNumber: number }) {
  const fields: FormField[] = [
    {
      id: 'task_name',
      label: `Task ${taskNumber} Name`,
      type: 'text',
      placeholder: 'Prepare quarterly strategy presentation',
      required: true
    },
    {
      id: 'impact_score',
      label: 'Impact (1-10)',
      type: 'number',
      helpText: 'How much does this move the needle toward your goals?',
      required: true
    },
    {
      id: 'impact_why',
      label: 'Why this impact score?',
      type: 'textarea',
      placeholder: 'Shapes entire team direction for Q2',
      required: true
    },
    {
      id: 'urgency_score',
      label: 'Urgency (1-10)',
      type: 'number',
      helpText: 'When must this be done?',
      required: true
    },
    {
      id: 'urgency_deadline',
      label: 'Deadline',
      type: 'text',
      placeholder: 'Due in 3 days',
      required: true
    },
    {
      id: 'effort_score',
      label: 'Effort (1-10)',
      type: 'number',
      helpText: 'How long will this take? How complex?',
      required: true
    },
    {
      id: 'effort_time',
      label: 'Time needed',
      type: 'text',
      placeholder: '3 hours of focused work',
      required: true
    },
    {
      id: 'alignment_score',
      label: 'Alignment (1-10)',
      type: 'number',
      helpText: 'How well does this align with your top 3 goals?',
      required: true
    },
    {
      id: 'alignment_goal',
      label: 'Which goal does this support?',
      type: 'text',
      placeholder: 'Goal 1 - Ship Product V2.0',
      required: true
    },
    {
      id: 'priority_score',
      label: 'Priority Score (calculated)',
      type: 'number',
      helpText: '(Impact × 2) + Urgency + (10 - Effort) + Alignment',
      required: true
    },
    {
      id: 'action_decision',
      label: 'Action Decision',
      type: 'select',
      options: [
        'Do Now (45-60 points)',
        'This Week (35-44 points)',
        'Next Week (25-34 points)',
        'Delegate (15-24 points)',
        'Eliminate (below 15 points)'
      ],
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId={`exercise-3-task-scoring-${taskNumber}`}
      fields={fields}
      title={`Task ${taskNumber} Scoring`}
    />
  );
}

// Exercise 5: Weekly Priority Ritual
export function WeeklyRitualForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    {
      id: 'monday_step1_done',
      label: 'STEP 1: Brain dump (5 min) - List everything you could work on this week',
      type: 'checkbox'
    },
    {
      id: 'monday_task_list',
      label: 'Your task list for this week (15-25 items)',
      type: 'textarea',
      placeholder: 'List all tasks, one per line...',
      helpText: 'Include: projects, meetings, admin, reactive work'
    },
    {
      id: 'monday_step2_done',
      label: 'STEP 2: AI prioritization (5 min) - Ran through ChatGPT/Claude',
      type: 'checkbox'
    },
    {
      id: 'monday_step3_done',
      label: 'STEP 3: Schedule top priorities (5 min) - Blocked calendar',
      type: 'checkbox'
    },
    {
      id: 'daily_big_thing',
      label: 'Today\'s 1 big thing',
      type: 'textarea',
      placeholder: 'My highest-priority task today...'
    },
    {
      id: 'daily_medium_things',
      label: 'Today\'s 3 medium things (comma-separated)',
      type: 'text',
      placeholder: 'Task 1, Task 2, Task 3'
    },
    {
      id: 'daily_small_things',
      label: 'Today\'s 5 small things (comma-separated)',
      type: 'text',
      placeholder: 'Quick task 1, Quick task 2, ...'
    },
    {
      id: 'daily_priority_drift_check',
      label: 'Did new urgent tasks appear today?',
      type: 'checkbox'
    },
    {
      id: 'daily_priority_drift_notes',
      label: 'If yes, did they score higher than your plan?',
      type: 'textarea',
      placeholder: 'Notes on priority changes...'
    },
    {
      id: 'friday_big3_completed',
      label: 'Did I complete my Big 3 for the week?',
      type: 'checkbox'
    },
    {
      id: 'friday_what_got_in_way',
      label: 'If not, what got in the way?',
      type: 'textarea',
      placeholder: 'Reflect on what prevented completion...'
    },
    {
      id: 'friday_quadrant_analysis',
      label: 'What quadrant am I spending too much time in?',
      type: 'select',
      options: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    {
      id: 'friday_learnings',
      label: 'What did I learn about my priorities this week?',
      type: 'textarea',
      placeholder: 'Key insights and patterns...'
    },
    {
      id: 'friday_next_week_changes',
      label: 'What will I do differently next Monday?',
      type: 'textarea',
      placeholder: 'Specific changes for next week...'
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="exercise-5-weekly-ritual"
      fields={fields}
      title="INTERACTIVE EXERCISE 5: Your Weekly Priority Ritual"
    />
  );
}

// Final Exercise: Complete Priority System
export function CompletePrioritySystemForm({ pathId, lessonId }: { pathId: string; lessonId: string }) {
  const fields: FormField[] = [
    // Part 1: Foundations
    {
      id: 'foundations_goals_defined',
      label: 'My top 3 goals defined',
      type: 'checkbox'
    },
    {
      id: 'foundations_prompt_saved',
      label: 'AI Priority Prompt template saved',
      type: 'checkbox'
    },
    {
      id: 'foundations_ritual_saved',
      label: 'Weekly ritual checklist saved',
      type: 'checkbox'
    },
    {
      id: 'foundations_reminders_set',
      label: 'Calendar reminders set',
      type: 'checkbox'
    },

    // Part 2: This Week's Priorities
    {
      id: 'priority1_task',
      label: '#1 Priority Task',
      type: 'text',
      required: true
    },
    {
      id: 'priority1_score',
      label: '#1 Priority Score (points)',
      type: 'number',
      required: true
    },
    {
      id: 'priority1_scheduled',
      label: '#1 Scheduled (day/time)',
      type: 'text',
      required: true
    },
    {
      id: 'priority1_duration',
      label: '#1 Duration (hours)',
      type: 'number',
      required: true
    },
    {
      id: 'priority1_time_block_created',
      label: '#1 Protected time block created',
      type: 'checkbox'
    },

    {
      id: 'priority2_task',
      label: '#2 Priority Task',
      type: 'text',
      required: true
    },
    {
      id: 'priority2_score',
      label: '#2 Priority Score',
      type: 'number',
      required: true
    },
    {
      id: 'priority2_scheduled',
      label: '#2 Scheduled',
      type: 'text',
      required: true
    },
    {
      id: 'priority2_duration',
      label: '#2 Duration (hours)',
      type: 'number',
      required: true
    },
    {
      id: 'priority2_time_block_created',
      label: '#2 Protected time block created',
      type: 'checkbox'
    },

    {
      id: 'priority3_task',
      label: '#3 Priority Task',
      type: 'text',
      required: true
    },
    {
      id: 'priority3_score',
      label: '#3 Priority Score',
      type: 'number',
      required: true
    },
    {
      id: 'priority3_scheduled',
      label: '#3 Scheduled',
      type: 'text',
      required: true
    },
    {
      id: 'priority3_duration',
      label: '#3 Duration (hours)',
      type: 'number',
      required: true
    },
    {
      id: 'priority3_time_block_created',
      label: '#3 Protected time block created',
      type: 'checkbox'
    },

    // Tasks to delegate
    {
      id: 'delegate_tasks',
      label: 'Tasks to Delegate (one per line: Task → Delegate to)',
      type: 'textarea',
      placeholder: 'Review support tickets → Customer service team\nVendor contract → Procurement'
    },

    // Tasks to eliminate
    {
      id: 'eliminate_tasks',
      label: 'Tasks to Eliminate (one per line: Task - Reason)',
      type: 'textarea',
      placeholder: 'Low-value meeting - Not aligned with goals\nUnnecessary report - No one reads it'
    },

    // Part 3: Daily Structure
    {
      id: 'tomorrow_big_thing',
      label: 'Tomorrow\'s 1 BIG thing',
      type: 'textarea',
      required: true
    },
    {
      id: 'tomorrow_big_thing_schedule',
      label: 'Schedule for BIG thing (from-to time)',
      type: 'text',
      placeholder: '9:00 AM to 12:00 PM',
      required: true
    },
    {
      id: 'tomorrow_big_thing_duration',
      label: 'Duration (hours)',
      type: 'number',
      required: true
    },
    {
      id: 'tomorrow_medium_things',
      label: 'Tomorrow\'s 3 MEDIUM things',
      type: 'textarea',
      placeholder: '1. Task (30-60 min)\n2. Task (30-60 min)\n3. Task (30-60 min)',
      required: true
    },
    {
      id: 'tomorrow_small_things',
      label: 'Tomorrow\'s 5 SMALL things',
      type: 'textarea',
      placeholder: '1. Quick task (5-15 min)\n2. ...\n3. ...\n4. ...\n5. ...',
      required: true
    },

    // Part 4: Commitment
    {
      id: 'commit_priority_score_mondays',
      label: 'I commit to using my Priority Score system every Monday',
      type: 'checkbox',
      required: true
    },
    {
      id: 'commit_protect_top3',
      label: 'I commit to protecting my top 3 priority time blocks',
      type: 'checkbox',
      required: true
    },
    {
      id: 'commit_friday_review',
      label: 'I commit to reviewing my priorities every Friday',
      type: 'checkbox',
      required: true
    },
    {
      id: 'commit_say_no_low_scores',
      label: 'I commit to saying NO to tasks that score below 25 points',
      type: 'checkbox',
      required: true
    },
    {
      id: 'commit_shift_to_q2',
      label: 'I commit to shifting 20% more time to Quadrant 2 work',
      type: 'checkbox',
      required: true
    },
    {
      id: 'signature',
      label: 'Your Name (Signature)',
      type: 'text',
      required: true
    },
    {
      id: 'commitment_date',
      label: 'Date',
      type: 'date',
      required: true
    }
  ];

  return (
    <LessonForm
      pathId={pathId}
      lessonId={lessonId}
      exerciseId="final-exercise-complete-system"
      fields={fields}
      title="FINAL EXERCISE: BUILD YOUR COMPLETE PRIORITY SYSTEM"
    />
  );
}
