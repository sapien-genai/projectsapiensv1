import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBilling } from '../contexts/BillingContext';
import { supabase } from '../lib/supabase';
import UpgradeModal from './UpgradeModal';

interface WritingSystemsPathProps {
  onBack?: () => void;
  onLabOpen?: (labId: string) => void;
  initialInput?: string;
  autoSend?: boolean;
}

type ImproveMode =
  | 'rewrite_clearer'
  | 'rewrite_shorter'
  | 'rewrite_more_professional'
  | 'rewrite_more_persuasive';

const IMPROVE_ACTIONS: { mode: ImproveMode; label: string }[] = [
  { mode: 'rewrite_clearer',           label: 'Clearer' },
  { mode: 'rewrite_shorter',           label: 'Shorter' },
  { mode: 'rewrite_more_professional', label: 'Professional' },
  { mode: 'rewrite_more_persuasive',   label: 'Persuasive' },
];

const IMPROVE_PROMPTS: Record<ImproveMode, string> = {
  rewrite_clearer:           'Rewrite this to be clearer and easier to understand. Return only the rewritten text:\n\n',
  rewrite_shorter:           'Rewrite this to be shorter while keeping the core message. Return only the rewritten text:\n\n',
  rewrite_more_professional: 'Rewrite this to sound more professional and confident, while keeping the message intact. Return only the rewritten text:\n\n',
  rewrite_more_persuasive:   'Rewrite this to be more persuasive and compelling. Return only the rewritten text:\n\n',
};

const MISSION_TITLE = 'Mission 1 — Turn Raw Ideas into Clear Writing';
const MISSION_TIP   = 'Dump messy thoughts first — refine after.';

export default function WritingSystemsPath({ onBack, initialInput, autoSend }: WritingSystemsPathProps) {
  const { user } = useAuth();
  const { refreshUsageStatus } = useBilling();

  const [input,         setInput]         = useState(initialInput ?? '');
  const [output,        setOutput]        = useState('');
  const [streaming,     setStreaming]     = useState(false);
  const [improvesUsed,  setImprovesUsed]  = useState(0);
  const [hasDumped,     setHasDumped]     = useState(false);
  const [showUpgrade,   setShowUpgrade]   = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Progress: first dump = 25%, each improve +25%, cap 100%.
  const progressPct = Math.min(100, (hasDumped ? 25 : 0) + improvesUsed * 25);

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

  const saveExperiment = useCallback(async (prompt: string, result: string) => {
    if (!user) return;
    await supabase.from('lab_experiments').insert({
      user_id: user.id,
      lab_id:  'writing-lab',
      prompt,
      output:  result,
    });
  }, [user]);

  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    if (!autoSend) return;
    if (!initialInput || !initialInput.trim()) return;
    autoSentRef.current = true;
    const text = initialInput.trim();
    const prompt =
      'Take the following rough thoughts and turn them into a clear, structured message. Return only the rewritten message:\n\n' +
      text;
    setInput('');
    runAI(prompt, 'freeform', 'dump');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, initialInput]);

  const runAI = async (prompt: string, mode: string, kind: 'dump' | 'improve') => {
    if (streaming) return;
    setStreaming(true);
    setOutput('');
    try {
      const full = await callAI(prompt, mode, t => setOutput(t));
      if (full) {
        if (kind === 'dump')    setHasDumped(true);
        if (kind === 'improve') setImprovesUsed(n => n + 1);
        await saveExperiment(prompt, full);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'LIMIT_REACHED') setShowUpgrade(true);
    } finally {
      setStreaming(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || streaming) return;
    const prompt =
      'Take the following rough thoughts and turn them into a clear, structured message. Return only the rewritten message:\n\n' +
      text;
    setInput('');
    runAI(prompt, 'freeform', 'dump');
  };

  const handleImprove = (mode: ImproveMode) => {
    if (!output || streaming) return;
    runAI(IMPROVE_PROMPTS[mode] + output, mode, 'improve');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="min-h-[100dvh] bg-white flex flex-col">

        {/* ─── Sticky top bar ──────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <h1 className="flex-1 text-[15px] font-semibold tracking-tight truncate">
              AI Writing Systems
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

        {/* ─── Workspace ───────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-40">

          {/* Compact mission title + one-line tip */}
          <p className="text-[13px] font-medium text-neutral-500">
            {MISSION_TITLE}
          </p>
          <p className="mt-1 text-[15px] text-neutral-700">
            {MISSION_TIP}
          </p>

          {/* Input — large, minimal, no heavy border */}
          <div className="mt-6">
            <div className="relative flex items-end gap-2 border-b border-neutral-300 focus-within:border-neutral-900 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={streaming}
                rows={1}
                placeholder="Start typing your thoughts…"
                className="flex-1 bg-transparent resize-none outline-none py-3 pr-12 text-[17px] leading-relaxed placeholder:text-neutral-400 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                aria-label="Send"
                className="absolute right-0 bottom-2 w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6A00] text-white disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors hover:bg-[#e95f00]"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* AI output — clean, no container */}
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

              {/* Improve actions */}
              {output && !streaming && (
                <div className="mt-8">
                  <p className="text-[13px] text-neutral-500 mb-3">
                    Improve this:
                  </p>
                  <div className="-mx-4 px-4 overflow-x-auto">
                    <div className="flex gap-2 w-max">
                      {IMPROVE_ACTIONS.map(a => (
                        <button
                          key={a.mode}
                          onClick={() => handleImprove(a.mode)}
                          disabled={streaming}
                          className="shrink-0 px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-[15px] font-medium text-neutral-900 transition-colors disabled:opacity-50"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inline next hint */}
                  <button
                    onClick={() => handleImprove('rewrite_clearer')}
                    disabled={streaming}
                    className="mt-6 inline-flex items-center gap-1.5 text-[14px] text-neutral-500 hover:text-[#FF6A00] transition-colors group disabled:opacity-50"
                  >
                    Next: Make it clearer
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </button>
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
