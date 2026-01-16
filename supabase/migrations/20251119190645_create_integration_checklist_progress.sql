/*
  # Create Integration Checklist Progress Tracking

  1. New Tables
    - `integration_checklist_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `item_id` (text) - unique identifier for each checklist item
      - `completed` (boolean) - whether the item is checked
      - `completed_at` (timestamptz) - when the item was completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `integration_checklist_progress` table
    - Add policies for authenticated users to manage their own checklist progress

  3. Indexes
    - Add index on (user_id, item_id) for fast lookups
*/

CREATE TABLE IF NOT EXISTS integration_checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE integration_checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist progress"
  ON integration_checklist_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON integration_checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON integration_checklist_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON integration_checklist_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_integration_checklist_user_item 
  ON integration_checklist_progress(user_id, item_id);

CREATE OR REPLACE FUNCTION update_integration_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_integration_checklist_updated_at ON integration_checklist_progress;

CREATE TRIGGER trigger_update_integration_checklist_updated_at
  BEFORE UPDATE ON integration_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_checklist_updated_at();