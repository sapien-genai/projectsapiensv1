/*
  # Create Lab Experiments and Activity Tracking

  1. New Tables
    - `lab_experiments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lab_id` (text)
      - `prompt` (text)
      - `output` (text)
      - `rating` (integer, nullable, 1-5)
      - `is_public` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lab_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lab_id` (text)
      - `total_experiments` (integer, default 0)
      - `last_activity` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read and write their own experiments
    - Users can read public experiments from others
    - Users can only modify their own stats

  3. Important Notes
    - Experiments are private by default
    - Users can choose to share experiments with community
    - Stats auto-update via triggers
*/

-- Create lab_experiments table
CREATE TABLE IF NOT EXISTS lab_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  lab_id text NOT NULL,
  prompt text NOT NULL,
  output text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own experiments"
  ON lab_experiments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public experiments"
  ON lab_experiments
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own experiments"
  ON lab_experiments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
  ON lab_experiments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments"
  ON lab_experiments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create lab_stats table
CREATE TABLE IF NOT EXISTS lab_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  lab_id text NOT NULL,
  total_experiments integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lab_id)
);

ALTER TABLE lab_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lab stats"
  ON lab_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab stats"
  ON lab_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab stats"
  ON lab_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update lab stats when experiment is created
CREATE OR REPLACE FUNCTION update_lab_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lab_stats (user_id, lab_id, total_experiments, last_activity)
  VALUES (NEW.user_id, NEW.lab_id, 1, now())
  ON CONFLICT (user_id, lab_id)
  DO UPDATE SET
    total_experiments = lab_stats.total_experiments + 1,
    last_activity = now(),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lab stats
CREATE TRIGGER trigger_update_lab_stats
AFTER INSERT ON lab_experiments
FOR EACH ROW
EXECUTE FUNCTION update_lab_stats();

-- Create trigger for updated_at
CREATE TRIGGER update_lab_experiments_updated_at
BEFORE UPDATE ON lab_experiments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_stats_updated_at
BEFORE UPDATE ON lab_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_experiments_user_lab ON lab_experiments(user_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_experiments_public ON lab_experiments(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_lab_stats_user ON lab_stats(user_id);
