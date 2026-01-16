/*
  # Update User Path Progress Schema

  1. Changes
    - Add completed_lessons column to store array of completed lesson IDs
    - Add current_module column to track which module user is on
    - Update existing columns for better tracking

  2. Notes
    - This migration safely adds new columns to existing table
    - Uses IF NOT EXISTS pattern to prevent errors
*/

-- Add completed_lessons column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_path_progress' AND column_name = 'completed_lessons'
  ) THEN
    ALTER TABLE user_path_progress ADD COLUMN completed_lessons text[] DEFAULT '{}';
  END IF;
END $$;

-- Add current_module column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_path_progress' AND column_name = 'current_module'
  ) THEN
    ALTER TABLE user_path_progress ADD COLUMN current_module text;
  END IF;
END $$;
