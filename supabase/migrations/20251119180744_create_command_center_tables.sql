/*
  # AI Command Center Database Schema

  ## Overview
  Creates tables for students to build their personal AI Command Center as part of Module 5: Final Project.
  
  ## New Tables
  
  ### `command_center_workflows`
  Stores individual AI workflows created by users
  - `id` (uuid, primary key) - Unique workflow identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `title` (text) - Workflow name
  - `description` (text) - What the workflow does
  - `category` (text) - Type of workflow (productivity, creative, analysis, etc.)
  - `prompt_template` (text) - The AI prompt template
  - `variables` (jsonb) - Dynamic variables in the template
  - `is_active` (boolean) - Whether workflow is enabled
  - `frequency` (text) - How often to run (daily, weekly, on-demand)
  - `last_run_at` (timestamptz) - Last execution timestamp
  - `run_count` (integer) - Number of times executed
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `command_center_executions`
  Tracks workflow execution history
  - `id` (uuid, primary key) - Unique execution identifier
  - `workflow_id` (uuid, foreign key) - References command_center_workflows
  - `user_id` (uuid, foreign key) - References auth.users
  - `input_data` (jsonb) - Input parameters used
  - `output_data` (text) - Generated output
  - `rating` (integer) - User rating (1-5)
  - `notes` (text) - User notes about execution
  - `created_at` (timestamptz) - Execution timestamp

  ### `command_center_templates`
  Pre-built workflow templates for students to use
  - `id` (uuid, primary key) - Unique template identifier
  - `title` (text) - Template name
  - `description` (text) - What the template does
  - `category` (text) - Type of workflow
  - `prompt_template` (text) - The AI prompt template
  - `variables` (jsonb) - Variable definitions
  - `example_output` (text) - Sample result
  - `difficulty` (text) - Beginner, intermediate, advanced
  - `tags` (text array) - Searchable tags
  - `is_featured` (boolean) - Show on featured list
  - `usage_count` (integer) - How many times used
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own workflows and executions
  - Templates are public (read-only for all authenticated users)
*/

-- Create command_center_workflows table
CREATE TABLE IF NOT EXISTS command_center_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('productivity', 'creative', 'analysis', 'learning', 'decision-making', 'communication', 'planning', 'custom')),
  prompt_template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  frequency text DEFAULT 'on-demand' CHECK (frequency IN ('on-demand', 'daily', 'weekly', 'monthly')),
  last_run_at timestamptz,
  run_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create command_center_executions table
CREATE TABLE IF NOT EXISTS command_center_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES command_center_workflows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_data jsonb DEFAULT '{}'::jsonb,
  output_data text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create command_center_templates table
CREATE TABLE IF NOT EXISTS command_center_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('productivity', 'creative', 'analysis', 'learning', 'decision-making', 'communication', 'planning', 'custom')),
  prompt_template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  example_output text,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags text[] DEFAULT ARRAY[]::text[],
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE command_center_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_center_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_center_templates ENABLE ROW LEVEL SECURITY;

-- Policies for command_center_workflows
CREATE POLICY "Users can view own workflows"
  ON command_center_workflows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON command_center_workflows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON command_center_workflows FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON command_center_workflows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for command_center_executions
CREATE POLICY "Users can view own executions"
  ON command_center_executions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions"
  ON command_center_executions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own executions"
  ON command_center_executions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own executions"
  ON command_center_executions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for command_center_templates
CREATE POLICY "Anyone can view templates"
  ON command_center_templates FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON command_center_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON command_center_workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON command_center_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON command_center_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON command_center_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON command_center_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_featured ON command_center_templates(is_featured);

-- Insert starter templates
INSERT INTO command_center_templates (title, description, category, prompt_template, variables, example_output, difficulty, tags, is_featured) VALUES
(
  'Daily Task Prioritizer',
  'Analyze your task list and prioritize based on urgency and impact',
  'productivity',
  'I have the following tasks to complete today: {{task_list}}

Please analyze these tasks and:
1. Prioritize them using the Eisenhower Matrix (Urgent/Important)
2. Suggest which 3 tasks I should focus on first
3. Estimate time needed for each priority task
4. Identify any tasks I could delegate or eliminate

Format the output as a clear action plan for my day.',
  '[{"name": "task_list", "label": "Your Tasks", "type": "textarea", "placeholder": "List your tasks, one per line"}]'::jsonb,
  'Based on your task list, here are your top 3 priorities...',
  'beginner',
  ARRAY['productivity', 'planning', 'time-management'],
  true
),
(
  'Morning Motivation Builder',
  'Generate a personalized motivational message to start your day',
  'productivity',
  'Create a personalized morning motivation message for me. Context:
- My main goal today: {{daily_goal}}
- Current challenge: {{challenge}}
- What energizes me: {{energy_source}}

Generate an uplifting, actionable message (2-3 paragraphs) that:
1. Acknowledges my challenge with empathy
2. Connects to my goal
3. Provides 1-2 specific actions I can take
4. Ends with an energizing affirmation',
  '[{"name": "daily_goal", "label": "Today''s Main Goal", "type": "text"}, {"name": "challenge", "label": "Current Challenge", "type": "text"}, {"name": "energy_source", "label": "What Energizes You", "type": "text"}]'::jsonb,
  'Good morning! Today is your day to make progress on...',
  'beginner',
  ARRAY['productivity', 'motivation', 'mindset'],
  true
),
(
  'Decision Framework Assistant',
  'Get structured guidance for important decisions',
  'decision-making',
  'Help me make a decision about: {{decision}}

Key factors to consider:
{{factors}}

Constraints or limitations:
{{constraints}}

Please provide:
1. A structured analysis of pros and cons
2. Key questions I should ask myself
3. Potential blind spots I might be missing
4. A framework for making this decision
5. Your recommendation with reasoning',
  '[{"name": "decision", "label": "What Decision Are You Making?", "type": "text"}, {"name": "factors", "label": "Key Factors", "type": "textarea"}, {"name": "constraints", "label": "Constraints/Limitations", "type": "textarea"}]'::jsonb,
  'Let me help you think through this decision systematically...',
  'intermediate',
  ARRAY['decision-making', 'analysis', 'planning'],
  true
),
(
  'Weekly Reflection Generator',
  'Structured prompts for meaningful weekly reflection',
  'learning',
  'I''m doing my weekly reflection. Here''s my week:

Key accomplishments:
{{accomplishments}}

Challenges faced:
{{challenges}}

What I learned:
{{learnings}}

Please help me:
1. Identify patterns in my successes
2. Extract deeper lessons from my challenges
3. Suggest 2-3 specific improvements for next week
4. Celebrate my progress with encouraging words
5. Create 1 powerful question for next week''s focus',
  '[{"name": "accomplishments", "label": "Key Accomplishments", "type": "textarea"}, {"name": "challenges", "label": "Challenges Faced", "type": "textarea"}, {"name": "learnings", "label": "What You Learned", "type": "textarea"}]'::jsonb,
  'Excellent work this week! Let me help you extract insights...',
  'beginner',
  ARRAY['learning', 'reflection', 'growth'],
  true
),
(
  'Content Idea Generator',
  'Generate creative content ideas based on your topic and audience',
  'creative',
  'Generate content ideas for:
Topic: {{topic}}
Target audience: {{audience}}
Content format: {{format}}
Goal: {{goal}}

Please provide:
1. 5 unique content ideas with catchy titles
2. Brief description of each idea (2-3 sentences)
3. Why each would resonate with my audience
4. Suggested hook or opening for the top idea',
  '[{"name": "topic", "label": "Main Topic", "type": "text"}, {"name": "audience", "label": "Target Audience", "type": "text"}, {"name": "format", "label": "Content Format", "type": "text", "placeholder": "blog, video, social media, etc."}, {"name": "goal", "label": "Content Goal", "type": "text"}]'::jsonb,
  'Here are 5 compelling content ideas tailored to your audience...',
  'intermediate',
  ARRAY['creative', 'content', 'marketing'],
  false
),
(
  'Email Response Assistant',
  'Draft professional email responses quickly',
  'communication',
  'Help me draft a response to this email:

Original email:
{{email_content}}

Key points I want to address:
{{key_points}}

Tone: {{tone}}

Please draft a clear, professional response that:
1. Acknowledges their message
2. Addresses all key points
3. Maintains the appropriate tone
4. Includes a clear call-to-action if needed',
  '[{"name": "email_content", "label": "Original Email", "type": "textarea"}, {"name": "key_points", "label": "Key Points to Address", "type": "textarea"}, {"name": "tone", "label": "Desired Tone", "type": "text", "placeholder": "professional, friendly, formal, etc."}]'::jsonb,
  'Here''s a draft response that addresses all your key points...',
  'beginner',
  ARRAY['communication', 'productivity', 'writing'],
  false
);
