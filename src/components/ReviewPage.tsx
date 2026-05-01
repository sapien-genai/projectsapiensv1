import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Inbox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { workflows, WorkflowId, workflowList } from '../data/workflows';

interface ReviewPageProps {
  onBack?: () => void;
  onReopen?: (workflowId: WorkflowId, seedText: string) => void;
}

interface Entry {
  id: string;
  lab_id: string;
  prompt: string;
  output: string;
  created_at: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function workflowFromLabId(labId: string): WorkflowId | null {
  if (labId?.startsWith('workflow-')) {
    const id = labId.slice('workflow-'.length) as WorkflowId;
    if (workflows[id]) return id;
  }
  if (labId === 'writing-lab') return 'write';
  return null;
}

function snippet(text: string, n = 160): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n - 1) + '…' : clean;
}

export default function ReviewPage({ onBack, onReopen }: ReviewPageProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | WorkflowId>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('lab_experiments')
        .select('id, lab_id, prompt, output, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      setEntries((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = entries.filter(e => {
    if (filter === 'all') return true;
    return workflowFromLabId(e.lab_id) === filter;
  });

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-[15px] font-semibold tracking-tight">Review</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-8 pb-24">
        <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900">
          Everything you've worked on.
        </h2>
        <p className="mt-2 text-[17px] text-neutral-500">
          Reopen a thread and keep pushing it forward.
        </p>

        {/* Filters */}
        <div className="mt-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 w-max">
            <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </FilterPill>
            {workflowList.map(w => (
              <FilterPill
                key={w.id}
                active={filter === w.id}
                onClick={() => setFilter(w.id)}
              >
                {w.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="mt-8">
          {loading ? (
            <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
              {[0,1,2,3].map(i => (
                <li key={i} className="py-5">
                  <div className="h-4 w-2/3 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-neutral-100 rounded mt-2 animate-pulse" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="w-6 h-6 text-neutral-300 mx-auto" strokeWidth={2} />
              <p className="mt-3 text-[15px] text-neutral-500">
                Nothing here yet. Run a workflow and it'll show up.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
              {filtered.map(e => {
                const wfId = workflowFromLabId(e.lab_id);
                const wf   = wfId ? workflows[wfId] : null;
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => wfId && onReopen?.(wfId, e.output || e.prompt || '')}
                      className="w-full flex items-start gap-3 py-5 text-left group"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-[12px] font-medium uppercase tracking-wider text-[#FF6A00]">
                            {wf?.label ?? 'Session'}
                          </span>
                          <span className="text-[12px] text-neutral-400">
                            {relativeTime(e.created_at)}
                          </span>
                        </span>
                        <span className="block mt-1.5 text-[15px] text-neutral-900 leading-snug">
                          {snippet(e.output || e.prompt)}
                        </span>
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-neutral-300 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ' +
        (active
          ? 'bg-neutral-900 text-white'
          : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200')
      }
    >
      {children}
    </button>
  );
}
