/*
  # Create workspaces (white-label tenants)

  ## Summary
  First step of runtime white-labeling. A workspace carries the brand
  identity (name, logo, colors) that the frontend applies to the theme
  tokens at runtime. Users are linked to a workspace through
  user_profiles.workspace_id; users without a workspace fall back to the
  default Project Sapiens brand in the app.

  ## New Tables
  - `workspaces`
    - `id` uuid, primary key
    - `slug` text, unique (e.g. 'project-sapiens')
    - `name` text — workspace display name (e.g. 'Acme AI Academy')
    - `platform_label` text — "Powered by X" label
    - `logo_url` text — optional logo image
    - `primary_color` / `secondary_color` / `background_color` — hex colors
      mapped onto the --accent / --info / --surface theme tokens
    - `created_at` / `updated_at` timestamps

  ## Changes
  - `user_profiles.workspace_id` uuid column (nullable, SET NULL on
    workspace delete)
  - Seeds the default 'project-sapiens' workspace

  ## Security
  - RLS enabled on workspaces
  - Members can view their own workspace; admins can view and manage all
    (via the is_admin SECURITY DEFINER function)
*/

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  platform_label text NOT NULL DEFAULT 'Project Sapiens',
  logo_url text NOT NULL DEFAULT '',
  primary_color text NOT NULL DEFAULT '#FF6A00',
  secondary_color text NOT NULL DEFAULT '#0A74FF',
  background_color text NOT NULL DEFAULT '#F4F4F4',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM user_profiles
      WHERE user_id = (select auth.uid())
    )
    OR is_admin((select auth.uid()))
  );

CREATE POLICY "Admins can insert workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can update workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (is_admin((select auth.uid())))
  WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can delete workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (is_admin((select auth.uid())));

-- Link users to workspaces
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_workspace_id
  ON user_profiles(workspace_id);

-- Seed the default workspace (matches the previously hardcoded brand)
INSERT INTO workspaces (slug, name, platform_label, logo_url, primary_color, secondary_color, background_color)
VALUES (
  'project-sapiens',
  'Project Sapiens Academy',
  'Project Sapiens',
  '',
  '#FF6A00',
  '#0A74FF',
  '#F4F4F4'
)
ON CONFLICT (slug) DO NOTHING;
