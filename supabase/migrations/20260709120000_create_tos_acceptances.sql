/*
  # Create ToS acceptance tracking

  ## Summary
  Records explicit Terms of Service acceptance per user and per ToS version,
  with a server-side timestamp for compliance purposes.

  - New signups accept via a required checkbox on the signup form.
  - Existing users are prompted once at login by the in-app acceptance gate.
  - Bumping CURRENT_TOS_VERSION in src/lib/tos.ts re-prompts everyone.

  ## New Tables
  - `tos_acceptances`
    - `id` uuid, primary key
    - `user_id` uuid, references auth.users, cascade delete
    - `tos_version` text (e.g. '2026-01')
    - `accepted_at` timestamptz, server default now()
    - UNIQUE (user_id, tos_version) — one acceptance per user per version

  ## Security
  - RLS enabled
  - Users can INSERT and SELECT their own acceptance rows
  - No UPDATE or DELETE policies — acceptances are immutable audit records
  - Admins can view all acceptances (via is_admin SECURITY DEFINER function)
*/

CREATE TABLE IF NOT EXISTS tos_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tos_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tos_version)
);

ALTER TABLE tos_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record own ToS acceptance"
  ON tos_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own ToS acceptance"
  ON tos_acceptances FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all ToS acceptances"
  ON tos_acceptances FOR SELECT
  TO authenticated
  USING (is_admin((select auth.uid())));

CREATE INDEX IF NOT EXISTS idx_tos_acceptances_user_id
  ON tos_acceptances(user_id);
