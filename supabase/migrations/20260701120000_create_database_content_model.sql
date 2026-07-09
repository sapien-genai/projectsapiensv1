/*
  # Create database-backed learning content model

  ## Summary
  Moves path/module/lesson content toward Supabase-backed storage while
  preserving the existing frontend contract until the app is wired to read
  from the database in a later task.

  - Keeps existing learning_paths UUID primary keys.
  - Adds path metadata currently sourced from src/data/paths.ts.
  - Adds database-backed modules and lessons.
  - Keeps lesson IDs as text so existing completed_lessons text[] progress
    entries continue to resolve after content moves out of static TS.

  ## New Tables
  - `modules`
    - `id` text, primary key
    - `path_id` uuid, references learning_paths, cascade delete
    - `title` text
    - `description` text
    - `sort_order` integer
    - `created_at` / `updated_at` timestamps
  - `lessons`
    - `id` text, primary key
    - `module_id` text, references modules, cascade delete
    - `title` text
    - `duration` text
    - `sort_order` integer
    - `content` jsonb rich lesson body
    - `volatility`, `last_reviewed`, `review_interval_days`
    - `is_published` boolean
    - `created_at` / `updated_at` timestamps

  ## Changed Tables
  - `learning_paths`
    - Adds `level`, `total_time`, `sort_order`, `is_published`, `tenant_id`

  ## Security
  - RLS enabled on every content table touched here.
  - Authenticated users can read published learning content.
  - Admins can read and manage all content via the existing is_admin(uuid)
    SECURITY DEFINER function, which intentionally bypasses admin_roles RLS
    and is defined with SET search_path = public in earlier migrations.
  - Seed writes are performed with the Supabase service-role key, which
    intentionally bypasses RLS outside this migration.
*/

ALTER TABLE learning_paths
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS total_time text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS tenant_id uuid;

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS modules (
  id text PRIMARY KEY,
  path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id text PRIMARY KEY,
  module_id text REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  duration text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  volatility text CHECK (volatility IN ('low', 'medium', 'high')),
  last_reviewed date,
  review_interval_days integer,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_published_sort
  ON learning_paths (is_published, sort_order, title);

CREATE INDEX IF NOT EXISTS idx_modules_path_sort
  ON modules (path_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_lessons_module_sort
  ON lessons (module_id, sort_order);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learning paths are readable by authenticated users" ON learning_paths;
DROP POLICY IF EXISTS "Published learning paths are readable by authenticated users" ON learning_paths;
CREATE POLICY "Published learning paths are readable by authenticated users"
  ON learning_paths
  FOR SELECT
  TO authenticated
  USING (is_published = true OR is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can insert learning paths" ON learning_paths;
CREATE POLICY "Admins can insert learning paths"
  ON learning_paths
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can update learning paths" ON learning_paths;
CREATE POLICY "Admins can update learning paths"
  ON learning_paths
  FOR UPDATE
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can delete learning paths" ON learning_paths;
CREATE POLICY "Admins can delete learning paths"
  ON learning_paths
  FOR DELETE
  TO authenticated
  USING (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Modules are readable by authenticated users" ON modules;
DROP POLICY IF EXISTS "Published modules are readable by authenticated users" ON modules;
CREATE POLICY "Published modules are readable by authenticated users"
  ON modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM learning_paths
      WHERE learning_paths.id = modules.path_id
        AND learning_paths.is_published = true
    )
    OR is_admin((select auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can insert modules" ON modules;
CREATE POLICY "Admins can insert modules"
  ON modules
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can update modules" ON modules;
CREATE POLICY "Admins can update modules"
  ON modules
  FOR UPDATE
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can delete modules" ON modules;
CREATE POLICY "Admins can delete modules"
  ON modules
  FOR DELETE
  TO authenticated
  USING (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Lessons are readable by authenticated users" ON lessons;
DROP POLICY IF EXISTS "Published lessons are readable by authenticated users" ON lessons;
CREATE POLICY "Published lessons are readable by authenticated users"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    (
      is_published = true
      AND EXISTS (
        SELECT 1
        FROM modules
        JOIN learning_paths ON learning_paths.id = modules.path_id
        WHERE modules.id = lessons.module_id
          AND learning_paths.is_published = true
      )
    )
    OR is_admin((select auth.uid()))
  );

DROP POLICY IF EXISTS "Admins can insert lessons" ON lessons;
CREATE POLICY "Admins can insert lessons"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;
CREATE POLICY "Admins can update lessons"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can delete lessons" ON lessons;
CREATE POLICY "Admins can delete lessons"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (is_admin((select auth.uid())));

DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
