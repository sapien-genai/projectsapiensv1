import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { loadSnapshotRaw, parseSnapshot, useSnapshotMeta } from '../utils/snapshots';

interface SnapshotPageProps {
  snapshotId: string;
  onBack?: () => void;
}

export default function SnapshotPage({ snapshotId, onBack }: SnapshotPageProps) {
  const [rawContent, setRawContent] = useState<string>('');
  const snapshotMeta = useSnapshotMeta(snapshotId);

  const daysUntilReview = useMemo(() => {
    const { lastReviewed, reviewIntervalDays } = snapshotMeta;
    if (!lastReviewed || !reviewIntervalDays) return null;
    const daysSince = Math.floor((Date.now() - new Date(lastReviewed).getTime()) / 86400000);
    return reviewIntervalDays - daysSince;
  }, [snapshotMeta]);

  useEffect(() => {
    const loadSnapshot = async () => {
      setRawContent(await loadSnapshotRaw(snapshotId));
    };
    loadSnapshot();
  }, [snapshotId]);

  const parsed = useMemo(() => (rawContent ? parseSnapshot(rawContent) : null), [rawContent]);

  if (!parsed) return <div className="min-h-screen p-8">Snapshot not found.</div>;

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-ink p-8 shadow-brutal">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lesson
          </button>
        )}
        <div className="bg-[#FFF8F5] border-l-4 border-accent px-4 py-3 mb-6 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Reference Snapshot</p>
            <p className="text-sm text-secondary">
              A quarterly-reviewed snapshot of current tools by category. Last reviewed{' '}
              {snapshotMeta.lastReviewed || parsed.meta.lastReviewed || 'Unknown'}
              {daysUntilReview !== null && ` · next review due in ${daysUntilReview} days`}.
            </p>
          </div>
        </div>
        <h1 className="font-extrabold text-3xl uppercase tracking-tight mb-6">
          {snapshotMeta.title || parsed.meta.title || snapshotId}
        </h1>
        <div className="leading-relaxed">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="font-extrabold text-2xl uppercase tracking-tight mt-8 mb-4 text-strong">{children}</h2>,
              h3: ({ children }) => <h3 className="font-extrabold text-xl uppercase tracking-tight mt-6 mb-4 text-strong">{children}</h3>,
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
