import { ArrowLeft, BookOpen, Calendar, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface JournalPageProps {
  onBack?: () => void;
}

interface JournalEntry {
  id: string;
  path_id: string;
  lesson_id: string;
  prompt_text: string;
  user_response: string;
  created_at: string;
  updated_at: string;
}

export default function JournalPage({ onBack }: JournalPageProps) {
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
    };
    return lessonTitles[lessonId] || lessonId;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <nav className="bg-[#F4F4F4] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-8 py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white border border-black px-4 py-2 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" strokeWidth={2} />
            <h1 className="font-extrabold text-3xl md:text-4xl uppercase tracking-tighter">
              MY JOURNAL
            </h1>
          </div>
          <p className="text-base md:text-lg leading-relaxed">
            Reflect on your AI learning journey. All your reflections and responses from lessons are saved here.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
            <p className="mt-4 font-semibold">LOADING YOUR JOURNAL...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-black p-8 text-center shadow-[3px_3px_0px_#000000]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" strokeWidth={2} />
            <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
              NO JOURNAL ENTRIES YET
            </h3>
            <p className="text-sm leading-relaxed mb-6">
              Complete lessons and answer reflection questions to start building your AI learning journal.
            </p>
            <button
              onClick={onBack}
              className="bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              START LEARNING
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-black p-6 shadow-[3px_3px_0px_#000000]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg uppercase tracking-tight mb-1">
                      {getLessonTitle(entry.lesson_id)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" strokeWidth={2} />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deleting === entry.id}
                    className="p-2 hover:bg-red-50 border border-black hover:border-red-500 transition-colors disabled:opacity-50"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="bg-[#FF6A00] bg-opacity-10 border-l-4 border-[#FF6A00] p-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-tight mb-2 text-[#FF6A00]">
                    PROMPT
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {entry.prompt_text.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <span key={i} className="font-semibold">{line.slice(2, -2)}</span>;
                      }
                      return line;
                    }).filter(Boolean).join('\n')}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-tight mb-2">
                    YOUR REFLECTION
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
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
