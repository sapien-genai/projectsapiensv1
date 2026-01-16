import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChecklistItem {
  id: string;
  label: string;
  week: number;
}

const checklistItems: ChecklistItem[] = [
  { id: 'week1-hub', label: 'Choose your hub platform', week: 1 },
  { id: 'week1-calendar', label: 'Connect calendar', week: 1 },
  { id: 'week1-tasks', label: 'Set up task capture system', week: 1 },
  { id: 'week1-dashboard', label: 'Create morning dashboard template', week: 1 },
  { id: 'week1-test', label: 'Test for 3 days', week: 1 },
  { id: 'week2-email', label: 'Add email integration', week: 2 },
  { id: 'week2-priority', label: 'Build AI priority system', week: 2 },
  { id: 'week2-review', label: 'Create evening review routine', week: 2 },
  { id: 'week2-planning', label: 'Set up weekly planning', week: 2 },
  { id: 'week2-refine', label: 'Refine based on usage', week: 2 },
  { id: 'week3-projects', label: 'Add project tracking', week: 3 },
  { id: 'week3-learning', label: 'Integrate learning goals', week: 3 },
  { id: 'week3-decisions', label: 'Build decision framework', week: 3 },
  { id: 'week3-knowledge', label: 'Create personal knowledge base', week: 3 },
  { id: 'week3-optimize', label: 'Optimize and customize', week: 3 },
  { id: 'week4-automated', label: 'Everything runs automatically', week: 4 },
  { id: 'week4-saved', label: '2+ hours saved daily', week: 4 },
  { id: 'week4-zero', label: 'Zero things falling through cracks', week: 4 },
  { id: 'week4-natural', label: 'System feels natural', week: 4 },
  { id: 'week4-teach', label: 'Ready to teach others', week: 4 },
];

const weekTitles = {
  1: 'WEEK 1: Core Setup',
  2: 'WEEK 2: Automation Layer',
  3: 'WEEK 3: Advanced Features',
  4: 'WEEK 4: Mastery',
};

export default function IntegrationChecklist() {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
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
        .from('integration_checklist_progress')
        .select('item_id, completed')
        .eq('user_id', user.id);

      if (error) throw error;

      const completed = new Set(
        data?.filter(item => item.completed).map(item => item.item_id) || []
      );
      setCompletedItems(completed);
    } catch (error) {
      console.error('Error loading checklist progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    if (!user) {
      alert('Please sign in to save your progress');
      return;
    }

    const isCompleted = completedItems.has(itemId);
    const newCompleted = new Set(completedItems);

    if (isCompleted) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }

    setCompletedItems(newCompleted);

    try {
      const { error } = await supabase
        .from('integration_checklist_progress')
        .upsert({
          user_id: user.id,
          item_id: itemId,
          completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,item_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving checklist progress:', error);
      setCompletedItems(completedItems);
    }
  };

  const getWeekProgress = (week: number) => {
    const weekItems = checklistItems.filter(item => item.week === week);
    const completed = weekItems.filter(item => completedItems.has(item.id)).length;
    return { completed, total: weekItems.length };
  };

  const totalProgress = () => {
    return {
      completed: completedItems.size,
      total: checklistItems.length,
    };
  };

  const progress = totalProgress();
  const progressPercent = Math.round((progress.completed / progress.total) * 100);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Your Integration Checklist
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-slate-700 min-w-[80px] text-right">
            {progress.completed} / {progress.total} ({progressPercent}%)
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map(week => {
          const weekProgress = getWeekProgress(week);
          const weekPercent = Math.round((weekProgress.completed / weekProgress.total) * 100);

          return (
            <div key={week} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-800">
                  {weekTitles[week as keyof typeof weekTitles]}
                </h4>
                <span className="text-sm text-slate-600">
                  {weekProgress.completed}/{weekProgress.total} ({weekPercent}%)
                </span>
              </div>

              <div className="space-y-2">
                {checklistItems
                  .filter(item => item.week === week)
                  .map(item => {
                    const isCompleted = completedItems.has(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all
                          ${isCompleted
                            ? 'bg-blue-50 border-blue-300 hover:border-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <div
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                            ${isCompleted
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-slate-300'
                            }
                          `}
                        >
                          {isCompleted && (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>

                        <span
                          className={`
                            text-left transition-all
                            ${isCompleted
                              ? 'text-slate-700 line-through'
                              : 'text-slate-900'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Sign in to save your checklist progress across sessions.
          </p>
        </div>
      )}
    </div>
  );
}
