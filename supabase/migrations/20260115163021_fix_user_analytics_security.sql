/*
  # Fix User Analytics Security Policy

  1. Security Changes
    - Drop the insecure "System can insert analytics" policy that allows any authenticated user to insert analytics with `WITH CHECK (true)`
    - Create a secure policy that only allows users to insert their own analytics data
    - Ensures user_id in the inserted record matches the authenticated user's ID

  2. Important Notes
    - This prevents users from inserting fake analytics data for other users
    - Maintains the admin view policy unchanged
    - Only affects the INSERT policy for user_analytics table
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "System can insert analytics" ON user_analytics;

-- Create a secure policy that validates user_id matches auth.uid()
CREATE POLICY "Users can insert own analytics"
  ON user_analytics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());