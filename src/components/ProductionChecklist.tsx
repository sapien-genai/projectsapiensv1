import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import OpenMoji from './OpenMoji';

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
}

const checklistItems: ChecklistItem[] = [
  { id: 'script-finalized', label: 'Script finalized and printed', category: 'pre-production' },
  { id: 'location-prepared', label: 'Location chosen and prepared', category: 'pre-production' },
  { id: 'props-gathered', label: 'Props/materials gathered', category: 'pre-production' },
  { id: 'lighting-tested', label: 'Lighting tested', category: 'pre-production' },
  { id: 'camera-positioned', label: 'Camera/phone positioned', category: 'pre-production' },
  { id: 'audio-tested', label: 'Audio test completed', category: 'pre-production' },
  { id: 'record-hook', label: 'Record hook first (do 5 takes, pick best)', category: 'filming' },
  { id: 'film-intro', label: 'Film intro', category: 'filming' },
  { id: 'record-main', label: 'Record main sections', category: 'filming' },
  { id: 'capture-broll', label: 'Capture B-roll footage', category: 'filming' },
  { id: 'film-outro', label: 'Film outro with CTA', category: 'filming' },
  { id: 'thumbnail-shot', label: 'Get thumbnail shot', category: 'filming' },
  { id: 'import-footage', label: 'Import footage', category: 'post-production' },
  { id: 'rough-cut', label: 'Rough cut edit', category: 'post-production' },
  { id: 'add-text', label: 'Add text overlays', category: 'post-production' },
  { id: 'add-music', label: 'Add music/sound', category: 'post-production' },
  { id: 'color-correction', label: 'Color correction', category: 'post-production' },
  { id: 'export-review', label: 'Export and review', category: 'post-production' },
];

export default function ProductionChecklist() {
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
        .from('production_checklist_progress')
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
        .from('production_checklist_progress')
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
            VIDEO PRODUCTION CHECKLIST
          </h3>
          <p className="text-xs text-[#555555]">
            Track your progress through pre-production, filming, and post-production
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
            className="h-full bg-[#FF6A00] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-[#555555] mt-1">{progressPercentage}% Complete</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              PRE-PRODUCTION
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('pre-production').completed} / {getCategoryProgress('pre-production').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('pre-production').map((item) => (
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

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              FILMING
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('filming').completed} / {getCategoryProgress('filming').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('filming').map((item) => (
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

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm uppercase tracking-tight">
              POST-PRODUCTION
            </h4>
            <span className="text-xs font-semibold text-[#555555]">
              {getCategoryProgress('post-production').completed} / {getCategoryProgress('post-production').total}
            </span>
          </div>
          <div className="space-y-2">
            {getCategoryItems('post-production').map((item) => (
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

      {progressPercentage === 100 && (
        <div className="mt-6 bg-[#4CAF50] border border-black p-4 text-black">
          <p className="font-extrabold text-sm uppercase tracking-tight mb-1 flex items-center gap-2">
            PRODUCTION COMPLETE!
            <OpenMoji emoji="🎉" size={20} />
          </p>
          <p className="text-xs leading-relaxed">
            Congratulations! You've completed all production tasks. Time to publish your video!
          </p>
        </div>
      )}

      <div className="mt-6 bg-[#E3F2FD] border border-black p-3">
        <p className="text-xs font-semibold mb-1">PRO TIP:</p>
        <p className="text-xs leading-relaxed">
          Check off items as you complete them. This helps you stay organized and ensures nothing gets forgotten in the production process.
        </p>
      </div>
    </div>
  );
}
