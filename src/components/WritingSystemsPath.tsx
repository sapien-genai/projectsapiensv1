import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  Copy,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  AlignLeft,
  Minimize2,
  Briefcase,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronDown,
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
  { mode: 'rewrite_clearer',           label: 'Clearer',       icon: AlignLeft  },
  { mode: 'rewrite_shorter',           label: 'Shorter',       icon: Minimize2  },
  { mode: 'rewrite_more_professional', label: 'Professional',  icon: Briefcase  },
  { mode: 'rewrite_more_persuasive',   label: 'Persuasive',    icon: TrendingUp },
];

const IMPROVE_PROMPTS: Record<string, string> = {
  rewrite_clearer:           'Rewrite this to be clearer and easier to understand:\n\n',
  rewrite_shorter:           'Rewrite this to be shorter while keeping the core message:\n\n',
  rewrite_more_professional: 'Make this sound more professional and confident, while keeping the message intact:\n\n',
  rewrite_more_persuasive:   'Rewrite this to be more persuasive and compelling:\n\n',
};

export default function WritingSystemsPath({ onBack, onLabOpen }: WritingSystemsPathProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();
  const { missions } = writingSystemsPath;

  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [activeStepIndex,    setActiveStepIndex]    = useState(0);
  const [completedStepKeys,  setCompletedStepKeys]  = useState<Set<string>>(new Set());

  const [userInput,     setUserInput]     = useState('');
  const [streaming,     setStreaming]     = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [outputVersions, setOutputVersions] = useState<OutputVersion[]>([]);
  const [copied,  setCopied]  = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; used: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
    activeStepIndex === activeMission.steps.length - 1;
  const allDone = isLastStep && currentStepDone;

  // Next label for the "continue" hint
  const nextLabel =
    activeStepIndex < activeMission.steps.length - 1
      ? activeMission.steps[activeStepIndex + 1].title
      : missions[activeMissionIndex + 1]?.title ?? '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText, outputVersions.length]);

  // Auto-resize both textareas
  useEffect(() => {
    [inputRef, stickyInputRef].forEach(ref => {
      if (!ref.current) return;
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px';
    });
  }, [userInput]);

  // Close mission menu on outside click
  useEffect(() => {
    if (!missionMenuOpen) return;
    const close = () => setMissionMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [missionMenuOpen]);

  // ── AI streaming ──────────────────────────────────────────────
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
          const parsed = JSON.parse(payload);
          const chunk  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
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
      lab_id: 'writing-lab',
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
  };

  const handleReset = () => {
    setOutputVersions([]);
    setUserInput('');
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const useExample = () => {
    setUserInput(activeMission.exampleInput);
    (hasOutput ? stickyInputRef : inputRef).current?.focus();
  };

  const switchMission = (mi: number) => {
    setActiveMissionIndex(mi);
    setActiveStepIndex(0);
    setOutputVersions([]);
    setUserInput('');
    setMissionMenuOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-[100dvh] bg-[#F4F4F4] overflow-hidden">

        {/* ── Desktop sidebar (lg+) ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-full border-r-2 border-black bg-[#F4F4F4] overflow-y-auto">
          <div className="px-4 py-4 border-b-2 border-black">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold hover:text-[#FF6A00] transition-colors uppercase tracking-tight"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
          </div>

          <div className="px-4 pt-5 pb-4 border-b-2 border-black">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">
              Writing Path
            </p>
            <h2 className="font-extrabold text-base uppercase tracking-tight leading-tight">
              AI Writing Systems
            </h2>
            <div className="mt-3 h-1.5 bg-white border border-black overflow-hidden">
              <div
                className="h-full bg-[#FF6A00] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-[#666666] mt-1.5">{completedCount} / {totalSteps} steps</p>
          </div>

          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#666666] mb-3">
              Missions
            </p>
            <div className="space-y-1">
              {missions.map((m, mi) => {
                const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
                const active = mi === activeMissionIndex;
                return (
                  <button
                    key={m.missionId}
                    onClick={() => switchMission(mi)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      active ? 'bg-black text-white' : 'hover:bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 border border-black ${
                      done   ? 'bg-[#FF6A00] text-black border-[#FF6A00]' :
                      active ? 'bg-white text-black' :
                               'bg-[#F4F4F4] text-black'
                    }`}>
                      {done ? <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> : mi + 1}
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-tight leading-tight line-clamp-2">
                      {m.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-4 mt-4 border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000]">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">
              Step {activeStepIndex + 1} of {activeMission.steps.length}
            </p>
            <p className="text-sm font-extrabold uppercase tracking-tight mb-2">
              {activeStep.title}
            </p>
            <p className="text-xs text-[#555555] leading-relaxed">{activeStep.instruction}</p>
          </div>

          {!currentStepDone && (
            <div className="mx-4 mt-3 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00] mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-xs text-[#666666] leading-relaxed">{activeMission.goal}</p>
            </div>
          )}

          {currentStepDone && (
            <div className="mx-4 mt-3 border-2 border-black bg-[#FFE5D9] p-3 shadow-[2px_2px_0px_#000]">
              <p className="text-xs font-extrabold uppercase tracking-tight text-black mb-1">
                Key Lesson
              </p>
              <p className="text-xs leading-relaxed text-[#333]">{activeMission.keyLesson}</p>
            </div>
          )}

          <div className="flex-1" />

          <div className="px-4 py-4 border-t-2 border-black">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#666666] mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {writingSystemsPath.skills.map(s => (
                <span key={s} className="text-xs font-semibold px-2 py-1 bg-white border border-black">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main workspace ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Mobile top bar ── */}
          <header className="lg:hidden shrink-0 bg-white border-b-2 border-black">
            {/* Row 1: back + title + progress% */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={onBack}
                className="p-1 -ml-1 shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-tight leading-none truncate">
                  AI Writing Systems
                </p>
                {/* Thin progress bar */}
                <div className="mt-1.5 h-1 bg-[#F4F4F4] border border-black/20 overflow-hidden w-full">
                  <div
                    className="h-full bg-[#FF6A00] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <span className="text-xs font-extrabold text-[#FF6A00] shrink-0">
                {progressPct}%
              </span>
            </div>

            {/* Row 2: mission pill + dropdown trigger */}
            <div className="flex items-center gap-2 px-4 pb-3">
              <span className="text-xs px-2 py-1 bg-[#FF6A00] border border-black font-extrabold uppercase tracking-tight shrink-0">
                M{activeMissionIndex + 1}
              </span>

              {/* Mission selector */}
              <div className="relative flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setMissionMenuOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-1 text-xs font-extrabold uppercase tracking-tight truncate"
                >
                  <span className="truncate">{activeMission.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${missionMenuOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                  />
                </button>

                {missionMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                    {missions.map((m, mi) => {
                      const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
                      const active = mi === activeMissionIndex;
                      return (
                        <button
                          key={m.missionId}
                          onClick={() => switchMission(mi)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-black/10 last:border-0 ${
                            active ? 'bg-black text-white' : 'hover:bg-[#F4F4F4]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 border border-black ${
                            done   ? 'bg-[#FF6A00] text-black border-[#FF6A00]' :
                            active ? 'bg-white text-black' :
                                     'bg-[#F4F4F4] text-black'
                          }`}>
                            {done ? <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> : mi + 1}
                          </div>
                          <span className="text-xs font-extrabold uppercase tracking-tight leading-tight">
                            {m.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Scrollable thread ── */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain">
            <div className="max-w-2xl mx-auto px-4 md:px-6 pt-5 pb-4 space-y-5">

              {/* ── Contextual step hint (replaces full mission intro on mobile) ── */}
              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-[#FF6A00] border border-black text-xs font-extrabold shrink-0 mt-0.5">
                  {activeStepIndex + 1}
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-tight leading-snug">
                    {activeStep.title}
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">
                    {activeStep.instruction}
                  </p>
                </div>
              </div>

              {/* Mission intro — collapsed on mobile, visible on desktop via CSS */}
              <p className="hidden md:block text-sm text-[#555555] leading-relaxed border-l-2 border-[#FF6A00] pl-3">
                {activeMission.intro}
              </p>

              {/* ── Initial input (no output yet) ── */}
              {!hasOutput && (
                <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 bg-[#F4F4F4]">
                    <span className="text-xs text-[#888888]">Type your text below</span>
                    <button
                      onClick={useExample}
                      className="text-xs font-semibold text-[#FF6A00] hover:underline active:opacity-70"
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
                    className="w-full resize-none px-4 py-3 text-sm leading-relaxed bg-white focus:outline-none"
                    style={{ minHeight: '80px', maxHeight: '160px' }}
                  />

                  {/* Send row */}
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-black/10">
                    <span className="text-xs text-[#aaa] hidden sm:block">⌘↵ to send</span>
                    <button
                      onClick={handleSend}
                      disabled={!userInput.trim() || streaming}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-extrabold uppercase tracking-tight active:scale-95 hover:bg-[#FF6A00] hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="space-y-4">
                  {outputVersions.map((v, vi) => {
                    const isLatest = vi === outputVersions.length - 1;
                    return (
                      <div key={v.id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {vi > 0 && (
                            <div className="ml-1 w-px h-3 bg-black/20" />
                          )}
                          <span className={`text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-black ${
                            isLatest
                              ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                              : 'bg-white text-[#999]'
                          }`}>
                            {vi === 0 ? 'Original' : v.label}
                          </span>
                        </div>

                        <div className={`relative border-2 p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                          isLatest
                            ? 'border-black bg-white shadow-[3px_3px_0px_#000] text-black'
                            : 'border-black/20 bg-[#F4F4F4] text-[#888]'
                        }`}>
                          {v.text}
                          {/* Copy — always visible on mobile, hover on desktop */}
                          <button
                            onClick={() => copy(v.text, v.id)}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-[#F4F4F4] border border-black active:scale-90 transition-transform md:opacity-0 md:group-hover:opacity-100"
                            aria-label="Copy"
                          >
                            {copied === v.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
                              : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming bubble */}
                  {streaming && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-[#FF6A00] bg-[#FFE5D9] text-[#FF6A00] flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2} />
                          Writing…
                        </span>
                      </div>
                      <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000] p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[48px]">
                        {streamingText || <span className="text-[#bbb]">…</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Improve actions (horizontally scrollable on mobile) ── */}
              {latestOutput && !streaming && (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-tight text-[#888888] mb-2">
                    Improve
                  </p>
                  {/* Scrollable row */}
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory">
                    {IMPROVE_ACTIONS.map(a => (
                      <button
                        key={a.mode}
                        onClick={() => handleImprove(a.mode, a.label)}
                        disabled={streaming}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-black bg-white text-xs font-extrabold uppercase tracking-tight whitespace-nowrap shrink-0 snap-start active:scale-95 active:bg-[#FF6A00] hover:bg-[#FF6A00] hover:border-[#FF6A00] transition-all disabled:opacity-40 touch-manipulation"
                        style={{ minWidth: '96px' }}
                      >
                        <a.icon className="w-4 h-4" strokeWidth={2} />
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-black/30 bg-[#F4F4F4] text-xs font-extrabold uppercase tracking-tight whitespace-nowrap shrink-0 snap-start active:scale-95 hover:border-black hover:text-black text-[#888] transition-all touch-manipulation"
                      style={{ minWidth: '80px' }}
                    >
                      <RotateCcw className="w-4 h-4" strokeWidth={2} />
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* ── Next step / Continue ── */}
              {latestOutput && !streaming && !allDone && (
                <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 shadow-[2px_2px_0px_#000]">
                  <div className="min-w-0 mr-3">
                    <p className="text-xs text-[#888] font-semibold uppercase tracking-tight">Up next</p>
                    <p className="text-xs font-extrabold uppercase tracking-tight truncate">{nextLabel}</p>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6A00] border-2 border-black text-black text-xs font-extrabold uppercase tracking-tight shrink-0 active:scale-95 hover:bg-black hover:text-white transition-all touch-manipulation shadow-[2px_2px_0px_#000] hover:shadow-none"
                  >
                    Continue
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* ── Challenge card ── */}
              {currentStepDone && (
                <div className="border-2 border-black bg-[#FFE5D9] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">
                    Your Challenge
                  </p>
                  <p className="text-sm leading-relaxed">{activeMission.challenge}</p>
                </div>
              )}

              {/* ── Key lesson (mobile — shown inline) ── */}
              {currentStepDone && (
                <div className="lg:hidden border-2 border-black bg-white p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
                    <p className="text-xs font-extrabold uppercase tracking-tight">Key Lesson</p>
                  </div>
                  <p className="text-xs leading-relaxed text-[#444]">{activeMission.keyLesson}</p>
                </div>
              )}

              {/* ── All done ── */}
              {allDone && (
                <div className="border-2 border-black bg-black text-white p-6 shadow-[4px_4px_0px_#FF6A00] text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mx-auto mb-3" strokeWidth={2} />
                  <h3 className="font-extrabold text-xl uppercase tracking-tighter mb-2">
                    Path Complete
                  </h3>
                  <p className="text-sm text-[#CCCCCC] leading-relaxed mb-5 max-w-xs mx-auto">
                    All three missions done. You now have a repeatable AI writing system.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onLabOpen && (
                      <button
                        onClick={() => onLabOpen('writing-lab')}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FF6A00] border-2 border-[#FF6A00] text-black font-extrabold text-xs uppercase tracking-tight active:scale-95 hover:bg-white hover:border-white transition-all touch-manipulation"
                      >
                        Open Writing Lab
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={onBack}
                      className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-white text-white font-extrabold text-xs uppercase tracking-tight active:scale-95 hover:bg-white hover:text-black transition-all touch-manipulation"
                    >
                      All Paths
                    </button>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* ── Sticky bottom input bar (after first send) ── */}
          {hasOutput && !allDone && (
            <div className="shrink-0 bg-white border-t-2 border-black px-3 py-2.5 safe-bottom">
              <div className="max-w-2xl mx-auto flex items-end gap-2">
                <div className="flex-1 flex items-end bg-[#F4F4F4] border-2 border-black focus-within:border-[#FF6A00] transition-colors">
                  <textarea
                    ref={stickyInputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 640) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Add more context or a new input…"
                    rows={1}
                    className="flex-1 w-full resize-none px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    onClick={useExample}
                    className="self-end px-3 py-2.5 text-xs font-semibold text-[#aaa] hover:text-[#FF6A00] transition-colors whitespace-nowrap border-l-2 border-black/10 active:text-[#FF6A00]"
                  >
                    eg.
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || streaming}
                  className="p-3 bg-black text-white border-2 border-black hover:bg-[#FF6A00] hover:text-black active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation shrink-0"
                  aria-label="Send"
                >
                  {streaming
                    ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                    : <Send className="w-4 h-4" strokeWidth={2} />
                  }
                </button>
              </div>
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
