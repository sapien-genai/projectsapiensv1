/*
  # Create Lesson Exercise Data Tables

  1. New Tables
    - `lesson_exercise_responses`
      - Stores user responses to interactive lesson exercises
      - Links to specific lessons and exercise IDs
      - Stores JSON data for flexible form structures
      - Includes timestamps for tracking progress

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own exercise data
    - Users can only read/write their own responses

  3. Features
    - Flexible JSON storage for any form structure
    - Exercise ID allows multiple exercises per lesson
    - Updated_at for tracking when users last worked on exercises
*/

-- Create lesson exercise responses table
CREATE TABLE IF NOT EXISTS lesson_exercise_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path_id text NOT NULL,
  lesson_id text NOT NULL,
  exercise_id text NOT NULL,
  response_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id, exercise_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercise_responses_user_lesson 
  ON lesson_exercise_responses(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_exercise_responses_path 
  ON lesson_exercise_responses(path_id);

-- Enable RLS
ALTER TABLE lesson_exercise_responses ENABLE ROW LEVEL SECURITY;

-- Policies for lesson_exercise_responses
CREATE POLICY "Users can view own exercise responses"
  ON lesson_exercise_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise responses"
  ON lesson_exercise_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise responses"
  ON lesson_exercise_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise responses"
  ON lesson_exercise_responses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_exercise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_lesson_exercise_responses_updated_at
  BEFORE UPDATE ON lesson_exercise_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_exercise_updated_at();