import { ArrowLeft, ArrowRight } from 'lucide-react';
import { workflowList, WorkflowId, Workflow } from '../data/workflows';

interface PathsListPageProps {
  onBack?: () => void;
  onWorkflowSelect?: (id: WorkflowId) => void;
  onPathSelect?: (pathId: string) => void;
}

export default function PathsListPage({ onBack, onWorkflowSelect, onPathSelect }: PathsListPageProps) {
  const handleSelect = (id: WorkflowId) => {
    if (onWorkflowSelect) onWorkflowSelect(id);
    else onPathSelect?.(id);
  };

  const thinking = workflowList.filter(w => w.category === 'thinking');
  const daily    = workflowList.filter(w => w.category === 'daily');

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
          <h1 className="flex-1 text-[15px] font-semibold tracking-tight">Workflows</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-8 pb-24">
        <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900">
          What do you want to do?
        </h2>
        <p className="mt-2 text-[17px] text-neutral-500">
          Every capability lives here. Run it, iterate, move on.
        </p>

        <Section title="Think & create" items={thinking} onSelect={handleSelect} />
        <Section title="Run your day"   items={daily}    onSelect={handleSelect} />
      </main>
    </div>
  );
}

function Section({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: Workflow[];
  onSelect: (id: WorkflowId) => void;
}) {
  return (
    <section className="mt-10">
      <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
        {title}
      </p>
      <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
        {items.map(w => {
          const Icon = w.icon;
          return (
            <li key={w.id}>
              <button
                onClick={() => onSelect(w.id)}
                className="w-full flex items-center gap-4 py-5 text-left group"
              >
                <span className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-neutral-900" strokeWidth={2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] font-medium text-neutral-900">
                    {w.label}
                  </span>
                  <span className="block text-[14px] text-neutral-500 mt-0.5 truncate">
                    {w.tagline}
                  </span>
                </span>
                <ArrowRight
                  className="w-4 h-4 text-neutral-400 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition-all shrink-0"
                  strokeWidth={2}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
