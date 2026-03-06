/*
  # Create lab_runs table for AI request history

  1. New Table
    - `lab_runs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lab_id` (text)
      - `mode` (text, nullable)
      - `input_text` (text)
      - `output_text` (text, nullable)
      - `status` (text: pending/success/error)
      - `provider` (text)
      - `model` (text)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS
    - Users can read their own rows
    - Service role can manage all rows
*/

CREATE TABLE IF NOT EXISTS lab_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id text NOT NULL,
  mode text,
  input_text text NOT NULL,
  output_text text,
  status text NOT NULL CHECK (status IN ('pending', 'success', 'error')),
  provider text NOT NULL,
  model text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE lab_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab runs"
  ON lab_runs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage lab runs"
  ON lab_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lab_runs_user_created_at ON lab_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_runs_status_created_at ON lab_runs(status, created_at DESC);
