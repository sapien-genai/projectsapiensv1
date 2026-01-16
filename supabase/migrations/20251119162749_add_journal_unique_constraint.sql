/*
  # Add unique constraint to lesson journal entries

  1. Changes
    - Add unique constraint on (user_id, lesson_id, prompt_text) to prevent duplicate entries
    - This allows upsert operations to work correctly
*/

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