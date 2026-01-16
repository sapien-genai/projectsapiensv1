import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CHECKLIST_ITEMS = [
  { id: 'assumptions', label: 'Did I ask for assumptions?' },
  { id: 'sources', label: 'Did I request sources and citations?' },
  { id: 'contradicting', label: 'Did I seek contradicting evidence?' },
  { id: 'calculations', label: 'Did I verify any calculations?' },
  { id: 'crosscheck', label: 'Did I cross-check with another model?' }
];

export default function VerificationChecklist() {
  const { user } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_exercise_responses')
        .select('response_data')
        .eq('user_id', user.id)
        .eq('lesson_id', 'mastery-lesson-3-2')
        .eq('exercise_id', 'verification-checklist')
        .maybeSingle();

      if (error) throw error;

      if (data?.response_data?.checkedItems) {
        setCheckedItems(new Set(data.response_data.checkedItems));
      }
    } catch (error) {
      console.error('Error loading verification checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (newCheckedItems: Set<string>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_exercise_responses')
        .upsert({
          user_id: user.id,
          path_id: 'mastery',
          lesson_id: 'mastery-lesson-3-2',
          exercise_id: 'verification-checklist',
          response_data: { checkedItems: Array.from(newCheckedItems) }
        }, {
          onConflict: 'user_id,lesson_id,exercise_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving verification checklist:', error);
    }
  };

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    saveProgress(newCheckedItems);
  };

  if (loading) {
    return (
      <div className="my-6 p-6 bg-white rounded-lg border-l-4 border-[#F4A261]">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-[#E9E5E0] rounded w-3/4"></div>
          <div className="h-6 bg-[#E9E5E0] rounded w-2/3"></div>
          <div className="h-6 bg-[#E9E5E0] rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const completedCount = checkedItems.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="my-6">
      <div className="bg-white rounded-lg border-l-4 border-[#F4A261] p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1C1A17]">
              {completedCount} of {totalCount} completed
            </span>
            <span className="text-sm text-[#57524D]">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-2 bg-[#E9E5E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F4A261] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    transition-all duration-200 cursor-pointer
                    ${isChecked
                      ? 'bg-[#F4A261] border-[#F4A261]'
                      : 'bg-white border-[#57524D] group-hover:border-[#F4A261]'
                    }
                  `}
                >
                  {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span
                  className={`
                    text-base transition-all duration-200
                    ${isChecked
                      ? 'text-[#57524D] line-through'
                      : 'text-[#1C1A17] group-hover:text-[#F4A261]'
                    }
                  `}
                >
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === totalCount && (
          <div className="mt-4 p-3 bg-[#98C9A3] bg-opacity-20 border border-[#98C9A3] rounded-lg">
            <p className="text-sm text-[#1C1A17] font-medium">
              Excellent! You've completed all verification checks. This habit will save you hours of wasted effort.
            </p>
          </div>
        )}

        {!user && (
          <div className="mt-4 p-3 bg-[#E9E5E0] rounded-lg">
            <p className="text-sm text-[#57524D]">
              Sign in to save your progress across devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
