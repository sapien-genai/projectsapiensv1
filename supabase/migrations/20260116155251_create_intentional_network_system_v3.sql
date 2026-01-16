/*
  # Intentional Network System - Phase 1 (Revised)

  ## Overview
  Creates a calm, professional network focused on learning and capability-building.
  Network is locked by default and unlocks based on achievement milestones.

  ## Changes
  1. Feature flags system (new tables)
  2. Network unlock tracking (new table)
  3. Enhanced project_shares with required fields
  4. User capabilities & goals in profiles
  5. Mentorship connections tracking (new table)

  ## Security
  - All tables have RLS enabled
  - Users can only see unlocked network content
  - Mentorship requires mutual opt-in
*/

-- =====================================================
-- 1. FEATURE FLAGS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text NOT NULL UNIQUE,
  enabled_globally boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flag_name text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flag_name)
);

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, enabled_globally, description)
VALUES
  ('network_enabled', false, 'Global network feature access'),
  ('project_sharing_enabled', false, 'Ability to share projects in network'),
  ('mentorship_enabled', false, 'Mentorship discovery and requests')
ON CONFLICT (flag_name) DO NOTHING;

-- =====================================================
-- 2. NETWORK UNLOCK TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS user_network_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  unlocked boolean DEFAULT false,
  unlock_reason text,
  unlocked_at timestamptz,
  paths_completed integer DEFAULT 0,
  labs_completed integer DEFAULT 0,
  approved_projects integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Function to check and unlock network access
CREATE OR REPLACE FUNCTION check_network_unlock(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_paths_completed integer;
  v_labs_completed integer;
  v_approved_projects integer;
  v_should_unlock boolean;
  v_unlock_reason text;
BEGIN
  SELECT COUNT(DISTINCT path_id)
  INTO v_paths_completed
  FROM user_path_progress
  WHERE user_id = p_user_id
    AND status = 'completed';

  SELECT COUNT(*)
  INTO v_labs_completed
  FROM lab_experiments
  WHERE user_id = p_user_id;

  SELECT COUNT(*)
  INTO v_approved_projects
  FROM project_shares
  WHERE user_id = p_user_id
    AND is_public = true;

  v_should_unlock := false;

  IF v_paths_completed >= 1 THEN
    v_should_unlock := true;
    v_unlock_reason := 'Completed learning path';
  ELSIF v_labs_completed >= 3 THEN
    v_should_unlock := true;
    v_unlock_reason := 'Completed 3 labs';
  ELSIF v_approved_projects >= 1 THEN
    v_should_unlock := true;
    v_unlock_reason := 'Submitted approved project';
  END IF;

  INSERT INTO user_network_access (
    user_id,
    unlocked,
    unlock_reason,
    unlocked_at,
    paths_completed,
    labs_completed,
    approved_projects
  )
  VALUES (
    p_user_id,
    v_should_unlock,
    v_unlock_reason,
    CASE WHEN v_should_unlock THEN now() ELSE NULL END,
    v_paths_completed,
    v_labs_completed,
    v_approved_projects
  )
  ON CONFLICT (user_id) DO UPDATE SET
    unlocked = v_should_unlock,
    unlock_reason = CASE WHEN v_should_unlock THEN v_unlock_reason ELSE user_network_access.unlock_reason END,
    unlocked_at = CASE WHEN v_should_unlock AND NOT user_network_access.unlocked THEN now() ELSE user_network_access.unlocked_at END,
    paths_completed = v_paths_completed,
    labs_completed = v_labs_completed,
    approved_projects = v_approved_projects,
    updated_at = now();

  RETURN v_should_unlock;
END;
$$;

-- =====================================================
-- 3. ENHANCE PROJECT_SHARES TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'problem_statement') THEN
    ALTER TABLE project_shares ADD COLUMN problem_statement text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'ai_approach') THEN
    ALTER TABLE project_shares ADD COLUMN ai_approach text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'tools_models') THEN
    ALTER TABLE project_shares ADD COLUMN tools_models text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'outcome') THEN
    ALTER TABLE project_shares ADD COLUMN outcome text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'skill_level') THEN
    ALTER TABLE project_shares ADD COLUMN skill_level text DEFAULT 'beginner';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'open_to_feedback') THEN
    ALTER TABLE project_shares ADD COLUMN open_to_feedback boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'looking_for_collaborators') THEN
    ALTER TABLE project_shares ADD COLUMN looking_for_collaborators boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'domain') THEN
    ALTER TABLE project_shares ADD COLUMN domain text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_shares' AND column_name = 'status') THEN
    ALTER TABLE project_shares ADD COLUMN status text DEFAULT 'draft';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_shares_skill_level_check') THEN
    ALTER TABLE project_shares ADD CONSTRAINT project_shares_skill_level_check CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_shares_status_check') THEN
    ALTER TABLE project_shares ADD CONSTRAINT project_shares_status_check CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

-- =====================================================
-- 4. USER CAPABILITIES & GOALS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'declared_strengths') THEN
    ALTER TABLE user_profiles ADD COLUMN declared_strengths text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'learning_goals') THEN
    ALTER TABLE user_profiles ADD COLUMN learning_goals text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'open_to_mentoring') THEN
    ALTER TABLE user_profiles ADD COLUMN open_to_mentoring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'open_to_being_mentored') THEN
    ALTER TABLE user_profiles ADD COLUMN open_to_being_mentored boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'bio') THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;
END $$;

-- =====================================================
-- 5. MENTORSHIP CONNECTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS mentorship_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true,
  UNIQUE(mentee_id, mentor_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mentorship_connections_different_users_check') THEN
    ALTER TABLE mentorship_connections ADD CONSTRAINT mentorship_connections_different_users_check CHECK (mentee_id != mentor_id);
  END IF;
END $$;

-- Add completed flag to lab_experiments if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_experiments' AND column_name = 'completed') THEN
    ALTER TABLE lab_experiments ADD COLUMN completed boolean DEFAULT true;
  END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_network_access_user_id ON user_network_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_network_access_unlocked ON user_network_access(unlocked) WHERE unlocked = true;

CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user_id ON user_feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_flags_flag_name ON user_feature_flags(flag_name);

CREATE INDEX IF NOT EXISTS idx_project_shares_skill_level ON project_shares(skill_level);
CREATE INDEX IF NOT EXISTS idx_project_shares_domain ON project_shares(domain);
CREATE INDEX IF NOT EXISTS idx_project_shares_status ON project_shares(status);
CREATE INDEX IF NOT EXISTS idx_project_shares_open_to_feedback ON project_shares(open_to_feedback) WHERE open_to_feedback = true;
CREATE INDEX IF NOT EXISTS idx_project_shares_looking_for_collaborators ON project_shares(looking_for_collaborators) WHERE looking_for_collaborators = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_open_to_mentoring ON user_profiles(open_to_mentoring) WHERE open_to_mentoring = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_open_to_being_mentored ON user_profiles(open_to_being_mentored) WHERE open_to_being_mentored = true;

CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentee ON mentorship_connections(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentor ON mentorship_connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_active ON mentorship_connections(active) WHERE active = true;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_network_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Users can read own feature flags"
  ON user_feature_flags FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user feature flags"
  ON user_feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Users can read own network access"
  ON user_network_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert network access"
  ON user_network_access FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update network access"
  ON user_network_access FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read their connections"
  ON mentorship_connections FOR SELECT
  TO authenticated
  USING (mentee_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "System can create connections from accepted requests"
  ON mentorship_connections FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Users can update their connections"
  ON mentorship_connections FOR UPDATE
  TO authenticated
  USING (mentee_id = auth.uid() OR mentor_id = auth.uid());
