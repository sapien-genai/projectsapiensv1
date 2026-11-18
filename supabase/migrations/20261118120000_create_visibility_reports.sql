/*
  # Create visibility_reports table

  One row per instant AI visibility report requested on /ai-visibility.
  Holds the full report, the visitor's email once they unlock it, and the
  data used for rate limiting (a salted hash of the requester's IP).

  Written and read exclusively by the visibility-report edge function with
  the service role. RLS is enabled with no public policies, so the anon and
  authenticated roles cannot read leads or reports directly. Admins can read
  rows through the existing admin_roles check.

  reused_from is set when a recent report for the same domain was copied
  instead of re-running the AI calls; those rows do not count toward limits.
*/

CREATE TABLE visibility_reports (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  domain       text        NOT NULL,
  url          text        NOT NULL,
  status       text        NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'complete', 'failed')),
  progress     text,
  report       jsonb,
  error        text,
  ip_hash      text,
  reused_from  uuid        REFERENCES visibility_reports(id) ON DELETE SET NULL,
  email        text,
  unlocked_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX visibility_reports_domain_created_idx ON visibility_reports (domain, created_at DESC);
CREATE INDEX visibility_reports_ip_created_idx ON visibility_reports (ip_hash, created_at DESC);
CREATE INDEX visibility_reports_created_idx ON visibility_reports (created_at DESC);
CREATE INDEX visibility_reports_leads_idx ON visibility_reports (unlocked_at DESC) WHERE email IS NOT NULL;

ALTER TABLE visibility_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read visibility reports"
  ON visibility_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('super_admin', 'admin')
    )
  );
