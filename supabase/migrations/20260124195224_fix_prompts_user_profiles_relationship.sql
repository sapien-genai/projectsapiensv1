/*
  # Fix Prompts to User Profiles Relationship

  ## Problem
  The prompts table references auth.users directly, but queries need to join with user_profiles.
  This causes PGRST200 errors when trying to fetch prompts with user profile information.

  ## Changes
  1. Drop the existing foreign key from prompts.user_id to auth.users
  2. Create a new foreign key from prompts.user_id to user_profiles.user_id
  3. This allows direct joins between prompts and user_profiles

  ## Note
  This assumes all users who create prompts have profiles in user_profiles table.
  The user_profiles.user_id already references auth.users, so the relationship is maintained.
*/

-- Drop existing foreign key constraint from prompts to auth.users
ALTER TABLE prompts 
  DROP CONSTRAINT IF EXISTS prompts_user_id_fkey;

-- Add new foreign key constraint from prompts to user_profiles
ALTER TABLE prompts
  ADD CONSTRAINT prompts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES user_profiles(user_id) 
  ON DELETE CASCADE;
