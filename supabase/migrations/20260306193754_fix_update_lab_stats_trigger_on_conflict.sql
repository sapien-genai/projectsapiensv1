/*
  # Fix update_lab_stats trigger ON CONFLICT mismatch

  ## Problem
  The `update_lab_stats()` trigger function inserts into `lab_stats` using:
    ON CONFLICT (user_id)
  But `lab_stats` has no unique constraint on just `user_id` alone.
  The actual unique constraint is: UNIQUE (user_id, lab_id)

  This caused every INSERT into `lab_experiments` to fail with:
    42P10 - there is no unique or exclusion constraint matching the ON CONFLICT specification

  ## Fix
  Rewrite the trigger to include `lab_id` in the INSERT and use
  ON CONFLICT (user_id, lab_id) to match the real unique constraint.
  Also include `last_activity` in the upsert to keep it current.
*/

CREATE OR REPLACE FUNCTION public.update_lab_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO lab_stats (user_id, lab_id, total_experiments, last_activity)
    VALUES (NEW.user_id, NEW.lab_id, 1, now())
    ON CONFLICT (user_id, lab_id)
    DO UPDATE SET
      total_experiments = lab_stats.total_experiments + 1,
      last_activity = now(),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;
