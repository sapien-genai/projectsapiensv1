/*
  # Create User Profiles and Progress Tracking System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text, unique)
      - `email` (text)
      - `fluency_level` (integer, 1-4)
      - `xp` (integer, experience points)
      - `current_path_id` (uuid, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `learning_paths`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `focus` (text)
      - `labs` (text array)
      - `final_project` (text)
      - `icon` (text)
      - `created_at` (timestamptz)

    - `user_path_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `path_id` (uuid, references learning_paths)
      - `status` (text, enum: not_started, in_progress, completed)
      - `progress_percentage` (integer)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_skills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `skill_name` (text)
      - `progress_percentage` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `badge_name` (text)
      - `badge_description` (text)
      - `earned_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for authenticated users to update their own profiles
    - Learning paths are readable by all authenticated users
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  fluency_level integer DEFAULT 1 CHECK (fluency_level >= 1 AND fluency_level <= 4),
  xp integer DEFAULT 0,
  current_path_id uuid,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  focus text NOT NULL,
  labs text[] DEFAULT '{}',
  final_project text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learning paths are readable by authenticated users"
  ON learning_paths
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_path_progress table
CREATE TABLE IF NOT EXISTS user_path_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  path_id uuid REFERENCES learning_paths NOT NULL,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, path_id)
);

ALTER TABLE user_path_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own path progress"
  ON user_path_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own path progress"
  ON user_path_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own path progress"
  ON user_path_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  skill_name text NOT NULL,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skills"
  ON user_skills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default learning paths
INSERT INTO learning_paths (title, slug, description, focus, labs, final_project, icon) VALUES
  ('AI FOR SMALL BUSINESS', 'ai-small-business', 'Transform your business operations with AI automation', 'Automate operations, marketing, and decisions', ARRAY['Writing Lab', 'Strategy Lab'], 'Build a Mini AI Ops Stack', 'briefcase'),
  ('AI FOR PRODUCTIVITY', 'ai-productivity', 'Master your workflow with AI-powered tools', 'Master your workflow with AI-powered tools', ARRAY['Writing Lab', 'Analysis Lab'], 'Design Your Perfect AI Assistant', 'zap'),
  ('AI FOR CREATORS', 'ai-creators', 'Create content, art, and experiences with AI', 'Create content, art, and experiences with AI', ARRAY['Creative Lab', 'Writing Lab'], 'Launch Your AI-Powered Creative Project', 'palette'),
  ('AI FOR EVERYDAY LIFE', 'ai-everyday', 'Use AI for personal growth and daily decisions', 'Use AI for personal growth and daily decisions', ARRAY['Writing Lab', 'Strategy Lab'], 'Build Your Personal AI Dashboard', 'home'),
  ('BUILD WITH AI', 'build-with-ai', 'Learn to build AI-powered applications', 'Develop technical AI integration skills', ARRAY['Code Lab', 'Strategy Lab'], 'Deploy Your First AI Application', 'code')
ON CONFLICT (slug) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_path_progress_updated_at BEFORE UPDATE ON user_path_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
