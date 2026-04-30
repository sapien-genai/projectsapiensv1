import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Menu, X, Clock, ChevronDown, Copy, CheckCircle2, TrendingUp,
  AlertCircle, RefreshCw, AlignLeft, Minimize2, Briefcase, RotateCcw,
  Brain, BarChart3, Palette, Lightbulb, Code2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBilling } from '../contexts/BillingContext';
import { supabase } from '../lib/supabase';
import UpgradeModal from './UpgradeModal';

interface LabSandboxProps {
  labId: string;
  onBack?: () => void;
  onLabSwitch?: (labId: string) => void;
}

interface OutputEntry {
  id: string;
  userPrompt: string;
  text: string;
  label: string;
  mode?: string;
}

interface Experiment {
  id: string;
  prompt: string;
  output: string;
  created_at: string;
}

interface LimitInfo {
  error?: string;
  limit: number;
  used: number;
  plan?: string;
}

// ── Lab configs ────────────────────────────────────────────────
const labConfigs: Record<string, {
  name: string;
  description: string;
  placeholder: string;
  systemContext: string;
  suggestions: string[];
  isWritingLab: boolean;
}> = {
  'writing-lab': {
    name: 'Writing Lab',
    description: 'Generate, edit, and refine written content',
    placeholder: 'Write a compelling product description for…',
    systemContext: 'writing, editing, and refining content',
    suggestions: [
      'Write a professional email to a client about a project delay',
      'Create a compelling product description for a minimalist desk lamp',
      'Draft a social media post announcing a new feature',
      'Rewrite this paragraph to be more concise and engaging',
    ],
    isWritingLab: true,
  },
  'analysis-lab': {
    name: 'Analysis Lab',
    description: 'Extract insights and analyze data',
    placeholder: 'Analyze this data and identify trends…',
    systemContext: 'data analysis, pattern recognition, and insights',
    suggestions: [
      'Analyze quarterly sales data and identify key trends',
      'Compare these two datasets and highlight the main differences',
      'Extract insights from customer feedback responses',
      'Identify patterns in this user behavior data',
    ],
    isWritingLab: false,
  },
  'creative-lab': {
    name: 'Creative Lab',
    description: 'Explore creative ideas and concepts',
    placeholder: 'Generate 3 brand concepts for…',
    systemContext: 'creative brainstorming, concepts, and ideation',
    suggestions: [
      'Generate 5 unique brand names for a sustainable coffee company',
      'Brainstorm creative marketing campaign ideas for Gen Z',
      'Create three logo concepts for a fitness app',
      'Develop a content series theme for our social media',
    ],
    isWritingLab: false,
  },
  'strategy-lab': {
    name: 'Strategy Lab',
    description: 'Build strategic frameworks and solve problems',
    placeholder: 'Create a decision framework for…',
    systemContext: 'strategic thinking, frameworks, and problem solving',
    suggestions: [
      'Create a decision framework for hiring my first developer',
      'Build a go-to-market strategy for a B2B SaaS product',
      'Design a prioritization system for feature requests',
      'Develop a competitive analysis framework',
    ],
    isWritingLab: false,
  },
  'code-lab': {
    name: 'Code Lab',
    description: 'Write, debug, and optimize code',
    placeholder: 'Write a function that…',
    systemContext: 'code writing, debugging, and optimization',
    suggestions: [
      'Write a Python function to find the longest palindrome in a string',
      'Debug this React component that re-renders too often',
      'Optimize this SQL query for better performance',
      'Explain how async/await works in JavaScript',
    ],
    isWritingLab: false,
  },
};

const labMeta: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  'writing-lab':   { icon: Brain,     color: '#FF6A00' },
  'analysis-lab':  { icon: BarChart3, color: '#0A74FF' },
  'creative-lab':  { icon: Palette,   color: '#FF6A00' },
  'strategy-lab':  { icon: Lightbulb, color: '#0A74FF' },
  'code-lab':      { icon: Code2,     color: '#FF6A00' },
};

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

// ── Component ──────────────────────────────────────────────────
export default function LabSandbox({ labId, onBack, onLabSwitch }: LabSandboxProps) {
  const { user } = useAuth();
  const {
    usageStatus, refreshUsageStatus,
    checkoutLoading, checkoutError, startCheckout, clearCheckoutError,
  } = useBilling();

  const config = labConfigs[labId] || labConfigs['writing-lab'];
  const meta   = labMeta[labId]   || labMeta['writing-lab'];
  const LabIcon = meta.icon;

  // Thread of AI outputs
  const [outputs,      setOutputs]      = useState<OutputEntry[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);

  // Sidebar / history
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [history,        setHistory]        = useState<Experiment[]>([]);
  const [showHistory,    setShowHistory]    = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError,   setHistoryError]   = useState<string | null>(null);

  // Limit
  const [limitReached,     setLimitReached]     = useState(false);
  const [limitInfo,        setLimitInfo]        = useState<LimitInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Copy
  const [copied, setCopied] = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);

  const latestOutput = outputs[outputs.length - 1]?.text ?? '';
  const hasOutputs   = outputs.length > 0;

  // ── Load history ──
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const { data, error } = await supabase
        .from('lab_experiments')
        .select('*')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistory(data || []);
    } catch {
      setHistoryError('Failed to load history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [labId, user]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText, outputs.length]);

  // auto-resize textareas
  useEffect(() => {
    [textareaRef, bottomTextareaRef].forEach(ref => {
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px';
      }
    });
  }, [input]);

  // ── SSE streaming ──
  const streamAI = useCallback(async (
    prompt: string,
    mode: string | undefined,
    conversationHistory: { role: string; content: string }[],
    onChunk: (t: string) => void
  ): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Authentication required');

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, labId, mode, conversationHistory }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 429 && err.error === 'limit_reached') {
        setLimitReached(true);
        setLimitInfo(typeof err.limit === 'number' && typeof err.used === 'number' ? err : null);
        await refreshUsageStatus();
        throw new Error('LIMIT_REACHED');
      }
      throw new Error(err.error || 'Failed to get AI response');
    }

    if (!res.body) throw new Error('Empty stream');

    const reader = res.body.getReader();
    const dec    = new TextDecoder();
    let buf = '', full = '';

    const parseEvent = (raw: string) => {
      const payload = raw.split(/\r?\n/).filter(l => l.startsWith('data: ')).map(l => l.slice(6).trim()).join('');
      if (!payload || payload === '[DONE]') return;
      try {
        const p = JSON.parse(payload);
        const chunk = p?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof chunk === 'string' && chunk.length > 0) { full += chunk; onChunk(full); }
      } catch { /* skip */ }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const events = buf.split(/\r?\n\r?\n/);
      buf = events.pop() || '';
      events.forEach(parseEvent);
    }
    buf += dec.decode();
    if (buf.trim()) parseEvent(buf);
    return full;
  }, [labId, refreshUsageStatus]);

  const saveExperiment = useCallback(async (prompt: string, output: string) => {
    if (!user) return;
    await supabase.from('lab_experiments').insert({
      user_id: user.id,
      lab_id: labId,
      prompt,
      output,
    });
    loadHistory();
  }, [user, labId, loadHistory]);

  // ── Run AI ──
  const run = async (prompt: string, label: string, mode?: string) => {
    if (loading) return;

    // Build conversation context from previous outputs
    const convHistory = outputs.flatMap(o => [
      { role: 'user',      content: o.userPrompt },
      { role: 'assistant', content: o.text       },
    ]);

    setLoading(true);
    setStreamingText('');

    try {
      const full = await streamAI(prompt, mode, convHistory, t => setStreamingText(t));
      if (full && full !== 'LIMIT_REACHED') {
        setOutputs(prev => [...prev, { id: `o${Date.now()}`, userPrompt: prompt, text: full, label, mode }]);
        await saveExperiment(prompt, full);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'LIMIT_REACHED') setShowUpgradeModal(true);
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    run(text, 'Response');
  };

  const handleImprove = (mode: string, label: string) => {
    if (!latestOutput || loading) return;
    run((IMPROVE_PROMPTS[mode] || '') + latestOutput, label, mode);
  };

  const handleReset = () => { setOutputs([]); setInput(''); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadExperiment = (exp: Experiment) => {
    setOutputs([{ id: `h${exp.id}`, userPrompt: exp.prompt, text: exp.output, label: 'Loaded' }]);
    setInput('');
    setSidebarOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F4F4F4] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#F4F4F4] border-r-2 border-black
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">

          {/* Sidebar header */}
          <div className="px-4 py-4 border-b-2 border-black flex items-center justify-between">
            <h2 className="font-extrabold text-sm uppercase tracking-tight">Labs</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white transition-colors">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {onBack && (
            <div className="px-4 py-3 border-b-2 border-black">
              <button
                onClick={onBack}
                className="text-xs font-extrabold uppercase tracking-tight hover:text-[#FF6A00] transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}

          {/* Lab list */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(labConfigs).map(([id, cfg]) => {
              const m = labMeta[id] || labMeta['writing-lab'];
              const Icon = m.icon;
              return (
                <button
                  key={id}
                  onClick={() => onLabSwitch?.(id)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-extrabold uppercase tracking-tight flex items-center gap-2.5 transition-colors mb-1 border ${
                    labId === id
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-black hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                  {cfg.name}
                </button>
              );
            })}
          </div>

          {/* History */}
          <div className="border-t-2 border-black">
            <button
              onClick={() => setShowHistory(s => !s)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span className="text-xs font-extrabold uppercase">History</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>

            {showHistory && (
              <div className="max-h-56 overflow-y-auto border-t-2 border-black">
                {historyLoading ? (
                  <div className="p-4 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#FF6A00]" strokeWidth={2} />
                  </div>
                ) : historyError ? (
                  <div className="p-4">
                    <p className="text-xs text-red-600 mb-2">{historyError}</p>
                    <button onClick={loadHistory} className="text-xs text-[#FF6A00] hover:underline font-semibold">Try again</button>
                  </div>
                ) : history.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {history.slice(0, 10).map(exp => (
                      <button
                        key={exp.id}
                        onClick={() => loadExperiment(exp)}
                        className="w-full text-left px-2 py-2 text-xs hover:bg-white transition-colors border border-transparent hover:border-black"
                      >
                        <p className="font-semibold truncate">{exp.prompt}</p>
                        <p className="text-[#888888] mt-0.5">{new Date(exp.created_at).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-xs text-[#888888] text-center">No saved experiments yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 hover:bg-[#F4F4F4] transition-colors"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <LabIcon className="w-5 h-5" style={{ color: meta.color }} strokeWidth={2} />
              <div>
                <h1 className="font-extrabold text-sm uppercase tracking-tight leading-tight">{config.name}</h1>
                <p className="text-xs text-[#666666] leading-tight">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {usageStatus?.plan === 'free' && (
              <span className="text-xs font-semibold text-[#888888]">
                {usageStatus.used} / {usageStatus.limit} today
              </span>
            )}
            {hasOutputs && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-tight px-3 py-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                New
              </button>
            )}
          </div>
        </div>

        {/* Limit banner */}
        {limitReached && limitInfo && (
          <div className="bg-[#FF6A00] border-b-2 border-black px-4 py-3 shrink-0">
            <div className="max-w-3xl mx-auto flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="font-extrabold text-sm uppercase tracking-tight">Daily Limit Reached</p>
                <p className="text-xs mt-0.5">You've used all {limitInfo.limit} sessions today. Resets at midnight UTC.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {limitInfo.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-3 py-1.5 bg-black text-white border-2 border-black text-xs font-extrabold uppercase tracking-tight hover:bg-white hover:text-black transition-colors"
                  >
                    Upgrade
                  </button>
                )}
                <button
                  onClick={() => setLimitReached(false)}
                  className="px-3 py-1.5 bg-white border-2 border-black text-xs font-extrabold uppercase tracking-tight hover:bg-[#F4F4F4] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Thread ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">

            {/* ── Initial input (no outputs yet) ── */}
            {!hasOutputs && (
              <>
                {/* Welcome / suggestions */}
                {!loading && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <LabIcon className="w-10 h-10" style={{ color: meta.color }} strokeWidth={1.5} />
                        <div>
                          <h2 className="font-extrabold text-2xl uppercase tracking-tighter leading-none">{config.name}</h2>
                          <p className="text-sm text-[#666666]">{config.description}</p>
                        </div>
                      </div>
                      <p className="text-xs font-extrabold uppercase tracking-tight text-[#888888] mb-3">Try asking:</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {config.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(s)}
                            className="text-left text-xs px-4 py-3 border-2 border-black bg-white hover:bg-[#FF6A00] hover:border-[#FF6A00] transition-colors font-medium leading-snug shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading state for first output */}
                {loading && (
                  <div className="border-2 border-black bg-white p-6 shadow-[3px_3px_0px_#000]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-[#FF6A00] bg-[#FFE5D9] text-[#FF6A00] flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2} />
                        Writing…
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap min-h-[40px]">
                      {streamingText || <span className="text-[#999]">…</span>}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Output thread ── */}
            {hasOutputs && (
              <div className="space-y-5">
                {outputs.map((o, oi) => {
                  const isLatest = oi === outputs.length - 1;
                  return (
                    <div key={o.id}>
                      {/* User prompt bubble */}
                      <div className="flex justify-end mb-2">
                        <div className="max-w-[80%] bg-[#F4F4F4] border-2 border-black px-4 py-3 text-sm font-medium text-right shadow-[2px_2px_0px_#000]">
                          {o.userPrompt.length > 120 ? o.userPrompt.slice(0, 120) + '…' : o.userPrompt}
                        </div>
                      </div>

                      {/* Version label */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-extrabold uppercase tracking-tight px-2 py-0.5 border border-black ${
                          isLatest ? 'bg-[#FF6A00] text-black border-[#FF6A00]' : 'bg-white text-[#888888]'
                        }`}>
                          {oi === 0 ? 'Response' : o.label}
                        </span>
                        {oi > 0 && (
                          <span className="text-xs text-[#888888] font-semibold">← improved</span>
                        )}
                      </div>

                      {/* Output text */}
                      <div className={`relative group border-2 p-5 text-sm leading-relaxed whitespace-pre-wrap transition-colors ${
                        isLatest
                          ? 'border-black bg-white shadow-[3px_3px_0px_#000]'
                          : 'border-black/20 bg-white text-[#777]'
                      }`}>
                        {o.text}
                        <button
                          onClick={() => copy(o.text, o.id)}
                          className="absolute top-3 right-3 p-1.5 bg-[#F4F4F4] border border-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF6A00] hover:border-[#FF6A00]"
                        >
                          {copied === o.id
                            ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                            : <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Streaming next response */}
                {loading && (
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

            {/* ── Improve actions (Writing Lab + after output) ── */}
            {latestOutput && !loading && config.isWritingLab && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-tight text-[#888888] mb-2">Improve</p>
                <div className="flex flex-wrap gap-2">
                  {IMPROVE_ACTIONS.map(a => (
                    <button
                      key={a.mode}
                      onClick={() => handleImprove(a.mode, a.label)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-white text-xs font-extrabold uppercase tracking-tight hover:bg-[#FF6A00] hover:border-[#FF6A00] transition-colors disabled:opacity-40 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      <a.icon className="w-3.5 h-3.5" strokeWidth={2} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Bottom input bar ── */}
        <div className="border-t-2 border-black bg-white px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Suggestions when empty (non-writing labs) */}
            {!hasOutputs && !loading && (
              <div />
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 border-2 border-black bg-[#F4F4F4] flex items-end">
                <textarea
                  ref={hasOutputs ? bottomTextareaRef : textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={config.placeholder}
                  className="flex-1 w-full resize-none px-4 py-3 text-sm bg-transparent focus:outline-none"
                  style={{ minHeight: '44px', maxHeight: '200px' }}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-3 bg-black text-white border-2 border-black hover:bg-[#FF6A00] hover:text-black hover:border-[#FF6A00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2} />
                  : <Send className="w-5 h-5" strokeWidth={2} />
                }
              </button>
            </div>
            <p className="text-xs text-[#888888] mt-1.5">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsed={limitInfo?.used ?? usageStatus?.used}
        currentLimit={limitInfo?.limit ?? usageStatus?.limit}
        onCheckout={startCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onClearError={clearCheckoutError}
      />
    </div>
  );
}
