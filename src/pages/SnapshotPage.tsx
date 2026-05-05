import { useEffect, useMemo, useState } from 'react';

interface SnapshotPageProps {
  snapshotId: string;
}

interface SnapshotMeta {
  title?: string;
  lastReviewed?: string;
}

const snapshotFiles = import.meta.glob('../content/snapshots/*.md', { query: '?raw', import: 'default' });

function parseSnapshot(raw: string): { meta: SnapshotMeta; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const metaLines = match[1].split('\n');
  const meta: SnapshotMeta = {};
  metaLines.forEach((line) => {
    const [k, ...rest] = line.split(':');
    if (!k || rest.length === 0) return;
    const value = rest.join(':').trim().replace(/^"|"$/g, '');
    if (k.trim() === 'title') meta.title = value;
    if (k.trim() === 'lastReviewed') meta.lastReviewed = value;
  });
  return { meta, body: match[2] };
}

export default function SnapshotPage({ snapshotId }: SnapshotPageProps) {
  const [rawContent, setRawContent] = useState<string>('');

  useEffect(() => {
    const loadSnapshot = async () => {
      const key = `../content/snapshots/${snapshotId}.md`;
      const loader = snapshotFiles[key] as (() => Promise<string>) | undefined;
      setRawContent(loader ? await loader() : '');
    };
    loadSnapshot();
  }, [snapshotId]);

  const parsed = useMemo(() => (rawContent ? parseSnapshot(rawContent) : null), [rawContent]);

  if (!parsed) return <div className="min-h-screen p-8">Snapshot not found.</div>;

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
        <h1 className="font-extrabold text-3xl uppercase tracking-tight mb-3">{parsed.meta.title || snapshotId}</h1>
        <div className="text-sm text-[#57524D] bg-[#F7FAFF] border border-black px-3 py-2 inline-block mb-6">
          Last reviewed: {parsed.meta.lastReviewed || 'Unknown'}
        </div>
        <div className="whitespace-pre-line leading-relaxed">
          {parsed.body}
        </div>
      </div>
    </div>
  );
}
