import { useEffect, useState, type CSSProperties } from 'react';
import { BookOpen, Code, Zap, Trophy, LogOut, Users, BookmarkPlus, Footprints, Flame, Compass, Beaker, Network as NetworkIcon, Sparkles, Rocket, Target, Shield, Lock, LucideIcon, AlertCircle, CreditCard, HelpCircle, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError, getErrorMessage } from '../utils/errorHandling';

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
  onHelpClick?: () => void;
}

const fluencyLevels = [
  { level: 1, title: 'Collaborator', subtitle: 'AI Fundamentals', xpRequired: 0 },
  { level: 2, title: 'Practitioner', subtitle: 'Workflow Designer', xpRequired: 1000 },
  { level: 3, title: 'Integrator', subtitle: 'System Builder', xpRequired: 4000 },
  { level: 4, title: 'Leader', subtitle: 'Solution Architect', xpRequired: 10000 },
];

const workspaceBrand = {
  name: 'Project Sapiens Academy',
  platformLabel: 'Project Sapiens',
  logoUrl: '',
  primaryColor: '#FF6A00',
  secondaryColor: '#0A74FF',
  backgroundColor: '#F4F4F4',
};

const dashboardActions = [
  {
    title: 'Learning programs',
    description: 'Assign paths, continue modules, and build a structured AI practice plan.',
    icon: BookOpen,
    cta: 'Choose a path',
    tone: 'primary' as const,
  },
  {
    title: 'AI practice labs',
    description: 'Practice writing, analysis, and creative workflows in guided AI environments.',
    icon: Code,
    cta: 'View all labs',
    tone: 'primary' as const,
  },
  {
    title: 'Prompt library',
    description: 'Collect reusable prompts and workflow patterns for everyday work.',
    icon: BookmarkPlus,
    cta: 'Browse prompts',
    tone: 'secondary' as const,
  },
  {
    title: 'Projects',
    description: 'Turn practice into portfolio-ready AI workflows and shareable outcomes.',
    icon: Rocket,
    cta: 'View projects',
    tone: 'secondary' as const,
  },
  {
    title: 'Network',
    description: 'Connect with peers, share projects, and find examples from other learners.',
    icon: Users,
    cta: 'Explore network',
    tone: 'secondary' as const,
  },
  {
    title: 'Badges',
    description: 'Track completion milestones and visible proof of AI fluency progress.',
    icon: Trophy,
    cta: 'View badges',
    tone: 'secondary' as const,
  },
  {
    title: 'Journal',
    description: 'Review reflections and lessons learned from completed exercises.',
    icon: BookOpen,
    cta: 'View journal',
    tone: 'secondary' as const,
  },
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

function ActionCard({
  title,
  description,
  icon: Icon,
  cta,
  onClick,
  primary = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  cta: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <div className="brand-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Icon className="h-8 w-8" strokeWidth={2} />
        <h3 className="font-extrabold text-xl uppercase tracking-tight">{title}</h3>
      </div>
      <p className="mb-6 text-sm leading-relaxed">{description}</p>
      <button
        onClick={onClick}
        className={`brand-button w-full ${primary ? 'brand-button-primary' : 'bg-white'}`}
      >
        {cta}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function WorkspaceLogo() {
  if (workspaceBrand.logoUrl) {
    return (
      <img
        src={workspaceBrand.logoUrl}
        alt={`${workspaceBrand.name} logo`}
        className="h-10 w-10 border border-ink object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center border border-ink bg-[var(--brand-primary)] font-extrabold text-sm uppercase text-ink shadow-[2px_2px_0px_var(--brand-ink)]">
      PS
    </div>
  );
}

export default function Dashboard({ onLabsClick, onNetworkClick, onPromptsClick, onBadgesClick, onProfileClick, onJournalClick, onProjectsClick, onCommandCenterClick, onPathSelect, onLabSelect, onPathsListClick, onAdminClick, onBillingClick, onHelpClick }: DashboardProps) {
  const { user, signOut } = useAuth();
  const isDevDashboardPreview = import.meta.env.DEV && window.location.pathname === '/dev/pro-dashboard-preview';
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

        if (isDevDashboardPreview) {
          setProfile({ username: 'Preview User', fluency_level: 2, xp: 2600 });
          setSkills([
            { skill_name: 'Prompt design', progress_percentage: 72 },
            { skill_name: 'Workflow mapping', progress_percentage: 58 },
            { skill_name: 'AI review habits', progress_percentage: 44 },
          ]);
          setBadges([
            { badge_id: 'starter', name: 'First workflow', icon: 'Footprints', color: '#2563eb', rarity: 'common' },
            { badge_id: 'builder', name: 'Workflow builder', icon: 'Flask', color: '#16a34a', rarity: 'rare' },
            { badge_id: 'spark', name: 'Prompt spark', icon: 'Sparkles', color: '#d97706', rarity: 'rare' },
          ]);
          setIsAdmin(true);
          setCommandCenterUnlocked(true);
          setLoading(false);
          return;
        }

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
  }, [user, isDevDashboardPreview]);

  const currentLevel = fluencyLevels.find(l => l.level === profile?.fluency_level) || fluencyLevels[0];
  const nextLevel = fluencyLevels.find(l => l.level === (profile?.fluency_level || 0) + 1);
  const xpProgress = nextLevel
    ? ((profile?.xp || 0) - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100
    : 100;

  const actionHandlers: Record<string, (() => void) | undefined> = {
    'Learning programs': onPathsListClick,
    'AI practice labs': onLabsClick,
    'Prompt library': onPromptsClick,
    'Projects': onProjectsClick,
    'Network': onNetworkClick,
    'Badges': onBadgesClick,
    'Journal': onJournalClick,
  };

  if (loading) {
    return (
      <div className="brand-page flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-ink border-t-[var(--brand-primary)] animate-spin"></div>
          <p className="mt-4 font-semibold uppercase tracking-tight">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-page flex items-center justify-center p-4">
        <div className="brand-card w-full max-w-md p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-500 border-2 border-ink p-3">
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
            className="brand-button brand-button-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="brand-page"
      style={{
        '--brand-primary': workspaceBrand.primaryColor,
        '--brand-secondary': workspaceBrand.secondaryColor,
        '--brand-bg': workspaceBrand.backgroundColor,
      } as CSSProperties}
    >
      <nav className="bg-[var(--brand-bg)] border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WorkspaceLogo />
            <div>
              <h1 className="font-extrabold text-base md:text-xl uppercase tracking-tight leading-tight">
                {workspaceBrand.name}
              </h1>
              <p className="hidden text-xs font-semibold text-[var(--brand-muted)] sm:block">
                Powered by {workspaceBrand.platformLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="brand-button brand-button-primary px-3 py-2"
                title="Admin"
              >
                <Shield className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">ADMIN</span>
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="brand-button bg-white px-3 py-2"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <section className="mb-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-extrabold text-2xl md:text-3xl lg:text-4xl uppercase tracking-tighter mb-2">
              Welcome back, {profile?.username || 'Sapiens'}
            </h2>
            <p className="text-base md:text-lg leading-relaxed">
              Continue building your AI mastery.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onPathsListClick} className="brand-button brand-button-primary">
                Continue learning
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <button onClick={onLabsClick} className="brand-button bg-white">
                Open labs
              </button>
            </div>
          </div>

          <aside className="brand-card p-4 md:p-6">
            <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
              AI Fluency
            </h3>
            <div className="mb-6">
              <div className="text-3xl font-extrabold uppercase mb-1">
                Level {currentLevel.level}: {currentLevel.title}
              </div>
              <p className="text-sm">{currentLevel.subtitle}</p>
            </div>

            {nextLevel && (
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>{profile?.xp || 0} XP</span>
                  <span>{nextLevel.xpRequired} XP TO LEVEL {nextLevel.level}</span>
                </div>
                <div className="h-6 bg-surface border border-ink relative overflow-hidden">
                  <div
                    className="brand-progress absolute inset-y-0 left-0"
                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </aside>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {dashboardActions.map((action) => (
                <ActionCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  cta={action.cta}
                  onClick={actionHandlers[action.title]}
                  primary={action.tone === 'primary'}
                />
              ))}
            </div>

            <div className={`brand-card p-6 md:p-8 ${commandCenterUnlocked ? 'bg-gradient-to-br from-cream to-[#FFE4B5]' : 'bg-gray-100 opacity-75'}`}>
              <div className="flex items-center gap-3 mb-6">
                <Target className={`w-8 h-8 ${commandCenterUnlocked ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`} strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  Command Center
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
                className={`brand-button w-full ${
                  commandCenterUnlocked
                    ? 'brand-button-primary cursor-pointer'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                {commandCenterUnlocked ? (
                  'Open Command Center'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" strokeWidth={2} />
                    Locked - Reach Module 5
                  </span>
                )}
              </button>
            </div>

            <div className="brand-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8" strokeWidth={2} />
                <h3 className="font-extrabold text-xl uppercase tracking-tight">
                  Community Feed
                </h3>
              </div>
              <div className="space-y-4">
                <div className="border border-ink p-4">
                  <p className="text-sm font-semibold mb-1">New Challenge Live</p>
                  <p className="text-sm">Build an AI-powered content pipeline. 7 days left.</p>
                </div>
                <div className="border border-ink p-4">
                  <p className="text-sm font-semibold mb-1">Weekly Prompt Drop</p>
                  <p className="text-sm">Check out the latest community-shared workflows.</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="brand-card p-4 md:p-6">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                Skill Progress
              </h3>
              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.skill_name}>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="uppercase">{skill.skill_name}</span>
                        <span>{skill.progress_percentage}%</span>
                      </div>
                      <div className="h-4 bg-surface border border-ink relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-[var(--brand-secondary)]"
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

            <div className="brand-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6" strokeWidth={2} />
                <h3 className="font-extrabold text-lg uppercase tracking-tight">
                  My Badges
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
                          className="aspect-square border border-ink flex items-center justify-center"
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
                        className="aspect-square border border-ink bg-surface flex items-center justify-center"
                      >
                        <span className="text-2xl opacity-30">?</span>
                      </div>
                    ))}
                  </>
                ) : (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square border border-ink bg-surface flex items-center justify-center"
                    >
                      <span className="text-2xl opacity-30">?</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="brand-card p-4 md:p-6">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">Quick Settings</h3>
              <div className="grid gap-3">
                <button onClick={onHelpClick} className="brand-button w-full justify-start bg-white">
                  <HelpCircle className="h-4 w-4" strokeWidth={2} />
                  Help
                </button>
                <button onClick={onBillingClick} className="brand-button w-full justify-start bg-white">
                  <CreditCard className="h-4 w-4" strokeWidth={2} />
                  Billing
                </button>
                <button onClick={onProfileClick} className="brand-button w-full justify-start bg-white">
                  <Settings className="h-4 w-4" strokeWidth={2} />
                  Settings
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
