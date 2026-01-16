/*
  # Fix Badge Function Table Names

  1. Changes
    - Updates check_and_award_badges function to use correct table name
    - Changes user_connections to network_connections
    - Adds user_prompt_library check (references prompts table instead)
  
  2. Notes
    - The connections table is actually named network_connections
    - Prompt library items are in the prompts table
*/

-- Drop and recreate the function with correct table names
DROP FUNCTION IF EXISTS check_and_award_badges(uuid);

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lessons_completed integer;
  v_paths_completed integer;
  v_lab_experiments integer;
  v_prompts_saved integer;
  v_connections integer;
  v_streak_days integer;
  v_newly_awarded jsonb := '[]'::jsonb;
  v_badge_record record;
  v_badge_id text;
BEGIN
  -- Get user stats
  SELECT 
    COALESCE(SUM(array_length(completed_lessons, 1)), 0)
  INTO v_lessons_completed
  FROM user_path_progress
  WHERE user_id = p_user_id;

  SELECT 
    COUNT(*)
  INTO v_paths_completed
  FROM user_path_progress
  WHERE user_id = p_user_id 
    AND progress_percentage = 100;

  SELECT COUNT(*) INTO v_lab_experiments
  FROM lab_experiments
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_prompts_saved
  FROM prompts
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_connections
  FROM network_connections
  WHERE (user_id = p_user_id OR connected_user_id = p_user_id)
    AND status = 'accepted';

  SELECT COALESCE(current_streak, 0) INTO v_streak_days
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Check and award badges based on criteria
  
  -- First Steps: Complete 1 lesson
  IF v_lessons_completed >= 1 THEN
    v_badge_id := 'first-steps';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Path Explorer: Complete 1 path
  IF v_paths_completed >= 1 THEN
    v_badge_id := 'path-explorer';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Multi-Path Master: Complete 3 paths
  IF v_paths_completed >= 3 THEN
    v_badge_id := 'multi-path-master';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- AI Fluent: Complete all 5 paths
  IF v_paths_completed >= 5 THEN
    v_badge_id := 'ai-fluent';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Week Warrior: 7 day streak
  IF v_streak_days >= 7 THEN
    v_badge_id := 'week-warrior';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Month Master: 30 day streak
  IF v_streak_days >= 30 THEN
    v_badge_id := 'month-master';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Daily Discipline: 100 day streak
  IF v_streak_days >= 100 THEN
    v_badge_id := 'daily-discipline';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Lab Rat: Complete 1 lab experiment
  IF v_lab_experiments >= 1 THEN
    v_badge_id := 'lab-rat';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Experimenter: Complete 10 lab experiments
  IF v_lab_experiments >= 10 THEN
    v_badge_id := 'experimenter';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Lab Legend: Complete 50 lab experiments
  IF v_lab_experiments >= 50 THEN
    v_badge_id := 'lab-legend';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Prompt Apprentice: Save 10 prompts
  IF v_prompts_saved >= 10 THEN
    v_badge_id := 'prompt-apprentice';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Prompt Collector: Save 50 prompts
  IF v_prompts_saved >= 50 THEN
    v_badge_id := 'prompt-collector';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Networker: Connect with 5 users
  IF v_connections >= 5 THEN
    v_badge_id := 'networker';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  -- Connector: Connect with 25 users
  IF v_connections >= 25 THEN
    v_badge_id := 'connector';
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, now())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      IF FOUND THEN
        v_newly_awarded := v_newly_awarded || jsonb_build_object('badge_id', v_badge_id);
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'newly_awarded', v_newly_awarded,
    'stats', jsonb_build_object(
      'lessons_completed', v_lessons_completed,
      'paths_completed', v_paths_completed,
      'lab_experiments', v_lab_experiments,
      'prompts_saved', v_prompts_saved,
      'connections', v_connections,
      'streak_days', v_streak_days
    )
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_and_award_badges(uuid) TO authenticated;