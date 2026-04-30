import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Send,
  Copy,
  CheckCircle2,
  Circle,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  BookOpen,
  PenLine,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBilling } from '../contexts/BillingContext';
import { supabase } from '../lib/supabase';
import UpgradeModal from './UpgradeModal';
import { writingSystemsPath, modeLabels, WritingMission, WritingStep } from '../data/writingSystemsPath';

interface WritingSystemsPathProps {
  onBack?: () => void;
  onLabOpen?: (labId: string) => void;
}

interface StepResult {
  stepId: string;
  output: string;
}


const modeColors: Record<string, string> = {
  freeform: 'bg-[#F4A261]/15 text-[#B85C1A] border-[#F4A261]/40',
  rewrite_clearer: 'bg-[#5B7DB1]/15 text-[#2E4E7A] border-[#5B7DB1]/40',
  rewrite_shorter: 'bg-[#98C9A3]/20 text-[#2D6A42] border-[#98C9A3]/50',
  rewrite_more_professional: 'bg-[#57524D]/10 text-[#57524D] border-[#57524D]/30',
  rewrite_more_persuasive: 'bg-[#F4A261]/15 text-[#B85C1A] border-[#F4A261]/40',
  summarize: 'bg-[#5B7DB1]/15 text-[#2E4E7A] border-[#5B7DB1]/40',
  title_suggestions: 'bg-[#98C9A3]/20 text-[#2D6A42] border-[#98C9A3]/50',
};

function buildPrompt(template: string, userInput: string, previousOutput: string): string {
  return template
    .replace('{{user_input}}', userInput)
    .replace('{{previous_output}}', previousOutput);
}

export default function WritingSystemsPath({ onBack, onLabOpen }: WritingSystemsPathProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();
  const { missions, skills } = writingSystemsPath;

  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepResults, setStepResults] = useState<Record<string, StepResult[]>>({});
  const [userInput, setUserInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; used: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedMissions, setExpandedMissions] = useState<Set<number>>(new Set([0]));

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeMission: WritingMission = missions[activeMissionIndex];
  const activeStep: WritingStep = activeMission.steps[activeStepIndex];
  const missionKey = activeMission.missionId;
  const missionResults = stepResults[missionKey] || [];

  const previousOutput =
    activeStepIndex > 0
      ? (missionResults.find(r => r.stepId === activeMission.steps[activeStepIndex - 1].stepId)?.output ?? '')
      : '';

  const totalSteps = missions.reduce((sum, m) => sum + m.steps.length, 0);
  const completedCount = completedSteps.size;

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamingText]);

  const callLabAiChat = useCallback(
    async (
      prompt: string,
      mode: string,
      onChunk: (text: string) => void
    ): Promise<string> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
          setLimitReached(true);
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

      if (!response.body) throw new Error('Empty response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventBuffer = '';
      let fullText = '';

      const processEvent = (rawEvent: string) => {
        const lines = rawEvent
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean);
        const dataPayload = lines
          .filter(l => l.startsWith('data: '))
          .map(l => l.slice(6).trim())
          .join('');
        if (!dataPayload || dataPayload === '[DONE]') return;
        try {
          const parsed = JSON.parse(dataPayload);
          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof chunk === 'string' && chunk.length > 0) {
            fullText += chunk;
            onChunk(fullText);
          }
        } catch {
          // ignore malformed SSE event
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        eventBuffer += decoder.decode(value, { stream: true });
        const events = eventBuffer.split(/\r?\n\r?\n/);
        eventBuffer = events.pop() || '';
        for (const ev of events) processEvent(ev);
      }

      eventBuffer += decoder.decode();
      if (eventBuffer.trim()) processEvent(eventBuffer);

      return fullText;
    },
    [refreshUsageStatus]
  );

  const handleRun = async () => {
    if (streaming) return;

    const isFirstStep = activeStepIndex === 0;
    const inputText = isFirstStep ? userInput.trim() : previousOutput;

    if (!inputText) return;

    const prompt = buildPrompt(activeStep.promptTemplate, isFirstStep ? inputText : '', inputText);

    setStreaming(true);
    setStreamingText('');

    try {
      const fullText = await callLabAiChat(prompt, activeStep.mode, text => {
        setStreamingText(text);
      });

      if (fullText) {
        const stepKey = `${missionKey}:${activeStep.stepId}`;
        setCompletedSteps(prev => new Set([...prev, stepKey]));

        setStepResults(prev => {
          const existing = prev[missionKey] || [];
          const filtered = existing.filter(r => r.stepId !== activeStep.stepId);
          return {
            ...prev,
            [missionKey]: [...filtered, { stepId: activeStep.stepId, output: fullText }],
          };
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'LIMIT_REACHED') {
        setShowUpgradeModal(true);
      }
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < activeMission.steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else if (activeMissionIndex < missions.length - 1) {
      const nextMission = activeMissionIndex + 1;
      setActiveMissionIndex(nextMission);
      setActiveStepIndex(0);
      setUserInput('');
      setExpandedMissions(prev => new Set([...prev, nextMission]));
    }
  };

  const currentStepOutput =
    missionResults.find(r => r.stepId === activeStep.stepId)?.output ?? '';

  const stepIsComplete = (missionIndex: number, stepIndex: number) => {
    const mission = missions[missionIndex];
    const step = mission.steps[stepIndex];
    return completedSteps.has(`${mission.missionId}:${step.stepId}`);
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

  const toggleMission = (index: number) => {
    setExpandedMissions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const isLastStep =
    activeMissionIndex === missions.length - 1 &&
    activeStepIndex === activeMission.steps.length - 1;

  return (
    <>
      <div className="min-h-screen" style={{ background: '#F8F5F2' }}>
        {/* Header */}
        <div
          className="border-b px-4 md:px-8 py-4 flex items-center justify-between"
          style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#57524D' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1C1A17')}
            onMouseLeave={e => (e.currentTarget.style.color = '#57524D')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Paths
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ color: '#57524D', borderColor: '#E9E5E0', background: '#E9E5E0' }}>
              {completedCount} / {totalSteps} steps
            </span>
            {onLabOpen && (
              <button
                onClick={() => onLabOpen('writing-lab')}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-all"
                style={{ background: '#1C1A17', color: '#F8F5F2', borderColor: '#1C1A17' }}
                onMouseEnter={e => { (e.currentTarget.style.background = '#F4A261'); (e.currentTarget.style.borderColor = '#F4A261'); (e.currentTarget.style.color = '#1C1A17'); }}
                onMouseLeave={e => { (e.currentTarget.style.background = '#1C1A17'); (e.currentTarget.style.borderColor = '#1C1A17'); (e.currentTarget.style.color = '#F8F5F2'); }}
              >
                <PenLine className="w-3.5 h-3.5" />
                Open Writing Lab
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Path header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ color: '#57524D', borderColor: '#E9E5E0', background: '#E9E5E0' }}
              >
                Learning Path
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ color: '#5B7DB1', borderColor: '#5B7DB1', background: '#5B7DB1/10' }}
              >
                {writingSystemsPath.level}
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ color: '#57524D', borderColor: '#E9E5E0', background: '#E9E5E0' }}
              >
                {writingSystemsPath.estimatedTime}
              </span>
            </div>

            <h1
              className="font-serif text-3xl sm:text-4xl md:text-5xl mb-3 leading-tight"
              style={{ color: '#1C1A17', fontFamily: "'Playfair Display', serif" }}
            >
              {writingSystemsPath.title}
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#57524D' }}>
              {writingSystemsPath.subtitle}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border"
                  style={{ color: '#57524D', borderColor: '#E9E5E0', background: '#E9E5E0' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between text-xs font-medium mb-2" style={{ color: '#57524D' }}>
              <span>Overall Progress</span>
              <span>{Math.round((completedCount / totalSteps) * 100)}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: '#E9E5E0' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / totalSteps) * 100}%`,
                  background: '#F4A261',
                }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* Left: Mission navigator */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#57524D' }}>
                Missions
              </h2>

              {missions.map((mission, mIndex) => {
                const isActive = mIndex === activeMissionIndex;
                const missionComplete = mission.steps.every((_, sIndex) =>
                  stepIsComplete(mIndex, sIndex)
                );
                const expanded = expandedMissions.has(mIndex);

                return (
                  <div
                    key={mission.missionId}
                    className="rounded-xl border overflow-hidden transition-all"
                    style={{
                      borderColor: isActive ? '#F4A261' : '#E9E5E0',
                      background: isActive ? '#FFF9F5' : '#fff',
                    }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      onClick={() => {
                        setActiveMissionIndex(mIndex);
                        setActiveStepIndex(0);
                        setUserInput('');
                        toggleMission(mIndex);
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          background: missionComplete
                            ? '#98C9A3'
                            : isActive
                            ? '#F4A261'
                            : '#E9E5E0',
                          color: missionComplete || isActive ? '#fff' : '#57524D',
                        }}
                      >
                        {missionComplete ? <CheckCircle2 className="w-4 h-4" /> : mIndex + 1}
                      </div>
                      <span
                        className="flex-1 text-sm font-semibold leading-snug"
                        style={{ color: '#1C1A17' }}
                      >
                        {mission.title}
                      </span>
                      <ChevronDown
                        className="w-4 h-4 flex-shrink-0 transition-transform"
                        style={{
                          color: '#57524D',
                          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>

                    {expanded && (
                      <div className="px-4 pb-3 space-y-1 border-t" style={{ borderColor: '#F4EDE6' }}>
                        {mission.steps.map((step, sIndex) => {
                          const done = stepIsComplete(mIndex, sIndex);
                          const isCurrentStep = isActive && sIndex === activeStepIndex;

                          return (
                            <button
                              key={step.stepId}
                              onClick={() => {
                                setActiveMissionIndex(mIndex);
                                setActiveStepIndex(sIndex);
                                setUserInput('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                              style={{
                                background: isCurrentStep ? '#F4A261/10' : 'transparent',
                              }}
                            >
                              <div className="flex-shrink-0">
                                {done ? (
                                  <CheckCircle2
                                    className="w-4 h-4"
                                    style={{ color: '#98C9A3' }}
                                    fill="currentColor"
                                  />
                                ) : (
                                  <Circle
                                    className="w-4 h-4"
                                    style={{ color: isCurrentStep ? '#F4A261' : '#C5C0BB' }}
                                  />
                                )}
                              </div>
                              <span
                                className="text-xs font-medium"
                                style={{
                                  color: isCurrentStep ? '#1C1A17' : '#57524D',
                                }}
                              >
                                {step.title}
                              </span>
                              <span
                                className={`ml-auto text-xs px-2 py-0.5 rounded-md border ${modeColors[step.mode] || modeColors.freeform}`}
                              >
                                {modeLabels[step.mode] || step.mode}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Active step workspace */}
            <div className="space-y-6">
              {/* Mission context banner */}
              <div
                className="rounded-xl p-5 border"
                style={{ background: '#FFF9F5', borderColor: '#F4EDE6' }}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#F4A261' }}>
                      Mission {activeMissionIndex + 1}
                    </p>
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', serif" }}>
                      {activeMission.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: '#57524D' }}>
                      {activeMission.intro}
                    </p>
                  </div>
                  <div
                    className="rounded-lg px-3 py-2 text-xs border flex items-center gap-2"
                    style={{ background: '#E9E5E0', borderColor: '#E9E5E0', color: '#57524D' }}
                  >
                    <Target className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{activeMission.goal}</span>
                  </div>
                </div>
              </div>

              {/* Step card */}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: '#fff', borderColor: '#E9E5E0' }}
              >
                {/* Step header */}
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: '#F4A261', color: '#fff' }}
                    >
                      {activeStepIndex + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#57524D' }}>
                        Step {activeStepIndex + 1} of {activeMission.steps.length}
                      </p>
                      <h3 className="font-bold text-base" style={{ color: '#1C1A17' }}>
                        {activeStep.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-md border ${modeColors[activeStep.mode] || modeColors.freeform}`}
                  >
                    {modeLabels[activeStep.mode] || activeStep.mode}
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Instruction */}
                  <div
                    className="flex gap-3 p-4 rounded-lg border"
                    style={{ background: '#F8F5F2', borderColor: '#E9E5E0' }}
                  >
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F4A261' }} />
                    <p className="text-sm leading-relaxed" style={{ color: '#57524D' }}>
                      {activeStep.instruction}
                    </p>
                  </div>

                  {/* Input area — only for first step */}
                  {activeStepIndex === 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold" style={{ color: '#1C1A17' }}>
                          Your Input
                        </label>
                        <button
                          onClick={useExample}
                          className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                          style={{ color: '#F4A261' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#B85C1A')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#F4A261')}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Use example
                        </button>
                      </div>
                      <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder={activeMission.exampleInput}
                        rows={4}
                        className="w-full resize-none rounded-lg border px-4 py-3 text-sm leading-relaxed outline-none transition-colors"
                        style={{
                          background: '#F8F5F2',
                          borderColor: '#E9E5E0',
                          color: '#1C1A17',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#F4A261')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E9E5E0')}
                      />
                    </div>
                  ) : (
                    /* Show previous output as context for subsequent steps */
                    previousOutput && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold" style={{ color: '#1C1A17' }}>
                            Previous Output (will be refined)
                          </label>
                          <button
                            onClick={() => copyText(previousOutput, 'prev')}
                            className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                            style={{ color: '#57524D' }}
                          >
                            {copied === 'prev' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#98C9A3' }} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copied === 'prev' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div
                          className="rounded-lg border p-4 text-sm leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap"
                          style={{
                            background: '#F8F5F2',
                            borderColor: '#E9E5E0',
                            color: '#57524D',
                          }}
                        >
                          {previousOutput}
                        </div>
                      </div>
                    )
                  )}

                  {/* Run button */}
                  <button
                    onClick={handleRun}
                    disabled={streaming || (activeStepIndex === 0 && !userInput.trim()) || (activeStepIndex > 0 && !previousOutput)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all"
                    style={{
                      background: streaming ? '#E9E5E0' : '#1C1A17',
                      color: streaming ? '#57524D' : '#F8F5F2',
                    }}
                    onMouseEnter={e => {
                      if (!streaming) {
                        (e.currentTarget.style.background = '#F4A261');
                        (e.currentTarget.style.color = '#1C1A17');
                      }
                    }}
                    onMouseLeave={e => {
                      if (!streaming) {
                        (e.currentTarget.style.background = '#1C1A17');
                        (e.currentTarget.style.color = '#F8F5F2');
                      }
                    }}
                  >
                    {streaming ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Run this step
                      </>
                    )}
                  </button>

                  {/* Streaming / output */}
                  {(streaming || currentStepOutput) && (
                    <div ref={outputRef}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold" style={{ color: '#1C1A17' }}>
                          {streaming ? 'Generating...' : 'Output'}
                        </label>
                        {!streaming && currentStepOutput && (
                          <button
                            onClick={() => copyText(currentStepOutput, activeStep.stepId)}
                            className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                            style={{ color: '#57524D' }}
                          >
                            {copied === activeStep.stepId ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#98C9A3' }} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copied === activeStep.stepId ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
                      <div
                        className="rounded-lg border p-4 text-sm leading-relaxed min-h-[80px] whitespace-pre-wrap"
                        style={{
                          background: '#fff',
                          borderColor: streaming ? '#F4A261' : '#E9E5E0',
                          color: '#1C1A17',
                          borderLeftWidth: '3px',
                          borderLeftColor: '#F4A261',
                        }}
                      >
                        {streaming ? streamingText || '...' : currentStepOutput}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  {currentStepOutput && !streaming && (
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#E9E5E0' }}>
                      <div className="text-xs" style={{ color: '#98C9A3' }}>
                        <CheckCircle2 className="w-4 h-4 inline mr-1.5" fill="currentColor" />
                        Step complete
                      </div>
                      {!isLastStep && (
                        <button
                          onClick={handleNextStep}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-all"
                          style={{
                            background: '#F4A261',
                            color: '#1C1A17',
                            borderColor: '#F4A261',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E8863A')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#F4A261')}
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Key lesson + challenge */}
              {completedSteps.size > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: '#5B7DB1/08', borderColor: '#5B7DB1/30' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" style={{ color: '#5B7DB1' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5B7DB1' }}>
                        Key Lesson
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#1C1A17' }}>
                      {activeMission.keyLesson}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: '#98C9A3/10', borderColor: '#98C9A3/40' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" style={{ color: '#2D6A42' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2D6A42' }}>
                        Challenge
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#1C1A17' }}>
                      {activeMission.challenge}
                    </p>
                  </div>
                </div>
              )}

              {/* All done */}
              {isLastStep && currentStepOutput && (
                <div
                  className="rounded-xl p-6 border text-center"
                  style={{ background: '#F4A261/10', borderColor: '#F4A261/40' }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: '#F4A261' }}
                  >
                    <CheckCircle2 className="w-6 h-6" style={{ color: '#fff' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', serif" }}>
                    Path Complete
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#57524D' }}>
                    You have completed all three missions. You now have the foundation for a real AI writing system.
                  </p>
                  {onLabOpen && (
                    <button
                      onClick={() => onLabOpen('writing-lab')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                      style={{ background: '#1C1A17', color: '#F8F5F2' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F4A261')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1C1A17')}
                    >
                      <PenLine className="w-4 h-4" />
                      Continue in Writing Lab
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
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
