/*
  # Fix Admin Roles Self-Check Policy

  ## Problem
  The existing RLS policy prevents users from checking their own admin status
  because it requires them to already be an admin to query the admin_roles table.
  This creates a chicken-and-egg problem.

  ## Solution
  Add a policy that allows authenticated users to check their own admin status
  while maintaining security by only showing their own row.

  ## Changes
  1. Add policy for users to view their own admin role
  2. Keep existing policy for admins to view all roles
*/

-- Drop the restrictive policy that prevents self-checks
DROP POLICY IF EXISTS "Admins can view all admin roles" ON admin_roles;

-- Allow users to check their own admin status
CREATE POLICY "Users can view own admin role"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Allow admins to view all admin roles
CREATE POLICY "Admins can view all admin roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = (SELECT auth.uid())
      AND ar.role IN ('super_admin', 'admin', 'support', 'analyst')
    )
  );
