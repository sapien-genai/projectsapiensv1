/*
  # Fix Performance and Security Issues

  ## Changes Made
  
  1. **Add Missing Indexes on Foreign Keys**
     - Add indexes on all foreign key columns that were missing covering indexes
     - This improves JOIN performance and foreign key constraint checks
  
  2. **Optimize RLS Policies**
     - Replace all `auth.uid()` calls with `(select auth.uid())` 
     - This prevents re-evaluation of auth functions for each row
     - Significantly improves query performance at scale
  
  3. **Fix Function Search Paths**
     - Set immutable search paths for functions to prevent security issues
  
  4. **Remove Unused Indexes**
     - The unused index warnings are informational and will be used as data grows
     - No action needed for these at this stage

  ## Security Improvements
  - All RLS policies now use optimized auth function calls
  - Functions have secure, immutable search paths
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- project_comments indexes
CREATE INDEX IF NOT EXISTS idx_project_comments_parent_comment_id 
  ON public.project_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_project_comments_user_id_fk 
  ON public.project_comments(user_id);

-- project_likes indexes
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id_fk 
  ON public.project_likes(user_id);

-- prompt_collection_items indexes
CREATE INDEX IF NOT EXISTS idx_prompt_collection_items_prompt_id_fk 
  ON public.prompt_collection_items(prompt_id);

-- prompt_likes indexes
CREATE INDEX IF NOT EXISTS idx_prompt_likes_user_id_fk 
  ON public.prompt_likes(user_id);

-- prompt_ratings indexes
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_user_id_fk 
  ON public.prompt_ratings(user_id);

-- prompt_usage_history indexes
CREATE INDEX IF NOT EXISTS idx_prompt_usage_history_prompt_id_fk 
  ON public.prompt_usage_history(prompt_id);

-- user_badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id_fk 
  ON public.user_badges(user_id);

-- user_path_progress indexes
CREATE INDEX IF NOT EXISTS idx_user_path_progress_path_id_fk 
  ON public.user_path_progress(path_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- USER_PROFILES policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- USER_PATH_PROGRESS policies
DROP POLICY IF EXISTS "Users can read own path progress" ON public.user_path_progress;
CREATE POLICY "Users can read own path progress"
  ON public.user_path_progress FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own path progress" ON public.user_path_progress;
CREATE POLICY "Users can insert own path progress"
  ON public.user_path_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own path progress" ON public.user_path_progress;
CREATE POLICY "Users can update own path progress"
  ON public.user_path_progress FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- USER_SKILLS policies
DROP POLICY IF EXISTS "Users can read own skills" ON public.user_skills;
CREATE POLICY "Users can read own skills"
  ON public.user_skills FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own skills" ON public.user_skills;
CREATE POLICY "Users can insert own skills"
  ON public.user_skills FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;
CREATE POLICY "Users can update own skills"
  ON public.user_skills FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- USER_BADGES policies
DROP POLICY IF EXISTS "Users can read own badges" ON public.user_badges;
CREATE POLICY "Users can read own badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;
CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- LAB_EXPERIMENTS policies
DROP POLICY IF EXISTS "Users can read own experiments" ON public.lab_experiments;
CREATE POLICY "Users can read own experiments"
  ON public.lab_experiments FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own experiments" ON public.lab_experiments;
CREATE POLICY "Users can insert own experiments"
  ON public.lab_experiments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own experiments" ON public.lab_experiments;
CREATE POLICY "Users can update own experiments"
  ON public.lab_experiments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own experiments" ON public.lab_experiments;
CREATE POLICY "Users can delete own experiments"
  ON public.lab_experiments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- LAB_STATS policies
DROP POLICY IF EXISTS "Users can read own lab stats" ON public.lab_stats;
CREATE POLICY "Users can read own lab stats"
  ON public.lab_stats FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own lab stats" ON public.lab_stats;
CREATE POLICY "Users can insert own lab stats"
  ON public.lab_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own lab stats" ON public.lab_stats;
CREATE POLICY "Users can update own lab stats"
  ON public.lab_stats FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- NETWORK_CONNECTIONS policies
DROP POLICY IF EXISTS "Users can view their own connections" ON public.network_connections;
CREATE POLICY "Users can view their own connections"
  ON public.network_connections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR connected_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create connection requests" ON public.network_connections;
CREATE POLICY "Users can create connection requests"
  ON public.network_connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update connections they're part of" ON public.network_connections;
CREATE POLICY "Users can update connections they're part of"
  ON public.network_connections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) OR connected_user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()) OR connected_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own connection requests" ON public.network_connections;
CREATE POLICY "Users can delete their own connection requests"
  ON public.network_connections FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROJECT_SHARES policies
DROP POLICY IF EXISTS "Users can create their own projects" ON public.project_shares;
CREATE POLICY "Users can create their own projects"
  ON public.project_shares FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own projects" ON public.project_shares;
CREATE POLICY "Users can update their own projects"
  ON public.project_shares FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.project_shares;
CREATE POLICY "Users can delete their own projects"
  ON public.project_shares FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROJECT_LIKES policies
DROP POLICY IF EXISTS "Users can like projects" ON public.project_likes;
CREATE POLICY "Users can like projects"
  ON public.project_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unlike projects" ON public.project_likes;
CREATE POLICY "Users can unlike projects"
  ON public.project_likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROJECT_COMMENTS policies
DROP POLICY IF EXISTS "Users can create comments" ON public.project_comments;
CREATE POLICY "Users can create comments"
  ON public.project_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own comments" ON public.project_comments;
CREATE POLICY "Users can update their own comments"
  ON public.project_comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.project_comments;
CREATE POLICY "Users can delete their own comments"
  ON public.project_comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- MENTORSHIP_REQUESTS policies
DROP POLICY IF EXISTS "Users can view their mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Users can view their mentorship requests"
  ON public.mentorship_requests FOR SELECT
  TO authenticated
  USING (mentee_id = (select auth.uid()) OR mentor_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Users can create mentorship requests"
  ON public.mentorship_requests FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Users can update their mentorship requests"
  ON public.mentorship_requests FOR UPDATE
  TO authenticated
  USING (mentee_id = (select auth.uid()) OR mentor_id = (select auth.uid()))
  WITH CHECK (mentee_id = (select auth.uid()) OR mentor_id = (select auth.uid()));

-- PROMPTS policies
DROP POLICY IF EXISTS "Users can view public prompts" ON public.prompts;
CREATE POLICY "Users can view public prompts"
  ON public.prompts FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create prompts" ON public.prompts;
CREATE POLICY "Users can create prompts"
  ON public.prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
CREATE POLICY "Users can update their own prompts"
  ON public.prompts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
CREATE POLICY "Users can delete their own prompts"
  ON public.prompts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROMPT_LIKES policies
DROP POLICY IF EXISTS "Users can like prompts" ON public.prompt_likes;
CREATE POLICY "Users can like prompts"
  ON public.prompt_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unlike prompts" ON public.prompt_likes;
CREATE POLICY "Users can unlike prompts"
  ON public.prompt_likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROMPT_RATINGS policies
DROP POLICY IF EXISTS "Users can rate prompts" ON public.prompt_ratings;
CREATE POLICY "Users can rate prompts"
  ON public.prompt_ratings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.prompt_ratings;
CREATE POLICY "Users can update their own ratings"
  ON public.prompt_ratings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.prompt_ratings;
CREATE POLICY "Users can delete their own ratings"
  ON public.prompt_ratings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROMPT_COLLECTIONS policies
DROP POLICY IF EXISTS "Users can view their own and public collections" ON public.prompt_collections;
CREATE POLICY "Users can view their own and public collections"
  ON public.prompt_collections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_public = true);

DROP POLICY IF EXISTS "Users can create collections" ON public.prompt_collections;
CREATE POLICY "Users can create collections"
  ON public.prompt_collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own collections" ON public.prompt_collections;
CREATE POLICY "Users can update their own collections"
  ON public.prompt_collections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.prompt_collections;
CREATE POLICY "Users can delete their own collections"
  ON public.prompt_collections FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- PROMPT_COLLECTION_ITEMS policies
DROP POLICY IF EXISTS "Users can view items in their collections" ON public.prompt_collection_items;
CREATE POLICY "Users can view items in their collections"
  ON public.prompt_collection_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prompt_collections
      WHERE prompt_collections.id = prompt_collection_items.collection_id
      AND prompt_collections.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can add items to their collections" ON public.prompt_collection_items;
CREATE POLICY "Users can add items to their collections"
  ON public.prompt_collection_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompt_collections
      WHERE prompt_collections.id = prompt_collection_items.collection_id
      AND prompt_collections.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can remove items from their collections" ON public.prompt_collection_items;
CREATE POLICY "Users can remove items from their collections"
  ON public.prompt_collection_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prompt_collections
      WHERE prompt_collections.id = prompt_collection_items.collection_id
      AND prompt_collections.user_id = (select auth.uid())
    )
  );

-- PROMPT_USAGE_HISTORY policies
DROP POLICY IF EXISTS "Users can view their own usage history" ON public.prompt_usage_history;
CREATE POLICY "Users can view their own usage history"
  ON public.prompt_usage_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can record their usage" ON public.prompt_usage_history;
CREATE POLICY "Users can record their usage"
  ON public.prompt_usage_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ONBOARDING_RESPONSES policies
DROP POLICY IF EXISTS "Users can view their own responses" ON public.onboarding_responses;
CREATE POLICY "Users can view their own responses"
  ON public.onboarding_responses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create their own responses" ON public.onboarding_responses;
CREATE POLICY "Users can create their own responses"
  ON public.onboarding_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own responses" ON public.onboarding_responses;
CREATE POLICY "Users can update their own responses"
  ON public.onboarding_responses FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- USER_ONBOARDING_STATUS policies
DROP POLICY IF EXISTS "Users can view their own status" ON public.user_onboarding_status;
CREATE POLICY "Users can view their own status"
  ON public.user_onboarding_status FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own status" ON public.user_onboarding_status;
CREATE POLICY "Users can insert their own status"
  ON public.user_onboarding_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own status" ON public.user_onboarding_status;
CREATE POLICY "Users can update their own status"
  ON public.user_onboarding_status FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Recreate functions with secure search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_lab_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lab_stats (user_id, lab_id, total_experiments)
    VALUES (NEW.user_id, NEW.lab_id, 1)
    ON CONFLICT (user_id, lab_id)
    DO UPDATE SET
      total_experiments = lab_stats.total_experiments + 1,
      last_activity = now();
  END IF;
  RETURN NEW;
END;
$$;
