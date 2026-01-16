/*
  # Launch Commitments

  This migration adds the launch_commitments table to store student commitment statements.

  ## 1. New Table
    
    ### `launch_commitments`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `student_name` (text) - Student's name
    - `start_date` (date) - Commitment start date
    - `why` (text) - Why they're doing this
    - `metric_1` (text) - First success metric
    - `metric_2` (text) - Second success metric
    - `metric_3` (text) - Third success metric
    - `metric_4` (text) - Fourth success metric
    - `accountability_person` (text) - Who they're sharing with
    - `checkin_schedule` (text) - When they'll check in
    - `backup_action` (text) - What they'll do if something breaks
    - `backup_help` (text) - Who they'll ask for help
    - `reward` (text) - How they'll celebrate completion
    - `signature` (text) - Their signature
    - `signed_date` (date) - Date they signed
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on launch_commitments table
    - Users can only view and manage their own commitments
    - One commitment per user (enforced with unique constraint)

  ## 3. Badge Award
    - Completing the commitment form awards the "Command Center Master" badge
*/

-- Launch Commitments
CREATE TABLE IF NOT EXISTS launch_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  student_name text NOT NULL,
  start_date date NOT NULL,
  why text NOT NULL,
  metric_1 text NOT NULL,
  metric_2 text NOT NULL,
  metric_3 text NOT NULL,
  metric_4 text NOT NULL,
  accountability_person text NOT NULL,
  checkin_schedule text NOT NULL,
  backup_action text NOT NULL,
  backup_help text NOT NULL,
  reward text NOT NULL,
  signature text NOT NULL,
  signed_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE launch_commitments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own commitment"
  ON launch_commitments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitment"
  ON launch_commitments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitment"
  ON launch_commitments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own commitment"
  ON launch_commitments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_launch_commitments_user ON launch_commitments(user_id);