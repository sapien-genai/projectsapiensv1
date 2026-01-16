/*
  # Enhanced Tasks and Calendar System

  This migration enhances the task management and calendar systems for the Command Center.

  ## 1. New Tables
    
    ### `tasks`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `title` (text) - Task title
    - `description` (text) - Task details
    - `status` (text) - todo, in_progress, completed, blocked
    - `priority` (text) - urgent, high, medium, low
    - `category` (text) - work, personal, learning, health, etc.
    - `due_date` (date) - When task is due
    - `estimated_minutes` (integer) - Time estimate
    - `actual_minutes` (integer) - Actual time spent
    - `energy_required` (text) - high, medium, low
    - `tags` (text[]) - Task tags
    - `parent_task_id` (uuid) - For subtasks
    - `ai_generated` (boolean) - Whether AI created this
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `task_notes`
    - `id` (uuid, primary key)
    - `task_id` (uuid, references tasks)
    - `user_id` (uuid, references auth.users)
    - `note` (text)
    - `created_at` (timestamptz)

  ## 2. Calendar Enhancements
    - Add recurring event support
    - Add reminder settings
    - Add event status tracking

  ## 3. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Proper indexes for performance

  ## 4. Features
    - Task hierarchy (parent/subtasks)
    - Time tracking
    - Energy-based scheduling
    - AI task generation support
*/

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category text DEFAULT 'work' CHECK (category IN ('work', 'personal', 'learning', 'health', 'finance', 'relationships', 'projects', 'other')),
  due_date date,
  estimated_minutes integer,
  actual_minutes integer DEFAULT 0,
  energy_required text DEFAULT 'medium' CHECK (energy_required IN ('high', 'medium', 'low')),
  tags text[] DEFAULT ARRAY[]::text[],
  parent_task_id uuid REFERENCES tasks(id),
  ai_generated boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task Notes
CREATE TABLE IF NOT EXISTS task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update calendar_events with additional fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'recurring'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN recurring boolean DEFAULT false;
    ALTER TABLE calendar_events ADD COLUMN recurrence_pattern text;
    ALTER TABLE calendar_events ADD COLUMN reminder_minutes integer DEFAULT 15;
    ALTER TABLE calendar_events ADD COLUMN status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled'));
    ALTER TABLE calendar_events ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for task_notes
CREATE POLICY "Users can view own task notes"
  ON task_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task notes"
  ON task_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task notes"
  ON task_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own task notes"
  ON task_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_status ON calendar_events(user_id, status);