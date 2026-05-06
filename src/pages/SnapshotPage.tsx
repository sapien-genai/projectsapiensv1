import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { loadSnapshotRaw, parseSnapshot, useSnapshotMeta } from '../utils/snapshots';

interface SnapshotPageProps {
  snapshotId: string;
  onBack?: () => void;
}

export default function SnapshotPage({ snapshotId, onBack }: SnapshotPageProps) {
  const [rawContent, setRawContent] = useState<string>('');
  const snapshotMeta = useSnapshotMeta(snapshotId);

  useEffect(() => {
    const loadSnapshot = async () => {
      setRawContent(await loadSnapshotRaw(snapshotId));
    };
    loadSnapshot();
  }, [snapshotId]);

  const parsed = useMemo(() => (rawContent ? parseSnapshot(rawContent) : null), [rawContent]);

  if (!parsed) return <div className="min-h-screen p-8">Snapshot not found.</div>;

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
        {onBack && (
          <button onClick={onBack} className="text-sm font-semibold mb-6 hover:text-[#FF6A00] transition-colors">
            ← BACK
          </button>
        )}
        <h1 className="font-extrabold text-3xl uppercase tracking-tight mb-3">{snapshotMeta.title || parsed.meta.title || snapshotId}</h1>
        <div className="text-sm text-[#57524D] bg-[#F7FAFF] border border-black px-3 py-2 inline-block mb-6">
          Last reviewed: {snapshotMeta.lastReviewed || parsed.meta.lastReviewed || 'Unknown'}
        </div>
        <div className="leading-relaxed">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="font-extrabold text-2xl uppercase tracking-tight mt-8 mb-4 text-[#1C1A17]">{children}</h2>,
              h3: ({ children }) => <h3 className="font-extrabold text-xl uppercase tracking-tight mt-6 mb-4 text-[#1C1A17]">{children}</h3>,
              p: ({ children }) => <p className="leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            }}
          >
            {parsed.body}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
