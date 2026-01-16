/*
  # Fix SECURITY DEFINER Functions Search Path

  1. Security Issue
    - SECURITY DEFINER functions without explicit search_path are vulnerable to search_path attacks
    - Attacker could create malicious objects in schemas that appear earlier in search_path

  2. Changes
    - Add `SET search_path = public` to all SECURITY DEFINER functions
    - Ensures functions only reference objects from the public schema

  3. Functions Updated
    - is_admin(uuid)
    - has_admin_role(uuid, text)
    - check_network_unlock(uuid)

  4. Security Impact
    - Prevents search_path injection attacks
    - Maintains least-privilege security model
*/

-- Update is_admin function to set search_path
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = user_uuid
      AND is_active = true
  );
END;
$$;

-- Update has_admin_role function to set search_path
CREATE OR REPLACE FUNCTION has_admin_role(user_uuid uuid, required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = user_uuid
      AND role = required_role
      AND is_active = true
  );
END;
$$;

-- Update check_network_unlock function to set search_path (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_network_unlock'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION check_network_unlock(p_user_id uuid)
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $func$
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
          AND status = ''completed'';

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
          v_unlock_reason := ''Completed at least one learning path'';
        ELSIF v_labs_completed >= 5 THEN
          v_should_unlock := true;
          v_unlock_reason := ''Completed 5+ lab experiments'';
        ELSIF v_approved_projects >= 1 THEN
          v_should_unlock := true;
          v_unlock_reason := ''Shared at least one public project'';
        END IF;

        IF v_should_unlock THEN
          INSERT INTO user_network_access (
            user_id, unlocked, unlock_reason, unlocked_at,
            paths_completed, labs_completed, approved_projects
          )
          VALUES (
            p_user_id, true, v_unlock_reason, now(),
            v_paths_completed, v_labs_completed, v_approved_projects
          )
          ON CONFLICT (user_id) DO UPDATE
          SET
            unlocked = true,
            unlock_reason = EXCLUDED.unlock_reason,
            unlocked_at = EXCLUDED.unlocked_at,
            paths_completed = EXCLUDED.paths_completed,
            labs_completed = EXCLUDED.labs_completed,
            approved_projects = EXCLUDED.approved_projects,
            updated_at = now();
        END IF;

        RETURN v_should_unlock;
      END;
      $func$;
    ';
  END IF;
END $$;
