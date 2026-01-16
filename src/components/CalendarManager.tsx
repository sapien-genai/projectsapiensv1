import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Plus, X, Clock, MapPin, Users,
  Edit2, Trash2, ChevronLeft, ChevronRight, Sparkles, Bell,
  CheckCircle2, XCircle, CalendarCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string;
  duration_minutes: number;
  event_type: string;
  location: string;
  attendees: string[];
  prep_notes: any;
  ai_generated_prep: boolean;
  completed: boolean;
  status: string;
  reminder_minutes: number;
  notes: string;
}

export default function CalendarManager() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [user, currentDate, viewMode]);

  const loadEvents = async () => {
    if (!user) return;

    const startDate = getViewStartDate();
    const endDate = getViewEndDate();

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', startDate.toISOString().split('T')[0])
      .lte('event_date', endDate.toISOString().split('T')[0])
      .order('event_time', { ascending: true });

    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const getViewStartDate = () => {
    if (viewMode === 'day') return currentDate;
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      return start;
    }
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  };

  const getViewEndDate = () => {
    if (viewMode === 'day') return currentDate;
    if (viewMode === 'week') {
      const end = new Date(currentDate);
      end.setDate(end.getDate() - end.getDay() + 6);
      return end;
    }
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  };

  const addEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!user) return;

    const { data } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        ...eventData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (data) {
      setEvents([...events, data]);
      setShowAddEvent(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    setEvents(events.map(e => e.id === eventId ? { ...e, ...updates } : e));
  };

  const deleteEvent = async (eventId: string) => {
    await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    setEvents(events.filter(e => e.id !== eventId));
  };

  const generateAIPrep = async (eventId: string) => {
    // In production, this would call an AI edge function
    const prepNotes = {
      keyPoints: ['Review agenda', 'Prepare questions', 'Check previous notes'],
      questions: ['What are the main objectives?', 'Who are the key stakeholders?'],
      outcomes: ['Clear action items', 'Next steps defined', 'Timelines agreed']
    };

    await updateEvent(eventId, {
      prep_notes: prepNotes,
      ai_generated_prep: true
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateRangeLabel = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const start = getViewStartDate();
      const end = getViewEndDate();
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.event_date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 border-blue-500';
      case 'task': return 'bg-green-100 border-green-500';
      case 'personal': return 'bg-purple-100 border-purple-500';
      case 'deadline': return 'bg-red-100 border-red-500';
      case 'reminder': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight mb-2">Calendar</h2>
            <p className="text-[#57524D] text-sm">Manage your schedule with AI-powered prep</p>
          </div>
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Event
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 border border-black hover:bg-[#F8F5F2] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 border border-black font-bold text-sm hover:bg-[#F8F5F2] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 border border-black hover:bg-[#F8F5F2] transition-colors"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
            <span className="ml-4 font-bold">{getDateRangeLabel()}</span>
          </div>

          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 border border-black font-bold text-sm capitalize transition-colors ${
                  viewMode === mode ? 'bg-black text-white' : 'bg-white hover:bg-[#F8F5F2]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Form */}
      {showAddEvent && (
        <AddEventForm onAdd={addEvent} onCancel={() => setShowAddEvent(false)} />
      )}

      {/* Calendar View */}
      {viewMode === 'day' && (
        <DayView
          date={currentDate}
          events={getEventsForDate(currentDate)}
          onEventUpdate={updateEvent}
          onEventDelete={deleteEvent}
          onGeneratePrep={generateAIPrep}
          getEventTypeColor={getEventTypeColor}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          startDate={getViewStartDate()}
          events={events}
          onEventUpdate={updateEvent}
          onEventDelete={deleteEvent}
          onGeneratePrep={generateAIPrep}
          getEventTypeColor={getEventTypeColor}
          getEventsForDate={getEventsForDate}
        />
      )}

      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          getEventsForDate={getEventsForDate}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Events" value={getEventsForDate(new Date()).length} icon={<CalendarIcon className="w-5 h-5" strokeWidth={2} />} color="bg-blue-100" />
        <StatCard label="This Week" value={events.length} icon={<CalendarCheck className="w-5 h-5" strokeWidth={2} />} color="bg-green-100" />
        <StatCard label="Completed" value={events.filter(e => e.completed).length} icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2} />} color="bg-purple-100" />
        <StatCard label="With AI Prep" value={events.filter(e => e.ai_generated_prep).length} icon={<Sparkles className="w-5 h-5" strokeWidth={2} />} color="bg-yellow-100" />
      </div>
    </div>
  );
}

function AddEventForm({ onAdd, onCancel }: { onAdd: (event: Partial<CalendarEvent>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '09:00',
    duration_minutes: 60,
    event_type: 'meeting',
    location: '',
    reminder_minutes: 15,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAdd({ ...formData, status: 'scheduled', completed: false, attendees: [], prep_notes: {}, ai_generated_prep: false });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold uppercase tracking-tight">Add Calendar Event</h3>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-[#F8F5F2] transition-colors rounded">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Event Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            placeholder="Meeting, deadline, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Type</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
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
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Time</label>
          <input
            type="time"
            value={formData.event_time}
            onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            min="15"
            step="15"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            placeholder="Office, Zoom, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Reminder (minutes before)</label>
          <select
            value={formData.reminder_minutes}
            onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="0">No reminder</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="1440">1 day</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261] resize-y"
            rows={3}
            placeholder="Event details..."
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#F4A261] text-white border border-black font-bold text-sm hover:bg-[#e89350] transition-colors"
        >
          Add Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-black font-bold text-sm hover:bg-[#F8F5F2] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DayView({ date, events, onEventUpdate, onEventDelete, onGeneratePrep, getEventTypeColor }: any) {
  return (
    <div className="bg-white border border-black shadow-[2px_2px_0px_#000000]">
      <div className="p-6">
        <h3 className="font-bold mb-4">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        {events.length === 0 ? (
          <div className="text-center py-12 text-[#57524D]">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-[#E9E5E0]" strokeWidth={2} />
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: CalendarEvent) => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={onEventUpdate}
                onDelete={onEventDelete}
                onGeneratePrep={onGeneratePrep}
                getEventTypeColor={getEventTypeColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView({ startDate, events, onEventUpdate, onEventDelete, onGeneratePrep, getEventTypeColor, getEventsForDate }: any) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] overflow-x-auto">
      <div className="grid grid-cols-7 min-w-[800px]">
        {days.map((day, i) => (
          <div key={i} className={`border-r-2 border-black last:border-r-0 ${day.toDateString() === new Date().toDateString() ? 'bg-[#FFF9E6]' : ''}`}>
            <div className="p-3 border-b-2 border-black">
              <div className="text-xs font-bold text-[#57524D]">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-lg font-bold">{day.getDate()}</div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {getEventsForDate(day).map((event: CalendarEvent) => (
                <div key={event.id} className={`p-2 border-l-4 ${getEventTypeColor(event.event_type)} text-xs`}>
                  <div className="font-bold truncate">{event.title}</div>
                  {event.event_time && <div className="text-[#57524D]">{event.event_time}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ currentDate, events, getEventsForDate }: any) {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const current = new Date(startDate);
  while (days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="bg-white border border-black shadow-[2px_2px_0px_#000000]">
      <div className="grid grid-cols-7">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 border-b-2 border-r-2 border-black last:border-r-0 text-center font-bold text-sm">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDate(day);

          return (
            <div
              key={i}
              className={`min-h-[100px] p-2 border-r-2 border-b-2 border-black last:border-r-0 ${
                !isCurrentMonth ? 'bg-[#F8F5F2] text-[#57524D]' : ''
              } ${isToday ? 'bg-[#FFF9E6]' : ''}`}
            >
              <div className={`text-sm font-bold mb-1 ${isToday ? 'bg-black text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event: CalendarEvent) => (
                  <div key={event.id} className="text-xs truncate bg-blue-100 px-1 rounded">
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-[#57524D]">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event, onUpdate, onDelete, onGeneratePrep, getEventTypeColor }: any) {
  return (
    <div className={`p-4 border-l-4 ${getEventTypeColor(event.event_type)}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold">{event.title}</h4>
          <div className="flex items-center gap-3 text-sm text-[#57524D] mt-1">
            {event.event_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {event.event_time} ({event.duration_minutes}m)
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" strokeWidth={2} />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-white border border-black">{event.event_type}</span>
      </div>

      {event.description && <p className="text-sm text-[#57524D] mb-3">{event.description}</p>}

      {event.ai_generated_prep && event.prep_notes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-500 rounded">
          <p className="text-xs font-bold text-yellow-700 mb-1">AI PREP NOTES</p>
          <p className="text-xs">Ready for review</p>
        </div>
      )}

      <div className="flex gap-2">
        {!event.ai_generated_prep && (
          <button
            onClick={() => onGeneratePrep(event.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-[#F4A261] text-white border border-black hover:bg-[#e89350] transition-colors"
          >
            <Sparkles className="w-3 h-3" strokeWidth={2} />
            Generate AI Prep
          </button>
        )}
        <button
          onClick={() => onUpdate(event.id, { completed: !event.completed })}
          className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-green-50 border border-black hover:bg-green-100 transition-colors"
        >
          <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
          {event.completed ? 'Completed' : 'Mark Complete'}
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-50 border border-black text-red-600 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3 h-3" strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`${color} border border-black p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
