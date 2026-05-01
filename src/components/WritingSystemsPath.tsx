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
  Lock,
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
  { mode: 'rewrite_clearer',          label: 'Clearer',       icon: AlignLeft  },
  { mode: 'rewrite_shorter',          label: 'Shorter',       icon: Minimize2  },
  { mode: 'rewrite_more_professional', label: 'Professional', icon: Briefcase  },
  { mode: 'rewrite_more_persuasive',  label: 'Persuasive',    icon: TrendingUp },
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

  const [userInput,    setUserInput]    = useState('');
  const [streaming,    setStreaming]    = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [outputVersions, setOutputVersions] = useState<OutputVersion[]>([]);
  const [copied,  setCopied]  = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; used: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const bottomInputRef = useRef<HTMLTextAreaElement>(null);

  const activeMission: WritingMission = missions[activeMissionIndex];
  const activeStep = activeMission.steps[activeStepIndex];
  const latestOutput = outputVersions[outputVersions.length - 1]?.text ?? '';
  const isFirstInput = outputVersions.length === 0;

  const totalSteps    = missions.reduce((sum, m) => sum + m.steps.length, 0);
  const completedCount = completedStepKeys.size;
  const progressPct   = Math.round((completedCount / totalSteps) * 100);

  const currentStepKey = `${activeMission.missionId}:${activeStep.stepId}`;
  const currentStepDone = completedStepKeys.has(currentStepKey);

  const isLastStep =
    activeMissionIndex === missions.length - 1 &&
    activeStepIndex === activeMission.steps.length - 1;
  const allDone = isLastStep && currentStepDone;

  // auto-scroll to bottom after each output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText, outputVersions.length]);

  // auto-resize textarea
  useEffect(() => {
    [inputRef, bottomInputRef].forEach(ref => {
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px';
      }
    });
  }, [userInput]);

  const callAI = useCallback(
    async (prompt: string, mode: string, onChunk: (t: string) => void): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Authentication required');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
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
        const payload = raw.split(/\r?\n/).filter(l => l.startsWith('data: ')).map(l => l.slice(6).trim()).join('');
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
        setOutputVersions(prev => [...prev, { id: `v${Date.now()}`, label, text: full, mode }]);
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

  const handleReset = () => { setOutputVersions([]); setUserInput(''); };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const useExample = () => {
    setUserInput(activeMission.exampleInput);
    (isFirstInput ? inputRef : bottomInputRef).current?.focus();
  };

  return (
    <>
      <div className="flex h-screen bg-[#F4F4F4] overflow-hidden">

        {/* ── Left context rail ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-full border-r-2 border-black bg-[#F4F4F4] overflow-y-auto">

          {/* Back */}
          <div className="px-4 py-4 border-b-2 border-black">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-semibold hover:text-[#FF6A00] transition-colors uppercase tracking-tight"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
          </div>

          {/* Path title */}
          <div className="px-4 pt-5 pb-4 border-b-2 border-black">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">Writing Path</p>
            <h2 className="font-extrabold text-base uppercase tracking-tight leading-tight">
              AI Writing Systems
            </h2>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white border border-black overflow-hidden">
              <div
                className="h-full bg-[#FF6A00] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-[#666666] mt-1.5">{completedCount} / {totalSteps} steps</p>
          </div>

          {/* Mission list */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#666666] mb-3">Missions</p>
            <div className="space-y-1">
              {missions.map((m, mi) => {
                const done   = m.steps.every(s => completedStepKeys.has(`${m.missionId}:${s.stepId}`));
                const active = mi === activeMissionIndex;
                return (
                  <button
                    key={m.missionId}
                    onClick={() => {
                      setActiveMissionIndex(mi);
                      setActiveStepIndex(0);
                      setOutputVersions([]);
                      setUserInput('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      active ? 'bg-black text-white' : 'hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 border border-black ${
                        done  ? 'bg-[#FF6A00] text-black border-[#FF6A00]' :
                        active ? 'bg-white text-black' :
                                 'bg-[#F4F4F4] text-black'
                      }`}
                    >
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

          {/* Current step */}
          <div className="mx-4 mt-4 border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000]">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">
              Step {activeStepIndex + 1} of {activeMission.steps.length}
            </p>
            <p className="text-sm font-extrabold uppercase tracking-tight mb-2">
              {activeStep.title}
            </p>
            <p className="text-xs text-[#555555] leading-relaxed">{activeStep.instruction}</p>
          </div>

          {/* Next hint */}
          {!currentStepDone && (
            <div className="mx-4 mt-3 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00] mt-0.5 shrink-0" strokeWidth={2} />
              <p className="text-xs text-[#666666] leading-relaxed">{activeMission.goal}</p>
            </div>
          )}

          {/* Key lesson after completion */}
          {currentStepDone && (
            <div className="mx-4 mt-3 border-2 border-black bg-[#FFE5D9] p-3 shadow-[2px_2px_0px_#000]">
              <p className="text-xs font-extrabold uppercase tracking-tight text-black mb-1">Key Lesson</p>
              <p className="text-xs leading-relaxed text-[#333]">{activeMission.keyLesson}</p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Skills footer */}
          <div className="px-4 py-4 border-t-2 border-black">
            <p className="text-xs font-extrabold uppercase tracking-tight text-[#666666] mb-2">Skills</p>
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

          {/* Top bar — mobile only */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight hover:text-[#FF6A00] transition-colors">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-tight">AI Writing Systems</p>
              <p className="text-xs text-[#666666]">Mission {activeMissionIndex + 1} · Step {activeStepIndex + 1}</p>
            </div>
            <span className="text-xs font-extrabold text-[#FF6A00]">{progressPct}%</span>
          </div>

          {/* Scrollable thread */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-8">

              {/* Mission heading */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-tight px-2 py-1 border-2 border-black bg-[#FF6A00]">
                    Mission {activeMissionIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#666666]">{writingSystemsPath.estimatedTime}</span>
                </div>
                <h1 className="font-extrabold text-2xl md:text-3xl uppercase tracking-tighter leading-none mb-3">
                  {activeMission.title}
                </h1>
                <p className="text-sm leading-relaxed text-[#555555] max-w-xl">
                  {activeMission.intro}
                </p>
              </div>

              {/* ── Initial input card ── */}
              {isFirstInput && (
                <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000]">
                  {/* Step label */}
                  <div className="flex items-center justify-between px-5 py-3 border-b-2 border-black bg-[#F4F4F4]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#FF6A00] border border-black text-xs font-extrabold">
                        {activeStepIndex + 1}
                      </span>
                      <span className="text-xs font-extrabold uppercase tracking-tight">{activeStep.title}</span>
                    </div>
                    <button
                      onClick={useExample}
                      className="text-xs font-semibold text-[#FF6A00] hover:underline"
                    >
                      Use example
                    </button>
                  </div>

                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
                    placeholder={activeStep.instruction + '…'}
                    className="w-full resize-none px-5 py-4 text-sm leading-relaxed bg-white focus:outline-none"
                    style={{ minHeight: '100px', maxHeight: '200px' }}
                  />

                  <div className="flex items-center justify-between px-4 py-3 border-t-2 border-black bg-[#F4F4F4]">
                    <span className="text-xs text-[#888888]">⌘↵ to send</span>
                    <button
                      onClick={handleSend}
                      disabled={!userInput.trim() || streaming}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black text-xs font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {streaming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Send className="w-3.5 h-3.5" strokeWidth={2} />}
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* ── Output thread ── */}
              {outputVersions.length > 0 && (
                <div className="space-y-5">
                  {outputVersions.map((v, vi) => {
                    const isLatest = vi === outputVersions.length - 1;
                    return (
                      <div key={v.id}>
                        {/* Version label row */}
                        <div className="flex items-center gap-2 mb-2">
                          {vi > 0 && <div className="ml-2 w-px h-4 bg-black/20" />}
                          <span className={`text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-black ${
                            isLatest ? 'bg-[#FF6A00] text-black' : 'bg-white text-[#888888]'
                          }`}>
                            {vi === 0 ? 'Original' : v.label}
                          </span>
                        </div>

                        {/* Output bubble */}
                        <div className={`relative group border-2 p-5 text-sm leading-relaxed whitespace-pre-wrap ${
                          isLatest
                            ? 'border-black bg-white shadow-[3px_3px_0px_#000] text-black'
                            : 'border-black/25 bg-[#F4F4F4] text-[#777]'
                        }`}>
                          {v.text}
                          <button
                            onClick={() => copy(v.text, v.id)}
                            className="absolute top-3 right-3 p-1.5 bg-[#F4F4F4] border border-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF6A00] hover:border-[#FF6A00]"
                          >
                            {copied === v.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-black" strokeWidth={2} />
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-[#FF6A00] bg-[#FFE5D9] text-[#FF6A00] flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2} />
                          Writing…
                        </span>
                      </div>
                      <div className="border-2 border-black bg-white shadow-[3px_3px_0px_#000] p-5 text-sm leading-relaxed whitespace-pre-wrap min-h-[60px]">
                        {streamingText || <span className="text-[#999]">…</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Post-output actions ── */}
              {latestOutput && !streaming && (
                <div className="space-y-4">

                  {/* Improve actions */}
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-tight text-[#888888] mb-2">Improve</p>
                    <div className="flex flex-wrap gap-2">
                      {IMPROVE_ACTIONS.map(a => (
                        <button
                          key={a.mode}
                          onClick={() => handleImprove(a.mode, a.label)}
                          disabled={streaming}
                          className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-white text-xs font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:border-[#FF6A00] transition-colors disabled:opacity-40"
                        >
                          <a.icon className="w-3.5 h-3.5" strokeWidth={2} />
                          {a.label}
                        </button>
                      ))}
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-2 border-2 border-black/30 bg-[#F4F4F4] text-xs font-extrabold uppercase tracking-tight text-[#888888] hover:border-black hover:text-black transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Next step row */}
                  {!allDone && (
                    <div className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#000]">
                      <div>
                        <p className="text-xs text-[#666666] font-semibold uppercase tracking-tight">Next</p>
                        <p className="text-sm font-extrabold uppercase tracking-tight">
                          {activeStepIndex < activeMission.steps.length - 1
                            ? activeMission.steps[activeStepIndex + 1].title
                            : missions[activeMissionIndex + 1]?.title ?? ''}
                        </p>
                      </div>
                      <button
                        onClick={handleNextStep}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] border-2 border-black text-black text-xs font-extrabold uppercase tracking-tight hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000] hover:shadow-none"
                      >
                        Continue
                        <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}

                  {/* Challenge */}
                  {currentStepDone && (
                    <div className="border-2 border-black bg-[#FFE5D9] p-4 shadow-[2px_2px_0px_#000]">
                      <p className="text-xs font-extrabold uppercase tracking-tight text-[#FF6A00] mb-1">Your Challenge</p>
                      <p className="text-sm leading-relaxed">{activeMission.challenge}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── All done ── */}
              {allDone && (
                <div className="border-2 border-black bg-black text-white p-8 shadow-[4px_4px_0px_#FF6A00] text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mx-auto mb-4" strokeWidth={2} />
                  <h3 className="font-extrabold text-2xl uppercase tracking-tighter mb-3">Path Complete</h3>
                  <p className="text-sm text-[#CCCCCC] leading-relaxed mb-6 max-w-sm mx-auto">
                    All three missions done. You now have a repeatable AI writing system.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {onLabOpen && (
                      <button
                        onClick={() => onLabOpen('writing-lab')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] border-2 border-[#FF6A00] text-black font-extrabold text-xs uppercase tracking-tight hover:bg-white hover:border-white transition-colors"
                      >
                        Open Writing Lab
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={onBack}
                      className="flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-white text-white font-extrabold text-xs uppercase tracking-tight hover:bg-white hover:text-black transition-colors"
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
          {!isFirstInput && !allDone && (
            <div className="border-t-2 border-black bg-white px-4 md:px-6 py-3">
              <div className="max-w-2xl mx-auto flex items-end gap-2">
                <div className="flex-1 border-2 border-black bg-[#F4F4F4] flex items-end">
                  <textarea
                    ref={bottomInputRef}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
                    placeholder="Add context or try a new input…"
                    rows={1}
                    className="flex-1 w-full resize-none px-4 py-3 text-sm bg-transparent focus:outline-none"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    onClick={useExample}
                    className="self-end px-3 py-3 text-xs font-semibold text-[#888888] hover:text-[#FF6A00] transition-colors whitespace-nowrap border-l-2 border-black"
                  >
                    Example
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!userInput.trim() || streaming}
                  className="p-3 bg-black text-white border-2 border-black hover:bg-[#FF6A00] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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