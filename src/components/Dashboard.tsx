import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, PenLine, ListTodo, Scale, Eye,
  Menu, X, LogOut, Settings, CreditCard, HelpCircle,
  Compass, Beaker, Layers, Shield, ArrowRight,
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
}

type QuickAction = 'write' | 'plan' | 'decide' | 'review';

const QUICK_ACTIONS: { id: QuickAction; label: string; icon: typeof PenLine; hint: string }[] = [
  { id: 'write',  label: 'Write',  icon: PenLine, hint: 'Turn thoughts into clear writing' },
  { id: 'plan',   label: 'Plan',   icon: ListTodo, hint: 'Break a goal into steps' },
  { id: 'decide', label: 'Decide', icon: Scale,    hint: 'Weigh options with AI' },
  { id: 'review', label: 'Review', icon: Eye,      hint: 'Get feedback on something' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({
  onLabsClick,
  onPathsListClick,
  onCommandCenterClick,
  onBillingClick,
  onProfileClick,
  onHelpClick,
  onAdminClick,
  onPathSelect,
}: DashboardProps) {
  const { user, signOut } = useAuth();
  const [username,     setUsername]     = useState<string>('');
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [input,        setInput]        = useState('');
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

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
  }, [input]);

  const firstName = username ? username.split(/[ _.]/)[0] : '';

  const suggestions = [
    'Draft a follow-up email I\'ve been putting off',
    'Turn a rough idea into a structured plan',
    'Rewrite something I wrote to sound more professional',
  ];

  const handleQuickAction = (id: QuickAction) => {
    if (id === 'write') onPathSelect?.('ai-writing-systems');
    else onPathsListClick?.();
  };

  const handleSend = () => {
    if (!input.trim()) return;
    // Route the raw intent into the writing workspace for now.
    onPathSelect?.('ai-writing-systems');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
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

        {/* Suggested actions */}
        <section className="mt-8">
          <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
            Suggested
          </p>
          <ul className="divide-y divide-neutral-100 border-y border-neutral-100">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSuggestion(s)}
                  className="w-full flex items-center gap-3 py-4 text-left group"
                >
                  <span className="flex-1 text-[16px] text-neutral-800 leading-snug">
                    {s}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-neutral-400 group-hover:text-[#FF6A00] transition-colors shrink-0"
                    strokeWidth={2}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Input */}
        <section className="mt-10">
          <div className="relative flex items-end gap-2 border-b border-neutral-300 focus-within:border-neutral-900 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="What do you want to move forward today?"
              className="flex-1 bg-transparent resize-none outline-none py-3 pr-12 text-[17px] leading-relaxed placeholder:text-neutral-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              className="absolute right-0 bottom-2 w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6A00] text-white disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors hover:bg-[#e95f00]"
            >
              <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* Quick start */}
        <section className="mt-8">
          <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
            Quick start
          </p>
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {QUICK_ACTIONS.map(a => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleQuickAction(a.id)}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-[15px] font-medium text-neutral-900 transition-colors"
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Secondary workspace links */}
        <section className="mt-12">
          <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
            Workspaces
          </p>
          <ul className="divide-y divide-neutral-100">
            <SecondaryRow
              icon={Compass}
              label="Workflows"
              hint="AI-powered learning paths"
              onClick={onPathsListClick}
            />
            <SecondaryRow
              icon={Beaker}
              label="Writing Lab"
              hint="Open the AI writing workspace"
              onClick={onLabsClick}
            />
            <SecondaryRow
              icon={Layers}
              label="Command Center"
              hint="Projects, tasks, calendar"
              onClick={onCommandCenterClick}
            />
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
              <MenuRow icon={Compass}    label="Workflows"      onClick={() => { setMenuOpen(false); onPathsListClick?.(); }} />
              <MenuRow icon={Beaker}     label="Writing Lab"    onClick={() => { setMenuOpen(false); onLabsClick?.(); }} />
              <MenuRow icon={Layers}     label="Command Center" onClick={() => { setMenuOpen(false); onCommandCenterClick?.(); }} />
              <MenuRow icon={Settings}   label="Settings"       onClick={() => { setMenuOpen(false); onProfileClick?.(); }} />
              <MenuRow icon={CreditCard} label="Billing"        onClick={() => { setMenuOpen(false); onBillingClick?.(); }} />
              <MenuRow icon={HelpCircle} label="Help"           onClick={() => { setMenuOpen(false); onHelpClick?.(); }} />
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
