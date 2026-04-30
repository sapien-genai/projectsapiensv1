import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, Copy, CheckCircle2, RefreshCw,
  ChevronRight, AlignLeft, Minimize2, Briefcase, TrendingUp,
  ChevronDown, ChevronUp, Lightbulb, Zap, RotateCcw,
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

const MISSION_TIPS: Record<string, string> = {
  'raw-ideas-to-clear-writing': 'Dump messy thoughts first — refine after.',
  'rewrite-for-impact':         'Same message, different effect. Tone controls how people respond.',
  'build-content-engine':       'One idea can produce a week of content.',
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

  const [whyOpen,         setWhyOpen]         = useState(false);
  const [challengeOpen,   setChallengeOpen]   = useState(false);
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
      ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + 'px';
    });
  }, [userInput]);

  useEffect(() => {
    if (!missionMenuOpen) return;
    const close = () => setMissionMenuOpen(false);
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

  const handleReset = () => {
    setOutputVersions([]);
    setUserInput('');
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
      <div className="flex h-[100dvh] bg-[#F4F4F4] overflow-hidden">

        {/* ══════════════════════════════════════════════════════
            Desktop sidebar (lg+)
        ══════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 h-full border-r-2 border-black bg-[#F4F4F4] overflow-y-auto">

          {/* Back */}
          <div className="px-4 py-4 border-b-2 border-black">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
          </div>

          {/* Path meta */}
          <div className="px-4 pt-4 pb-4 border-b-2 border-black">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6A00] mb-1">
              Writing Path
            </p>
            <p className="text-sm font-extrabold uppercase tracking-tight leading-snug">
              AI Writing Systems
            </p>
            {/* Progress */}
            <div className="mt-3 h-2 bg-white border border-black overflow-hidden">
              <div
                className="h-full bg-[#FF6A00] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-[#666666] mt-1.5 font-semibold">
              {completedCount} / {totalSteps} steps complete
            </p>
          </div>

          {/* Mission list */}
          <nav className="px-3 py-3 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888] px-1 mb-2">
              Missions
            </p>
            {missions.map((m, mi) => {
              const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
              const active = mi === activeMissionIndex;
              return (
                <button
                  key={m.missionId}
                  onClick={() => switchMission(mi)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left border mb-1 transition-colors ${
                    active
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-black hover:bg-[#FF6A00] hover:border-[#FF6A00]'
                  }`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
                    done
                      ? 'bg-[#FF6A00] border-[#FF6A00] text-black'
                      : active
                        ? 'bg-white border-white text-black'
                        : 'bg-[#F4F4F4] border-black text-black'
                  }`}>
                    {done ? '✓' : mi + 1}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-tight leading-tight line-clamp-2">
                    {m.title}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Current step */}
          <div className="mx-3 mb-3 border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6A00] mb-1">
              Step {activeStepIndex + 1} of {activeMission.steps.length}
            </p>
            <p className="text-xs font-extrabold uppercase tracking-tight mb-1.5">
              {activeStep.title}
            </p>
            <p className="text-xs text-[#555555] leading-relaxed">
              {MISSION_TIPS[activeMission.missionId] ?? activeStep.instruction}
            </p>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════
            Main workspace
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Top bar ── */}
          <header className="shrink-0 bg-white border-b-2 border-black">
            {/* Primary row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={onBack}
                className="p-1 -ml-1 hover:bg-[#F4F4F4] transition-colors shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-tight leading-none truncate">
                  AI Writing Systems
                </p>
                <div className="mt-1.5 h-1 bg-[#F4F4F4] border border-black/20 overflow-hidden">
                  <div
                    className="h-full bg-[#FF6A00] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <span className="text-xs font-extrabold text-[#FF6A00] shrink-0">
                {progressPct}%
              </span>

              {hasOutput && (
                <button
                  onClick={handleReset}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-tight px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  New
                </button>
              )}
            </div>

            {/* Mobile mission row */}
            <div
              className="lg:hidden flex items-center gap-2 px-4 pb-3"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6A00] shrink-0">
                M{activeMissionIndex + 1}
              </span>

              <div className="relative flex-1 min-w-0">
                <button
                  onClick={() => setMissionMenuOpen(o => !o)}
                  className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-tight text-black hover:text-[#FF6A00] transition-colors"
                >
                  <span className="truncate max-w-[180px]">{activeMission.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${missionMenuOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                  />
                </button>

                {missionMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-white border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden">
                    {missions.map((m, mi) => {
                      const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
                      const active = mi === activeMissionIndex;
                      return (
                        <button
                          key={m.missionId}
                          onClick={() => switchMission(mi)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/10 last:border-0 transition-colors ${
                            active ? 'bg-black text-white' : 'hover:bg-[#F4F4F4]'
                          }`}
                        >
                          <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
                            done
                              ? 'bg-[#FF6A00] border-[#FF6A00] text-black'
                              : active
                                ? 'bg-white border-white text-black'
                                : 'bg-[#F4F4F4] border-black text-black'
                          }`}>
                            {done ? '✓' : mi + 1}
                          </span>
                          <span className="text-xs font-extrabold uppercase tracking-tight leading-tight">
                            {m.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {hasOutput && (
                <button
                  onClick={handleReset}
                  className="sm:hidden flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#888888] hover:text-black transition-colors"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={2} />
                  New
                </button>
              )}
            </div>
          </header>

          {/* ── Scrollable workspace ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-2xl mx-auto px-4 md:px-6 pt-6 pb-6 space-y-6">

              {/* Step context */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 inline-flex items-center justify-center h-5 px-1.5 bg-[#FF6A00] border border-black text-[10px] font-extrabold uppercase tracking-tight">
                  Step {activeStepIndex + 1}
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-tight leading-snug">
                    {activeStep.title}
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-[#FF6A00] shrink-0" strokeWidth={2} />
                    {MISSION_TIPS[activeMission.missionId] ?? activeStep.instruction}
                  </p>
                </div>
              </div>

              {/* ── Initial input (no output yet) ── */}
              {!hasOutput && (
                <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 bg-[#F4F4F4]">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                      Your input
                    </p>
                    <button
                      onClick={() => setUserInput(activeMission.exampleInput)}
                      className="text-xs font-semibold text-[#FF6A00] hover:underline"
                    >
                      Use example
                    </button>
                  </div>

                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                    }}
                    placeholder={activeMission.exampleInput}
                    className="w-full resize-none px-4 pt-4 pb-2 text-sm leading-relaxed bg-white focus:outline-none text-[#1C1A17] placeholder:text-[#aaa]"
                    style={{ minHeight: '96px', maxHeight: '200px' }}
                  />

                  <div className="flex items-center justify-between px-3 pb-3">
                    <span className="text-xs text-[#aaa] hidden sm:block">⌘↵ to send</span>
                    <button
                      onClick={handleSend}
                      disabled={!userInput.trim() || streaming}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black text-xs font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                        {/* Version tag */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 border ${
                            isLatest
                              ? 'bg-[#FF6A00] border-[#FF6A00] text-black'
                              : 'bg-white border-black/20 text-[#aaa]'
                          }`}>
                            {vi === 0 ? 'AI Response' : v.label}
                          </span>
                          {vi > 0 && (
                            <span className="text-[10px] text-[#aaa] font-semibold">improved</span>
                          )}
                        </div>

                        {/* Output text — latest is primary, older are muted */}
                        <div className={`relative text-sm leading-relaxed whitespace-pre-wrap ${
                          isLatest
                            ? 'text-[#1C1A17]'
                            : 'text-[#888888] pl-4 border-l-2 border-black/10'
                        }`}>
                          {v.text}

                          {/* Copy */}
                          <button
                            onClick={() => copy(v.text, v.id)}
                            className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                              isLatest
                                ? 'text-[#888888] hover:text-black'
                                : 'text-[#ccc] hover:text-[#888888]'
                            }`}
                          >
                            {copied === v.id
                              ? <><CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} /> Copied</>
                              : <><Copy className="w-3.5 h-3.5" strokeWidth={2} /> Copy</>
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming bubble */}
                  {streaming && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 border border-[#FF6A00] bg-[#FFE5D9] text-[#FF6A00] flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2} />
                          Writing…
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#1C1A17] min-h-[32px]">
                        {streamingText || <span className="text-[#ccc]">…</span>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Divider ── */}
              {latestOutput && !streaming && (
                <div className="border-t border-black/10" />
              )}

              {/* ── Improve actions ── */}
              {latestOutput && !streaming && (
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888] mb-3">
                    Improve this
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x">
                    {IMPROVE_ACTIONS.map(a => (
                      <button
                        key={a.mode}
                        onClick={() => handleImprove(a.mode, a.label)}
                        disabled={streaming}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-white text-xs font-extrabold uppercase tracking-tight whitespace-nowrap shrink-0 snap-start hover:bg-[#FF6A00] hover:border-[#FF6A00] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-40 touch-manipulation shadow-[2px_2px_0px_#000] hover:shadow-none"
                        style={{ minWidth: '100px' }}
                      >
                        <a.icon className="w-3.5 h-3.5" strokeWidth={2} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Next step — inline ── */}
              {latestOutput && !streaming && !allDone && (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-tight text-[#666666] hover:text-[#FF6A00] transition-colors group"
                >
                  <Zap className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
                  Next: {nextLabel}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              )}

              {/* ── Collapsible: Why this matters ── */}
              {currentStepDone && (
                <div className="border-t border-black/10 pt-4">
                  <button
                    onClick={() => setWhyOpen(o => !o)}
                    className="flex items-center justify-between w-full text-[10px] font-extrabold uppercase tracking-widest text-[#888888] hover:text-black transition-colors"
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
                    <p className="mt-3 text-sm text-[#555555] leading-relaxed border-l-2 border-[#FF6A00] pl-3">
                      {activeMission.keyLesson}
                    </p>
                  )}
                </div>
              )}

              {/* ── Collapsible: Challenge ── */}
              {currentStepDone && (
                <div className="border-t border-black/10 pt-4">
                  <button
                    onClick={() => setChallengeOpen(o => !o)}
                    className="flex items-center justify-between w-full text-[10px] font-extrabold uppercase tracking-widest text-[#888888] hover:text-black transition-colors"
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
                    <p className="mt-3 text-sm text-[#555555] leading-relaxed border-l-2 border-[#FF6A00] pl-3">
                      {activeMission.challenge}
                    </p>
                  )}
                </div>
              )}

              {/* ── All done ── */}
              {allDone && (
                <div className="border-2 border-black bg-black text-white p-8 shadow-[4px_4px_0px_#FF6A00] text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mx-auto mb-4" strokeWidth={2} />
                  <h3 className="font-extrabold text-xl uppercase tracking-tighter mb-2">
                    Path Complete
                  </h3>
                  <p className="text-sm text-[#CCCCCC] leading-relaxed mb-6 max-w-xs mx-auto">
                    All three missions done. You now have a repeatable AI writing system.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onLabOpen && (
                      <button
                        onClick={() => onLabOpen('writing-lab')}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FF6A00] border-2 border-[#FF6A00] text-black font-extrabold text-xs uppercase tracking-tight hover:bg-white hover:border-white active:translate-x-0.5 active:translate-y-0.5 transition-all touch-manipulation"
                      >
                        Open Writing Lab
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={onBack}
                      className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-white text-white font-extrabold text-xs uppercase tracking-tight hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all touch-manipulation"
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
            <div className="shrink-0 bg-white border-t-2 border-black px-4 py-3">
              <div className="max-w-2xl mx-auto flex items-end gap-2">
                <div className="flex-1 flex items-end border-2 border-black bg-[#F4F4F4] focus-within:border-[#FF6A00] transition-colors">
                  <textarea
                    ref={stickyInputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 640) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Add more context or try another draft…"
                    rows={1}
                    className="flex-1 w-full resize-none px-4 py-3 text-sm bg-transparent focus:outline-none text-[#1C1A17] placeholder:text-[#aaa]"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || streaming}
                  className="p-3 bg-black text-white border-2 border-black hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                  aria-label="Send"
                >
                  {streaming
                    ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                    : <Send className="w-4 h-4" strokeWidth={2} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-[#aaa] mt-2 text-center hidden sm:block font-semibold">
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
