/*
  # AI Command Center System

  This migration creates the complete infrastructure for the interactive Command Center
  that students build in Module 5. The system includes:

  ## 1. New Tables
    
    ### `command_center_config`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `is_enabled` (boolean) - Whether Command Center is activated
    - `morning_routine_time` (time) - Preferred morning review time
    - `evening_routine_time` (time) - Preferred evening review time
    - `energy_peak_hours` (text[]) - Array of peak productivity hours
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `daily_priorities`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `date` (date) - The date these priorities are for
    - `priorities` (jsonb) - Array of priority objects with title, description, status
    - `ai_generated` (boolean) - Whether priorities were AI-generated
    - `completed_count` (integer) - Number of completed priorities
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `decision_queue`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text) - Decision title
    - `description` (text) - Decision details
    - `category` (text) - quick, medium, or big
    - `deadline` (date) - Optional deadline
    - `status` (text) - pending, analyzing, decided, deferred
    - `ai_analysis` (jsonb) - AI-generated analysis and recommendations
    - `final_decision` (text) - The decision made
    - `decision_date` (timestamptz) - When decision was made
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `task_management`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text) - Task title
    - `description` (text) - Task details
    - `project_id` (uuid) - Optional project reference
    - `priority` (text) - high, medium, low
    - `status` (text) - inbox, next, waiting, scheduled, completed
    - `due_date` (date) - Optional due date
    - `scheduled_date` (date) - When task is scheduled
    - `energy_level_required` (text) - high, medium, low
    - `estimated_minutes` (integer) - Time estimate
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `learning_projects`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text) - Learning goal title
    - `description` (text) - What they're learning
    - `target_skill_level` (text) - Target proficiency
    - `current_progress` (integer) - Progress percentage 0-100
    - `timeline_weeks` (integer) - Expected timeline
    - `learning_path` (jsonb) - AI-generated learning path
    - `status` (text) - planning, active, paused, completed
    - `milestones` (jsonb) - Array of milestone objects
    - `resources` (jsonb) - Learning resources
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `life_operations`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `category` (text) - meals, travel, financial, health, household
    - `title` (text) - Operation title
    - `data` (jsonb) - Flexible data structure for different operation types
    - `scheduled_date` (date) - When this operation is scheduled
    - `status` (text) - planning, active, completed
    - `ai_generated` (boolean) - Whether this was AI-generated
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `daily_reviews`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `review_date` (date) - Date of review
    - `review_type` (text) - morning or evening
    - `wins` (text[]) - Array of wins/accomplishments
    - `challenges` (text[]) - Challenges faced
    - `tomorrow_prep` (jsonb) - Prep for tomorrow
    - `energy_rating` (integer) - 1-5 energy level rating
    - `focus_rating` (integer) - 1-5 focus quality rating
    - `ai_recommendations` (jsonb) - AI-generated insights
    - `created_at` (timestamptz)

    ### `weekly_reflections`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `week_start_date` (date) - Start of week
    - `week_end_date` (date) - End of week
    - `goals_completed` (integer) - Number of goals achieved
    - `goals_total` (integer) - Total goals set
    - `insights` (text) - Personal reflections
    - `what_worked` (text[]) - What went well
    - `what_to_improve` (text[]) - Areas for improvement
    - `next_week_focus` (text[]) - Focus areas for next week
    - `ai_analysis` (jsonb) - AI-generated weekly insights
    - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own Command Center data

  ## 3. Indexes
    - Add indexes for user_id on all tables for performance
    - Add indexes for date-based queries (daily_priorities.date, etc.)
    - Add indexes for status filters

  ## 4. Notes
    - All tables use soft deletes (no actual deletion)
    - JSONB fields allow flexibility for future features
    - AI-generated flags help track automation adoption
    - Status fields use consistent enums across tables
*/

-- Command Center Configuration
CREATE TABLE IF NOT EXISTS command_center_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  is_enabled boolean DEFAULT false,
  morning_routine_time time DEFAULT '08:00:00',
  evening_routine_time time DEFAULT '18:00:00',
  energy_peak_hours text[] DEFAULT ARRAY['09:00', '10:00', '11:00', '14:00', '15:00'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Daily Priorities
CREATE TABLE IF NOT EXISTS daily_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  priorities jsonb DEFAULT '[]'::jsonb,
  ai_generated boolean DEFAULT false,
  completed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Decision Queue
CREATE TABLE IF NOT EXISTS decision_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'medium' CHECK (category IN ('quick', 'medium', 'big')),
  deadline date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'decided', 'deferred')),
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  final_decision text,
  decision_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task Management
CREATE TABLE IF NOT EXISTS task_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  project_id uuid,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text DEFAULT 'inbox' CHECK (status IN ('inbox', 'next', 'waiting', 'scheduled', 'completed')),
  due_date date,
  scheduled_date date,
  energy_level_required text DEFAULT 'medium' CHECK (energy_level_required IN ('high', 'medium', 'low')),
  estimated_minutes integer DEFAULT 30,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Learning Projects
CREATE TABLE IF NOT EXISTS learning_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  target_skill_level text DEFAULT '',
  current_progress integer DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  timeline_weeks integer DEFAULT 4,
  learning_path jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  milestones jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Life Operations
CREATE TABLE IF NOT EXISTS life_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text NOT NULL CHECK (category IN ('meals', 'travel', 'financial', 'health', 'household')),
  title text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  scheduled_date date,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  ai_generated boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily Reviews
CREATE TABLE IF NOT EXISTS daily_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  review_date date NOT NULL,
  review_type text NOT NULL CHECK (review_type IN ('morning', 'evening')),
  wins text[] DEFAULT ARRAY[]::text[],
  challenges text[] DEFAULT ARRAY[]::text[],
  tomorrow_prep jsonb DEFAULT '{}'::jsonb,
  energy_rating integer CHECK (energy_rating >= 1 AND energy_rating <= 5),
  focus_rating integer CHECK (focus_rating >= 1 AND focus_rating <= 5),
  ai_recommendations jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, review_date, review_type)
);

-- Weekly Reflections
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  goals_completed integer DEFAULT 0,
  goals_total integer DEFAULT 0,
  insights text DEFAULT '',
  what_worked text[] DEFAULT ARRAY[]::text[],
  what_to_improve text[] DEFAULT ARRAY[]::text[],
  next_week_focus text[] DEFAULT ARRAY[]::text[],
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS
ALTER TABLE command_center_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for command_center_config
CREATE POLICY "Users can view own config"
  ON command_center_config FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config"
  ON command_center_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
  ON command_center_config FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_priorities
CREATE POLICY "Users can view own priorities"
  ON daily_priorities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own priorities"
  ON daily_priorities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own priorities"
  ON daily_priorities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for decision_queue
CREATE POLICY "Users can view own decisions"
  ON decision_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON decision_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON decision_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
  ON decision_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for task_management
CREATE POLICY "Users can view own tasks"
  ON task_management FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON task_management FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON task_management FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON task_management FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for learning_projects
CREATE POLICY "Users can view own learning projects"
  ON learning_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning projects"
  ON learning_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning projects"
  ON learning_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning projects"
  ON learning_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for life_operations
CREATE POLICY "Users can view own operations"
  ON life_operations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations"
  ON life_operations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations"
  ON life_operations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own operations"
  ON life_operations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_reviews
CREATE POLICY "Users can view own reviews"
  ON daily_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON daily_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON daily_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_reflections
CREATE POLICY "Users can view own reflections"
  ON weekly_reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON weekly_reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON weekly_reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_priorities_user_date ON daily_priorities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_decision_queue_user_status ON decision_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_management_user_status ON task_management(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_management_scheduled ON task_management(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_learning_projects_user_status ON learning_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_life_operations_user_date ON life_operations(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_date ON daily_reviews(user_id, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_date ON weekly_reflections(user_id, week_start_date DESC);