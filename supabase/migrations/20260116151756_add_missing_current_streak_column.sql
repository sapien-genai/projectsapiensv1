/*
  # Add Missing current_streak Column to user_profiles

  1. Changes
    - Adds current_streak column to user_profiles table
    - Adds last_activity_date column to track streak calculations
    - Creates index for efficient streak queries
    - Sets default values
  
  2. Security
    - No RLS changes needed (already protected by existing policies)
*/

-- Add current_streak column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_streak integer DEFAULT 0;
  END IF;
END $$;

-- Add last_activity_date column for tracking streaks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_activity_date date;
  END IF;
END $$;

-- Create index for streak queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_streak 
ON user_profiles(current_streak) 
WHERE current_streak > 0;