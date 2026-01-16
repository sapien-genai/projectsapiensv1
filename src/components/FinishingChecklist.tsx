import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
}

const checklistItems: ChecklistItem[] = [
  // Technical Quality
  { id: 'proper-resolution', label: 'Proper resolution for use case', category: 'technical' },
  { id: 'accurate-colors', label: 'Colors are accurate and consistent', category: 'technical' },
  { id: 'no-artifacts', label: 'No artifacts or errors', category: 'technical' },
  { id: 'proper-format', label: 'Proper file format (PNG/JPG/SVG)', category: 'technical' },
  { id: 'optimized-size', label: 'Optimized file size', category: 'technical' },

  // Visual Polish
  { id: 'balanced-composition', label: 'Composition is balanced', category: 'visual' },
  { id: 'harmonious-colors', label: 'Colors are harmonious', category: 'visual' },
  { id: 'appropriate-contrast', label: 'Contrast is appropriate', category: 'visual' },
  { id: 'readable-typography', label: 'Typography is readable', category: 'visual' },
  { id: 'clear-hierarchy', label: 'Visual hierarchy is clear', category: 'visual' },

  // Brand Consistency
  { id: 'matches-style-guide', label: 'Matches brand style guide', category: 'brand' },
  { id: 'aligned-colors', label: 'Colors align with palette', category: 'brand' },
  { id: 'fits-assets', label: 'Fits with other brand assets', category: 'brand' },
  { id: 'professional-quality', label: 'Professional quality', category: 'brand' },

  // Functional
  { id: 'works-at-size', label: 'Works at intended size', category: 'functional' },
  { id: 'mobile-readable', label: 'Readable on mobile', category: 'functional' },
  { id: 'platform-appropriate', label: 'Appropriate for platform', category: 'functional' },
  { id: 'meets-specs', label: 'Meets technical specs (if required)', category: 'functional' },
];

export default function FinishingChecklist() {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('finishing_checklist_progress')
        .select('completed_items')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.completed_items) {
        setCompletedItems(new Set(data.completed_items));
      }
    } catch (error) {
      console.error('Error loading checklist progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (items: Set<string>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('finishing_checklist_progress')
        .upsert({
          user_id: user.id,
          completed_items: Array.from(items),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving checklist progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
    saveProgress(newCompleted);
  };

  const resetChecklist = async () => {
    const newCompleted = new Set<string>();
    setCompletedItems(newCompleted);
    if (user) {
      await saveProgress(newCompleted);
    }
  };

  const getCategoryItems = (category: string) => {
    return checklistItems.filter(item => item.category === category);
  };

  const getCategoryProgress = (category: string) => {
    const items = getCategoryItems(category);
    const completed = items.filter(item => completedItems.has(item.id)).length;
    return { completed, total: items.length };
  };

  const totalProgress = {
    completed: completedItems.size,
    total: checklistItems.length,
  };

  const progressPercentage = Math.round((totalProgress.completed / totalProgress.total) * 100);
  const isComplete = progressPercentage === 100;

  if (isLoading) {
    return (
      <div className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-[#555555]">Loading checklist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-lg uppercase tracking-tight mb-1">
            THE PROFESSIONAL FINISHING CHECKLIST
          </h3>
          <p className="text-xs text-[#555555]">
            Before you call any visual "done" — check every box
          </p>
        </div>
        <button
          onClick={resetChecklist}
          className="p-2 border border-black bg-white hover:bg-[#F4F4F4] transition-colors"
          title="Reset checklist"
          disabled={isSaving}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {!user && (
        <div className="mb-6 bg-[#FFF9E6] border border-black p-4">
          <p className="text-xs font-semibold mb-1">SIGN IN TO SAVE PROGRESS</p>
          <p className="text-xs leading-relaxed">
            Your checklist progress will be saved automatically when you're signed in.
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-tight">
            OVERALL PROGRESS
          </span>
          <span className="text-xs font-semibold">
            {totalProgress.completed} / {totalProgress.total}
          </span>
        </div>
        <div className="w-full h-3 bg-[#F4F4F4] border border-black">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? 'bg-[#4CAF50]' : 'bg-[#0A74FF]'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-[#555555] mt-1">{progressPercentage}% Complete</p>
      </div>

      <div className="space-y-6">
        {/* Technical Quality */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              TECHNICAL QUALITY
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('technical').completed} / {getCategoryProgress('technical').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('technical').map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 border border-black transition-all text-left ${
                  completedItems.has(item.id)
                    ? 'bg-[#E3F2FD] shadow-none'
                    : 'bg-white hover:bg-[#F4F4F4] shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                disabled={isSaving}
              >
                {completedItems.has(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0 text-[#555555]" strokeWidth={2} />
                )}
                <span className={`text-sm ${completedItems.has(item.id) ? 'line-through text-[#555555]' : 'text-black'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Polish */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              VISUAL POLISH
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('visual').completed} / {getCategoryProgress('visual').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('visual').map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 border border-black transition-all text-left ${
                  completedItems.has(item.id)
                    ? 'bg-[#E3F2FD] shadow-none'
                    : 'bg-white hover:bg-[#F4F4F4] shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                disabled={isSaving}
              >
                {completedItems.has(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0 text-[#555555]" strokeWidth={2} />
                )}
                <span className={`text-sm ${completedItems.has(item.id) ? 'line-through text-[#555555]' : 'text-black'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Consistency */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              BRAND CONSISTENCY
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('brand').completed} / {getCategoryProgress('brand').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('brand').map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 border border-black transition-all text-left ${
                  completedItems.has(item.id)
                    ? 'bg-[#E3F2FD] shadow-none'
                    : 'bg-white hover:bg-[#F4F4F4] shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                disabled={isSaving}
              >
                {completedItems.has(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0 text-[#555555]" strokeWidth={2} />
                )}
                <span className={`text-sm ${completedItems.has(item.id) ? 'line-through text-[#555555]' : 'text-black'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Functional */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              FUNCTIONAL
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('functional').completed} / {getCategoryProgress('functional').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('functional').map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 border border-black transition-all text-left ${
                  completedItems.has(item.id)
                    ? 'bg-[#E3F2FD] shadow-none'
                    : 'bg-white hover:bg-[#F4F4F4] shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                disabled={isSaving}
              >
                {completedItems.has(item.id) ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0 text-[#555555]" strokeWidth={2} />
                )}
                <span className={`text-sm ${completedItems.has(item.id) ? 'line-through text-[#555555]' : 'text-black'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isComplete ? (
        <div className="mt-6 bg-[#4CAF50] border border-black p-4 text-black">
          <p className="font-extrabold text-sm uppercase tracking-tight mb-1">
            PROFESSIONAL QUALITY ACHIEVED!
          </p>
          <p className="text-xs leading-relaxed">
            All quality checks passed. Your visual work is ready for production. This is the difference between amateur and professional.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-[#E3F2FD] border border-black p-3">
          <p className="text-xs font-semibold mb-1">REMEMBER:</p>
          <p className="text-xs leading-relaxed">
            If any checkbox is empty, it's not done yet. The difference between amateur and professional is in the finishing. AI gets you 80% there. The final 20% is what makes it excellent.
          </p>
        </div>
      )}
    </div>
  );
}
