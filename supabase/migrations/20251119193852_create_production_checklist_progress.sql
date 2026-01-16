/*
  # Create Production Checklist Progress Table

  1. New Tables
    - `production_checklist_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `completed_items` (text array) - Array of completed item IDs
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `production_checklist_progress` table
    - Add policy for users to read their own progress
    - Add policy for users to insert their own progress
    - Add policy for users to update their own progress

  3. Indexes
    - Index on user_id for faster lookups
*/

-- Create production_checklist_progress table
CREATE TABLE IF NOT EXISTS production_checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_items text[] DEFAULT ARRAY[]::text[] NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT production_checklist_progress_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE production_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own production checklist progress"
  ON production_checklist_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own production checklist progress"
  ON production_checklist_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production checklist progress"
  ON production_checklist_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_production_checklist_progress_user_id
  ON production_checklist_progress(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_production_checklist_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER production_checklist_progress_updated_at
  BEFORE UPDATE ON production_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_production_checklist_progress_updated_at();
