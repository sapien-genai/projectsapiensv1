/*
  # Create Lesson Journal Entries System

  1. New Tables
    - `lesson_journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `path_id` (text, references the learning path)
      - `lesson_id` (text, identifies the specific lesson)
      - `prompt_text` (text, the question/prompt from the lesson)
      - `user_response` (text, the user's journal entry)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `lesson_journal_entries` table
    - Add policy for users to read their own entries
    - Add policy for users to create their own entries
    - Add policy for users to update their own entries
    - Add policy for users to delete their own entries
  
  3. Indexes
    - Add index on user_id for faster queries
    - Add index on path_id and lesson_id for filtering
    - Add index on created_at for sorting
  
  4. Constraints
    - Add unique constraint on (user_id, lesson_id, prompt_text) to prevent duplicate entries
    - This allows upsert operations to work correctly
*/

CREATE TABLE IF NOT EXISTS lesson_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id text NOT NULL,
  lesson_id text NOT NULL,
  prompt_text text NOT NULL,
  user_response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journal entries"
  ON lesson_journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON lesson_journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON lesson_journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON lesson_journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_journal_user_id 
  ON lesson_journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_path_lesson 
  ON lesson_journal_entries(path_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_journal_created_at 
  ON lesson_journal_entries(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lesson_journal_entries_user_lesson_prompt_key'
  ) THEN
    ALTER TABLE lesson_journal_entries 
    ADD CONSTRAINT lesson_journal_entries_user_lesson_prompt_key 
    UNIQUE (user_id, lesson_id, prompt_text);
  END IF;
END $$;