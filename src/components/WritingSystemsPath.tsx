import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, Copy, CheckCircle2, RefreshCw,
  ChevronRight, AlignLeft, Minimize2, Briefcase, TrendingUp,
  ChevronDown, ChevronUp, Lightbulb, Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBilling } from '../contexts/BillingContext';
import { supabase } from '../lib/supabase';
import UpgradeModal from './UpgradeModal';
import { writingSystemsPath, WritingMission } from '../data/writingSystemsPath';

interface WritingSystemsPathProps {
  onBack?: () => void;
  onLabOpen?: (labId: string) => void;
}

interface OutputVersion {
  id: string;
  label: string;
  text: string;
  mode: string;
}

const IMPROVE_ACTIONS = [
  { mode: 'rewrite_clearer',           label: 'Clearer',      icon: AlignLeft  },
  { mode: 'rewrite_shorter',           label: 'Shorter',      icon: Minimize2  },
  { mode: 'rewrite_more_professional', label: 'Professional', icon: Briefcase  },
  { mode: 'rewrite_more_persuasive',   label: 'Persuasive',   icon: TrendingUp },
];

const IMPROVE_PROMPTS: Record<string, string> = {
  rewrite_clearer:           'Rewrite this to be clearer and easier to understand:\n\n',
  rewrite_shorter:           'Rewrite this to be shorter while keeping the core message:\n\n',
  rewrite_more_professional: 'Make this sound more professional and confident, while keeping the message intact:\n\n',
  rewrite_more_persuasive:   'Rewrite this to be more persuasive and compelling:\n\n',
};

// One-line coaching tip per mission
const MISSION_TIPS: Record<string, string> = {
  'raw-ideas-to-clear-writing': 'Tip: Dump your thoughts first — messy is fine. Refine after.',
  'rewrite-for-impact':         'Tip: Same message, different effect. Tone controls how people feel.',
  'build-content-engine':       'Tip: One idea can produce a week of content. Let AI multiply it.',
};

export default function WritingSystemsPath({ onBack, onLabOpen }: WritingSystemsPathProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();
  const { missions } = writingSystemsPath;

  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [activeStepIndex,    setActiveStepIndex]    = useState(0);
  const [completedStepKeys,  setCompletedStepKeys]  = useState<Set<string>>(new Set());

  const [userInput,      setUserInput]      = useState('');
  const [streaming,      setStreaming]      = useState(false);
  const [streamingText,  setStreamingText]  = useState('');
  const [outputVersions, setOutputVersions] = useState<OutputVersion[]>([]);
  const [copied,         setCopied]         = useState<string | null>(null);
  const [limitInfo,      setLimitInfo]      = useState<{ limit: number; used: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Collapsible secondary sections
  const [whyOpen,       setWhyOpen]       = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);

  // Mission dropdown (mobile)
  const [missionMenuOpen, setMissionMenuOpen] = useState(false);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const stickyInputRef = useRef<HTMLTextAreaElement>(null);

  const activeMission: WritingMission = missions[activeMissionIndex];
  const activeStep   = activeMission.steps[activeStepIndex];
  const latestOutput = outputVersions[outputVersions.length - 1]?.text ?? '';
  const hasOutput    = outputVersions.length > 0;

  const totalSteps     = missions.reduce((sum, m) => sum + m.steps.length, 0);
  const completedCount = completedStepKeys.size;
  const progressPct    = Math.round((completedCount / totalSteps) * 100);

  const currentStepKey  = `${activeMission.missionId}:${activeStep.stepId}`;
  const currentStepDone = completedStepKeys.has(currentStepKey);

  const isLastStep =
    activeMissionIndex === missions.length - 1 &&
    activeStepIndex    === activeMission.steps.length - 1;
  const allDone = isLastStep && currentStepDone;

  const nextLabel =
    activeStepIndex < activeMission.steps.length - 1
      ? activeMission.steps[activeStepIndex + 1].title
      : missions[activeMissionIndex + 1]?.title ?? '';

  // ── Effects ───────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText, outputVersions.length]);

  useEffect(() => {
    [inputRef, stickyInputRef].forEach(ref => {
      if (!ref.current) return;
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px';
    });
  }, [userInput]);

  useEffect(() => {
    if (!missionMenuOpen) return;
    const close = (e: MouseEvent) => {
      setMissionMenuOpen(false);
      e.stopPropagation();
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [missionMenuOpen]);

  // ── AI ────────────────────────────────────────────────────────
  const callAI = useCallback(
    async (prompt: string, mode: string, onChunk: (t: string) => void): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Authentication required');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            labId: 'writing-lab',
            mode: mode === 'freeform' ? undefined : mode,
            conversationHistory: [],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429 && err.error === 'limit_reached') {
          setLimitInfo(
            typeof err.limit === 'number' && typeof err.used === 'number' ? err : null
          );
          await refreshUsageStatus();
          throw new Error('LIMIT_REACHED');
        }
        throw new Error(err.error || 'Failed');
      }

      if (!res.body) throw new Error('Empty stream');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', full = '';

      const parseEvent = (raw: string) => {
        const payload = raw
          .split(/\r?\n/)
          .filter(l => l.startsWith('data: '))
          .map(l => l.slice(6).trim())
          .join('');
        if (!payload || payload === '[DONE]') return;
        try {
          const p     = JSON.parse(payload);
          const chunk = p?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof chunk === 'string' && chunk.length > 0) { full += chunk; onChunk(full); }
        } catch { /* skip */ }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split(/\r?\n\r?\n/);
        buf = events.pop() || '';
        events.forEach(parseEvent);
      }
      buf += decoder.decode();
      if (buf.trim()) parseEvent(buf);
      return full;
    },
    [refreshUsageStatus]
  );

  const saveExperiment = useCallback(async (prompt: string, output: string) => {
    if (!user) return;
    await supabase.from('lab_experiments').insert({
      user_id: user.id,
      lab_id:  'writing-lab',
      prompt,
      output,
    });
  }, [user]);

  const runAI = async (prompt: string, mode: string, label: string) => {
    if (streaming) return;
    setStreaming(true);
    setStreamingText('');
    try {
      const full = await callAI(prompt, mode, t => setStreamingText(t));
      if (full) {
        setOutputVersions(prev => [
          ...prev,
          { id: `v${Date.now()}`, label, text: full, mode },
        ]);
        setCompletedStepKeys(prev => new Set([...prev, currentStepKey]));
        await saveExperiment(prompt, full);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'LIMIT_REACHED') setShowUpgradeModal(true);
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  };

  const handleSend = () => {
    const text = userInput.trim();
    if (!text || streaming) return;
    const prompt = activeStep.promptTemplate
      .replace('{{user_input}}', text)
      .replace('{{previous_output}}', latestOutput || text);
    setUserInput('');
    runAI(prompt, activeStep.mode, activeStep.title);
  };

  const handleImprove = (mode: string, label: string) => {
    if (!latestOutput || streaming) return;
    runAI((IMPROVE_PROMPTS[mode] || '') + latestOutput, mode, label);
  };

  const handleNextStep = () => {
    if (activeStepIndex < activeMission.steps.length - 1) {
      setActiveStepIndex(s => s + 1);
    } else if (activeMissionIndex < missions.length - 1) {
      setActiveMissionIndex(m => m + 1);
      setActiveStepIndex(0);
    }
    setOutputVersions([]);
    setUserInput('');
    setWhyOpen(false);
    setChallengeOpen(false);
  };

  const switchMission = (mi: number) => {
    setActiveMissionIndex(mi);
    setActiveStepIndex(0);
    setOutputVersions([]);
    setUserInput('');
    setWhyOpen(false);
    setChallengeOpen(false);
    setMissionMenuOpen(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-[100dvh] bg-white overflow-hidden">

        {/* ══════════════════════════════════════════════════════
            Desktop sidebar (lg+) — minimal rail
        ══════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 h-full bg-white border-r border-gray-100 overflow-y-auto">

          <div className="px-5 py-5 border-b border-gray-100">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
          </div>

          <div className="px-5 py-5 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">
              Writing Path
            </p>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              AI Writing Systems
            </p>
            <div className="mt-3 h-0.5 bg-gray-100 w-full overflow-hidden rounded-full">
              <div
                className="h-full bg-orange-500 transition-all duration-700 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{completedCount} / {totalSteps} steps</p>
          </div>

          <nav className="px-3 py-4 flex-1">
            {missions.map((m, mi) => {
              const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
              const active = mi === activeMissionIndex;
              return (
                <button
                  key={m.missionId}
                  onClick={() => switchMission(mi)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-0.5 transition-colors ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    done   ? 'bg-orange-500 text-white' :
                    active ? 'bg-white text-gray-900' :
                             'bg-gray-100 text-gray-500'
                  }`}>
                    {done ? '✓' : mi + 1}
                  </span>
                  <span className="text-xs font-medium leading-snug line-clamp-2">
                    {m.title}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Step {activeStepIndex + 1} of {activeMission.steps.length}
            </p>
            <p className="text-xs font-semibold text-gray-800">{activeStep.title}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{activeStep.instruction}</p>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════
            Main workspace
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Top bar ── */}
          <header className="shrink-0 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3 px-4 h-13" style={{ height: '52px' }}>

              {/* Back */}
              <button
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-md text-gray-500 hover:text-black hover:bg-gray-50 transition-colors shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>

              {/* Title + progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    AI Writing Systems
                  </p>
                  <span className="text-xs font-semibold text-orange-500 shrink-0">
                    {progressPct}%
                  </span>
                </div>
                {/* Progress line */}
                <div className="mt-1 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-700 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile mission selector row */}
            <div className="lg:hidden flex items-center gap-2 px-4 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 shrink-0">
                M{activeMissionIndex + 1}
              </span>

              <div
                className="relative flex-1 min-w-0"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setMissionMenuOpen(o => !o)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black transition-colors"
                >
                  <span className="truncate max-w-[180px]">{activeMission.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${missionMenuOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                  />
                </button>

                {missionMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {missions.map((m, mi) => {
                      const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
                      const active = mi === activeMissionIndex;
                      return (
                        <button
                          key={m.missionId}
                          onClick={() => switchMission(mi)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 last:border-0 transition-colors ${
                            active ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            done   ? 'bg-orange-500 text-white' :
                            active ? 'bg-white text-gray-900' :
                                     'bg-gray-100 text-gray-500'
                          }`}>
                            {done ? '✓' : mi + 1}
                          </span>
                          <span className="text-xs font-medium leading-snug">{m.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Scrollable workspace ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-2xl mx-auto px-4 md:px-6 pt-6 pb-6 space-y-6">

              {/* ── Step context + one-line tip ── */}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[10px] font-bold bg-orange-500 text-white rounded px-1.5 py-0.5 shrink-0 uppercase tracking-wide">
                  Step {activeStepIndex + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeStep.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-orange-400 shrink-0" strokeWidth={2} />
                    {MISSION_TIPS[activeMission.missionId] ?? activeStep.instruction}
                  </p>
                </div>
              </div>

              {/* ── Initial input (no output yet) ── */}
              {!hasOutput && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                    }}
                    placeholder={activeMission.exampleInput}
                    className="w-full resize-none px-4 pt-4 pb-2 text-sm leading-relaxed bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400"
                    style={{ minHeight: '96px', maxHeight: '200px' }}
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5">
                    <button
                      onClick={() => setUserInput(activeMission.exampleInput)}
                      className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Use example
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!userInput.trim() || streaming}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {streaming
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                        : <Send className="w-3.5 h-3.5" strokeWidth={2} />
                      }
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* ── Output thread ── */}
              {outputVersions.length > 0 && (
                <div className="space-y-6">
                  {outputVersions.map((v, vi) => {
                    const isLatest = vi === outputVersions.length - 1;
                    return (
                      <div key={v.id}>
                        {/* Label */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            isLatest ? 'text-orange-500' : 'text-gray-300'
                          }`}>
                            {vi === 0 ? 'AI Response' : v.label}
                          </span>
                          {vi > 0 && (
                            <span className="text-[10px] text-gray-300">· improved</span>
                          )}
                        </div>

                        {/* Text — no heavy card on latest, soft bg on older */}
                        <div className={`relative group text-sm leading-relaxed whitespace-pre-wrap ${
                          isLatest
                            ? 'text-gray-900'
                            : 'text-gray-400 border-l-2 border-gray-100 pl-4'
                        }`}>
                          {v.text}
                          {/* Copy button */}
                          <button
                            onClick={() => copy(v.text, v.id)}
                            className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                              isLatest
                                ? 'text-gray-400 hover:text-gray-700'
                                : 'text-gray-300 hover:text-gray-500'
                            }`}
                          >
                            {copied === v.id
                              ? <><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" strokeWidth={2} /> Copied</>
                              : <><Copy className="w-3.5 h-3.5" strokeWidth={2} /> Copy</>
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming */}
                  {streaming && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2} />
                          Writing…
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 min-h-[32px]">
                        {streamingText || <span className="text-gray-300">…</span>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Divider before actions ── */}
              {latestOutput && !streaming && (
                <div className="border-t border-gray-100" />
              )}

              {/* ── Improve actions ── */}
              {latestOutput && !streaming && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-3">Improve this</p>
                  {/* Scrollable pills on mobile */}
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x">
                    {IMPROVE_ACTIONS.map(a => (
                      <button
                        key={a.mode}
                        onClick={() => handleImprove(a.mode, a.label)}
                        disabled={streaming}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 whitespace-nowrap shrink-0 snap-start hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-40 touch-manipulation"
                      >
                        <a.icon className="w-3.5 h-3.5" strokeWidth={2} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Next step — inline link style ── */}
              {latestOutput && !streaming && !allDone && (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors group"
                >
                  <Zap className="w-4 h-4 text-orange-400 group-hover:text-orange-500 shrink-0" strokeWidth={2} />
                  Next: {nextLabel}
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                </button>
              )}

              {/* ── Collapsible: Why this matters ── */}
              {currentStepDone && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setWhyOpen(o => !o)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" strokeWidth={2} />
                      Why this matters
                    </span>
                    {whyOpen
                      ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                      : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                  </button>
                  {whyOpen && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {activeMission.keyLesson}
                    </p>
                  )}
                </div>
              )}

              {/* ── Collapsible: Challenge ── */}
              {currentStepDone && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setChallengeOpen(o => !o)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" strokeWidth={2} />
                      Challenge
                    </span>
                    {challengeOpen
                      ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                      : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                  </button>
                  {challengeOpen && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {activeMission.challenge}
                    </p>
                  )}
                </div>
              )}

              {/* ── All done ── */}
              {allDone && (
                <div className="rounded-2xl bg-gray-900 text-white p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-orange-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-xl mb-2">Path Complete</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs mx-auto">
                    All three missions done. You now have a repeatable AI writing system.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onLabOpen && (
                      <button
                        onClick={() => onLabOpen('writing-lab')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-400 active:scale-95 transition-all touch-manipulation"
                      >
                        Open Writing Lab
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={onBack}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 text-sm font-semibold rounded-xl hover:border-gray-400 hover:text-white active:scale-95 transition-all touch-manipulation"
                    >
                      All Paths
                    </button>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Sticky bottom input (after first send) ── */}
          {hasOutput && !allDone && (
            <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3">
              <div className="max-w-2xl mx-auto flex items-end gap-2.5">
                <div className="flex-1 flex items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-orange-300 focus-within:bg-white transition-colors overflow-hidden">
                  <textarea
                    ref={stickyInputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      // Desktop: Enter sends. Mobile: only meta+Enter
                      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 640) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Add more context or try another draft…"
                    rows={1}
                    className="flex-1 w-full resize-none px-4 py-3 text-sm bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || streaming}
                  className="p-3 bg-gray-900 text-white rounded-xl hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation shrink-0"
                  aria-label="Send"
                >
                  {streaming
                    ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                    : <Send className="w-4 h-4" strokeWidth={2} />
                  }
                </button>
              </div>
              <p className="text-center text-xs text-gray-300 mt-2 hidden sm:block">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsed={limitInfo?.used}
        currentLimit={limitInfo?.limit}
      />
    </>
  );
}
