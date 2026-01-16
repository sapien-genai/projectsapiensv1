/*
  # Update Project Shares Schema

  1. Changes
    - Add `github_url` column (text, optional)
    - Add `demo_url` column (text, optional)
    - Add `is_public` column (boolean, default false)
    - Update `project_type` check constraint to include 'personal'
    
  2. Notes
    - Existing project_type values will remain valid
    - New columns are nullable/have defaults to preserve existing data
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_shares' AND column_name = 'github_url'
  ) THEN
    ALTER TABLE project_shares ADD COLUMN github_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_shares' AND column_name = 'demo_url'
  ) THEN
    ALTER TABLE project_shares ADD COLUMN demo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_shares' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE project_shares ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Drop the old constraint if it exists
ALTER TABLE project_shares DROP CONSTRAINT IF EXISTS project_shares_project_type_check;

-- Add the updated constraint including 'personal'
ALTER TABLE project_shares ADD CONSTRAINT project_shares_project_type_check 
  CHECK (project_type IN ('personal', 'lab_experiment', 'capstone', 'showcase'));
