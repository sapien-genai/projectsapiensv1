import { ArrowLeft, Home, CheckCircle2, Circle, Lock, Palette, Briefcase, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { paths } from '../data/paths';

interface PathPageProps {
  pathId: string;
  onBack?: () => void;
  onLessonSelect?: (moduleId: string, lessonId: string) => void;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
}

interface PathProgress {
  completed_lessons: string[];
  current_module: string;
  progress_percentage: number;
}

const legacyEverydayLifePath: Module[] = [
  {
    id: 'module-1',
    title: 'MODULE 1: AI FUNDAMENTALS',
    description: 'Understanding AI in your daily context',
    lessons: [
      { id: 'lesson-1-1', title: 'What AI Actually Is (No Jargon)', duration: '10 min' },
      { id: 'lesson-1-2', title: 'Your First Prompt: Talk to AI Like a Human', duration: '15 min' },
      { id: 'lesson-1-3', title: 'The 3 Types of AI You Use Every Day', duration: '12 min' },
      { id: 'lesson-1-4', title: 'Practice Lab: Write 5 Different Prompts', duration: '20 min' },
    ],
  },
  {
    id: 'module-2',
    title: 'MODULE 2: PERSONAL PRODUCTIVITY',
    description: 'Use AI to organize, plan, and decide',
    lessons: [
      { id: 'lesson-2-1', title: 'Meal Planning with AI', duration: '15 min' },
      { id: 'lesson-2-2', title: 'Travel Itinerary Generator', duration: '18 min' },
      { id: 'lesson-2-3', title: 'Daily Schedule Optimizer', duration: '20 min' },
      { id: 'lesson-2-4', title: 'Decision-Making Framework', duration: '25 min' },
      { id: 'lesson-2-5', title: 'Practice Lab: Plan Your Week', duration: '30 min' },
    ],
  },
  {
    id: 'module-3',
    title: 'MODULE 3: LEARNING & GROWTH',
    description: 'Accelerate your personal development',
    lessons: [
      { id: 'lesson-3-1', title: 'Create Your Personal Learning Path', duration: '20 min' },
      { id: 'lesson-3-2', title: 'AI as Your Study Partner', duration: '18 min' },
      { id: 'lesson-3-3', title: 'Skill Gap Analysis', duration: '22 min' },
      { id: 'lesson-3-4', title: 'Practice Lab: Build a Study Plan', duration: '30 min' },
    ],
  },
  {
    id: 'module-4',
    title: 'MODULE 4: CREATIVITY & EXPRESSION',
    description: 'Unlock your creative potential',
    lessons: [
      { id: 'lesson-4-1', title: 'Writing Better Emails & Messages', duration: '15 min' },
      { id: 'lesson-4-2', title: 'Storytelling with AI', duration: '20 min' },
      { id: 'lesson-4-3', title: 'Personal Journaling Assistant', duration: '18 min' },
      { id: 'lesson-4-4', title: 'Practice Lab: Write Your Story', duration: '30 min' },
    ],
  },
  {
    id: 'module-5',
    title: 'MODULE 5: FINAL PROJECT',
    description: 'Build your personal AI dashboard',
    lessons: [
      { id: 'lesson-5-1', title: 'Design Your Dashboard', duration: '30 min' },
      { id: 'lesson-5-2', title: 'Set Up Your AI Workflows', duration: '45 min' },
      { id: 'lesson-5-3', title: 'Test & Refine', duration: '30 min' },
      { id: 'lesson-5-4', title: 'Share & Get Feedback', duration: '20 min' },
    ],
  },
];

export default function PathPage({ pathId, onBack, onLessonSelect }: PathPageProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PathProgress>({
    completed_lessons: [],
    current_module: 'module-1',
    progress_percentage: 0
  });
  const [loading, setLoading] = useState(true);

  const pathData = paths[pathId] || paths['ai-everyday-life'];
  const pathModules = pathData.modules;

  useEffect(() => {
    loadProgress();
  }, [pathId, user]);

  const loadProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Map frontend path IDs to database slugs
    const pathSlugMap: Record<string, string> = {
      'ai-everyday-life': 'ai-everyday',
      'ai-for-creators': 'ai-creators',
      'ai-for-small-business': 'ai-small-business',
      'ai-for-productivity': 'ai-productivity'
    };

    const dbSlug = pathSlugMap[pathId] || pathId;

    // Get the UUID for this path
    const { data: pathData } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('slug', dbSlug)
      .maybeSingle();

    if (!pathData) {
      console.error('Path not found:', dbSlug);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_path_progress')
      .select('completed_lessons, current_module, progress_percentage')
      .eq('user_id', user.id)
      .eq('path_id', pathData.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading progress:', error);
      if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('auth')) {
        console.warn('Authentication error - user may need to sign in again');
      }
    }

    if (data) {
      setProgress(data);
    }
    setLoading(false);
  };

  const totalLessons = pathModules.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedCount = progress.completed_lessons.length;

  const isModuleUnlocked = (moduleIndex: number) => {
    if (moduleIndex === 0 || moduleIndex === 1 || moduleIndex === 2) return true;
    const previousModule = pathModules[moduleIndex - 1];
    return previousModule.lessons.every(lesson =>
      progress.completed_lessons.includes(lesson.id)
    );
  };

  const getNextLesson = () => {
    for (const module of pathModules) {
      for (const lesson of module.lessons) {
        if (!progress.completed_lessons.includes(lesson.id)) {
          return { moduleId: module.id, lessonId: lesson.id };
        }
      }
    }
    return null;
  };

  const handleContinueLearning = () => {
    const nextLesson = getNextLesson();
    if (nextLesson && onLessonSelect) {
      onLessonSelect(nextLesson.moduleId, nextLesson.lessonId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
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
            <div>
              <div className="flex items-center gap-3 mb-4">
                {pathId === 'ai-for-creators' ? (
                  <Palette className="w-8 h-8" strokeWidth={2} />
                ) : pathId === 'ai-for-small-business' ? (
                  <Briefcase className="w-8 h-8" strokeWidth={2} />
                ) : pathId === 'ai-for-productivity' ? (
                  <Zap className="w-8 h-8" strokeWidth={2} />
                ) : (
                  <Home className="w-8 h-8" strokeWidth={2} />
                )}
                <div className="text-xs font-semibold px-3 py-1 border border-black bg-white">
                  LEARNING PATH
                </div>
              </div>
              <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter leading-none mb-4">
                {pathData.title}
              </h1>
              <p className="text-base md:text-lg leading-relaxed">
                {pathData.description}
              </p>
            </div>

            {pathModules.map((module, moduleIndex) => {
              const unlocked = isModuleUnlocked(moduleIndex);
              return (
                <div
                  key={module.id}
                  className={`bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] ${
                    !unlocked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="font-extrabold text-lg md:text-xl lg:text-2xl uppercase tracking-tight mb-2 break-words">
                        {module.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#555555] break-words">
                        {module.description}
                      </p>
                    </div>
                    {!unlocked && (
                      <Lock className="w-6 h-6 text-[#555555]" strokeWidth={2} />
                    )}
                  </div>

                  <div className="space-y-3">
                    {module.lessons.map((lesson) => {
                      const completed = progress.completed_lessons.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => unlocked && onLessonSelect?.(module.id, lesson.id)}
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
                            <p className="font-semibold text-sm break-words line-clamp-2">{lesson.title}</p>
                            <p className="text-xs text-[#555555]">{lesson.duration}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] lg:sticky lg:top-8">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                YOUR PROGRESS
              </h3>

              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>{completedCount} / {totalLessons} LESSONS</span>
                  <span>{Math.round((completedCount / totalLessons) * 100)}%</span>
                </div>
                <div className="h-6 bg-[#F4F4F4] border border-black relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#FF6A00]"
                    style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Modules:</span>
                  <span>{pathModules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Total Time:</span>
                  <span>{pathData.totalTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Level:</span>
                  <span>{pathData.level}</span>
                </div>
              </div>

              <button
                onClick={handleContinueLearning}
                disabled={completedCount === totalLessons}
                className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completedCount === totalLessons ? 'PATH COMPLETED' : 'CONTINUE LEARNING'}
              </button>
            </div>

            <div className="bg-[#0A74FF] border border-black p-6 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000]">
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-3 text-white">
                WHAT YOU'LL BUILD
              </h4>
              <p className="text-xs leading-relaxed text-white">
                {pathData.finalProject}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
