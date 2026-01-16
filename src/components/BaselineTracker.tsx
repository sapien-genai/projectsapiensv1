import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TimeEntry {
  id: string;
  date: string;
  activity: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  aiPotential: number;
}

interface BaselineTrackerProps {
  lessonId: string;
  pathId: string;
}

const categories = [
  'Writing',
  'Meetings',
  'Research',
  'Planning',
  'Communication',
  'Admin',
  'Creative Work',
  'Analysis',
  'Learning',
  'Other'
];

export default function BaselineTracker({ lessonId, pathId }: BaselineTrackerProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    startTime: '',
    endTime: '',
    category: 'Writing',
    aiPotential: 1
  });
  const [saving, setSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [user, lessonId]);

  const loadEntries = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('lesson_journal_entries')
      .select('user_response')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('prompt_text', 'BASELINE_TRACKER_DATA')
      .maybeSingle();

    if (data?.user_response) {
      try {
        const parsed = JSON.parse(data.user_response);
        setEntries(parsed);
      } catch (e) {
        console.error('Error parsing baseline data', e);
      }
    }
  };

  const saveEntries = async () => {
    if (!user) return;

    setSaving(true);
    await supabase
      .from('lesson_journal_entries')
      .upsert({
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        prompt_text: 'BASELINE_TRACKER_DATA',
        user_response: JSON.stringify(entries),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id,prompt_text'
      });

    setSaving(false);
  };

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return endMinutes - startMinutes;
  };

  const addEntry = () => {
    if (!newEntry.activity || !newEntry.startTime || !newEntry.endTime) {
      alert('Please fill in all fields');
      return;
    }

    const duration = calculateDuration(newEntry.startTime, newEntry.endTime);
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    const entry: TimeEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      activity: newEntry.activity,
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      duration,
      category: newEntry.category,
      aiPotential: newEntry.aiPotential
    };

    setEntries([...entries, entry]);
    setNewEntry({
      date: newEntry.date,
      activity: '',
      startTime: '',
      endTime: '',
      category: 'Writing',
      aiPotential: 1
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const calculateAnalysis = () => {
    const categoryTotals: Record<string, number> = {};
    const tierTotals: Record<number, number> = {};
    let totalMinutes = 0;

    entries.forEach(entry => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.duration;
      tierTotals[entry.aiPotential] = (tierTotals[entry.aiPotential] || 0) + entry.duration;
      totalMinutes += entry.duration;
    });

    return { categoryTotals, tierTotals, totalMinutes };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Activity', 'Start Time', 'End Time', 'Duration (min)', 'Category', 'AI Potential'];
    const rows = entries.map(e => [
      e.date,
      e.activity,
      e.startTime,
      e.endTime,
      e.duration.toString(),
      e.category,
      e.aiPotential.toString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity-baseline.csv';
    a.click();
  };

  const { categoryTotals, tierTotals, totalMinutes } = calculateAnalysis();

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black p-6">
        <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
          Time Tracking Tool
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Date</label>
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Activity</label>
            <input
              type="text"
              value={newEntry.activity}
              onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
              placeholder="e.g., Write project proposal"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Start Time</label>
            <input
              type="time"
              value={newEntry.startTime}
              onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">End Time</label>
            <input
              type="time"
              value={newEntry.endTime}
              onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Category</label>
            <select
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
              className="w-full p-2 border border-black text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">AI Potential</label>
            <select
              value={newEntry.aiPotential}
              onChange={(e) => setNewEntry({ ...newEntry, aiPotential: Number(e.target.value) })}
              className="w-full p-2 border border-black text-sm"
            >
              <option value={1}>Tier 1 - High Impact</option>
              <option value={2}>Tier 2 - Medium Impact</option>
              <option value={3}>Tier 3 - Low Impact</option>
              <option value={4}>Tier 4 - Can't Automate</option>
            </select>
          </div>
        </div>

        <button
          onClick={addEntry}
          className="flex items-center gap-2 bg-[#FF6A00] text-black border border-black px-4 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Entry
        </button>
      </div>

      {entries.length > 0 && (
        <>
          <div className="bg-white border border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg uppercase tracking-tight">
                Your Time Log ({entries.length} entries)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="flex items-center gap-2 bg-[#0A74FF] text-white border border-black px-3 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <TrendingUp className="w-4 h-4" strokeWidth={2} />
                  {showAnalysis ? 'Hide' : 'Show'} Analysis
                </button>
                <button
                  onClick={saveEntries}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white border border-black px-3 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-[#10b981] text-black border border-black px-3 py-2 font-extrabold text-xs uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-2 font-extrabold">Date</th>
                    <th className="text-left p-2 font-extrabold">Activity</th>
                    <th className="text-left p-2 font-extrabold">Time</th>
                    <th className="text-left p-2 font-extrabold">Duration</th>
                    <th className="text-left p-2 font-extrabold">Category</th>
                    <th className="text-left p-2 font-extrabold">AI Tier</th>
                    <th className="text-left p-2 font-extrabold"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-200">
                      <td className="p-2">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="p-2">{entry.activity}</td>
                      <td className="p-2">{entry.startTime} - {entry.endTime}</td>
                      <td className="p-2">{entry.duration} min</td>
                      <td className="p-2">{entry.category}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs font-bold ${
                          entry.aiPotential === 1 ? 'bg-[#10b981] text-white' :
                          entry.aiPotential === 2 ? 'bg-[#0A74FF] text-white' :
                          entry.aiPotential === 3 ? 'bg-[#F59E0B] text-black' :
                          'bg-gray-300 text-black'
                        }`}>
                          Tier {entry.aiPotential}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 hover:bg-red-100 border border-black"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showAnalysis && (
            <div className="bg-[#FFF9E6] border border-black p-6 shadow-[2px_2px_0px_#000000]">
              <h3 className="font-extrabold text-lg uppercase tracking-tight mb-4">
                Your Baseline Analysis
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-extrabold text-sm uppercase mb-3">Time by Category</h4>
                  <div className="space-y-2">
                    {Object.entries(categoryTotals).map(([category, minutes]) => {
                      const hours = (minutes / 60).toFixed(1);
                      const percentage = ((minutes / totalMinutes) * 100).toFixed(0);
                      return (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span className="font-semibold">{category}</span>
                          <span>{hours} hrs ({percentage}%)</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t-2 border-black">
                      <span>TOTAL</span>
                      <span>{(totalMinutes / 60).toFixed(1)} hrs</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm uppercase mb-3">AI Opportunity</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(tier => {
                      const minutes = tierTotals[tier] || 0;
                      const hours = (minutes / 60).toFixed(1);
                      const percentage = totalMinutes > 0 ? ((minutes / totalMinutes) * 100).toFixed(0) : '0';
                      const label = tier === 1 ? 'High' : tier === 2 ? 'Medium' : tier === 3 ? 'Low' : 'None';
                      return (
                        <div key={tier} className="flex justify-between items-center text-sm">
                          <span className="font-semibold">Tier {tier} - {label}</span>
                          <span>{hours} hrs ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-[#FF6A00] border border-black">
                    <p className="text-xs font-extrabold uppercase mb-2">Your Opportunity</p>
                    <p className="text-2xl font-extrabold">
                      {((tierTotals[1] || 0) / 60).toFixed(1)} hours
                    </p>
                    <p className="text-xs">of Tier 1 (high-impact) work per week</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-black">
                <p className="text-xs font-extrabold uppercase mb-2">Key Insights</p>
                <ul className="text-sm space-y-1">
                  <li>• You tracked {entries.length} activities totaling {(totalMinutes / 60).toFixed(1)} hours</li>
                  <li>• Top category: {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0]} ({((Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[1] || 0) / 60).toFixed(1)} hrs)</li>
                  <li>• {(((tierTotals[1] || 0) / totalMinutes) * 100).toFixed(0)}% of your time has high AI automation potential</li>
                  <li>• Focus on Tier 1 activities for maximum productivity gains</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {entries.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-600 mb-2">No entries yet. Start tracking your time above!</p>
          <p className="text-xs text-gray-500">Add activities throughout your day to build your baseline.</p>
        </div>
      )}
    </div>
  );
}
