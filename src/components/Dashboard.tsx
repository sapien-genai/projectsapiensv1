import { useEffect, useState } from 'react';
import { BookOpen, Code, Zap, Trophy, LogOut, Users, BookmarkPlus, Footprints, Flame, Compass, Beaker, Network as NetworkIcon, Sparkles, Rocket, Target, Shield, Lock, LucideIcon, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError, getErrorMessage } from '../utils/errorHandling';
import OpenMoji from './OpenMoji';

interface UserProfile {
  username: string;
  fluency_level: number;
  xp: number;
}

interface Skill {
  skill_name: string;
  progress_percentage: number;
}

interface Badge {
  badge_id: string;
  name: string;
  icon: string;
  color: string;
  rarity: string;
}

interface DashboardProps {
  onLabsClick?: () => void;
  onNetworkClick?: () => void;
  onPromptsClick?: () => void;
  onBadgesClick?: () => void;
  onProfileClick?: () => void;
  onJournalClick?: () => void;
  onProjectsClick?: () => void;
  onCommandCenterClick?: () => void;
  onPathSelect?: (pathId: string) => void;
  onLabSelect?: (labId: string) => void;
  onPathsListClick?: () => void;
  onAdminClick?: () => void;
  onBillingClick?: () => void;
}

const fluencyLevels = [
  { level: 1, title: 'COLLABORATOR', subtitle: 'AI Fundamentals', xpRequired: 0 },
  { level: 2, title: 'PRACTITIONER', subtitle: 'Workflow Designer', xpRequired: 1000 },
  { level: 3, title: 'INTEGRATOR', subtitle: 'System Builder', xpRequired: 4000 },
  { level: 4, title: 'LEADER', subtitle: 'Solution Architect', xpRequired: 10000 },
];

const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Footprints': Footprints,
    'Flame': Flame,
    'Compass': Compass,
    'Flask': Beaker,
    'Network': NetworkIcon,
    'Sparkles': Sparkles,
    'Trophy': Trophy,
  };
  return iconMap[iconName] || Trophy;
};

export default function Dashboard({ onLabsClick, onNetworkClick, onPromptsClick, onBadgesClick, onProfileClick, onJournalClick, onProjectsClick, onCommandCenterClick, onPathSelect, onLabSelect, onPathsListClick, onAdminClick, onBillingClick }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commandCenterUnlocked, setCommandCenterUnlocked] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      try {
        setError(null);
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('username, fluency_level, xp')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile(profileData);
        }

        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('skill_name, progress_percentage')
          .eq('user_id', user.id);

        if (skillsError) throw skillsError;

        if (skillsData) {
          setSkills(skillsData);
        }

        const { data: adminData } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminData) {
          setIsAdmin(true);
        }

        const { data: progressData } = await supabase
          .from('user_path_progress')
          .select('completed_lessons')
          .eq('user_id', user.id);

        if (progressData) {
          const allCompletedLessons = progressData.flatMap(p => p.completed_lessons || []);
          const hasModule5Access = allCompletedLessons.some((lessonId: string) =>
            lessonId.startsWith('lesson-5-') || lessonId.startsWith('productivity-lesson-5-')
          );
          setCommandCenterUnlocked(hasModule5Access);
        }

        try {
          await supabase.rpc('check_and_award_badges', { p_user_id: user.id });
        } catch (badgeError) {
          logError(badgeError, 'Dashboard - check_and_award_badges');
        }

        const { data: badgesData } = await supabase
          .from('user_badges')
          .select(`
            badge_id,
            badges (
              name,
              icon,
              color,
              rarity
            )
          `)
          .eq('user_id', user.id)
          .limit(6);

        if (badgesData) {
          const formattedBadges = badgesData
            .filter(item => item.badges)
            .map(item => ({
              badge_id: item.badge_id,
              name: (item.badges as any).name,
              icon: (item.badges as any).icon,
              color: (item.badges as any).color,
              rarity: (item.badges as any).rarity
            }));
          setBadges(formattedBadges);
        }

        setLoading(false);
      } catch (err) {
        logError(err, 'Dashboard - loadUserData');
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  const currentLevel = fluencyLevels.find(l => l.level === profile?.fluency_level) || fluencyLevels[0];
  const nextLevel = fluencyLevels.find(l => l.level === (profile?.fluency_level || 0) + 1);
  const xpProgress = nextLevel
    ? ((profile?.xp || 0) - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100
    : 100;

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-500 border-2 border-black p-3">
              <AlertCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                Unable to Load Dashboard
              </h2>
              <p className="text-base leading-relaxed text-gray-700">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <nav className="bg-[#F4F4F4] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="font-extrabold text-xl uppercase tracking-tight">
            PROJECT SAPIENS
          </h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="flex items-center gap-2 bg-[#FF6A00] text-black border border-black px-4 py-2 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Shield className="w-4 h-4" strokeWidth={2} />
                ADMIN
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-white text-black border border-black px-4 py-2 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              SIGN OUT
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-extrabold text-2xl md:text-3xl lg:text-4xl uppercase tracking-tighter mb-2">
                  WELCOME BACK, {profile?.username || 'SAPIENS'}
                </h2>
                <p className="text-base md:text-lg leading-relaxed">
                  Continue building your AI mastery.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={onBillingClick}
                  className="bg-white border border-black px-4 py-2 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" strokeWidth={2} />
                  BILLING
                </button>
                <button
                  onClick={onProfileClick}
                  className="bg-white border border-black px-4 py-2 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  SETTINGS
                </button>
              </div>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                    MY LEARNING PATH
                  </h3>
                  <p className="text-sm">Start your AI learning journey</p>
                </div>
                <BookOpen className="w-8 h-8" strokeWidth={2} />
              </div>

              <button
                onClick={onPathsListClick}
                className="bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                CHOOSE A PATH
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  MY LABS
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { name: 'WRITING LAB', id: 'writing-lab' },
                  { name: 'ANALYSIS LAB', id: 'analysis-lab' },
                  { name: 'CREATIVE LAB', id: 'creative-lab' }
                ].map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => onLabSelect?.(lab.id)}
                    className="bg-white text-black border border-black px-4 py-3 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    {lab.name}
                  </button>
                ))}
              </div>

              <button
                onClick={onLabsClick}
                className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                VIEW ALL LABS
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  THE NETWORK
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Connect with peers, share projects, and find mentors.
              </p>
              <button
                onClick={onNetworkClick}
                className="w-full bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                EXPLORE NETWORK
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <BookmarkPlus className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  PROMPT LIBRARY
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Discover powerful prompts, create your own, and organize your favorites.
              </p>
              <button
                onClick={onPromptsClick}
                className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                BROWSE PROMPTS
              </button>
            </div>

            <div className={`border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000] ${commandCenterUnlocked ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FFE4B5]' : 'bg-gray-100 opacity-75'}`}>
              <div className="flex items-center gap-3 mb-6">
                <Target className={`w-8 h-8 ${commandCenterUnlocked ? 'text-[#F4A261]' : 'text-gray-400'}`} strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  COMMAND CENTER
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                {commandCenterUnlocked
                  ? 'Your AI-powered hub for managing work, learning, and life. Built in Module 5!'
                  : 'Unlock this feature by reaching Module 5 in either "AI for Everyday Life" or "AI for Productivity" path.'}
              </p>
              <button
                onClick={commandCenterUnlocked ? onCommandCenterClick : undefined}
                disabled={!commandCenterUnlocked}
                className={`w-full border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] transition-all ${
                  commandCenterUnlocked
                    ? 'bg-[#F4A261] text-white hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                {commandCenterUnlocked ? (
                  'OPEN COMMAND CENTER'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" strokeWidth={2} />
                    LOCKED - REACH MODULE 5
                  </span>
                )}
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  PROJECTS
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Build AI-powered projects, showcase your work, and learn from the community.
              </p>
              <button
                onClick={onProjectsClick}
                className="w-full bg-[#0A74FF] text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                VIEW PROJECTS
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  MY BADGES
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Track your achievements, earn badges, and showcase your AI fluency journey.
              </p>
              <button
                onClick={onBadgesClick}
                className="w-full bg-[#F59E0B] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                VIEW BADGES
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  MY JOURNAL
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Review your reflections and insights from completed lessons.
              </p>
              <button
                onClick={onJournalClick}
                className="w-full bg-[#10b981] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                VIEW JOURNAL
              </button>
            </div>

            <div className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  COMMUNITY FEED
                </h3>
              </div>

              <div className="space-y-4">
                <div className="border border-black p-4">
                  <p className="text-sm font-semibold mb-1">NEW CHALLENGE LIVE</p>
                  <p className="text-sm">Build an AI-powered content pipeline. 7 days left.</p>
                </div>
                <div className="border border-black p-4">
                  <p className="text-sm font-semibold mb-1">WEEKLY PROMPT DROP</p>
                  <p className="text-sm">Check out the latest community-shared workflows.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-black p-4 md:p-6 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                AI FLUENCY
              </h3>

              <div className="mb-6">
                <div className="text-3xl font-extrabold uppercase mb-1">
                  LEVEL {currentLevel.level}: {currentLevel.title}
                </div>
                <p className="text-sm">{currentLevel.subtitle}</p>
              </div>

              {nextLevel && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>{profile?.xp || 0} XP</span>
                    <span>{nextLevel.xpRequired} XP TO LEVEL {nextLevel.level}</span>
                  </div>
                  <div className="h-6 bg-[#F4F4F4] border border-black relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#FF6A00]"
                      style={{ width: `${Math.min(xpProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-black p-4 md:p-6 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                SKILL PROGRESS
              </h3>

              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.skill_name}>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="uppercase">{skill.skill_name}</span>
                        <span>{skill.progress_percentage}%</span>
                      </div>
                      <div className="h-4 bg-[#F4F4F4] border border-black relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-[#0A74FF]"
                          style={{ width: `${skill.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">No skills tracked yet. Start a learning path to begin.</p>
              )}
            </div>

            <div className="bg-white border border-black p-4 md:p-6 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6" strokeWidth={2} />
                <h3 className="font-extrabold text-lg uppercase tracking-tight">
                  MY BADGES
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {badges.length > 0 ? (
                  <>
                    {badges.map((badge) => {
                      const IconComponent = getIconComponent(badge.icon);
                      return (
                        <div
                          key={badge.badge_id}
                          className="aspect-square border border-black flex items-center justify-center"
                          style={{ backgroundColor: badge.color + '20' }}
                          title={badge.name}
                        >
                          {IconComponent && (
                            <IconComponent
                              className="w-8 h-8"
                              strokeWidth={2}
                              style={{ color: badge.color }}
                            />
                          )}
                        </div>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 6 - badges.length) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square border border-black bg-[#F4F4F4] flex items-center justify-center"
                      >
                        <span className="text-2xl opacity-30">?</span>
                      </div>
                    ))}
                  </>
                ) : (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square border border-black bg-[#F4F4F4] flex items-center justify-center"
                    >
                      <span className="text-2xl opacity-30">?</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
