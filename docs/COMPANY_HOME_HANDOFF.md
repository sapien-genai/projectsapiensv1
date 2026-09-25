# Company homepage — September 25, 2026

Root `/` now presents Project Sapiens as the company behind Hotline Sports. The existing academy is preserved as AcademyApp.tsx and lazy-loaded on `/academy`, `/academy/login`, and existing non-root routes. Root payment success/cancel query callbacks continue to the academy. Existing sessions and database records are not migrated or removed. Signing into the learning platform uses the same origin and auth client.

Preservation: local Git history was bundled and the dirty patch plus both untracked work files copied to `/Users/tonydamon/Documents/Project-Sapiens-2027/backups/2026-09-25/`. The original checkout was not modified. A second older checkout exists under Documents/code and remains untouched.

Release hold: production audit showed workspace-branding behavior present in unpublished July commits, whereas fetched origin/main is 122cfe8. This branch intentionally does not sweep those commits or the uncommitted admin/migration changes into a cosmetic homepage PR. Reconcile the actual deployed revision before merging/deploying to avoid rolling back academy behavior. No subscription/customer inventory or backend snapshot has been performed. The academy remains accessible regardless of subscription status; nothing is retired or deleted.

Validation: TypeScript and production build pass; new homepage and entry-point ESLint pass. Existing repository-wide lint debt was previously recorded (118 errors, 40 warnings in the local working copy), not represented as fixed. Browser-check company page and academy login before release.
