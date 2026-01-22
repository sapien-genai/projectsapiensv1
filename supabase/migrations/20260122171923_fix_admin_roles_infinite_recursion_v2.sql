/*
  # Fix Admin Roles Infinite Recursion - Version 2
  
  ## Problem
  The RLS policy "Admins can view all admin roles" creates infinite recursion by querying
  the admin_roles table within its own USING clause.
  
  ## Solution
  1. Drop the problematic policies
  2. Recreate with simple, non-recursive logic
  3. Update is_admin and has_admin_role functions to properly use SECURITY DEFINER
     with search_path set to avoid RLS recursion
  
  ## Changes
  - Remove recursive policy checks
  - Add simple policy: users can always view their own admin_roles row
  - Update admin functions with proper search_path setting
*/

-- Drop all existing policies on admin_roles
DROP POLICY IF EXISTS "Users can view own admin role" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view all admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON admin_roles;

-- Create simple, non-recursive policy: users can view their own admin role
CREATE POLICY "Users can view own admin role"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for inserting admin roles (managed via admin panel only)
CREATE POLICY "Service role can insert admin roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Direct inserts prevented, use service role

-- Create policy for updating admin roles  
CREATE POLICY "Service role can update admin roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false); -- Direct updates prevented, use service role

-- Create policy for deleting admin roles
CREATE POLICY "Service role can delete admin roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (false); -- Direct deletes prevented, use service role

-- Update the is_admin function to properly bypass RLS
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query without RLS since this function is SECURITY DEFINER with search_path set
  SELECT role INTO user_role
  FROM admin_roles
  WHERE user_id = user_uuid
  LIMIT 1;
  
  RETURN user_role IS NOT NULL AND user_role IN ('super_admin', 'admin', 'support', 'analyst');
END;
$$;

-- Update the has_admin_role function
CREATE OR REPLACE FUNCTION has_admin_role(user_uuid uuid, required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query without RLS since this function is SECURITY DEFINER with search_path set
  SELECT role INTO user_role
  FROM admin_roles
  WHERE user_id = user_uuid
  LIMIT 1;
  
  RETURN user_role = required_role;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_admin_role(uuid, text) TO authenticated;