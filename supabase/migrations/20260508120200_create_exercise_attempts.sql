/*
  # Create exercise_attempts table

  Persists each exercise submission for cross-session restore and analytics.
  Each submission is a new row; prior attempts are never overwritten.
  Client insert is permitted so the component can write after step 2 completes
  without routing through an edge function.
*/

CREATE TABLE exercise_attempts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     text        NOT NULL,
  lesson_id       text        NOT NULL,
  user_prompt     text        NOT NULL,
  ai_response     text        NOT NULL,
  feedback_json   jsonb       NOT NULL,
  score           integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own attempts"
  ON exercise_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own attempts"
  ON exercise_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read all attempts"
  ON exercise_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );

CREATE INDEX idx_exercise_attempts_user_exercise_created
  ON exercise_attempts(user_id, exercise_id, created_at DESC);

CREATE INDEX idx_exercise_attempts_lesson_created
  ON exercise_attempts(lesson_id, created_at DESC);
