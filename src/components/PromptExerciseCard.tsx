import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ExternalLink, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PromptExerciseCardProps {
  exerciseNumber: number;
  title: string;
  description: string;
  guidancePoints: string[];
  exampleBad?: string;
  exampleGood?: string;
  pathId: string;
  lessonId: string;
  onOpenPromptLibrary?: () => void;
}

export default function PromptExerciseCard({
  exerciseNumber,
  title,
  description,
  guidancePoints,
  exampleBad,
  exampleGood,
  pathId,
  lessonId,
  onOpenPromptLibrary
}: PromptExerciseCardProps) {
  const { user } = useAuth();
  const [promptDraft, setPromptDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const exerciseKey = `exercise-${exerciseNumber}-${title}`;

  useEffect(() => {
    loadSavedPrompt();
  }, [user, exerciseKey]);

  const loadSavedPrompt = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('lesson_exercise_data')
      .select('exercise_data')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('exercise_key', exerciseKey)
      .maybeSingle();

    if (data?.exercise_data?.prompt) {
      setPromptDraft(data.exercise_data.prompt);
      setSaved(true);
    }
  };

  const savePrompt = async () => {
    if (!user || !promptDraft.trim()) return;

    setSaving(true);

    const { error } = await supabase
      .from('lesson_exercise_data')
      .upsert({
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        exercise_key: exerciseKey,
        exercise_data: { prompt: promptDraft },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id,exercise_key'
      });

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] overflow-hidden">
      <div className="bg-[#FF6A00] border-b border-black px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg uppercase tracking-tight text-black">
            Exercise {exerciseNumber}: {title}
          </h3>
          <span className="text-xs font-semibold bg-black text-white px-3 py-1 uppercase tracking-tight">
            Prompt Practice
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <p className="text-[#1C1A17] leading-relaxed mb-4">{description}</p>

          <div className="bg-[#FFF9E6] border border-[#E6D5A0] p-4 rounded-lg">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 flex-shrink-0 text-[#F4A261] mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-2 text-[#1C1A17]">Your prompt should include:</p>
                <ul className="space-y-1.5">
                  {guidancePoints.map((point, index) => (
                    <li key={index} className="text-sm text-[#57524D] flex items-start gap-2">
                      <span className="text-[#F4A261] mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {(exampleBad || exampleGood) && (
            <div className="mt-4 space-y-3">
              {exampleBad && (
                <div className="bg-[#FFE8E8] border border-[#FFCCCC] px-4 py-3 rounded">
                  <p className="text-xs font-semibold text-[#CC0000] uppercase tracking-tight mb-1">
                    Bad Example
                  </p>
                  <p className="text-sm text-[#57524D] italic">{exampleBad}</p>
                </div>
              )}
              {exampleGood && (
                <div className="bg-[#E8F5E8] border border-[#C0E0C0] px-4 py-3 rounded">
                  <p className="text-xs font-semibold text-[#006600] uppercase tracking-tight mb-1">
                    Good Example
                  </p>
                  <p className="text-sm text-[#57524D] italic">{exampleGood}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold text-sm mb-2 text-[#1C1A17] uppercase tracking-tight">
            Write Your Prompt
          </label>
          <textarea
            value={promptDraft}
            onChange={(e) => {
              setPromptDraft(e.target.value);
              if (saved) setSaved(false);
            }}
            placeholder="Write your detailed prompt here..."
            className="w-full min-h-[140px] p-4 bg-[#F8F5F2] border-2 border-[#E9E5E0] focus:border-[#F4A261] focus:outline-none text-[#1C1A17] placeholder-[#B0ABA5] text-base leading-relaxed resize-y transition-colors"
            rows={5}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={savePrompt}
            disabled={saving || !promptDraft.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm uppercase tracking-tight transition-all border border-black ${
              saved
                ? 'bg-[#98C9A3] text-black'
                : 'bg-[#F4A261] text-white shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                Saved
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                Save Progress
              </>
            )}
          </button>

          {onOpenPromptLibrary && (
            <button
              onClick={onOpenPromptLibrary}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white border border-black font-bold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
              Open Prompt Library
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
