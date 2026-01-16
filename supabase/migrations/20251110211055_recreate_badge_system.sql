/*
  # Recreate Badge System with Proper Structure

  1. Drop existing user_badges table (has wrong structure)
  2. Create new badges master table
  3. Create new user_badges table with proper foreign key to badges
  4. Set up proper RLS policies
*/

-- Drop existing user_badges table
DROP TABLE IF EXISTS user_badges CASCADE;

-- Create badges master table
CREATE TABLE IF NOT EXISTS badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  points integer NOT NULL DEFAULT 10,
  criteria jsonb NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table with proper structure
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress jsonb DEFAULT '{}',
  notified boolean DEFAULT false,
  featured boolean DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX idx_badges_category ON badges(category, sort_order);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can read badges
CREATE POLICY "Anyone can read badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read user badges
CREATE POLICY "Anyone can read user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own badge settings
CREATE POLICY "Users update own badge settings"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);