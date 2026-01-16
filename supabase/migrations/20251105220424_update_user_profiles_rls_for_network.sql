/*
  # Update User Profiles RLS for Network Visibility

  ## Changes
  1. Update RLS policies on `user_profiles` table
    - Allow authenticated users to view all profiles (needed for network features)
    - Keep write access restricted to own profile only
  
  ## Security
  - Read access: All authenticated users can view all profiles
  - Write access: Users can only modify their own profiles
  - This enables community features while maintaining data security
*/

-- Drop the old restrictive read policy
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Create new policy that allows all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);
