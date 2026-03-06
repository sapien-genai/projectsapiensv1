/*
  # Create lesson_exercise_data table

  1. New Tables
    - `lesson_exercise_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `path_id` (text) - the learning path the exercise belongs to
      - `lesson_id` (text) - the specific lesson
      - `exercise_key` (text) - unique identifier for the exercise within the lesson
      - `exercise_data` (jsonb) - flexible JSON storage for exercise state (e.g. prompt draft)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Constraints
    - Unique constraint on (user_id, lesson_id, exercise_key) to support upsert

  3. Security
    - RLS enabled
    - Users can only read and write their own exercise data
*/

CREATE TABLE IF NOT EXISTS lesson_exercise_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id text NOT NULL DEFAULT '',
  lesson_id text NOT NULL,
  exercise_key text NOT NULL,
  exercise_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lesson_id, exercise_key)
);

ALTER TABLE lesson_exercise_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exercise data"
  ON lesson_exercise_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise data"
  ON lesson_exercise_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise data"
  ON lesson_exercise_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise data"
  ON lesson_exercise_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_exercise_data_user_id ON lesson_exercise_data (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_exercise_data_lesson_id ON lesson_exercise_data (lesson_id);
