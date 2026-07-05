import { ArrowLeft, Home, Palette, Briefcase, Zap, PenLine } from 'lucide-react';
import { paths } from '../data/paths';

interface PathsListPageProps {
  onBack?: () => void;
  onPathSelect?: (pathId: string) => void;
}

const pathIcons: Record<string, React.ComponentType<any>> = {
  'ai-writing-systems': PenLine,
  'ai-everyday-life': Home,
  'ai-for-creators': Palette,
  'ai-for-small-business': Briefcase,
  'ai-for-productivity': Zap,
};

export default function PathsListPage({ onBack, onPathSelect }: PathsListPageProps) {
  const pathList = Object.values(paths);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            BACK TO DASHBOARD
          </button>
        )}

        <div className="mb-12">
          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-none mb-4">
            CHOOSE YOUR LEARNING PATH
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-3xl">
            Goal-based, role-specific learning paths designed to take you from beginner to master. Each path includes lessons, labs, and a capstone project.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {pathList.map((path) => {
            const Icon = pathIcons[path.id] || Zap;
            return (
              <div
                key={path.id}
                className="bg-white border border-ink p-6 md:p-8 shadow-brutal hover:shadow-brutal-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon className="w-12 h-12" strokeWidth={2} />
                  <div className="text-xs font-semibold px-3 py-1 border border-ink bg-surface">
                    {path.level}
                  </div>
                </div>

                <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4">
                  {path.title}
                </h2>

                <p className="text-sm leading-relaxed mb-6">
                  {path.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Modules:</span>
                    <span>{path.modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Total Time:</span>
                    <span>{path.totalTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Total Lessons:</span>
                    <span>
                      {path.modules.reduce((sum, module) => sum + module.lessons.length, 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface border border-ink p-4 mb-6">
                  <p className="text-xs font-extrabold uppercase tracking-tight mb-2">
                    FINAL PROJECT:
                  </p>
                  <p className="text-xs leading-relaxed">
                    {path.finalProject.substring(0, 150)}...
                  </p>
                </div>

                <button
                  onClick={() => onPathSelect?.(path.id)}
                  className="w-full bg-accent text-ink border border-ink px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  START PATH
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white border border-ink p-6 md:p-8 shadow-brutal">
          <h3 className="font-extrabold text-xl uppercase tracking-tight mb-6">
            HOW LEARNING PATHS WORK
          </h3>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="text-3xl font-extrabold text-accent mb-2">01</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                STRUCTURED LEARNING
              </h4>
              <p className="text-sm leading-relaxed">
                Follow a carefully designed curriculum that builds knowledge progressively.
              </p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-accent mb-2">02</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                HANDS-ON PRACTICE
              </h4>
              <p className="text-sm leading-relaxed">
                Apply what you learn with interactive labs and real-world exercises.
              </p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-accent mb-2">03</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                BUILD & SHARE
              </h4>
              <p className="text-sm leading-relaxed">
                Complete a capstone project that demonstrates your new AI skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
