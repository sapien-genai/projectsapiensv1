/*
  # Remove Unused Indexes and Fix Policy Issues

  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop all indexes that are currently unused
     - These can be recreated later if needed when actual usage patterns emerge
     - Reduces maintenance overhead and storage costs
  
  2. **Fix Multiple Permissive Policies**
     - Consolidate multiple SELECT policies on lab_experiments into a single policy
     - This maintains the same access control but is more efficient

  ## Notes
  - Indexes can be recreated later if query performance analysis shows they're needed
  - The consolidated policy provides the same access (own experiments OR public experiments)
*/

-- ============================================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_network_connections_user_id;
DROP INDEX IF EXISTS public.idx_network_connections_connected_user_id;
DROP INDEX IF EXISTS public.idx_user_badges_user_id_fk;
DROP INDEX IF EXISTS public.idx_project_shares_user_id;
DROP INDEX IF EXISTS public.idx_project_shares_path_id;
DROP INDEX IF EXISTS public.idx_project_likes_project_id;
DROP INDEX IF EXISTS public.idx_project_likes_user_id_fk;
DROP INDEX IF EXISTS public.idx_project_comments_project_id;
DROP INDEX IF EXISTS public.idx_project_comments_parent_comment_id;
DROP INDEX IF EXISTS public.idx_project_comments_user_id_fk;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentee_id;
DROP INDEX IF EXISTS public.idx_mentorship_requests_mentor_id;
DROP INDEX IF EXISTS public.idx_onboarding_responses_user_id;
DROP INDEX IF EXISTS public.idx_onboarding_responses_step;
DROP INDEX IF EXISTS public.idx_lab_experiments_public;
DROP INDEX IF EXISTS public.idx_lab_stats_user;
DROP INDEX IF EXISTS public.idx_prompts_category_id;
DROP INDEX IF EXISTS public.idx_prompts_is_public;
DROP INDEX IF EXISTS public.idx_prompts_is_featured;
DROP INDEX IF EXISTS public.idx_prompts_created_at;
DROP INDEX IF EXISTS public.idx_prompts_tags;
DROP INDEX IF EXISTS public.idx_prompt_likes_prompt_id;
DROP INDEX IF EXISTS public.idx_prompt_likes_user_id_fk;
DROP INDEX IF EXISTS public.idx_user_path_progress_path_id_fk;
DROP INDEX IF EXISTS public.idx_prompt_ratings_prompt_id;
DROP INDEX IF EXISTS public.idx_prompt_ratings_user_id_fk;
DROP INDEX IF EXISTS public.idx_prompt_collection_items_collection_id;
DROP INDEX IF EXISTS public.idx_prompt_collection_items_prompt_id_fk;
DROP INDEX IF EXISTS public.idx_prompt_usage_history_user_id;
DROP INDEX IF EXISTS public.idx_prompt_usage_history_prompt_id_fk;
DROP INDEX IF EXISTS public.idx_user_onboarding_status_completed;

-- ============================================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES ON LAB_EXPERIMENTS
-- ============================================================================

-- Drop the two separate SELECT policies
DROP POLICY IF EXISTS "Users can read own experiments" ON public.lab_experiments;
DROP POLICY IF EXISTS "Users can read public experiments" ON public.lab_experiments;

-- Create a single consolidated SELECT policy
CREATE POLICY "Users can read own or public experiments"
  ON public.lab_experiments FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR is_public = true
  );
