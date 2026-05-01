import { ArrowLeft, Home, CheckCircle2, Circle, Lock, Palette, Briefcase, Zap, PenLine, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { paths } from '../data/paths';

interface PathPageProps {
  pathId: string;
  onBack?: () => void;
  onLessonSelect?: (missionId: string, stepId: string) => void;
}

interface PathProgress {
  completed_lessons: string[];
  current_module: string;
  progress_percentage: number;
}

const pathIcons: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'ai-writing-systems': PenLine,
  'ai-everyday-life': Home,
  'ai-for-creators': Palette,
  'ai-for-small-business': Briefcase,
  'ai-for-productivity': Zap,
  'ai-prompting-mastery': Target,
};

export default function PathPage({ pathId, onBack, onLessonSelect }: PathPageProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PathProgress>({
    completed_lessons: [],
    current_module: '',
    progress_percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  const pathData = paths[pathId] || paths['ai-everyday-life'];
  const missions = pathData.missions;
  const PathIcon = pathIcons[pathData.id] || Home;

  useEffect(() => {
    loadProgress();
  }, [pathId, user]);

  const loadProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const pathSlugMap: Record<string, string> = {
      'ai-everyday-life': 'ai-everyday',
      'ai-for-creators': 'ai-creators',
      'ai-for-small-business': 'ai-small-business',
      'ai-for-productivity': 'ai-productivity',
    };

    const dbSlug = pathSlugMap[pathId] || pathId;

    const { data: row } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('slug', dbSlug)
      .maybeSingle();

    if (!row) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_path_progress')
      .select('completed_lessons, current_module, progress_percentage')
      .eq('user_id', user.id)
      .eq('path_id', row.id)
      .maybeSingle();

    if (data) setProgress(data);
    setLoading(false);
  };

  const totalSteps = missions.reduce((sum, m) => sum + m.steps.length, 0);
  const completedCount = progress.completed_lessons.length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const isMissionUnlocked = (missionIndex: number) => {
    if (missionIndex <= 2) return true;
    const prev = missions[missionIndex - 1];
    return prev.steps.every(s => progress.completed_lessons.includes(s.id));
  };

  const getNextStep = () => {
    for (const m of missions) {
      for (const s of m.steps) {
        if (!progress.completed_lessons.includes(s.id)) {
          return { missionId: m.id, stepId: s.id };
        }
      }
    }
    return null;
  };

  const handleContinue = () => {
    const next = getNextStep();
    if (next && onLessonSelect) onLessonSelect(next.missionId, next.stepId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin" />
          <p className="mt-4 font-semibold">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK TO DASHBOARD
        </button>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PathIcon className="w-8 h-8" strokeWidth={2} />
                <div className="text-xs font-semibold px-3 py-1 border border-black bg-white">
                  MISSION PATH
                </div>
              </div>
              <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter leading-none mb-4">
                {pathData.title}
              </h1>
              <p className="text-base md:text-lg leading-relaxed">
                {pathData.description}
              </p>
            </div>

            {/* Missions */}
            {missions.map((mission, mi) => {
              const unlocked = isMissionUnlocked(mi);
              const done = mission.steps.every(s => progress.completed_lessons.includes(s.id));
              return (
                <div
                  key={mission.id}
                  className={`bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] ${!unlocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-extrabold text-lg md:text-xl lg:text-2xl uppercase tracking-tight mb-2 break-words">
                        {mission.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#555555] break-words">
                        {mission.description}
                      </p>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-6 h-6 text-[#4CAF50] shrink-0" strokeWidth={2} />
                    ) : !unlocked ? (
                      <Lock className="w-6 h-6 text-[#555555] shrink-0" strokeWidth={2} />
                    ) : null}
                  </div>

                  {/* Mission outcome */}
                  <div className="bg-[#F4F4F4] border border-black p-3 mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6A00] mb-1">
                      Outcome
                    </p>
                    <p className="text-xs leading-relaxed text-[#333]">
                      {mission.outcome}
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888] mb-2">
                      {mission.steps.length} Steps
                    </p>
                    {mission.steps.map((step, si) => {
                      const completed = progress.completed_lessons.includes(step.id);
                      return (
                        <button
                          key={step.id}
                          onClick={() => unlocked && onLessonSelect?.(mission.id, step.id)}
                          disabled={!unlocked}
                          className={`w-full flex items-center gap-4 p-4 border border-black ${
                            completed ? 'bg-[#E8F5E9]' : 'bg-[#F4F4F4]'
                          } hover:bg-white transition-colors text-left ${
                            !unlocked ? 'cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="relative w-5 h-5 flex-shrink-0">
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" strokeWidth={2} fill="currentColor" />
                            ) : (
                              <Circle className="w-5 h-5" strokeWidth={2} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                              Step {si + 1}
                            </p>
                            <p className="font-semibold text-sm break-words line-clamp-2">{step.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] lg:sticky lg:top-8">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                YOUR PROGRESS
              </h3>

              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>{completedCount} / {totalSteps} STEPS</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-6 bg-[#F4F4F4] border border-black relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#FF6A00]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Missions:</span>
                  <span>{missions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Level:</span>
                  <span>{pathData.level}</span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={completedCount === totalSteps}
                className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completedCount === totalSteps ? 'PATH COMPLETED' : 'CONTINUE MISSION'}
              </button>
            </div>

            <div className="bg-[#0A74FF] border border-black p-6 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000]">
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-3 text-white">
                BY THE END, YOU WILL HAVE
              </h4>
              <p className="text-xs leading-relaxed text-white">
                {pathData.outcome}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
