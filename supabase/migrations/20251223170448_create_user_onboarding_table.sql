/*
  # Create User Onboarding Progress Table

  1. New Tables
    - `user_onboarding`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `completed` (boolean, default false)
      - `current_step` (integer, default 0)
      - `steps_completed` (text array, tracks which steps were finished)
      - `skipped` (boolean, default false)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_onboarding` table
    - Add policy for users to read their own onboarding state
    - Add policy for users to update their own onboarding state
    - Add policy for users to insert their own onboarding state
  
  3. Indexes
    - Add index on user_id for faster lookups
    - Add unique constraint on user_id to ensure one record per user
*/

CREATE TABLE IF NOT EXISTS user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  current_step integer DEFAULT 0,
  steps_completed text[] DEFAULT '{}',
  skipped boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id)
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding state"
  ON user_onboarding
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding state"
  ON user_onboarding
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding state"
  ON user_onboarding
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id 
  ON user_onboarding(user_id);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed 
  ON user_onboarding(completed) WHERE NOT completed;