import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  Copy,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  PenLine,
  AlignLeft,
  Minimize2,
  Briefcase,
  TrendingUp,
  RotateCcw,
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
  stepTitle: string;
}

const IMPROVE_ACTIONS = [
  { mode: 'rewrite_clearer', label: 'Clearer', icon: AlignLeft, color: '#5B7DB1' },
  { mode: 'rewrite_shorter', label: 'Shorter', icon: Minimize2, color: '#2D6A42' },
  { mode: 'rewrite_more_professional', label: 'Professional', icon: Briefcase, color: '#57524D' },
  { mode: 'rewrite_more_persuasive', label: 'Persuasive', icon: TrendingUp, color: '#B85C1A' },
];

const IMPROVE_PROMPTS: Record<string, string> = {
  rewrite_clearer: 'Rewrite this to be clearer and easier to understand:\n\n',
  rewrite_shorter: 'Rewrite this to be shorter while keeping the core message:\n\n',
  rewrite_more_professional: 'Make this sound more professional and confident, while keeping the message intact:\n\n',
  rewrite_more_persuasive: 'Rewrite this to be more persuasive and compelling:\n\n',
};

export default function WritingSystemsPath({ onBack, onLabOpen }: WritingSystemsPathProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();
  const { missions } = writingSystemsPath;

  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedMissionSteps, setCompletedMissionSteps] = useState<Set<string>>(new Set());

  // The main text input
  const [userInput, setUserInput] = useState('');

  // Streaming state
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // The ordered chain of outputs for this session
  const [outputVersions, setOutputVersions] = useState<OutputVersion[]>([]);

  // Current "working text" = latest output in chain
  const latestOutput = outputVersions[outputVersions.length - 1]?.text ?? '';

  const [copied, setCopied] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; used: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const workspaceBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeMission: WritingMission = missions[activeMissionIndex];
  const activeStep = activeMission.steps[activeStepIndex];

  const totalSteps = missions.reduce((sum, m) => sum + m.steps.length, 0);
  const completedCount = completedMissionSteps.size;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  const isOnLastStep =
    activeMissionIndex === missions.length - 1 &&
    activeStepIndex === activeMission.steps.length - 1;
  const allDone = isOnLastStep && completedMissionSteps.has(
    `${activeMission.missionId}:${activeStep.stepId}`
  );

  useEffect(() => {
    workspaceBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText, outputVersions]);

  // Adjust textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 240) + 'px';
    }
  }, [userInput]);

  const callAI = useCallback(
    async (
      prompt: string,
      mode: string,
      onChunk: (text: string) => void
    ): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Authentication required');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`;
      const response = await fetch(apiUrl, {
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429 && errorData.error === 'limit_reached') {
          setLimitInfo(
            typeof errorData.limit === 'number' && typeof errorData.used === 'number'
              ? errorData
              : null
          );
          await refreshUsageStatus();
          throw new Error('LIMIT_REACHED');
        }
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      if (!response.body) throw new Error('Empty stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let full = '';

      const processEvent = (raw: string) => {
        const payload = raw
          .split(/\r?\n/)
          .filter(l => l.startsWith('data: '))
          .map(l => l.slice(6).trim())
          .join('');
        if (!payload || payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload);
          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof chunk === 'string' && chunk.length > 0) {
            full += chunk;
            onChunk(full);
          }
        } catch { /* ignore */ }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split(/\r?\n\r?\n/);
        buf = events.pop() || '';
        for (const ev of events) processEvent(ev);
      }
      buf += decoder.decode();
      if (buf.trim()) processEvent(buf);

      return full;
    },
    [refreshUsageStatus]
  );

  const runStep = async (promptText: string, mode: string, versionLabel: string, stepTitle: string) => {
    if (streaming) return;
    setStreaming(true);
    setStreamingText('');
    try {
      const full = await callAI(promptText, mode, text => setStreamingText(text));
      if (full) {
        const id = `v-${Date.now()}`;
        setOutputVersions(prev => [...prev, { id, label: versionLabel, text: full, mode, stepTitle }]);
        const stepKey = `${activeMission.missionId}:${activeStep.stepId}`;
        setCompletedMissionSteps(prev => new Set([...prev, stepKey]));
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'LIMIT_REACHED') setShowUpgradeModal(true);
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  };

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || streaming) return;

    // Build the prompt from the current step template
    const prompt = activeStep.promptTemplate
      .replace('{{user_input}}', text)
      .replace('{{previous_output}}', latestOutput || text);

    await runStep(prompt, activeStep.mode, activeStep.title, activeStep.title);
  };

  const handleImprove = async (mode: string, label: string) => {
    const base = latestOutput;
    if (!base || streaming) return;
    const prompt = (IMPROVE_PROMPTS[mode] || '') + base;
    await runStep(prompt, mode, label, label);
  };

  const handleNextMissionStep = () => {
    if (activeStepIndex < activeMission.steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else if (activeMissionIndex < missions.length - 1) {
      const next = activeMissionIndex + 1;
      setActiveMissionIndex(next);
      setActiveStepIndex(0);
      setOutputVersions([]);
      setUserInput('');
    }
  };

  const handleReset = () => {
    setOutputVersions([]);
    setUserInput('');
    setStreamingText('');
  };

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const useExample = () => {
    setUserInput(activeMission.exampleInput);
    inputRef.current?.focus();
  };

  // Determine what the input area should say/do
  const isFirstUserInput = outputVersions.length === 0;
  const currentStepDone = completedMissionSteps.has(`${activeMission.missionId}:${activeStep.stepId}`);

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ background: '#F8F5F2' }}>

        {/* ── Top bar ── */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 px-4 md:px-6 py-3 border-b"
          style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm transition-colors shrink-0"
            style={{ color: '#57524D' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1C1A17')}
            onMouseLeave={e => (e.currentTarget.style.color = '#57524D')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Paths</span>
          </button>

          {/* Path title + progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold truncate" style={{ color: '#1C1A17' }}>
                AI Writing Systems
              </span>
              <span className="text-xs hidden sm:inline" style={{ color: '#57524D' }}>
                Mission {activeMissionIndex + 1} of {missions.length}
              </span>
            </div>
            {/* Thin progress bar */}
            <div className="mt-1.5 h-1 rounded-full overflow-hidden w-40 sm:w-64" style={{ background: '#E9E5E0' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: '#F4A261' }}
              />
            </div>
          </div>

          <span className="text-xs font-medium shrink-0" style={{ color: '#57524D' }}>
            {progressPct}%
          </span>
        </header>

        {/* ── Body: context rail + workspace ── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Left context rail (desktop only) ── */}
          <aside
            className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r px-5 py-6 gap-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto"
            style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
          >
            {/* Mission list */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#C5C0BB' }}>
                Missions
              </p>
              <div className="space-y-1">
                {missions.map((m, mi) => {
                  const mDone = m.steps.every((s) =>
                    completedMissionSteps.has(`${m.missionId}:${s.stepId}`)
                  );
                  const mActive = mi === activeMissionIndex;
                  return (
                    <button
                      key={m.missionId}
                      onClick={() => {
                        setActiveMissionIndex(mi);
                        setActiveStepIndex(0);
                        setOutputVersions([]);
                        setUserInput('');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                      style={{
                        background: mActive ? '#F4A261/10' : 'transparent',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                        style={{
                          background: mDone ? '#98C9A3' : mActive ? '#F4A261' : '#E9E5E0',
                          color: mDone || mActive ? '#fff' : '#57524D',
                        }}
                      >
                        {mDone ? <CheckCircle2 className="w-3 h-3" /> : mi + 1}
                      </div>
                      <span
                        className="text-xs font-medium leading-tight"
                        style={{ color: mActive ? '#1C1A17' : '#57524D' }}
                      >
                        {m.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current mission guidance */}
            <div
              className="rounded-xl p-4 border"
              style={{ background: '#fff', borderColor: '#E9E5E0' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#F4A261' }}>
                Now
              </p>
              <p className="text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>
                {activeStep.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#57524D' }}>
                {activeStep.instruction}
              </p>
            </div>

            {/* Next step hint */}
            {!currentStepDone && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F4A261' }} />
                <p className="text-xs leading-relaxed" style={{ color: '#57524D' }}>
                  {activeMission.goal}
                </p>
              </div>
            )}

            {/* Key lesson after step is done */}
            {currentStepDone && (
              <div
                className="rounded-xl p-4 border"
                style={{ background: '#EEF3FA', borderColor: '#C8D8EF' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#5B7DB1' }}>
                  Key lesson
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#1C1A17' }}>
                  {activeMission.keyLesson}
                </p>
              </div>
            )}
          </aside>

          {/* ── Main workspace ── */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 xl:px-16 py-8 md:py-10">
              <div className="max-w-2xl mx-auto space-y-8">

                {/* Mission heading */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#F4A261' }}>
                    Mission {activeMissionIndex + 1}
                  </p>
                  <h1
                    className="text-2xl md:text-3xl font-bold leading-tight mb-2"
                    style={{ color: '#1C1A17', fontFamily: "'Playfair Display', 'Georgia', serif" }}
                  >
                    {activeMission.title}
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: '#57524D' }}>
                    {activeMission.intro}
                  </p>
                </div>

                {/* ── Input area (shown when no output yet, or for new input) ── */}
                {isFirstUserInput && (
                  <div
                    className="rounded-2xl border overflow-hidden transition-shadow"
                    style={{ borderColor: '#E9E5E0', background: '#fff' }}
                  >
                    {/* Current step pill */}
                    <div
                      className="flex items-center justify-between px-5 pt-4 pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#F4A261', color: '#fff' }}
                        >
                          {activeStepIndex + 1}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#1C1A17' }}>
                          {activeStep.title}
                        </span>
                      </div>
                      <button
                        onClick={useExample}
                        className="text-xs transition-colors"
                        style={{ color: '#F4A261' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#B85C1A')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#F4A261')}
                      >
                        Try example
                      </button>
                    </div>

                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                      }}
                      placeholder={activeStep.instruction + '…'}
                      className="w-full resize-none px-5 py-3 text-sm leading-relaxed outline-none"
                      style={{
                        background: 'transparent',
                        color: '#1C1A17',
                        minHeight: '96px',
                        maxHeight: '240px',
                      }}
                    />

                    <div
                      className="flex items-center justify-between px-4 py-3 border-t"
                      style={{ borderColor: '#F4EDE6' }}
                    >
                      <span className="text-xs" style={{ color: '#C5C0BB' }}>
                        ⌘↵ to send
                      </span>
                      <button
                        onClick={handleSend}
                        disabled={!userInput.trim() || streaming}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                        style={{ background: '#1C1A17', color: '#F8F5F2' }}
                        onMouseEnter={e => {
                          if (!streaming && userInput.trim()) e.currentTarget.style.background = '#F4A261';
                        }}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1C1A17')}
                      >
                        {streaming ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
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
                          {/* Version label */}
                          <div className="flex items-center gap-2 mb-3">
                            {vi > 0 && (
                              <div
                                className="w-px h-4 self-center"
                                style={{ background: '#E9E5E0', marginLeft: '10px' }}
                              />
                            )}
                            <div
                              className="flex items-center gap-2 text-xs font-semibold"
                              style={{ color: isLatest ? '#F4A261' : '#C5C0BB' }}
                            >
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                style={{
                                  background: isLatest ? '#F4A261' : '#E9E5E0',
                                  color: isLatest ? '#fff' : '#57524D',
                                }}
                              >
                                {vi + 1}
                              </span>
                              {v.label}
                            </div>
                          </div>

                          {/* Output text */}
                          <div
                            className="rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap relative group"
                            style={{
                              background: isLatest ? '#fff' : '#F8F5F2',
                              color: isLatest ? '#1C1A17' : '#7A756F',
                              borderLeft: isLatest ? '3px solid #F4A261' : '3px solid transparent',
                            }}
                          >
                            {v.text}

                            <button
                              onClick={() => copyText(v.text, v.id)}
                              className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: '#F8F5F2' }}
                            >
                              {copied === v.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#98C9A3' }} />
                              ) : (
                                <Copy className="w-3.5 h-3.5" style={{ color: '#57524D' }} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* ── Streaming bubble ── */}
                    {streaming && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="flex items-center gap-2 text-xs font-semibold"
                            style={{ color: '#F4A261' }}
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Writing…
                          </div>
                        </div>
                        <div
                          className="rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap"
                          style={{
                            background: '#fff',
                            color: '#1C1A17',
                            borderLeft: '3px solid #F4A261',
                          }}
                        >
                          {streamingText || (
                            <span style={{ color: '#C5C0BB' }}>…</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Post-output actions ── */}
                {latestOutput && !streaming && (
                  <div className="space-y-4">
                    {/* Improve inline actions */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#C5C0BB' }}>
                        Improve
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {IMPROVE_ACTIONS.map(action => (
                          <button
                            key={action.mode}
                            onClick={() => handleImprove(action.mode, action.label)}
                            disabled={streaming}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all disabled:opacity-40"
                            style={{
                              background: '#fff',
                              color: action.color,
                              borderColor: '#E9E5E0',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = action.color;
                              e.currentTarget.style.background = `${action.color}10`;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#E9E5E0';
                              e.currentTarget.style.background = '#fff';
                            }}
                          >
                            <action.icon className="w-3.5 h-3.5" />
                            {action.label}
                          </button>
                        ))}
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all"
                          style={{ background: '#fff', color: '#C5C0BB', borderColor: '#E9E5E0' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#C5C0BB';
                            e.currentTarget.style.color = '#57524D';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#E9E5E0';
                            e.currentTarget.style.color = '#C5C0BB';
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Start over
                        </button>
                      </div>
                    </div>

                    {/* Next step in the mission */}
                    {!isOnLastStep && !allDone && (
                      <div
                        className="flex items-center justify-between rounded-xl p-4 border"
                        style={{ background: '#fff', borderColor: '#E9E5E0' }}
                      >
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#57524D' }}>
                            Next step
                          </p>
                          <p className="text-sm font-medium" style={{ color: '#1C1A17' }}>
                            {activeStepIndex < activeMission.steps.length - 1
                              ? activeMission.steps[activeStepIndex + 1].title
                              : missions[activeMissionIndex + 1]?.title}
                          </p>
                        </div>
                        <button
                          onClick={handleNextMissionStep}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                          style={{ background: '#F4A261', color: '#1C1A17' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E8863A')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#F4A261')}
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Challenge card — appears after latest step */}
                    {currentStepDone && (
                      <div
                        className="rounded-xl p-4 border"
                        style={{ background: '#F0F7F2', borderColor: '#BEE0C9' }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#2D6A42' }}>
                          Your challenge
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#1C1A17' }}>
                          {activeMission.challenge}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── All done ── */}
                {allDone && (
                  <div
                    className="rounded-2xl p-8 border text-center"
                    style={{ background: '#fff', borderColor: '#E9E5E0' }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: '#F4A261' }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: '#1C1A17', fontFamily: "'Playfair Display', 'Georgia', serif" }}
                    >
                      Path Complete
                    </h3>
                    <p className="text-sm leading-relaxed mb-6 max-w-sm mx-auto" style={{ color: '#57524D' }}>
                      You have completed all three missions and built a real AI writing system. Now take it further in the Writing Lab.
                    </p>
                    {onLabOpen && (
                      <button
                        onClick={() => onLabOpen('writing-lab')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        style={{ background: '#1C1A17', color: '#F8F5F2' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F4A261')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1C1A17')}
                      >
                        <PenLine className="w-4 h-4" />
                        Open Writing Lab
                      </button>
                    )}
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={workspaceBottomRef} />
              </div>
            </div>

            {/* ── Sticky bottom input (after first send) ── */}
            {!isFirstUserInput && !allDone && (
              <div
                className="border-t px-4 md:px-6 lg:px-10 xl:px-16 py-4"
                style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
              >
                <div className="max-w-2xl mx-auto">
                  <div
                    className="flex items-end gap-3 rounded-2xl border px-4 py-3"
                    style={{ background: '#fff', borderColor: '#E9E5E0' }}
                  >
                    <textarea
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                      }}
                      placeholder="Add more context or try a new input…"
                      rows={1}
                      className="flex-1 resize-none text-sm leading-relaxed outline-none"
                      style={{
                        background: 'transparent',
                        color: '#1C1A17',
                        maxHeight: '120px',
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!userInput.trim() || streaming}
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all disabled:opacity-40"
                      style={{ background: '#1C1A17', color: '#F8F5F2' }}
                      onMouseEnter={e => {
                        if (!streaming && userInput.trim()) e.currentTarget.style.background = '#F4A261';
                      }}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1C1A17')}
                    >
                      {streaming ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
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
