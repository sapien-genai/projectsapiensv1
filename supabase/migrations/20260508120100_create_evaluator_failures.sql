/*
  # Create evaluator_failures table

  Stores raw Gemini output when JSON parsing fails in lab-exercise-feedback,
  for debugging only. Never read by the client; admin read via service role.
*/

CREATE TABLE evaluator_failures (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id    text        NOT NULL,
  raw_output     text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evaluator_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read failures"
  ON evaluator_failures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "service role manages failures"
  ON evaluator_failures
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_evaluator_failures_created_at
  ON evaluator_failures(created_at DESC);
