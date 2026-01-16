import { useState, useEffect } from 'react';
import {
  Plus, X, CheckCircle2, Circle, Clock, AlertCircle, Flame,
  Battery, BatteryMedium, BatteryLow, Edit2, Trash2, ChevronDown,
  ChevronRight, Sparkles, Filter, Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  due_date?: string;
  estimated_minutes?: number;
  energy_required: 'high' | 'medium' | 'low';
  tags: string[];
  ai_generated: boolean;
  completed_at?: string;
  created_at: string;
}

export default function TasksManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const addTask = async (taskData: Partial<Task>) => {
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        ...taskData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (data) {
      setTasks([data, ...tasks]);
      setShowAddTask(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = async (taskId: string) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updates: Partial<Task> = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    };
    await updateTask(task.id, updates);
  };

  const generateAITasks = async () => {
    // In production, this would call an AI edge function
    const aiTasks = [
      { title: 'Review morning emails', priority: 'high' as const, category: 'work', estimated_minutes: 30, energy_required: 'medium' as const },
      { title: 'Plan weekly goals', priority: 'medium' as const, category: 'personal', estimated_minutes: 45, energy_required: 'high' as const },
      { title: 'Exercise session', priority: 'medium' as const, category: 'health', estimated_minutes: 60, energy_required: 'high' as const }
    ];

    for (const task of aiTasks) {
      await addTask({ ...task, ai_generated: true, status: 'todo', description: '', tags: [] });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'active' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high': return <Battery className="w-4 h-4 text-red-600" strokeWidth={2} />;
      case 'medium': return <BatteryMedium className="w-4 h-4 text-yellow-600" strokeWidth={2} />;
      case 'low': return <BatteryLow className="w-4 h-4 text-green-600" strokeWidth={2} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight mb-2">Task Management</h2>
            <p className="text-[#57524D] text-sm">Organize and prioritize your work with AI assistance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateAITasks}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4A261] text-white border border-black font-bold text-sm hover:bg-[#e89350] transition-colors"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              AI Generate
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 text-sm font-bold border border-black transition-colors ${
                filterStatus === 'active' ? 'bg-black text-white' : 'bg-white hover:bg-[#F8F5F2]'
              }`}
            >
              Active ({tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 text-sm font-bold border border-black transition-colors ${
                filterStatus === 'completed' ? 'bg-black text-white' : 'bg-white hover:bg-[#F8F5F2]'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-sm font-bold border border-black transition-colors ${
                filterStatus === 'all' ? 'bg-black text-white' : 'bg-white hover:bg-[#F8F5F2]'
              }`}
            >
              All ({tasks.length})
            </button>
          </div>

          <div className="h-6 w-px bg-black"></div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1 text-sm font-bold border border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 text-sm font-bold border border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="priority">Sort by Priority</option>
            <option value="due_date">Sort by Due Date</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <AddTaskForm onAdd={addTask} onCancel={() => setShowAddTask(false)} />
      )}

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white border border-black p-12 text-center shadow-[2px_2px_0px_#000000]">
          <Circle className="w-12 h-12 mx-auto mb-3 text-[#E9E5E0]" strokeWidth={2} />
          <p className="text-[#57524D] mb-2">No tasks found</p>
          <p className="text-sm text-[#57524D]">Create your first task or let AI generate suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTaskStatus(task)}
              onUpdate={(updates) => updateTask(task.id, updates)}
              onDelete={() => deleteTask(task.id)}
              getPriorityColor={getPriorityColor}
              getEnergyIcon={getEnergyIcon}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          icon={<Circle className="w-5 h-5" strokeWidth={2} />}
          color="bg-blue-100"
        />
        <StatCard
          label="In Progress"
          value={tasks.filter(t => t.status === 'in_progress').length}
          icon={<Clock className="w-5 h-5" strokeWidth={2} />}
          color="bg-yellow-100"
        />
        <StatCard
          label="Completed Today"
          value={tasks.filter(t => t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString()).length}
          icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2} />}
          color="bg-green-100"
        />
        <StatCard
          label="Urgent"
          value={tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
          icon={<AlertCircle className="w-5 h-5" strokeWidth={2} />}
          color="bg-red-100"
        />
      </div>
    </div>
  );
}

function AddTaskForm({ onAdd, onCancel }: { onAdd: (task: Partial<Task>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'work' as const,
    due_date: '',
    estimated_minutes: 30,
    energy_required: 'medium' as const,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAdd({ ...formData, status: 'todo' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold uppercase tracking-tight">Add New Task</h3>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-[#F8F5F2] transition-colors rounded">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261] resize-y"
            rows={3}
            placeholder="Add details..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="relationships">Relationships</option>
            <option value="projects">Projects</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Estimated Time (minutes)</label>
          <input
            type="number"
            value={formData.estimated_minutes}
            onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
            min="5"
            step="5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Energy Required</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, energy_required: level })}
                className={`flex-1 px-4 py-2 border border-black font-bold text-sm capitalize transition-colors ${
                  formData.energy_required === level ? 'bg-black text-white' : 'bg-white hover:bg-[#F8F5F2]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#F4A261] text-white border border-black font-bold text-sm hover:bg-[#e89350] transition-colors"
        >
          Add Task
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

function TaskCard({
  task,
  onToggle,
  onUpdate,
  onDelete,
  getPriorityColor,
  getEnergyIcon
}: {
  task: Task;
  onToggle: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  getPriorityColor: (priority: string) => string;
  getEnergyIcon: (energy: string) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white border border-black p-4 shadow-[2px_2px_0px_#000000] ${task.status === 'completed' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2} />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-black transition-colors" strokeWidth={2} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className={`font-bold ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</h4>
              {task.description && expanded && (
                <p className="text-sm text-[#57524D] mt-1">{task.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} title={task.priority}></div>
              {getEnergyIcon(task.energy_required)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#57524D]">
            <span className="px-2 py-1 bg-[#F8F5F2] border border-[#E9E5E0] font-bold">
              {task.category}
            </span>
            {task.due_date && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                <CalendarIcon className="w-3 h-3" strokeWidth={2} />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {task.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {task.estimated_minutes}m
              </span>
            )}
            {task.ai_generated && (
              <span className="flex items-center gap-1 text-[#F4A261] font-bold">
                <Sparkles className="w-3 h-3" strokeWidth={2} />
                AI
              </span>
            )}
          </div>

          {expanded && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-[#F8F5F2] border border-black hover:bg-[#E9E5E0] transition-colors"
              >
                <Edit2 className="w-3 h-3" strokeWidth={2} />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-50 border border-black text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" strokeWidth={2} />
                Delete
              </button>
              {task.status !== 'completed' && (
                <button
                  onClick={() => onUpdate({ status: 'in_progress' })}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-yellow-50 border border-black hover:bg-yellow-100 transition-colors"
                >
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  Start
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          ) : (
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          )}
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
