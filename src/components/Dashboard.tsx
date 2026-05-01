import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, PenLine, ListTodo, Scale, Eye,
  Menu, X, LogOut, Settings, CreditCard, HelpCircle,
  Compass, History, Shield, ArrowRight, Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  onStartWriting?: (text: string, autoSend?: boolean) => void;
  onRunWorkflow?: (workflowId: 'write' | 'plan' | 'decide' | 'review', text: string, autoSend?: boolean) => void;
  onReviewClick?: () => void;
}

type QuickAction = 'write' | 'plan' | 'decide' | 'review';

const QUICK_ACTIONS: { id: QuickAction; label: string; icon: typeof PenLine }[] = [
  { id: 'write',  label: 'Write',  icon: PenLine },
  { id: 'plan',   label: 'Plan',   icon: ListTodo },
  { id: 'decide', label: 'Decide', icon: Scale },
  { id: 'review', label: 'Review', icon: Eye },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface Suggestion {
  title: string;
  context: string;
  prefill: string;
  autoSend: boolean;
  workflow: QuickAction;
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1)    return 'just now';
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'yesterday';
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function truncate(text: string, n: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n - 1) + '…' : clean;
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    title: 'Draft a message you\'ve been putting off',
    context: 'Runs the Write workflow',
    prefill: '',
    autoSend: false,
    workflow: 'write',
  },
  {
    title: 'Turn a rough idea into a structured plan',
    context: 'Runs the Plan workflow',
    prefill: '',
    autoSend: false,
    workflow: 'plan',
  },
  {
    title: 'Get sharp feedback on something you wrote',
    context: 'Runs the Review workflow',
    prefill: '',
    autoSend: false,
    workflow: 'review',
  },
];

export default function Dashboard({
  onPathsListClick,
  onBillingClick,
  onProfileClick,
  onHelpClick,
  onAdminClick,
  onStartWriting,
  onRunWorkflow,
  onReviewClick,
}: DashboardProps) {
  const { user, signOut } = useAuth();
  const [username, setUsername]       = useState<string>('');
  const [menuOpen, setMenuOpen]       = useState(false);
  const [isAdmin,  setIsAdmin]        = useState(false);
  const [input,    setInput]          = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.username) setUsername(data.username);

      const { data: admin } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (admin) setIsAdmin(true);
    })();
  }, [user]);

  // Load recent activity from Supabase to build contextual suggestions.
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingSuggestions(true);
      const { data: recent } = await supabase
        .from('lab_experiments')
        .select('prompt, output, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const personalized: Suggestion[] = [];

      if (recent && recent.length > 0) {
        const last = recent[0];
        if (last.output) {
          personalized.push({
            title: 'Refine your last writing draft',
            context: `From your last session · ${relativeTime(last.created_at)}`,
            prefill: last.output,
            autoSend: true,
            workflow: 'write',
          });
        }

        const olderThanToday = recent.find(r => {
          const d = new Date(r.created_at);
          return Date.now() - d.getTime() > 18 * 60 * 60 * 1000;
        });
        if (olderThanToday && personalized.length < 3) {
          const snippet = truncate(olderThanToday.prompt || olderThanToday.output || '', 70);
          personalized.push({
            title: 'Follow up on yesterday\'s idea',
            context: `Picked up from "${snippet}"`,
            prefill: olderThanToday.output || olderThanToday.prompt || '',
            autoSend: true,
            workflow: 'write',
          });
        }

        if (recent.length >= 3 && personalized.length < 3) {
          personalized.push({
            title: 'Turn your recent work into a weekly plan',
            context: `Suggested based on your activity · ${recent.length} recent drafts`,
            prefill: recent[0].output || recent[0].prompt || '',
            autoSend: true,
            workflow: 'plan',
          });
        }
      }

      // Always fill to 3 using defaults for slots not taken
      const filled = [...personalized];
      for (const d of DEFAULT_SUGGESTIONS) {
        if (filled.length >= 3) break;
        filled.push(d);
      }

      setSuggestions(filled.slice(0, 3));
      setLoadingSuggestions(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 220) + 'px';
  }, [input]);

  const firstName = username ? username.split(/[ _.]/)[0] : '';

  const runWorkflow = (id: QuickAction, text: string, autoSend: boolean) => {
    if (onRunWorkflow) onRunWorkflow(id, text, autoSend);
    else onStartWriting?.(text, autoSend); // legacy fallback
  };

  const handleQuickAction = (a: typeof QUICK_ACTIONS[number]) => {
    const text = input.trim();
    runWorkflow(a.id, text, !!text);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    runWorkflow('write', text, true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: Suggestion) => {
    runWorkflow(s.workflow, s.prefill, s.autoSend);
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">

      {/* ─── Top bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="text-[15px] font-semibold tracking-tight">Today</span>
          <span className="flex-1" />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="p-2 -mr-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ─── Today body ───────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-8 pb-40">

        {/* Greeting */}
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-neutral-900">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-2 text-[17px] text-neutral-500">
          Here's what matters today.
        </p>

        {/* Primary input — elevated as the main action */}
        <section className="mt-8">
          <div className="relative flex items-end gap-2 border-b-2 border-neutral-900 focus-within:border-[#FF6A00] transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="What do you want to move forward right now?"
              className="flex-1 bg-transparent resize-none outline-none py-4 pr-14 text-[19px] leading-relaxed placeholder:text-neutral-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              className="absolute right-0 bottom-2.5 w-11 h-11 flex items-center justify-center rounded-full bg-[#FF6A00] text-white disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors hover:bg-[#e95f00] shadow-sm"
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick start */}
          <div className="mt-4 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {QUICK_ACTIONS.map(a => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleQuickAction(a)}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-[14px] font-medium text-neutral-900 transition-colors"
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Suggestions — personalized, contextual */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
            <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400">
              Suggested for you
            </p>
          </div>

          {loadingSuggestions ? (
            <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
              {[0,1,2].map(i => (
                <li key={i} className="py-5">
                  <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-neutral-100 rounded mt-2 animate-pulse" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSuggestion(s)}
                    className="w-full flex items-center gap-3 py-4 text-left group"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[16px] text-neutral-900 leading-snug">
                        {s.title}
                      </span>
                      <span className="block text-[12px] text-neutral-500 mt-1">
                        {s.context}
                      </span>
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-neutral-400 group-hover:text-[#FF6A00] group-hover:translate-x-0.5 transition-all shrink-0"
                      strokeWidth={2}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Secondary nav */}
        <section className="mt-12">
          <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
            Elsewhere
          </p>
          <ul className="divide-y divide-neutral-100">
            <SecondaryRow icon={Compass} label="Workflows" hint="All capabilities in one place" onClick={onPathsListClick} />
            <SecondaryRow icon={History} label="Review"    hint="Your past sessions and drafts" onClick={onReviewClick} />
          </ul>
        </section>

      </main>

      {/* ─── Side menu (secondary nav) ────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            onClick={e => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col"
          >
            <div className="h-14 px-4 flex items-center gap-3 border-b border-neutral-100">
              <span className="flex-1 text-[15px] font-semibold tracking-tight">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-2">
              {username && (
                <div className="px-3 py-3 text-[13px] text-neutral-500">
                  Signed in as <span className="text-neutral-900 font-medium">{username}</span>
                </div>
              )}
              <MenuRow icon={Compass}    label="Workflows" onClick={() => { setMenuOpen(false); onPathsListClick?.(); }} />
              <MenuRow icon={History}    label="Review"    onClick={() => { setMenuOpen(false); onReviewClick?.(); }} />
              <MenuRow icon={Settings}   label="Settings"  onClick={() => { setMenuOpen(false); onProfileClick?.(); }} />
              <MenuRow icon={CreditCard} label="Billing"   onClick={() => { setMenuOpen(false); onBillingClick?.(); }} />
              <MenuRow icon={HelpCircle} label="Help"      onClick={() => { setMenuOpen(false); onHelpClick?.(); }} />
              {isAdmin && (
                <MenuRow icon={Shield} label="Admin" onClick={() => { setMenuOpen(false); onAdminClick?.(); }} />
              )}
            </nav>

            <div className="px-2 py-2 border-t border-neutral-100">
              <MenuRow icon={LogOut} label="Sign out" onClick={() => signOut()} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SecondaryRow({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: typeof Compass;
  label: string;
  hint: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 py-4 text-left group"
      >
        <Icon className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 transition-colors shrink-0" strokeWidth={2} />
        <span className="flex-1 min-w-0">
          <span className="block text-[16px] text-neutral-900">{label}</span>
          <span className="block text-[13px] text-neutral-500 truncate">{hint}</span>
        </span>
        <ArrowRight
          className="w-4 h-4 text-neutral-300 group-hover:text-[#FF6A00] transition-colors shrink-0"
          strokeWidth={2}
        />
      </button>
    </li>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Compass;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-100 text-left transition-colors"
    >
      <Icon className="w-[18px] h-[18px] text-neutral-600" strokeWidth={2} />
      <span className="text-[15px] text-neutral-900">{label}</span>
    </button>
  );
}
