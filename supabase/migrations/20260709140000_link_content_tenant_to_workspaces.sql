/*
  # Link content tenant_id to workspaces

  ## Summary
  The database content model added learning_paths.tenant_id as a bare uuid.
  The workspaces table (white-label tenants) is the canonical tenant model,
  so this migration ties the two together: tenant-scoped content belongs to
  a workspace, and content with tenant_id NULL is global/default content.

  Runs after 20260709130000_create_workspaces.sql (timestamp ordering).

  ## Changes
  - Foreign key: learning_paths.tenant_id -> workspaces.id (SET NULL on
    workspace delete, so content survives tenant removal as global content)
  - Index on learning_paths.tenant_id for tenant-filtered queries

  ## Security
  - No RLS changes. Existing content model policies still apply; per-tenant
    read scoping (members only see their workspace's paths) is a follow-up
    once tenant assignment is actually in use.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_paths_tenant_id_fkey'
  ) THEN
    ALTER TABLE learning_paths
      ADD CONSTRAINT learning_paths_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES workspaces(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_learning_paths_tenant_id
  ON learning_paths(tenant_id);
