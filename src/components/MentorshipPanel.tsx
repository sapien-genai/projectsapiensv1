import { useState, useEffect } from 'react';
import { UserPlus, MessageSquare, X, Send, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { logError, getErrorMessage } from '../utils/errorHandling';

interface MentorProfile {
  user_id: string;
  username: string;
  fluency_level: number;
  declared_strengths: string[];
  bio: string | null;
}

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  message: string;
  status: string;
  created_at: string;
  mentor_username?: string;
  mentee_username?: string;
}

export default function MentorshipPanel() {
  const { user } = useAuth();
  const [availableMentors, setAvailableMentors] = useState<MentorProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MentorshipRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MentorshipRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestForm, setRequestForm] = useState({
    topic: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      loadMentorshipData();
    }
  }, [user]);

  const loadMentorshipData = async () => {
    if (!user) return;

    try {
      const [mentorsResult, incomingResult, outgoingResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('user_id, username, fluency_level, declared_strengths, bio')
          .eq('open_to_mentoring', true)
          .neq('user_id', user.id)
          .order('fluency_level', { ascending: false })
          .limit(20),

        supabase
          .from('mentorship_requests')
          .select('*')
          .eq('mentor_id', user.id)
          .in('status', ['pending', 'accepted'])
          .order('created_at', { ascending: false }),

        supabase
          .from('mentorship_requests')
          .select('*')
          .eq('mentee_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (mentorsResult.data) {
        setAvailableMentors(mentorsResult.data);
      }

      if (incomingResult.data && incomingResult.data.length > 0) {
        const menteeIds = incomingResult.data.map(r => r.mentee_id);
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', menteeIds);

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.user_id, p.username])
        );

        const formattedIncoming = incomingResult.data.map((req: any) => ({
          ...req,
          mentee_username: profilesMap.get(req.mentee_id) || 'Unknown',
        }));
        setIncomingRequests(formattedIncoming);
      } else {
        setIncomingRequests([]);
      }

      if (outgoingResult.data && outgoingResult.data.length > 0) {
        const mentorIds = outgoingResult.data.map(r => r.mentor_id);
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', mentorIds);

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.user_id, p.username])
        );

        const formattedOutgoing = outgoingResult.data.map((req: any) => ({
          ...req,
          mentor_username: profilesMap.get(req.mentor_id) || 'Unknown',
        }));
        setOutgoingRequests(formattedOutgoing);
      } else {
        setOutgoingRequests([]);
      }

      setLoading(false);
    } catch (err) {
      logError(err, 'MentorshipPanel - loadMentorshipData');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
      setLoading(false);
    }
  };

  const handleRequestMentorship = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMentor) return;

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('mentorship_requests')
        .insert({
          mentee_id: user.id,
          mentor_id: selectedMentor.user_id,
          topic: requestForm.topic,
          message: requestForm.message,
          status: 'pending',
        });

      if (insertError) throw insertError;

      setShowRequestForm(false);
      setRequestForm({ topic: '', message: '' });
      setSelectedMentor(null);
      loadMentorshipData();
    } catch (err) {
      logError(err, 'MentorshipPanel - handleSubmitRequest');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    }
  };

  const handleRespondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('mentorship_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (status === 'accepted') {
        const request = incomingRequests.find(r => r.id === requestId);
        if (request) {
          await supabase.from('mentorship_connections').insert({
            mentee_id: request.mentee_id,
            mentor_id: request.mentor_id,
            active: true,
          });
        }
      }

      loadMentorshipData();
    } catch (err) {
      logError(err, 'MentorshipPanel - handleRespondToRequest');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-black border-t-[#F4A261] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {incomingRequests.length > 0 && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
          <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
            Incoming Requests
          </h3>
          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <div key={request.id} className="border-2 border-black p-4 bg-[#E9E5E0]">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold">{request.mentee_username}</p>
                  <span className="text-xs bg-white border border-black px-2 py-1">
                    {request.status}
                  </span>
                </div>
                <p className="text-sm font-bold mb-1">Topic: {request.topic}</p>
                <p className="text-sm text-gray-700 mb-3">{request.message}</p>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accepted')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#98C9A3] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-sm uppercase"
                    >
                      <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'declined')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-sm uppercase"
                    >
                      <XCircle className="w-4 h-4" strokeWidth={2.5} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoingRequests.length > 0 && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
          <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
            Your Requests
          </h3>
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
              <div key={request.id} className="border-2 border-black p-4 bg-[#E9E5E0]">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold">To: {request.mentor_username}</p>
                  <span
                    className={`text-xs border border-black px-2 py-1 ${
                      request.status === 'accepted'
                        ? 'bg-[#98C9A3]'
                        : request.status === 'declined'
                        ? 'bg-red-200'
                        : 'bg-white'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-sm font-bold mb-1">Topic: {request.topic}</p>
                <p className="text-sm text-gray-700">{request.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
          Available Mentors
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {availableMentors.map((mentor) => (
            <div key={mentor.user_id} className="border-2 border-black p-4 bg-[#E9E5E0]">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-lg">{mentor.username}</p>
                <span className="text-xs bg-white border border-black px-2 py-1">
                  Level {mentor.fluency_level}
                </span>
              </div>
              {mentor.bio && <p className="text-sm text-gray-700 mb-3">{mentor.bio}</p>}
              {mentor.declared_strengths && mentor.declared_strengths.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {mentor.declared_strengths.map((strength, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white border border-black px-2 py-1"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleRequestMentorship(mentor)}
                className="flex items-center gap-2 px-4 py-2 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-sm uppercase w-full justify-center"
              >
                <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                Request Mentorship
              </button>
            </div>
          ))}
        </div>
      </div>

      {showRequestForm && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_#000000] max-w-lg w-full">
            <div className="bg-[#E9E5E0] border-b-4 border-black p-6 flex justify-between items-center">
              <h3 className="font-extrabold text-xl uppercase tracking-tight">
                Request Mentorship
              </h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="p-2 hover:bg-white border-2 border-black transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <p className="text-sm mb-4">
                  Requesting mentorship from: <span className="font-bold">{selectedMentor.username}</span>
                </p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                  What do you need help with?
                </label>
                <input
                  type="text"
                  value={requestForm.topic}
                  onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                  placeholder="e.g., Prompt engineering, workflow automation"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                  Message
                </label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] min-h-[120px]"
                  placeholder="Tell them what you're working on and how they could help..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
