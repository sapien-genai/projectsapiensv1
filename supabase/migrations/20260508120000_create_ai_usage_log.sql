/*
  # Create ai_usage_log table

  Tracks per-call token usage for AI features. Written exclusively by
  edge functions via the service-role client; no client insert path.

  feature_id values: 'exercise_response' | 'exercise_evaluation' | 'lab_chat'
  exercise_id is null for non-exercise calls.
*/

CREATE TABLE ai_usage_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id    text        NOT NULL,
  exercise_id   text,
  model         text        NOT NULL,
  input_tokens  integer     NOT NULL,
  output_tokens integer     NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own usage"
  ON ai_usage_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all usage"
  ON ai_usage_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "service role manages usage"
  ON ai_usage_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_ai_usage_log_user_created_at
  ON ai_usage_log(user_id, created_at DESC);

CREATE INDEX idx_ai_usage_log_feature_created_at
  ON ai_usage_log(feature_id, created_at DESC);
