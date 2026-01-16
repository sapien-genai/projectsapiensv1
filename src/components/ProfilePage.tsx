import { useState, useEffect } from 'react';
import { ArrowLeft, User, Save, Trophy, Target, Users, BookOpen, Beaker, Share2, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError, getErrorMessage } from '../utils/errorHandling';

interface ProfilePageProps {
  onBack?: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  fluency_level: number;
  xp: number;
  bio: string | null;
  declared_strengths: string[];
  learning_goals: string[];
  open_to_mentoring: boolean;
  open_to_being_mentored: boolean;
  avatar_url: string | null;
}

interface UserStats {
  completedPaths: number;
  completedLabs: number;
  sharedProjects: number;
}

const fluencyLevels = [
  { level: 1, title: 'COLLABORATOR', subtitle: 'AI Fundamentals' },
  { level: 2, title: 'PRACTITIONER', subtitle: 'Workflow Designer' },
  { level: 3, title: 'INTEGRATOR', subtitle: 'System Builder' },
  { level: 4, title: 'LEADER', subtitle: 'Solution Architect' },
];

const AI_STRENGTH_OPTIONS = [
  'Prompt Engineering',
  'Workflow Automation',
  'Content Generation',
  'Data Analysis',
  'Creative Tools',
  'Research Skills',
  'System Integration',
  'AI Ethics',
];

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ completedPaths: 0, completedLabs: 0, sharedProjects: 0 });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    declared_strengths: [] as string[],
    learning_goals: [] as string[],
    open_to_mentoring: false,
    open_to_being_mentored: false,
  });

  const [newStrength, setNewStrength] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (data) {
        setProfile(data);
        setEditForm({
          username: data.username,
          bio: data.bio || '',
          declared_strengths: data.declared_strengths || [],
          learning_goals: data.learning_goals || [],
          open_to_mentoring: data.open_to_mentoring || false,
          open_to_being_mentored: data.open_to_being_mentored || false,
        });
      }
    } catch (err) {
      logError(err, 'ProfilePage - loadProfile');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const [pathsResult, labsResult, projectsResult] = await Promise.all([
        supabase
          .from('user_path_progress')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'completed'),

        supabase
          .from('lab_experiments')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),

        supabase
          .from('project_shares')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_public', true),
      ]);

      setStats({
        completedPaths: pathsResult.count || 0,
        completedLabs: labsResult.count || 0,
        sharedProjects: projectsResult.count || 0,
      });
    } catch (err) {
      logError(err, 'ProfilePage - loadStats');
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio || null,
          declared_strengths: editForm.declared_strengths,
          learning_goals: editForm.learning_goals,
          open_to_mentoring: editForm.open_to_mentoring,
          open_to_being_mentored: editForm.open_to_being_mentored,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile({
        ...profile,
        username: editForm.username,
        bio: editForm.bio || null,
        declared_strengths: editForm.declared_strengths,
        learning_goals: editForm.learning_goals,
        open_to_mentoring: editForm.open_to_mentoring,
        open_to_being_mentored: editForm.open_to_being_mentored,
      });
      setEditing(false);
    } catch (err) {
      logError(err, 'ProfilePage - handleSave');
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    } finally {
      setSaving(false);
    }
  };

  const addStrength = (strength: string) => {
    if (strength && !editForm.declared_strengths.includes(strength)) {
      setEditForm({
        ...editForm,
        declared_strengths: [...editForm.declared_strengths, strength],
      });
      setNewStrength('');
    }
  };

  const removeStrength = (strength: string) => {
    setEditForm({
      ...editForm,
      declared_strengths: editForm.declared_strengths.filter((s) => s !== strength),
    });
  };

  const addGoal = () => {
    if (newGoal && !editForm.learning_goals.includes(newGoal)) {
      setEditForm({
        ...editForm,
        learning_goals: [...editForm.learning_goals, newGoal],
      });
      setNewGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setEditForm({
      ...editForm,
      learning_goals: editForm.learning_goals.filter((g) => g !== goal),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#F4A261] animate-spin"></div>
          <p className="mt-4 font-semibold">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  const currentLevel = fluencyLevels.find((l) => l.level === profile.fluency_level) || fluencyLevels[0];

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-[#E9E5E0] border-2 border-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
            )}
            <h1 className="font-extrabold text-2xl uppercase tracking-tight">Profile</h1>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
            >
              Edit Profile
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-100 border-2 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-[#E9E5E0] border-4 border-black flex items-center justify-center">
              <User className="w-12 h-12 text-gray-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-tight text-sm mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] min-h-[100px]"
                      placeholder="Tell others about your AI journey..."
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-extrabold text-3xl uppercase tracking-tight mb-2">
                    {profile.username}
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm bg-[#F4A261] border-2 border-black px-3 py-1 font-bold">
                      {currentLevel.title}
                    </span>
                    <span className="text-sm text-gray-600">{currentLevel.subtitle}</span>
                  </div>
                  {profile.bio && (
                    <p className="text-base leading-relaxed text-gray-700">{profile.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
            <BookOpen className="w-8 h-8 mb-3" strokeWidth={2.5} />
            <p className="text-3xl font-extrabold">{stats.completedPaths}</p>
            <p className="text-sm font-bold uppercase tracking-tight text-gray-600">
              Paths Completed
            </p>
          </div>
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
            <Beaker className="w-8 h-8 mb-3" strokeWidth={2.5} />
            <p className="text-3xl font-extrabold">{stats.completedLabs}</p>
            <p className="text-sm font-bold uppercase tracking-tight text-gray-600">
              Labs Completed
            </p>
          </div>
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-6">
            <Share2 className="w-8 h-8 mb-3" strokeWidth={2.5} />
            <p className="text-3xl font-extrabold">{stats.sharedProjects}</p>
            <p className="text-sm font-bold uppercase tracking-tight text-gray-600">
              Projects Shared
            </p>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6" strokeWidth={2.5} />
            <h3 className="font-extrabold text-xl uppercase tracking-tight">
              Declared Strengths
            </h3>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261] bg-white"
                >
                  <option value="">Select a strength...</option>
                  {AI_STRENGTH_OPTIONS.filter(s => !editForm.declared_strengths.includes(s)).map((strength) => (
                    <option key={strength} value={strength}>
                      {strength}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => newStrength && addStrength(newStrength)}
                  className="px-4 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editForm.declared_strengths.map((strength) => (
                  <span
                    key={strength}
                    className="inline-flex items-center gap-2 bg-[#98C9A3] border-2 border-black px-3 py-2 font-bold text-sm"
                  >
                    {strength}
                    <button onClick={() => removeStrength(strength)}>
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.declared_strengths && profile.declared_strengths.length > 0 ? (
                profile.declared_strengths.map((strength) => (
                  <span
                    key={strength}
                    className="bg-[#98C9A3] border-2 border-black px-4 py-2 font-bold text-sm"
                  >
                    {strength}
                  </span>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No strengths declared yet</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6" strokeWidth={2.5} />
            <h3 className="font-extrabold text-xl uppercase tracking-tight">Learning Goals</h3>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  placeholder="Add a learning goal..."
                  className="flex-1 px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                />
                <button
                  onClick={addGoal}
                  className="px-4 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="space-y-2">
                {editForm.learning_goals.map((goal) => (
                  <div
                    key={goal}
                    className="flex items-center justify-between bg-[#E9E5E0] border-2 border-black px-4 py-3"
                  >
                    <span className="text-sm">{goal}</span>
                    <button onClick={() => removeGoal(goal)}>
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.learning_goals && profile.learning_goals.length > 0 ? (
                profile.learning_goals.map((goal) => (
                  <div key={goal} className="bg-[#E9E5E0] border-2 border-black px-4 py-3">
                    <p className="text-sm">{goal}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No learning goals set yet</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6" strokeWidth={2.5} />
            <h3 className="font-extrabold text-xl uppercase tracking-tight">
              Mentorship Settings
            </h3>
          </div>
          {editing ? (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-black hover:bg-[#E9E5E0] transition-colors">
                <input
                  type="checkbox"
                  checked={editForm.open_to_mentoring}
                  onChange={(e) =>
                    setEditForm({ ...editForm, open_to_mentoring: e.target.checked })
                  }
                  className="w-5 h-5 border-2 border-black"
                />
                <div>
                  <p className="font-bold">Open to mentoring others</p>
                  <p className="text-sm text-gray-600">
                    You'll appear in the mentor discovery list
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-black hover:bg-[#E9E5E0] transition-colors">
                <input
                  type="checkbox"
                  checked={editForm.open_to_being_mentored}
                  onChange={(e) =>
                    setEditForm({ ...editForm, open_to_being_mentored: e.target.checked })
                  }
                  className="w-5 h-5 border-2 border-black"
                />
                <div>
                  <p className="font-bold">Open to being mentored</p>
                  <p className="text-sm text-gray-600">
                    You can request mentorship from available mentors
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-bold">Mentoring others:</span>{' '}
                {profile.open_to_mentoring ? 'Yes' : 'No'}
              </p>
              <p className="text-sm">
                <span className="font-bold">Open to being mentored:</span>{' '}
                {profile.open_to_being_mentored ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>

        {editing && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setEditForm({
                  username: profile.username,
                  bio: profile.bio || '',
                  declared_strengths: profile.declared_strengths || [],
                  learning_goals: profile.learning_goals || [],
                  open_to_mentoring: profile.open_to_mentoring || false,
                  open_to_being_mentored: profile.open_to_being_mentored || false,
                });
              }}
              className="flex-1 px-6 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[#F4A261] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-tight flex items-center justify-center gap-2"
              disabled={saving}
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
