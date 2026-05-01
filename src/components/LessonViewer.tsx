import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Lightbulb, Zap, Save, ExternalLink, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { lessonContent } from '../data/lessonContent';
import { paths } from '../data/paths';
import OpenMoji from './OpenMoji';
import BaselineTracker from './BaselineTracker';
import BaselineAnalysis from './BaselineAnalysis';
import PromptTester from './PromptTester';
import IntegrationChecklist from './IntegrationChecklist';
import CreativeVoicePractice from './CreativeVoicePractice';
import ProductionChecklist from './ProductionChecklist';
import FinishingChecklist from './FinishingChecklist';
import LabSandbox from './LabSandbox';
import LaunchCommitmentForm from './LaunchCommitmentForm';
import PromptExerciseCard from './PromptExerciseCard';
import {
  TimeAllocationForm,
  GoalsDefinitionForm,
  TaskScoringForm,
  WeeklyRitualForm,
  CompletePrioritySystemForm
} from './PriorityMatrixForms';
import {
  TimeInventoryForm,
  ROICalculatorForm,
  BusinessPriorityForm,
  InvestmentPlanForm,
  CurrentTasksScoringForm,
  AIPriorityPromptForm,
  BlogPostPracticeForm,
  ContentIdeaForm,
  FirstPromptForm,
  AIAwarenessForm
} from './InteractiveForms';
import PromptPracticeChat from './PromptPracticeChat';
import FullscreenLabOverlay from './FullscreenLabOverlay';
import VerificationChecklist from './VerificationChecklist';

interface LessonViewerProps {
  pathId: string;
  moduleId: string;
  lessonId: string;
  onBack?: () => void;
  onComplete?: () => void;
  onPromptsClick?: () => void;
  onCommandCenterClick?: () => void;
}

const fallbackLesson = {
  title: 'Lesson Content Coming Soon',
  duration: '10 min',
  content: [
    {
      type: 'text' as const,
      content: `# This lesson is being prepared

We're working on creating amazing content for this lesson. Check back soon!`
    }
  ]
};

export default function LessonViewer({ pathId, moduleId, lessonId, onBack, onComplete, onPromptsClick, onCommandCenterClick }: LessonViewerProps) {
  const { user } = useAuth();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [journalEntries, setJournalEntries] = useState<Record<number, string>>({});
  const [savingJournal, setSavingJournal] = useState<Record<number, boolean>>({});
  const [savedJournal, setSavedJournal] = useState<Record<number, boolean>>({});
  const [activeLabTool, setActiveLabTool] = useState<string | null>(null);
  const [activeLabTitle, setActiveLabTitle] = useState<string>('');
  const [activeLabSubtitle, setActiveLabSubtitle] = useState<string>('');
  const [activeLabType, setActiveLabType] = useState<'writing' | 'decision-making' | 'schedule' | 'learning-path' | 'aim-framework' | 'map-framework' | 'debug-patterns' | 'ocean-framework'>('writing');
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [copiedBlocks, setCopiedBlocks] = useState<Record<number, boolean>>({});

  const lesson = lessonContent[lessonId] || fallbackLesson;

  useEffect(() => {
    loadJournalEntries();
  }, [lessonId, user]);

  const loadJournalEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lesson_journal_entries')
      .select('prompt_text, user_response')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Error loading journal entries:', error);
      return;
    }

    if (data) {
      const entries: Record<number, string> = {};
      const saved: Record<number, boolean> = {};
      lesson.content.forEach((block, index) => {
        if (block.type === 'exercise') {
          const entry = data.find(e => e.prompt_text === block.content);
          if (entry) {
            entries[index] = entry.user_response;
            saved[index] = true;
          }
        }
      });
      setJournalEntries(entries);
      setSavedJournal(saved);
    }
  };

  const saveJournalEntry = async (blockIndex: number, promptText: string, response: string) => {
    if (!user || !response.trim()) return;

    setSavingJournal(prev => ({ ...prev, [blockIndex]: true }));

    const { error } = await supabase
      .from('lesson_journal_entries')
      .upsert({
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        prompt_text: promptText,
        user_response: response,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id,prompt_text'
      });

    setSavingJournal(prev => ({ ...prev, [blockIndex]: false }));

    if (!error) {
      setSavedJournal(prev => ({ ...prev, [blockIndex]: true }));
    }
  };

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => ({ ...prev, [blockIndex]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [blockIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleComplete = async () => {
    if (!user || completing || completed) return;

    setCompleting(true);

    // Map frontend path IDs to database slugs
    const pathSlugMap: Record<string, string> = {
      'ai-everyday-life': 'ai-everyday',
      'ai-for-creators': 'ai-creators',
      'ai-for-small-business': 'ai-small-business',
      'ai-for-productivity': 'ai-productivity',
      'ai-prompting-mastery': 'ai-prompting-mastery'
    };

    const dbSlug = pathSlugMap[pathId] || pathId;

    // Get the UUID for this path
    const { data: pathData } = await supabase
      .from('learning_paths')
      .select('id')
      .eq('slug', dbSlug)
      .maybeSingle();

    if (!pathData) {
      console.error('Path not found:', dbSlug);
      setCompleting(false);
      return;
    }

    const pathUuid = pathData.id;

    const { data: existingProgress } = await supabase
      .from('user_path_progress')
      .select('completed_lessons')
      .eq('user_id', user.id)
      .eq('path_id', pathUuid)
      .maybeSingle();

    const currentCompleted = existingProgress?.completed_lessons || [];

    if (!currentCompleted.includes(lessonId)) {
      const updatedCompleted = [...currentCompleted, lessonId];

      // Calculate total lessons for this path
      const pathData = paths[pathId];
      const totalLessons = pathData?.missions.reduce((total, m) => total + m.steps.length, 0) || 21;

      // Use upsert to create or update the progress record
      const { error: updateError } = await supabase
        .from('user_path_progress')
        .upsert({
          user_id: user.id,
          path_id: pathUuid,
          completed_lessons: updatedCompleted,
          current_module: moduleId,
          progress_percentage: Math.round((updatedCompleted.length / totalLessons) * 100),
          status: 'in_progress',
          started_at: existingProgress ? undefined : new Date().toISOString()
        }, {
          onConflict: 'user_id,path_id'
        });

      if (updateError) {
        console.error('Error saving progress:', updateError);
        setCompleting(false);
        return;
      }

      // Get current XP and increment it
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('xp')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentXp = profileData?.xp || 0;

      await supabase
        .from('user_profiles')
        .update({ xp: currentXp + 50 })
        .eq('user_id', user.id);
    }

    setCompleted(true);
    setCompleting(false);

    setTimeout(() => {
      onComplete?.();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          BACK TO PATH
        </button>

        <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-semibold">{lesson.duration}</span>
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl uppercase tracking-tighter leading-none mb-8">
            {lesson.title}
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none space-y-6">
            {lesson.content.map((block, index) => {
              if (block.type === 'text') {
                return (
                  <div key={index} className="whitespace-pre-line font-sans leading-relaxed">
                    {block.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h2 key={i} className="font-extrabold text-2xl uppercase tracking-tight mt-8 mb-4 text-[#1C1A17]">{line.substring(2)}</h2>;
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="font-extrabold text-xl uppercase tracking-tight mt-6 mb-4 text-[#1C1A17]">{line.substring(3)}</h3>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mb-3">{line.slice(2, -2)}</p>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={i} className="ml-6 mb-3">{line.substring(line.indexOf('.') + 2)}</li>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={i} className="ml-6 mb-3">{line.substring(2)}</li>;
                      }
                      if (line.trim()) {
                        return <p key={i} className="mb-4">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                );
              }

              if (block.type === 'tip') {
                return (
                  <div key={index} className="bg-[#FFF9E6] p-6 border border-black shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
                    <div className="flex gap-4">
                      <Lightbulb className="w-6 h-6 flex-shrink-0 text-[#FF6A00]" strokeWidth={2} />
                      <div>
                        <p className="font-extrabold text-sm uppercase tracking-tight mb-2">Pro Tip</p>
                        <p className="text-sm leading-relaxed">{block.content}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.type === 'example') {
                const lines = block.content.split('\n');
                const hasPrompt = lines.some(line => line.startsWith('"') && line.endsWith('"'));
                const promptText = hasPrompt ? lines.find(line => line.startsWith('"') && line.endsWith('"'))?.slice(1, -1) : '';
                const isScheduleOptimizer = lessonId === 'lesson-2-3' && block.content.includes('Schedule Optimization Prompt');
                const isDecisionMaking = lessonId === 'lesson-2-4' && block.content.includes('Medium Decision Prompt');

                return (
                  <div key={index} className="bg-[#E3F2FD] p-4 md:p-6 border border-black shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000] relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {isScheduleOptimizer && (
                        <button
                          onClick={() => {
                            setActiveLabType('schedule');
                            setActiveLabTool('prompt-practice-chat');
                            setActiveLabTitle('Try This Prompt');
                            setActiveLabSubtitle('Practice the schedule optimization prompt in our AI chat');
                          }}
                          className="p-2 bg-[#0A74FF] hover:bg-[#0960d9] text-white rounded transition-colors shadow-sm"
                          title="Try this prompt in AI chat"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}
                      {isDecisionMaking && (
                        <button
                          onClick={() => {
                            setActiveLabType('decision-making');
                            setActiveLabTool('prompt-practice-chat');
                            setActiveLabTitle('Try This Prompt');
                            setActiveLabSubtitle('Practice the decision-making prompt in our AI chat');
                          }}
                          className="p-2 bg-[#0A74FF] hover:bg-[#0960d9] text-white rounded transition-colors shadow-sm"
                          title="Try this prompt in AI chat"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}
                      {hasPrompt && promptText && (
                        <button
                          onClick={() => copyToClipboard(promptText, index)}
                          className="p-2 bg-[#0A74FF] hover:bg-[#0960d9] text-white rounded transition-colors shadow-sm"
                          title="Copy prompt"
                        >
                          {copiedBlocks[index] ? (
                            <Check className="w-4 h-4" strokeWidth={2} />
                          ) : (
                            <Copy className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Zap className="w-6 h-6 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                      <div className="text-sm leading-relaxed whitespace-pre-line pr-20">
                        {lines.map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-semibold mb-3">{line.slice(2, -2)}</p>;
                          }
                          if (line.trim()) {
                            return <p key={i} className="mb-2">{line}</p>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.type === 'prompt-lab') {
                const lines = block.content.split('\n');
                const hasPrompt = lines.some(line => line.startsWith('"') && line.endsWith('"'));
                const promptText = hasPrompt ? lines.find(line => line.startsWith('"') && line.endsWith('"'))?.slice(1, -1) : '';
                const isLearningPath = lessonId === 'lesson-3-1' && block.content.includes('Sample Learning Path Prompt');

                return (
                  <div key={index} className="bg-[#E3F2FD] p-4 md:p-6 border border-black shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000] relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {isLearningPath && (
                        <button
                          onClick={() => {
                            setActiveLabType('learning-path');
                            setActiveLabTool('prompt-practice-chat');
                            setActiveLabTitle('Try This Prompt');
                            setActiveLabSubtitle('Practice creating your personal learning path in our AI chat');
                          }}
                          className="p-2 bg-[#0A74FF] hover:bg-[#0960d9] text-white rounded transition-colors shadow-sm"
                          title="Try this prompt in AI chat"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}
                      {hasPrompt && promptText && (
                        <button
                          onClick={() => copyToClipboard(promptText, index)}
                          className="p-2 bg-[#0A74FF] hover:bg-[#0960d9] text-white rounded transition-colors shadow-sm"
                          title="Copy prompt"
                        >
                          {copiedBlocks[index] ? (
                            <Check className="w-4 h-4" strokeWidth={2} />
                          ) : (
                            <Copy className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Zap className="w-6 h-6 flex-shrink-0 text-[#0A74FF]" strokeWidth={2} />
                      <div className="text-sm leading-relaxed whitespace-pre-line pr-20">
                        {lines.map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-extrabold uppercase tracking-tight mb-2 text-black">{line.slice(2, -2)}</p>;
                          }
                          if (line.startsWith('"') && line.endsWith('"')) {
                            return <p key={i} className="italic text-black font-medium mb-2">{line}</p>;
                          }
                          if (line.trim()) {
                            return <p key={i} className="mb-2 text-black">{line}</p>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.type === 'prompt-exercise') {
                const promptBlock = block as any;
                return (
                  <PromptExerciseCard
                    key={index}
                    exerciseNumber={promptBlock.exerciseNumber}
                    title={promptBlock.title}
                    description={promptBlock.description}
                    guidancePoints={promptBlock.guidancePoints}
                    exampleBad={promptBlock.exampleBad}
                    exampleGood={promptBlock.exampleGood}
                    pathId={pathId}
                    lessonId={lessonId}
                    onOpenPromptLibrary={onPromptsClick}
                  />
                );
              }

              if (block.type === 'exercise') {
                const parseLineWithLinks = (line: string) => {
                  const linkRegex = /\[LINK:([^\]]+)\](.*?)\[\/LINK\]/g;
                  const parts: (string | JSX.Element)[] = [];
                  let lastIndex = 0;
                  let match;

                  while ((match = linkRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(line.substring(lastIndex, match.index));
                    }
                    const labId = match[1];
                    const linkText = match[2];

                    const labNames: Record<string, string> = {
                      'writing-lab': 'Writing Lab',
                      'analysis-lab': 'Analysis Lab',
                      'creative-lab': 'Creative Lab',
                      'strategy-lab': 'Strategy Lab',
                      'code-lab': 'Code Lab'
                    };

                    // Handle Command Center link
                    if (labId === 'command-center') {
                      parts.push(
                        <button
                          key={match.index}
                          onClick={() => onCommandCenterClick?.()}
                          className="inline-flex items-center gap-1 font-bold underline hover:text-white transition-colors"
                        >
                          {linkText}
                          <ExternalLink className="w-3 h-3" strokeWidth={2} />
                        </button>
                      );
                    } else {
                      // Handle Lab links
                      parts.push(
                        <button
                          key={match.index}
                          onClick={() => {
                            setActiveLabTool('lab-sandbox');
                            setActiveLabTitle(labNames[labId] || linkText);
                            setActiveLabSubtitle(`Open the ${labNames[labId] || linkText} to practice`);
                            setSelectedLab(labId);
                          }}
                          className="inline-flex items-center gap-1 font-bold underline hover:text-white transition-colors"
                        >
                          {linkText}
                          <ExternalLink className="w-3 h-3" strokeWidth={2} />
                        </button>
                      );
                    }
                    lastIndex = linkRegex.lastIndex;
                  }

                  if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                  }

                  return parts.length > 0 ? parts : line;
                };

                return (
                  <div key={index} className="bg-[#FF6A00] border border-black p-4 md:p-6 shadow-[2px_2px_0px_#000000] md:shadow-[2px_2px_0px_#000000]">
                    <div className="text-sm leading-relaxed text-black whitespace-pre-line mb-4">
                      {block.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-extrabold uppercase tracking-tight mb-3">{line.slice(2, -2)}</p>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="ml-6 mb-2">{parseLineWithLinks(line.substring(line.indexOf('.') + 2))}</li>;
                        }
                        if (line.trim()) {
                          return <p key={i} className="mb-2">{parseLineWithLinks(line)}</p>;
                        }
                        return null;
                      })}
                    </div>

                    <div className="mt-6 space-y-3">
                      <textarea
                        value={journalEntries[index] || ''}
                        onChange={(e) => {
                          setJournalEntries(prev => ({ ...prev, [index]: e.target.value }));
                          if (savedJournal[index]) {
                            setSavedJournal(prev => ({ ...prev, [index]: false }));
                          }
                        }}
                        placeholder="Write your reflections here..."
                        className="w-full min-h-[120px] p-4 bg-white border border-black text-black placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
                        rows={4}
                      />
                      <button
                        onClick={() => saveJournalEntry(index, block.content, journalEntries[index] || '')}
                        disabled={savingJournal[index] || savedJournal[index] || !journalEntries[index]?.trim()}
                        className={`flex items-center gap-2 border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight transition-all disabled:cursor-not-allowed ${
                          savedJournal[index]
                            ? 'bg-[#98C9A3] text-black border-black'
                            : 'bg-black text-white shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                        } ${(savingJournal[index] || !journalEntries[index]?.trim()) && !savedJournal[index] ? 'opacity-50' : ''}`}
                      >
                        {savedJournal[index] ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            Successfully Saved
                          </>
                        ) : savingJournal[index] ? (
                          'SAVING...'
                        ) : (
                          <>
                            <Save className="w-4 h-4" strokeWidth={2} />
                            SAVE TO JOURNAL
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              }

              if (block.type === 'form') {
                const formType = (block as any).formType;
                const formProps = { pathId, lessonId };

                // Priority Matrix Forms
                if (formType === 'time-allocation') {
                  return <div key={index} className="my-6"><TimeAllocationForm {...formProps} /></div>;
                }
                if (formType === 'goals-definition') {
                  return <div key={index} className="my-6"><GoalsDefinitionForm {...formProps} /></div>;
                }
                if (formType === 'task-scoring') {
                  const taskNumber = (block as any).taskNumber || 1;
                  return <div key={index} className="my-6"><TaskScoringForm {...formProps} taskNumber={taskNumber} /></div>;
                }
                if (formType === 'weekly-ritual') {
                  return <div key={index} className="my-6"><WeeklyRitualForm {...formProps} /></div>;
                }
                if (formType === 'complete-priority-system') {
                  return <div key={index} className="my-6"><CompletePrioritySystemForm {...formProps} /></div>;
                }

                // Small Business Forms
                if (formType === 'time-inventory') {
                  return <div key={index} className="my-6"><TimeInventoryForm {...formProps} /></div>;
                }
                if (formType === 'roi-calculator') {
                  return <div key={index} className="my-6"><ROICalculatorForm {...formProps} /></div>;
                }
                if (formType === 'business-priority') {
                  return <div key={index} className="my-6"><BusinessPriorityForm {...formProps} /></div>;
                }
                if (formType === 'investment-plan') {
                  return <div key={index} className="my-6"><InvestmentPlanForm {...formProps} /></div>;
                }

                // Additional Productivity Forms
                if (formType === 'current-tasks-scoring') {
                  return <div key={index} className="my-6"><CurrentTasksScoringForm {...formProps} /></div>;
                }
                if (formType === 'ai-priority-prompt') {
                  return <div key={index} className="my-6"><AIPriorityPromptForm {...formProps} /></div>;
                }

                // Creator Forms
                if (formType === 'blog-post-practice') {
                  return <div key={index} className="my-6"><BlogPostPracticeForm {...formProps} /></div>;
                }
                if (formType === 'content-idea') {
                  return <div key={index} className="my-6"><ContentIdeaForm {...formProps} /></div>;
                }

                // Everyday Life Forms
                if (formType === 'first-prompt-practice') {
                  return <div key={index} className="my-6"><FirstPromptForm {...formProps} /></div>;
                }
                if (formType === 'ai-awareness') {
                  return <div key={index} className="my-6"><AIAwarenessForm {...formProps} /></div>;
                }
              }

              if (block.type === 'interactive') {
                const tool = (block as any).tool;
                if (tool === 'prompt-practice-chat') {
                  const isMealPlanning = lessonId === 'lesson-2-1';
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">
                            {isMealPlanning ? 'AI Meal Planning Practice' : 'Practice Prompting Lab'}
                          </h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('prompt-practice-chat');
                              setActiveLabTitle(isMealPlanning ? 'MEAL PLANNING LAB' : 'WRITING LAB');
                              setActiveLabSubtitle(isMealPlanning ? 'Test your meal planning prompts with AI' : 'Generate, edit, and refine written content');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          {isMealPlanning
                            ? 'Test your meal planning prompts with AI. Try the sample prompt above, then customize it with your own dietary preferences, time constraints, and budget. The lab opens in fullscreen for a focused practice session.'
                            : 'Practice writing effective prompts with real-time AI feedback. The lab opens in fullscreen so you can focus on experimenting with different approaches.'
                          }
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'baseline-tracker') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Baseline Tracker</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('baseline-tracker');
                              setActiveLabTitle('BASELINE TRACKER');
                              setActiveLabSubtitle('Track your current workflows and time usage');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Track your current workflows and time usage to establish a baseline before implementing AI tools.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'baseline-analysis') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Baseline Analysis</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('baseline-analysis');
                              setActiveLabTitle('BASELINE ANALYSIS');
                              setActiveLabSubtitle('Review your baseline data and identify opportunities');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Review your baseline data and identify opportunities for AI-powered improvements.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'prompt-tester') {
                  return (
                    <div key={index} className="my-6 space-y-4">
                      {lessonId === 'lesson-1-4' && onPromptsClick && (
                        <div className="bg-[#FF6A00] border border-black p-6 shadow-[2px_2px_0px_#000000]">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-2 flex items-center gap-2">
                                <OpenMoji emoji="🎯" size={28} />
                                CREATE YOUR FIRST PROMPTS
                              </h3>
                              <p className="text-sm leading-relaxed mb-4">
                                Open your Prompt Library to save, organize, and reuse the prompts you create in this practice lab. Build your personal collection of effective prompts!
                              </p>
                              <button
                                onClick={onPromptsClick}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                              >
                                <BookOpen className="w-4 h-4" strokeWidth={2} />
                                OPEN PROMPT LIBRARY
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Prompt Tester</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('prompt-tester');
                              setActiveLabTitle('PROMPT TESTER');
                              setActiveLabSubtitle('Test and compare different prompt strategies');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Test and compare different prompt strategies to see how they affect AI responses.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'integration-checklist') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Integration Checklist</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('integration-checklist');
                              setActiveLabTitle('INTEGRATION CHECKLIST');
                              setActiveLabSubtitle('Track your progress integrating AI into your workflow');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Track your progress integrating AI tools into your daily workflow.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'creative-voice-practice') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Creative Voice Practice</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('creative-voice-practice');
                              setActiveLabTitle('CREATIVE VOICE PRACTICE');
                              setActiveLabSubtitle('Practice using AI while maintaining authenticity');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Practice using AI to enhance your creative voice while maintaining authenticity.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'production-checklist') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Production Checklist</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('production-checklist');
                              setActiveLabTitle('PRODUCTION CHECKLIST');
                              setActiveLabSubtitle('Track your content production workflow');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Track your content production workflow and AI integration milestones.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'finishing-checklist') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#E3F2FD] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight">Finishing Checklist</h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('finishing-checklist');
                              setActiveLabTitle('FINISHING CHECKLIST');
                              setActiveLabSubtitle('Complete your AI integration journey');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Lab
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] leading-relaxed">
                          Complete your AI integration journey with final optimization steps.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'launch-commitment') {
                  return (
                    <div key={index} className="my-6">
                      <LaunchCommitmentForm />
                    </div>
                  );
                }
                if (tool === 'aim-practice-lab') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#FF6A00] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
                            <OpenMoji emoji="🎯" size={24} />
                            PRACTICE THE AIM FRAMEWORK
                          </h3>
                          <button
                            onClick={() => {
                              setActiveLabType('aim-framework');
                              setActiveLabTool('prompt-practice-chat');
                              setActiveLabTitle('AIM FRAMEWORK PRACTICE LAB');
                              setActiveLabSubtitle('Practice writing prompts using Actor, Input, and Mission');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Practice Window
                          </button>
                        </div>
                        <p className="text-sm text-black leading-relaxed">
                          Open the practice window to write and test your own AIM prompts with live AI feedback. Try rewriting your old prompts using the Actor-Input-Mission structure and see how much better the responses become.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'map-practice-lab') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#FF6A00] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
                            <OpenMoji emoji="🗺️" size={24} />
                            PRACTICE THE MAP FRAMEWORK
                          </h3>
                          <button
                            onClick={() => {
                              setActiveLabType('map-framework');
                              setActiveLabTool('prompt-practice-chat');
                              setActiveLabTitle('MAP FRAMEWORK PRACTICE LAB');
                              setActiveLabSubtitle('Practice adding context layers: Memory, Assets, Actions, and Prompt');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Practice Window
                          </button>
                        </div>
                        <p className="text-sm text-black leading-relaxed">
                          Open the practice window to build rich, context-aware prompts. Practice layering Memory, Assets, Actions, and Prompt to see how context dramatically improves AI responses. Try the proposal example from the lesson or create your own.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'debug-prompting-lab') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#FF6A00] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
                            <OpenMoji emoji="🔧" size={24} />
                            PRACTICE DEBUGGING PATTERNS
                          </h3>
                          <button
                            onClick={() => {
                              setActiveLabType('debug-patterns');
                              setActiveLabTool('prompt-practice-chat');
                              setActiveLabTitle('PROMPT DEBUGGING LAB');
                              setActiveLabSubtitle('Practice the 3 debugging patterns: Chain of Thought, Verifier, and Refinement');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Practice Window
                          </button>
                        </div>
                        <p className="text-sm text-black leading-relaxed">
                          Open the practice window to test the three debugging patterns. Start with a weak prompt, then apply Chain of Thought, Verifier, or Refinement patterns to see how they transform AI responses. Compare results side-by-side.
                        </p>
                      </div>
                    </div>
                  );
                }
                if (tool === 'verification-checklist') {
                  return <VerificationChecklist key={index} />;
                }
                if (tool === 'ocean-practice-lab') {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#FF6A00] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight mb-3">
                            OCEAN Practice
                          </h3>
                          <ul className="space-y-2 mb-4">
                            <li className="text-black">• Take a prompt you've been working with</li>
                            <li className="text-black">• Rewrite it to include all five OCEAN elements</li>
                            <li className="text-black">• Compare the original output to the OCEAN-enhanced output</li>
                            <li className="text-black">• Note which elements made the biggest difference</li>
                          </ul>
                          <p className="text-sm text-black font-semibold mb-4">
                            Save your best OCEAN prompts as templates for future use.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveLabType('ocean-framework');
                            setActiveLabTool('prompt-practice-chat');
                            setActiveLabTitle('OCEAN PRACTICE LAB');
                            setActiveLabSubtitle('Practice enhancing prompts with Original, Concrete, Evident, Assertive, and Narrative elements');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black rounded-lg font-semibold text-sm hover:bg-[#333333] transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={2} />
                          Open Practice Window
                        </button>
                      </div>
                    </div>
                  );
                }
              }

              if (block.type === 'lab') {
                const tools = (block as any).tools || [];
                const content = block.content || '';

                if (tools.includes('prompt-practice')) {
                  return (
                    <div key={index} className="my-6">
                      <div className="bg-[#FF6A00] border border-black shadow-[2px_2px_0px_#000000] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
                            <OpenMoji emoji="🧪" size={24} />
                            AI PRACTICE LAB
                          </h3>
                          <button
                            onClick={() => {
                              setActiveLabTool('prompt-practice-chat');
                              setActiveLabTitle('WRITING LAB');
                              setActiveLabSubtitle('Test prompts with AI');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" strokeWidth={2} />
                            Open Practice Window
                          </button>
                        </div>
                        <p className="text-sm text-white leading-relaxed">
                          {content}
                        </p>
                      </div>
                    </div>
                  );
                }
              }

              return null;
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 bg-white text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            BACK TO PATH
          </button>

          <button
            onClick={handleComplete}
            disabled={completing || completed}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                COMPLETED
              </>
            ) : completing ? (
              'COMPLETING...'
            ) : (
              <>
                COMPLETE & CONTINUE
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Lab Overlay */}
      <FullscreenLabOverlay
        isOpen={activeLabTool !== null}
        onClose={() => setActiveLabTool(null)}
        title={activeLabTitle}
        subtitle={activeLabSubtitle}
        hideHeader={activeLabTool === 'lab-sandbox'}
      >
        {activeLabTool === 'prompt-practice-chat' && <PromptPracticeChat labType={activeLabType} />}
        {activeLabTool === 'baseline-tracker' && <BaselineTracker lessonId={lessonId} pathId={pathId} />}
        {activeLabTool === 'baseline-analysis' && <BaselineAnalysis lessonId={lessonId} pathId={pathId} />}
        {activeLabTool === 'prompt-tester' && <PromptTester />}
        {activeLabTool === 'integration-checklist' && <IntegrationChecklist />}
        {activeLabTool === 'creative-voice-practice' && <CreativeVoicePractice />}
        {activeLabTool === 'production-checklist' && <ProductionChecklist />}
        {activeLabTool === 'finishing-checklist' && <FinishingChecklist />}
        {activeLabTool === 'lab-sandbox' && <LabSandbox labId={selectedLab} onBack={() => setActiveLabTool(null)} />}
      </FullscreenLabOverlay>
    </div>
  );
}
