/*
  # Fix Project Shares RLS Privacy Leak

  1. Security Issue
    - Current SELECT policy allows all authenticated users to see ALL project_shares with `USING (true)`
    - This leaks private projects that should only be visible to their owners

  2. Fix
    - Replace the overly permissive SELECT policy
    - New policy only allows viewing:
      - Public projects (is_public = true)
      - OR projects owned by the current user (user_id = auth.uid())

  3. Impact
    - Users can only see their own projects or explicitly public ones
    - Maintains proper privacy boundaries
*/

-- Drop the insecure policy that allows viewing all projects
DROP POLICY IF EXISTS "Anyone can view public projects" ON project_shares;

-- Create a properly restricted policy
CREATE POLICY "Users can view public projects or own projects"
  ON project_shares FOR SELECT
  TO authenticated
  USING (
    is_public = true OR user_id = auth.uid()
  );
