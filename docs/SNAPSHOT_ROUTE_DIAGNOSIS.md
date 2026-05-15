# Snapshot Route 404 Diagnosis

## Summary

Two separate bugs combine to produce the 404. The primary cause is a missing
Vercel SPA rewrite (affects all snapshot routes on hard load/refresh). A
secondary cause is that inline `snapshotRef` links lack an `onClick` handler
and always trigger a full page navigation, which hits the same Vercel 404 even
from within the running app.

---

## Finding 1 — No `vercel.json`; Vercel has no SPA fallback

There is no `vercel.json` in the repo root, and `vite.config.ts` contains no
Vercel-specific configuration.

Vercel's default behavior for a static deployment is to serve the exact file
that matches the requested path. The build output only contains `index.html` at
the root. When a browser requests `/snapshots/foo` — whether by clicking a link
that triggers a full navigation or by directly loading/refreshing the URL —
Vercel has no file at that path and returns its own 404 page before the React
app ever boots.

**Fix direction:** add a `vercel.json` with a catch-all rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Finding 2 — Inline links have no `onClick` handler (full page navigation)

`src/components/LessonViewer.tsx` renders two variants of a `snapshotRef` block:

**Callout variant** (`block.style === 'callout'`, rendered via `SnapshotCallout`,
lines 338–340 and 74–84):

```tsx
<a
  href={`/snapshots/${snapshotId}`}
  onClick={(e) => {
    if (!onOpen) return;
    e.preventDefault();
    onOpen(snapshotId);         // SPA navigation via App.tsx state machine
  }}
>
```

When `onOpen` is defined (it is, in `App.tsx` at line 145), `preventDefault()`
fires and the SPA handler takes over — no full page navigation occurs.

**Inline variant** (non-callout, lines 344–355):

```tsx
<a
  href={`/snapshots/${block.snapshotId}`}
  className="hover:text-[#374151] hover:underline transition-colors"
>
  {block.label} →
</a>
```

There is **no `onClick` handler**. Every click causes the browser to issue a
real HTTP GET for `/snapshots/{id}`, which Vercel 404s (per Finding 1). The
`(see current tools →)` links in lesson-1-3 use this inline variant.

---

## Finding 3 — `App.tsx` snapshot detection is correct but never reached

`App.tsx` does contain a `useEffect` (lines 58–66) that parses
`window.location.pathname` for `/snapshots/{id}` on mount and sets
`view = 'snapshot'`. The `snapshot` view is a member of the `View` union type
(line 43). The logic is sound.

The problem is that this code only runs if `index.html` is delivered to the
browser first. Because Vercel 404s before serving `index.html`, the React app
never loads and this handler never fires.

There is also a subtle ordering issue: the effect's dependency array is `[user]`,
meaning it re-runs when auth resolves. On a direct load, `user` starts `null`
and the snapshot detection still fires (the guard is just `if (snapshotMatch)`),
so auth state is not blocking the route detection — but again, this is moot
until Vercel is configured to serve `index.html`.

---

## Why it works locally

Vite's dev server (`npm run dev`) has a built-in SPA fallback: it serves
`index.html` for any path it doesn't have a static file for. This masks both
bugs locally — the inline links trigger a full navigation, Vite catches it,
serves `index.html`, and the `App.tsx` snapshot detection fires correctly.

---

## Root causes (ordered by priority)

1. **Missing `vercel.json` SPA rewrite** — blocks all direct loads and
   navigations away from the SPA shell in production.
2. **Inline `snapshotRef` links have no `onClick` handler** — they always
   trigger a full page navigation instead of using the SPA state machine. Even
   after a `vercel.json` fix causes Vercel to serve `index.html`, each click
   will still cause a full page reload/re-auth cycle rather than instant
   in-app navigation. The callout variant should be used as the reference
   implementation.
