import { useEffect, useState } from 'react';

export interface SnapshotMeta {
  title?: string;
  lastReviewed?: string;
  reviewIntervalDays?: number;
}

export interface ParsedSnapshot {
  meta: SnapshotMeta;
  body: string;
}

const snapshotFiles = import.meta.glob('../content/snapshots/*.md', { query: '?raw', import: 'default' });

export function parseSnapshot(raw: string): ParsedSnapshot {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const metaLines = match[1].split('\n');
  const meta: SnapshotMeta = {};

  metaLines.forEach((line) => {
    const [k, ...rest] = line.split(':');
    if (!k || rest.length === 0) return;

    const key = k.trim();
    const value = rest.join(':').trim().replace(/^"|"$/g, '');

    if (key === 'title') meta.title = value;
    if (key === 'lastReviewed') meta.lastReviewed = value;
    if (key === 'reviewIntervalDays') {
      const days = Number(value);
      if (!Number.isNaN(days)) meta.reviewIntervalDays = days;
    }
  });

  return { meta, body: match[2] };
}

export async function loadSnapshotRaw(snapshotId: string): Promise<string> {
  const key = `../content/snapshots/${snapshotId}.md`;
  const loader = snapshotFiles[key] as (() => Promise<string>) | undefined;
  if (!loader) return '';
  return loader();
}

export function useSnapshotMeta(snapshotId: string): SnapshotMeta {
  const [meta, setMeta] = useState<SnapshotMeta>({});

  useEffect(() => {
    const loadMeta = async () => {
      const raw = await loadSnapshotRaw(snapshotId);
      setMeta(raw ? parseSnapshot(raw).meta : {});
    };

    loadMeta();
  }, [snapshotId]);

  return meta;
}
