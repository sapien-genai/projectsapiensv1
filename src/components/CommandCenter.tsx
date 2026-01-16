import { useState, useEffect } from 'react';
import {
  Sun, Moon, CheckCircle2, Circle, Clock, TrendingUp,
  Target, Brain, Home, Calendar, Plus, ChevronRight,
  ListTodo, Lightbulb, BookOpen, Heart, DollarSign, Plane,
  Settings, Link as LinkIcon, X, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TasksManager from './TasksManager';
import CalendarManager from './CalendarManager';

interface CommandCenterProps {
  onBack?: () => void;
  onLessonClick?: (pathId: string, lessonId: string) => void;
}

type View = 'dashboard' | 'tasks' | 'calendar' | 'learning' | 'life' | 'review' | 'integrations';

interface JournalEntry {
  id: string;
  path_id: string;
  lesson_id: string;
  prompt_text: string;
  user_response: string;
  created_at: string;
  updated_at: string;
}

export default function CommandCenter({ onBack, onLessonClick }: CommandCenterProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('command_center_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsEnabled(data?.is_enabled || false);
    setLoading(false);
  };

  const enableCommandCenter = async () => {
    if (!user) return;

    await supabase
      .from('command_center_config')
      .upsert({
        user_id: user.id,
        is_enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    setIsEnabled(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-lg text-[#57524D]">Loading Command Center...</div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="text-center mb-8">
            <Target className="w-16 h-16 mx-auto mb-4 text-[#F4A261]" strokeWidth={2} />
            <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-4">
              Activate Your AI Command Center
            </h1>
            <p className="text-lg text-[#57524D] leading-relaxed">
              You're about to build your personal AI-powered system for managing work, learning, and life.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex gap-4 p-4 bg-[#FFF9E6] border border-black">
              <Sun className="w-6 h-6 flex-shrink-0 text-[#F4A261]" strokeWidth={2} />
              <div>
                <h3 className="font-bold mb-1">Morning Dashboard</h3>
                <p className="text-sm text-[#57524D]">Start each day with AI-generated priorities and energy-optimized scheduling</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-[#E3F2FD] border border-black">
              <ListTodo className="w-6 h-6 flex-shrink-0 text-[#5B7DB1]" strokeWidth={2} />
              <div>
                <h3 className="font-bold mb-1">Work Management Hub</h3>
                <p className="text-sm text-[#57524D]">Capture, organize, and complete tasks with AI assistance</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-[#F3E5F5] border border-black">
              <Brain className="w-6 h-6 flex-shrink-0 text-[#9C27B0]" strokeWidth={2} />
              <div>
                <h3 className="font-bold mb-1">Learning & Growth Station</h3>
                <p className="text-sm text-[#57524D]">Track learning projects and skill development</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-[#E8F5E9] border border-black">
              <Home className="w-6 h-6 flex-shrink-0 text-[#4CAF50]" strokeWidth={2} />
              <div>
                <h3 className="font-bold mb-1">Life Operations Center</h3>
                <p className="text-sm text-[#57524D]">Manage meals, travel, finances, and health</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-[#FFF3E0] border border-black">
              <Moon className="w-6 h-6 flex-shrink-0 text-[#FF9800]" strokeWidth={2} />
              <div>
                <h3 className="font-bold mb-1">Evening Review</h3>
                <p className="text-sm text-[#57524D]">Reflect on your day and prep for tomorrow</p>
              </div>
            </div>
          </div>

          <button
            onClick={enableCommandCenter}
            className="w-full bg-[#F4A261] text-white border border-black px-8 py-4 font-extrabold text-lg uppercase tracking-tight shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
          >
            Activate Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">
              AI Command Center
            </h1>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white border border-black text-sm font-bold hover:bg-[#F8F5F2] transition-colors"
              >
                Back to Lessons
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#E9E5E0] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard' as View, label: 'Dashboard', icon: Target },
              { id: 'tasks' as View, label: 'Tasks', icon: ListTodo },
              { id: 'calendar' as View, label: 'Calendar', icon: Calendar },
              { id: 'learning' as View, label: 'Learning', icon: Brain },
              { id: 'life' as View, label: 'Life Ops', icon: Home },
              { id: 'review' as View, label: 'Review', icon: TrendingUp },
              { id: 'integrations' as View, label: 'Integrations', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors ${
                  activeView === tab.id
                    ? 'bg-white border-2 border-b-0 border-black -mb-[2px]'
                    : 'bg-[#E9E5E0] hover:bg-[#ddd9d4]'
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'tasks' && <TasksView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'learning' && <LearningView onLessonClick={onLessonClick} />}
        {activeView === 'life' && <LifeOpsView />}
        {activeView === 'review' && <ReviewView />}
        {activeView === 'integrations' && <IntegrationsView />}
      </div>
    </div>
  );
}

function DashboardView() {
  const { user } = useAuth();
  const [priorities, setPriorities] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;

    // Load today's priorities
    const { data: prioritiesData } = await supabase
      .from('daily_priorities')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (prioritiesData?.priorities) {
      setPriorities(prioritiesData.priorities as any[]);
    }

    // Load pending decisions
    const { data: decisionsData } = await supabase
      .from('decision_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(3);

    if (decisionsData) {
      setDecisions(decisionsData);
    }

    // Load today's calendar events
    const { data: eventsData } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_date', today)
      .order('event_time', { ascending: true });

    if (eventsData) {
      setCalendarEvents(eventsData);
    }
  };

  const generatePriorities = async () => {
    if (!user) return;

    // In a real implementation, this would call the AI edge function
    const samplePriorities = [
      { id: 1, title: 'Complete project proposal', description: 'Finish and send to client', status: 'pending', priority: 'high' },
      { id: 2, title: 'Review team feedback', description: '30 min review session', status: 'pending', priority: 'medium' },
      { id: 3, title: 'Plan next week', description: 'Weekly planning session', status: 'pending', priority: 'medium' }
    ];

    await supabase
      .from('daily_priorities')
      .upsert({
        user_id: user.id,
        date: today,
        priorities: samplePriorities,
        ai_generated: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      });

    setPriorities(samplePriorities);
  };

  return (
    <div className="space-y-6">
      {/* Morning Greeting */}
      <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFE4B5] border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="w-8 h-8 text-[#F4A261]" strokeWidth={2} />
          <h2 className="text-2xl font-bold">Good Morning!</h2>
        </div>
        <p className="text-[#57524D]">Ready to make today productive?</p>
      </div>

      {/* Today's Priorities */}
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold uppercase tracking-tight">Today's Priorities</h3>
          <button
            onClick={generatePriorities}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4A261] text-white border border-black text-sm font-bold hover:bg-[#e89350] transition-colors"
          >
            <Lightbulb className="w-4 h-4" strokeWidth={2} />
            AI Generate
          </button>
        </div>

        {priorities.length === 0 ? (
          <div className="text-center py-8 text-[#57524D]">
            <p className="mb-4">No priorities set for today</p>
            <p className="text-sm">Click "AI Generate" to create your daily priorities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priorities.map((priority) => (
              <div key={priority.id} className="flex items-start gap-3 p-3 bg-[#F8F5F2] border border-[#E9E5E0]">
                {priority.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                ) : (
                  <Circle className="w-5 h-5 text-[#57524D] flex-shrink-0 mt-0.5" strokeWidth={2} />
                )}
                <div className="flex-1">
                  <h4 className="font-bold mb-1">{priority.title}</h4>
                  <p className="text-sm text-[#57524D]">{priority.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold border border-black ${
                  priority.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {priority.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Queue */}
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold uppercase tracking-tight">Decision Queue</h3>
          <span className="px-3 py-1 bg-[#FF6A00] text-white text-sm font-bold border border-black">
            {decisions.length} Pending
          </span>
        </div>

        {decisions.length === 0 ? (
          <p className="text-center py-8 text-[#57524D]">No decisions waiting</p>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div key={decision.id} className="p-3 bg-[#FFF9E6] border border-black">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold">{decision.title}</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-white border border-black">
                    {decision.category}
                  </span>
                </div>
                {decision.description && (
                  <p className="text-sm text-[#57524D] mb-2">{decision.description}</p>
                )}
                {decision.deadline && (
                  <div className="flex items-center gap-1 text-xs text-[#57524D]">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    Due: {new Date(decision.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Calendar */}
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold uppercase tracking-tight">Today's Calendar</h3>
          <button
            onClick={() => setShowAddEvent(!showAddEvent)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5B7DB1] text-white border border-black text-sm font-bold hover:bg-[#4a6a95] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Event
          </button>
        </div>

        {showAddEvent && <AddEventForm onClose={() => { setShowAddEvent(false); loadDashboard(); }} />}

        {calendarEvents.length === 0 && !showAddEvent ? (
          <div className="text-center py-8 text-[#57524D]">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[#E9E5E0]" strokeWidth={2} />
            <p className="mb-2">No events scheduled for today</p>
            <p className="text-sm">Click "Add Event" to create your first calendar event</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calendarEvents.map((event) => (
              <div key={event.id} className="p-4 bg-[#E3F2FD] border border-black">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-[#57524D]">
                      <Clock className="w-4 h-4" strokeWidth={2} />
                      {event.event_time || 'All day'} {event.duration_minutes && `(${event.duration_minutes} min)`}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white border border-black">
                    {event.event_type}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-[#57524D] mb-2">{event.description}</p>
                )}
                {event.ai_generated_prep && (
                  <div className="mt-2 p-2 bg-white border border-[#5B7DB1] rounded">
                    <p className="text-xs font-bold text-[#5B7DB1] mb-1">AI PREP NOTES</p>
                    <p className="text-xs text-[#57524D]">Prep notes available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#E3F2FD] border border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-5 h-5 text-[#5B7DB1]" strokeWidth={2} />
            <h4 className="font-bold text-sm">Active Tasks</h4>
          </div>
          <p className="text-2xl font-bold">8</p>
        </div>

        <div className="bg-[#F3E5F5] border border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[#9C27B0]" strokeWidth={2} />
            <h4 className="font-bold text-sm">Learning Projects</h4>
          </div>
          <p className="text-2xl font-bold">2</p>
        </div>

        <div className="bg-[#E8F5E9] border border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#4CAF50]" strokeWidth={2} />
            <h4 className="font-bold text-sm">Weekly Progress</h4>
          </div>
          <p className="text-2xl font-bold">75%</p>
        </div>
      </div>
    </div>
  );
}

function TasksView() {
  return <TasksManager />;
}

function CalendarView() {
  return <CalendarManager />;
}

function LearningView({ onLessonClick }: { onLessonClick?: (pathId: string, lessonId: string) => void }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadJournalEntries();
  }, [user]);

  const loadJournalEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lesson_journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    setDeleting(entryId);
    const { error } = await supabase
      .from('lesson_journal_entries')
      .delete()
      .eq('id', entryId);

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== entryId));
    }
    setDeleting(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLessonTitle = (lessonId: string) => {
    const lessonTitles: Record<string, string> = {
      'lesson-1-1': 'What AI Actually Is (No Jargon)',
      'lesson-1-2': 'Your First Prompt: Talk to AI Like a Human',
      'lesson-1-3': 'The 3 Types of AI You Use Every Day',
      'lesson-1-4': 'Practice Lab: Write 5 Different Prompts',
      'lesson-2-1': 'Meal Planning with AI',
      'lesson-2-2': 'Travel Itinerary Generator',
      'lesson-2-3': 'Decision-Making Assistant',
    };
    return lessonTitles[lessonId] || lessonId.toUpperCase();
  };

  const getModuleFromLesson = (lessonId: string) => {
    const match = lessonId.match(/lesson-(\d+)-\d+/);
    if (match) {
      return `module-${match[1]}`;
    }
    return 'module-1';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-[#9C27B0]" strokeWidth={2} />
          <h2 className="text-2xl font-bold uppercase tracking-tight">My Journal</h2>
        </div>
        <p className="text-[#57524D] mb-6">
          Reflect on your AI learning journey. All your reflections and responses from lessons are saved here.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-black border-t-[#9C27B0] animate-spin rounded-full"></div>
            <p className="mt-4 font-semibold text-[#57524D]">Loading your journal...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-[#F8F5F2] border-2 border-[#E9E5E0]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#E9E5E0]" strokeWidth={2} />
            <h3 className="font-bold text-lg uppercase tracking-tight mb-2">
              No Journal Entries Yet
            </h3>
            <p className="text-sm text-[#57524D] leading-relaxed">
              Complete lessons and answer reflection questions to start building your AI learning journal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#F8F5F2] border-2 border-[#E9E5E0] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {onLessonClick ? (
                      <button
                        onClick={() => onLessonClick(entry.path_id, entry.lesson_id)}
                        className="font-bold text-base uppercase tracking-tight mb-1 text-left hover:text-[#9C27B0] transition-colors underline decoration-2 decoration-transparent hover:decoration-[#9C27B0]"
                      >
                        {getLessonTitle(entry.lesson_id)}
                      </button>
                    ) : (
                      <h3 className="font-bold text-base uppercase tracking-tight mb-1">
                        {getLessonTitle(entry.lesson_id)}
                      </h3>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[#57524D]">
                      <Calendar className="w-3 h-3" strokeWidth={2} />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deleting === entry.id}
                    className="p-2 hover:bg-red-50 border border-[#E9E5E0] hover:border-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="bg-white border-l-4 border-[#9C27B0] p-3 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-[#9C27B0]">
                    Prompt
                  </p>
                  <p className="text-sm leading-relaxed text-[#1C1A17] whitespace-pre-line">
                    {entry.prompt_text}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-2 text-[#57524D]">
                    Your Reflection
                  </p>
                  <p className="text-sm leading-relaxed text-[#1C1A17] whitespace-pre-line">
                    {entry.user_response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LifeOpsView() {
  return (
    <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
      <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Life Operations</h2>
      <p className="text-[#57524D]">Life operations interface coming in the interactive lessons...</p>
    </div>
  );
}

function ReviewView() {
  return (
    <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
      <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Daily Review</h2>
      <p className="text-[#57524D]">Review interface coming in the interactive lessons...</p>
    </div>
  );
}

function AddEventForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [eventType, setEventType] = useState('meeting');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSaving(true);
    await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        duration_minutes: duration,
        event_type: eventType
      });

    setSaving(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F8F5F2] border border-black">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold uppercase tracking-tight">Add Calendar Event</h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white transition-colors rounded"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
            <option value="personal">Personal</option>
            <option value="deadline">Deadline</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Time</label>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            min="15"
            step="15"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-bold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261] resize-y"
          rows={3}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4A261] text-white border border-black font-bold text-sm hover:bg-[#e89350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Event'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white border border-black font-bold text-sm hover:bg-[#F8F5F2] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function IntegrationsView() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, [user]);

  const loadIntegrations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('external_integrations')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setIntegrations(data);
    }
    setLoading(false);
  };

  const toggleIntegration = async (integrationType: string) => {
    if (!user) return;

    const existing = integrations.find(i => i.integration_type === integrationType);

    if (existing) {
      await supabase
        .from('external_integrations')
        .update({
          is_connected: !existing.is_connected,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('external_integrations')
        .insert({
          user_id: user.id,
          integration_type: integrationType,
          is_connected: true
        });
    }

    loadIntegrations();
  };

  const integrationOptions = [
    { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, description: 'Sync events from Google Calendar', color: 'bg-[#4285F4]' },
    { id: 'outlook_calendar', name: 'Outlook Calendar', icon: Calendar, description: 'Sync events from Outlook', color: 'bg-[#0078D4]' },
    { id: 'gmail', name: 'Gmail', icon: Lightbulb, description: 'Process emails with AI', color: 'bg-[#EA4335]' },
    { id: 'notion', name: 'Notion', icon: BookOpen, description: 'Sync notes and documents', color: 'bg-black' },
    { id: 'todoist', name: 'Todoist', icon: ListTodo, description: 'Import tasks automatically', color: 'bg-[#E44332]' },
    { id: 'slack', name: 'Slack', icon: LinkIcon, description: 'Get updates from team channels', color: 'bg-[#4A154B]' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">External Integrations</h2>
        <p className="text-[#57524D] mb-6">
          Connect your external tools to bring all your data into the Command Center. Enable AI-powered processing and automated workflows.
        </p>

        {loading ? (
          <div className="text-center py-8 text-[#57524D]">Loading integrations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationOptions.map((option) => {
              const integration = integrations.find(i => i.integration_type === option.id);
              const isConnected = integration?.is_connected || false;

              return (
                <div key={option.id} className="p-4 border border-black bg-[#F8F5F2]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${option.color} rounded`}>
                        <option.icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold">{option.name}</h3>
                        <p className="text-xs text-[#57524D]">{option.description}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleIntegration(option.id)}
                    className={`w-full px-4 py-2 border border-black font-bold text-sm transition-colors ${
                      isConnected
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white hover:bg-[#F4A261] hover:text-white'
                    }`}
                  >
                    {isConnected ? 'Connected ✓' : 'Connect'}
                  </button>

                  {isConnected && (
                    <div className="mt-2 text-xs text-[#57524D]">
                      <p>Last sync: {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#FFF9E6] border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#F4A261]" strokeWidth={2} />
          Integration Tips
        </h3>
        <ul className="space-y-2 text-sm text-[#57524D]">
          <li>• Start with 2-3 integrations you use daily</li>
          <li>• Google Calendar is the most popular first integration</li>
          <li>• Test each integration before adding more</li>
          <li>• Use the Integrations tab to check sync status</li>
          <li>• Note: Actual syncing requires OAuth setup (coming in advanced lessons)</li>
        </ul>
      </div>
    </div>
  );
}
