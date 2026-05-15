import { useEffect, useMemo, useReducer } from 'react';
import { CheckCircle2, RefreshCw, AlertCircle, BookOpen, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface EvaluationCriterion {
  id: string;
  label: string;
  description: string;
}

interface PromptExerciseBlockData {
  type: 'promptExercise';
  id: string;
  label: string;
  scenario: string;
  template: string;
  criteria: EvaluationCriterion[];
  referenceSolution: string;
}

interface ExerciseFeedback {
  strengths: string[];
  improvements: { criterion: string; suggestion: string }[];
  score: number;
  summary: string;
}

type Blanks = Record<string, string>;

type ExerciseState =
  | { status: 'idle' }
  | { status: 'filling'; blanks: Blanks }
  | { status: 'submitting'; blanks: Blanks; userPrompt: string }
  | { status: 'streaming'; blanks: Blanks; userPrompt: string; partialResponse: string }
  | { status: 'response_received'; blanks: Blanks; userPrompt: string; aiResponse: string }
  | { status: 'complete'; blanks: Blanks; userPrompt: string; aiResponse: string; feedback: ExerciseFeedback }
  | { status: 'revealed'; blanks: Blanks; userPrompt: string; aiResponse: string; feedback: ExerciseFeedback }
  | { status: 'error_api'; blanks: Blanks; userPrompt: string; partialResponse?: string }
  | { status: 'error_rate_limit'; blanks: Blanks; userPrompt: string; retryAfterSeconds?: number }
  | { status: 'error_parse'; blanks: Blanks; userPrompt: string; aiResponse: string };

type Action =
  | { type: 'INIT_FILLING'; blanks: Blanks }
  | { type: 'RESTORE_COMPLETE'; blanks: Blanks; userPrompt: string; aiResponse: string; feedback: ExerciseFeedback }
  | { type: 'UPDATE_BLANK'; name: string; value: string }
  | { type: 'SUBMIT'; userPrompt: string }
  | { type: 'STREAM_CHUNK'; partial: string }
  | { type: 'STREAM_DONE'; aiResponse: string }
  | { type: 'EVAL_COMPLETE'; feedback: ExerciseFeedback }
  | { type: 'EVAL_PARSE_ERROR' }
  | { type: 'API_ERROR'; partial?: string }
  | { type: 'RATE_LIMIT'; retryAfterSeconds?: number }
  | { type: 'RESET'; blanks: Blanks }
  | { type: 'TOGGLE_REFERENCE' };

const BLANK_REGEX = /\{\{([a-z_][a-z0-9_]*)\}\}/g;

function extractUniqueBlanks(template: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of template.matchAll(BLANK_REGEX)) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      ordered.push(match[1]);
    }
  }
  return ordered;
}

function emptyBlanks(names: string[]): Blanks {
  const out: Blanks = {};
  names.forEach(n => { out[n] = ''; });
  return out;
}

function fillTemplate(template: string, blanks: Blanks): string {
  return template.replace(BLANK_REGEX, (_, name) => blanks[name] ?? '');
}

function reverseParse(template: string, userPrompt: string): Blanks | null {
  const parts = template.split(BLANK_REGEX);
  if (parts.length === 1) return userPrompt === template ? {} : null;
  if (!userPrompt.startsWith(parts[0])) return null;

  let cursor = parts[0].length;
  const result: Blanks = {};

  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i];
    const nextLiteral = parts[i + 1] ?? '';
    const isLast = i + 2 >= parts.length;

    let value: string;
    if (isLast) {
      if (nextLiteral.length > 0 && !userPrompt.endsWith(nextLiteral)) return null;
      value = userPrompt.slice(cursor, userPrompt.length - nextLiteral.length);
      cursor = userPrompt.length;
    } else {
      // Adjacent blanks (no literal between them) would let the first capture as empty
      // and the second swallow the whole gap — ambiguous, so refuse to restore.
      if (nextLiteral.length === 0) return null;
      const rest = userPrompt.slice(cursor);
      const idx = rest.indexOf(nextLiteral);
      if (idx < 0) return null;
      value = rest.slice(0, idx);
      cursor += idx + nextLiteral.length;
    }

    if (name in result && result[name] !== value) return null;
    result[name] = value;
  }

  return cursor === userPrompt.length ? result : null;
}

function reducer(state: ExerciseState, action: Action): ExerciseState {
  switch (action.type) {
    case 'INIT_FILLING':
      return { status: 'filling', blanks: action.blanks };
    case 'RESTORE_COMPLETE':
      return {
        status: 'complete',
        blanks: action.blanks,
        userPrompt: action.userPrompt,
        aiResponse: action.aiResponse,
        feedback: action.feedback,
      };
    case 'UPDATE_BLANK':
      if (state.status === 'filling') {
        return { status: 'filling', blanks: { ...state.blanks, [action.name]: action.value } };
      }
      return state;
    case 'SUBMIT':
      if (state.status === 'filling') {
        return { status: 'submitting', blanks: state.blanks, userPrompt: action.userPrompt };
      }
      return state;
    case 'STREAM_CHUNK':
      if (state.status === 'submitting') {
        return {
          status: 'streaming',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          partialResponse: action.partial,
        };
      }
      if (state.status === 'streaming') {
        return { ...state, partialResponse: action.partial };
      }
      return state;
    case 'STREAM_DONE':
      if (state.status === 'submitting' || state.status === 'streaming') {
        return {
          status: 'response_received',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          aiResponse: action.aiResponse,
        };
      }
      return state;
    case 'EVAL_COMPLETE':
      if (state.status === 'response_received') {
        return {
          status: 'complete',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          aiResponse: state.aiResponse,
          feedback: action.feedback,
        };
      }
      return state;
    case 'EVAL_PARSE_ERROR':
      if (state.status === 'response_received') {
        return {
          status: 'error_parse',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          aiResponse: state.aiResponse,
        };
      }
      return state;
    case 'API_ERROR':
      if (
        state.status === 'submitting' ||
        state.status === 'streaming' ||
        state.status === 'response_received'
      ) {
        return {
          status: 'error_api',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          partialResponse: action.partial,
        };
      }
      return state;
    case 'RATE_LIMIT':
      if (
        state.status === 'submitting' ||
        state.status === 'streaming' ||
        state.status === 'response_received'
      ) {
        return {
          status: 'error_rate_limit',
          blanks: state.blanks,
          userPrompt: state.userPrompt,
          retryAfterSeconds: action.retryAfterSeconds,
        };
      }
      return state;
    case 'RESET':
      return { status: 'filling', blanks: action.blanks };
    case 'TOGGLE_REFERENCE':
      if (state.status === 'complete') {
        return { ...state, status: 'revealed' };
      }
      if (state.status === 'revealed') {
        return { ...state, status: 'complete' };
      }
      return state;
    default:
      return state;
  }
}

interface Props {
  block: PromptExerciseBlockData;
  lessonId: string;
}

export default function PromptExerciseBlock({ block, lessonId }: Props) {
  const { user } = useAuth();
  const blankNames = useMemo(() => extractUniqueBlanks(block.template), [block.template]);

  const [state, dispatch] = useReducer(
    reducer,
    blankNames,
    (names): ExerciseState => ({ status: 'filling', blanks: emptyBlanks(names) })
  );

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      dispatch({ type: 'INIT_FILLING', blanks: emptyBlanks(blankNames) });
      return () => { cancelled = true; };
    }

    (async () => {
      const { data, error } = await supabase
        .from('exercise_attempts')
        .select('user_prompt, ai_response, feedback_json')
        .eq('user_id', user.id)
        .eq('exercise_id', block.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load prior exercise attempt:', error);
        dispatch({ type: 'INIT_FILLING', blanks: emptyBlanks(blankNames) });
        return;
      }

      if (!data) {
        dispatch({ type: 'INIT_FILLING', blanks: emptyBlanks(blankNames) });
        return;
      }

      const parsedBlanks = reverseParse(block.template, data.user_prompt);
      if (!parsedBlanks) {
        console.warn('Could not restore prior attempt blanks for exercise', block.id);
        dispatch({ type: 'INIT_FILLING', blanks: emptyBlanks(blankNames) });
        return;
      }

      const fullBlanks: Blanks = { ...emptyBlanks(blankNames), ...parsedBlanks };
      dispatch({
        type: 'RESTORE_COMPLETE',
        blanks: fullBlanks,
        userPrompt: data.user_prompt,
        aiResponse: data.ai_response,
        feedback: data.feedback_json as ExerciseFeedback,
      });
    })();

    return () => { cancelled = true; };
  }, [user?.id, block.id, block.template, blankNames]);

  const handleSubmit = async () => {
    if (state.status !== 'filling' || !user) return;
    if (Object.values(state.blanks).some(v => !v.trim())) return;

    const userPrompt = fillTemplate(block.template, state.blanks);
    dispatch({ type: 'SUBMIT', userPrompt });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        dispatch({ type: 'API_ERROR' });
        return;
      }

      const streamRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-ai-chat`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userPrompt, labId: 'exercise-lab', exerciseId: block.id }),
        }
      );

      if (!streamRes.ok) {
        const err = await streamRes.json().catch(() => ({}));
        if (streamRes.status === 429) {
          const headerRetry = streamRes.headers.get('Retry-After');
          const retryAfter = typeof err.retryAfterSeconds === 'number'
            ? err.retryAfterSeconds
            : headerRetry ? parseInt(headerRetry, 10) : undefined;
          dispatch({ type: 'RATE_LIMIT', retryAfterSeconds: retryAfter });
        } else {
          dispatch({ type: 'API_ERROR' });
        }
        return;
      }

      if (!streamRes.body) {
        dispatch({ type: 'API_ERROR' });
        return;
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      const parseEvent = (raw: string) => {
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
            accumulated += chunk;
            dispatch({ type: 'STREAM_CHUNK', partial: accumulated });
          }
        } catch {
          // ignore malformed chunk
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';
        events.forEach(parseEvent);
      }
      buffer += decoder.decode();
      if (buffer.trim()) parseEvent(buffer);

      if (!accumulated) {
        dispatch({ type: 'API_ERROR' });
        return;
      }

      const aiResponse = accumulated;
      dispatch({ type: 'STREAM_DONE', aiResponse });

      const evalRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-exercise-feedback`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: block.id,
            userPrompt,
            aiResponse,
            criteria: block.criteria,
            referenceSolution: block.referenceSolution,
          }),
        }
      );

      if (!evalRes.ok) {
        const evalErr = await evalRes.json().catch(() => ({}));
        if (evalRes.status === 429) {
          const headerRetry = evalRes.headers.get('Retry-After');
          const retryAfter = typeof evalErr.retryAfterSeconds === 'number'
            ? evalErr.retryAfterSeconds
            : headerRetry ? parseInt(headerRetry, 10) : undefined;
          dispatch({ type: 'RATE_LIMIT', retryAfterSeconds: retryAfter });
        } else if (evalRes.status === 500 && evalErr.error === 'parse_error') {
          dispatch({ type: 'EVAL_PARSE_ERROR' });
        } else {
          dispatch({ type: 'API_ERROR' });
        }
        return;
      }

      const feedback = (await evalRes.json()) as ExerciseFeedback;
      dispatch({ type: 'EVAL_COMPLETE', feedback });

      supabase
        .from('exercise_attempts')
        .insert({
          user_id: user.id,
          exercise_id: block.id,
          lesson_id: lessonId,
          user_prompt: userPrompt,
          ai_response: aiResponse,
          feedback_json: feedback,
          score: feedback?.score,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error('Failed to persist exercise attempt:', insertError);
        });
    } catch (e) {
      console.error('Exercise submission failed:', e);
      dispatch({ type: 'API_ERROR' });
    }
  };

  const handleTryAgain = () => {
    dispatch({ type: 'RESET', blanks: emptyBlanks(blankNames) });
  };

  const handleToggleReference = () => {
    dispatch({ type: 'TOGGLE_REFERENCE' });
  };

  if (state.status === 'idle') return null;

  const currentBlanks: Blanks = state.blanks;
  const isEditable = state.status === 'filling';
  const allFilled = blankNames.every(n => (currentBlanks[n] ?? '').trim().length > 0);

  const showAiResponse =
    state.status === 'streaming' ||
    state.status === 'response_received' ||
    state.status === 'complete' ||
    state.status === 'revealed' ||
    state.status === 'error_parse';

  const aiResponseText =
    state.status === 'streaming'
      ? state.partialResponse
      : state.status === 'response_received' ||
        state.status === 'complete' ||
        state.status === 'revealed' ||
        state.status === 'error_parse'
        ? state.aiResponse
        : '';

  const showActionButtons =
    state.status === 'complete' ||
    state.status === 'revealed' ||
    state.status === 'error_parse' ||
    state.status === 'error_api' ||
    state.status === 'error_rate_limit';

  const renderTemplateWithInputs = () => {
    const tokens: (string | { name: string })[] = [];
    let lastIndex = 0;
    for (const match of block.template.matchAll(BLANK_REGEX)) {
      if (match.index! > lastIndex) tokens.push(block.template.slice(lastIndex, match.index!));
      tokens.push({ name: match[1] });
      lastIndex = match.index! + match[0].length;
    }
    if (lastIndex < block.template.length) tokens.push(block.template.slice(lastIndex));

    return (
      <div className="bg-[#F4F4F4] border border-black p-4 text-sm leading-loose">
        {tokens.map((tok, i) =>
          typeof tok === 'string' ? (
            <span key={i} className="whitespace-pre-wrap">{tok}</span>
          ) : (
            <input
              key={i}
              type="text"
              value={currentBlanks[tok.name] ?? ''}
              onChange={e => dispatch({ type: 'UPDATE_BLANK', name: tok.name, value: e.target.value })}
              disabled={!isEditable}
              placeholder={tok.name.replace(/_/g, ' ')}
              aria-label={tok.name.replace(/_/g, ' ')}
              className="inline-block min-w-[140px] mx-1 px-2 py-1 bg-white border border-black text-sm font-semibold disabled:bg-[#EFEFEF] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-[#FF6A00]" strokeWidth={2} />
        <h3 className="font-extrabold text-lg uppercase tracking-tight">{block.label}</h3>
      </div>

      <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{block.scenario}</p>

      <div className="mb-4">
        <p className="text-xs font-extrabold uppercase tracking-tight text-[#666] mb-2">Your Prompt</p>
        {renderTemplateWithInputs()}
      </div>

      {isEditable && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="flex items-center gap-2 bg-black text-white border border-black px-5 py-2.5 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_#000000]"
        >
          Submit
        </button>
      )}

      {state.status === 'submitting' && (
        <div className="flex items-center gap-2 text-sm text-[#666] mt-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FF6A00]" strokeWidth={2} />
          Generating response…
        </div>
      )}

      {showAiResponse && (
        <div className="mt-6">
          <p className="text-xs font-extrabold uppercase tracking-tight text-[#666] mb-2">AI Response</p>
          <div className="bg-[#F4F4F4] border border-black p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[60px]">
            {aiResponseText || <span className="text-[#999]">…</span>}
          </div>
        </div>
      )}

      {state.status === 'response_received' && (
        <div className="flex items-center gap-2 text-sm text-[#666] mt-4">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FF6A00]" strokeWidth={2} />
          Evaluating your prompt…
        </div>
      )}

      {(state.status === 'complete' || state.status === 'revealed') && (
        <div className="mt-6 bg-[#E8F5E9] border border-black p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" strokeWidth={2} />
            <p className="font-extrabold text-sm uppercase tracking-tight">Feedback</p>
          </div>

          {state.feedback.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-tight text-[#666] mb-1">Strengths</p>
              <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
                {state.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {state.feedback.improvements.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-tight text-[#666] mb-1">Improvements</p>
              <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
                {state.feedback.improvements.map((imp, i) => {
                  const crit = block.criteria.find(c => c.id === imp.criterion);
                  return (
                    <li key={i}>
                      <span className="font-semibold">{crit?.label ?? imp.criterion}:</span> {imp.suggestion}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {state.feedback.summary && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-tight text-[#666] mb-1">Summary</p>
              <p className="text-sm leading-relaxed">{state.feedback.summary}</p>
            </div>
          )}
        </div>
      )}

      {state.status === 'revealed' && (
        <div className="mt-4 bg-[#FFF9E6] border border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-[#FF6A00]" strokeWidth={2} />
            <p className="font-extrabold text-sm uppercase tracking-tight">Reference Solution</p>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.referenceSolution}</p>
        </div>
      )}

      {state.status === 'error_parse' && (
        <div className="mt-4 bg-[#FFF3E0] border border-black p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF6A00] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm leading-relaxed">
              We couldn't generate detailed feedback this time. Your prompt and the AI's response are above — feel free to revise and try again.
            </p>
          </div>
        </div>
      )}

      {state.status === 'error_api' && (
        <div className="mt-4 bg-[#FFEBEE] border border-black p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#C62828] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm leading-relaxed">Something went wrong. Try submitting again.</p>
          </div>
        </div>
      )}

      {state.status === 'error_rate_limit' && (
        <div className="mt-4 bg-[#FFF3E0] border border-black p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF6A00] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm leading-relaxed">
              You've hit the request limit. Try again in a minute
              {state.retryAfterSeconds ? ` (about ${state.retryAfterSeconds}s)` : ''}.
            </p>
          </div>
        </div>
      )}

      {showActionButtons && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleTryAgain}
            className="flex items-center gap-2 bg-white text-black border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            Try Again
          </button>

          {(state.status === 'complete' || state.status === 'revealed') && (
            <button
              onClick={handleToggleReference}
              className="flex items-center gap-2 bg-[#FF6A00] text-black border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              {state.status === 'revealed' ? 'Hide Reference' : 'Show Reference Solution'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
