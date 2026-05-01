import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBilling } from '../contexts/BillingContext';
import { supabase } from '../lib/supabase';
import UpgradeModal from './UpgradeModal';
import { Workflow } from '../data/workflows';
import { getTip, getWhyBullets, getNextMoves } from '../data/guidanceLibrary';

interface WorkflowRunnerProps {
  workflow: Workflow;
  onBack?: () => void;
  initialInput?: string;
  autoSend?: boolean;
}

export default function WorkflowRunner({
  workflow,
  onBack,
  initialInput,
  autoSend,
}: WorkflowRunnerProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();

  const [input,      setInput]      = useState(initialInput ?? '');
  const [output,     setOutput]     = useState('');
  const [streaming,  setStreaming]  = useState(false);
  const [improves,   setImproves]   = useState(0);
  const [hasRan,     setHasRan]     = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guidance, setGuidance] = useState<{ why: string[]; next: string[] } | null>(null);

  const tip = workflow.inputTip || getTip(workflow.guidanceCategory);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const progressPct = Math.min(100, (hasRan ? 25 : 0) + improves * 25);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
  }, [input]);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [output]);

  const callAI = useCallback(
    async (prompt: string, onChunk: (t: string) => void): Promise<string> => {
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
            labId: `workflow-${workflow.id}`,
            conversationHistory: [],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429 && err.error === 'limit_reached') {
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
          const p = JSON.parse(payload);
          const chunk = p?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof chunk === 'string' && chunk.length > 0) {
            full += chunk;
            onChunk(full);
          }
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
    [refreshUsageStatus, workflow.id]
  );

  const loadGuidance = useCallback(() => {
    setGuidance({
      why:  getWhyBullets(workflow.guidanceCategory, 3),
      next: getNextMoves(workflow.guidanceCategory, 3),
    });
  }, [workflow.guidanceCategory]);

  const saveExperiment = useCallback(
    async (prompt: string, result: string) => {
      if (!user) return;
      await supabase.from('lab_experiments').insert({
        user_id: user.id,
        lab_id:  `workflow-${workflow.id}`,
        prompt,
        output:  result,
      });
    },
    [user, workflow.id]
  );

  const runAI = useCallback(
    async (prompt: string, kind: 'run' | 'improve') => {
      if (streaming) return;
      setStreaming(true);
      setOutput('');
      setGuidance(null);
      try {
        const full = await callAI(prompt, t => setOutput(t));
        if (full) {
          if (kind === 'run')     setHasRan(true);
          if (kind === 'improve') setImproves(n => n + 1);
          await saveExperiment(prompt, full);
          loadGuidance();
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'LIMIT_REACHED') setShowUpgrade(true);
      } finally {
        setStreaming(false);
      }
    },
    [callAI, saveExperiment, streaming, loadGuidance]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;
    const prompt = workflow.promptTemplate(text);
    setInput('');
    runAI(prompt, 'run');
  }, [input, streaming, workflow, runAI]);

  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    if (!autoSend) return;
    const text = (initialInput ?? '').trim();
    if (!text) return;
    autoSentRef.current = true;
    const prompt = workflow.promptTemplate(text);
    setInput('');
    runAI(prompt, 'run');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, initialInput, workflow.id]);

  const handleImprove = (action: Workflow['improveActions'][number]) => {
    if (!output || streaming) return;
    runAI(action.promptTemplate(output), 'improve');
  };

  const handleNextMove = (label: string) => {
    if (!output || streaming) return;
    const prompt =
      `Apply this change to the content below: "${label}". ` +
      `Return only the rewritten content, same format.\n\n${output}`;
    runAI(prompt, 'improve');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const Icon = workflow.icon;

  return (
    <>
      <div className="min-h-[100dvh] bg-white flex flex-col">

        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <h1 className="flex-1 text-[15px] font-semibold tracking-tight truncate flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#FF6A00]" strokeWidth={2} />
              {workflow.label}
            </h1>
            <span className="text-xs font-medium text-neutral-500 tabular-nums">
              {progressPct}%
            </span>
          </div>
          <div className="h-[2px] bg-neutral-100">
            <div
              className="h-full bg-[#FF6A00] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-40">
          <p className="text-[13px] font-medium text-neutral-500">
            {workflow.intent}
          </p>
          <p className="mt-1 text-[15px] text-neutral-700">
            {workflow.tagline}.
          </p>

          {!output && !streaming && tip && (
            <p className="mt-6 text-[13px] text-neutral-500 leading-relaxed">
              <span className="text-[#FF6A00] font-medium">Tip</span>
              <span className="mx-2 text-neutral-300">·</span>
              {tip}
            </p>
          )}

          <div className="mt-4">
            <div className="relative flex items-end gap-2 border-b border-neutral-300 focus-within:border-neutral-900 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={streaming}
                rows={1}
                placeholder={workflow.inputPlaceholder}
                className="flex-1 bg-transparent resize-none outline-none py-3 pr-12 text-[17px] leading-relaxed placeholder:text-neutral-400 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                aria-label="Run"
                className="absolute right-0 bottom-2 w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6A00] text-white disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors hover:bg-[#e95f00]"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {(output || streaming) && (
            <div ref={outputRef} className="mt-10">
              <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-3">
                Response
              </p>
              <div className="text-[17px] leading-[1.7] text-neutral-900 whitespace-pre-wrap">
                {output}
                {streaming && (
                  <span className="inline-block w-[2px] h-[1.1em] align-[-2px] ml-[1px] bg-neutral-900 animate-pulse" />
                )}
              </div>

              {output && !streaming && guidance && (
                <div className="mt-7 space-y-4">
                  {guidance.why.length > 0 && (
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                        Why this works
                      </p>
                      <ul className="space-y-1.5">
                        {guidance.why.map((w, i) => (
                          <li
                            key={i}
                            className="text-[14px] leading-relaxed text-neutral-600 pl-4 relative"
                          >
                            <span className="absolute left-0 top-[10px] w-1 h-1 rounded-full bg-neutral-400" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {guidance.next.length > 0 && (
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                        Next move
                      </p>
                      <div className="-mx-4 px-4 overflow-x-auto">
                        <div className="flex gap-2 w-max">
                          {guidance.next.map((n, i) => (
                            <button
                              key={i}
                              onClick={() => handleNextMove(n)}
                              disabled={streaming}
                              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium text-[#FF6A00] hover:bg-[#FF6A00]/10 active:bg-[#FF6A00]/15 transition-colors disabled:opacity-50"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {output && !streaming && (
                <div className="mt-8">
                  <p className="text-[13px] text-neutral-500 mb-3">
                    Improve this:
                  </p>
                  <div className="-mx-4 px-4 overflow-x-auto">
                    <div className="flex gap-2 w-max">
                      {workflow.improveActions.map(a => (
                        <button
                          key={a.id}
                          onClick={() => handleImprove(a)}
                          disabled={streaming}
                          className="shrink-0 px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-[15px] font-medium text-neutral-900 transition-colors disabled:opacity-50"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
