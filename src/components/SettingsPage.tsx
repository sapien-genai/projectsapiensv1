import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Save, Eye, EyeOff, Shield, Bell, Globe, AlertCircle, CheckCircle2, LifeBuoy, Send, Ticket, ExternalLink, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../lib/supabase';

interface SettingsPageProps {
  onBack?: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  fluency_level: number;
  xp: number;
  avatar_url: string | null;
}

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'preferences' | 'support'>('profile');

  // Profile fields
  const [editedUsername, setEditedUsername] = useState('');
  const [editedAvatarUrl, setEditedAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  // Support
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (activeSection === 'support') {
      loadTickets();
    }
  }, [activeSection]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username,
          email: user.email || '',
          fluency_level: data.fluency_level,
          xp: data.xp,
          avatar_url: data.avatar_url
        });
        setEditedUsername(data.username);
        setEditedAvatarUrl(data.avatar_url || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setProfileError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: editedUsername,
          avatar_url: editedAvatarUrl || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        username: editedUsername,
        avatar_url: editedAvatarUrl || null,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.code === '23505') {
        setProfileError('Username already taken');
      } else {
        setProfileError('Failed to update profile');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    setPreferencesSuccess(false);

    setTimeout(() => {
      setPreferencesSuccess(true);
      setSavingPreferences(false);
      setTimeout(() => setPreferencesSuccess(false), 3000);
    }, 500);
  };

  const loadTickets = async () => {
    if (!user) return;

    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!user || !profile) return;

    setTicketError(null);
    setTicketSuccess(false);

    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      setTicketError('Subject and description are required');
      return;
    }

    setSubmittingTicket(true);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: ticketSubject,
          category: ticketCategory,
          priority: ticketPriority,
          description: ticketDescription,
          status: 'open'
        });

      if (error) throw error;

      setTicketSuccess(true);
      setTicketSubject('');
      setTicketDescription('');
      setTicketCategory('general');
      setTicketPriority('medium');
      setShowTicketForm(false);
      loadTickets();
      setTimeout(() => setTicketSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      setTicketError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 text-[#57524D] font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-[#57524D] hover:text-[#1C1A17] transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="font-extrabold text-3xl md:text-4xl uppercase tracking-tighter mb-2 font-sans">
            SETTINGS
          </h1>
          <p className="text-[#57524D] text-lg font-sans">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] overflow-hidden">
              <nav>
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-black font-semibold text-left transition-colors ${
                        isActive
                          ? 'bg-[#E67E22] text-black'
                          : 'bg-white text-[#57524D] hover:bg-[#E9E5E0]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] p-6">
                <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6">
                  Profile Information
                </h2>

                {profileSuccess && (
                  <div className="mb-6 bg-[#98C9A3] border border-black p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Profile updated successfully!</span>
                  </div>
                )}

                {profileError && (
                  <div className="mb-6 bg-red-100 border border-red-500 text-red-700 p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{profileError}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#E9E5E0] border border-black">
                      <Mail className="w-5 h-5 text-[#57524D]" />
                      <span className="font-semibold text-[#57524D]">{profile?.email}</span>
                    </div>
                    <p className="text-sm text-[#57524D] mt-2">
                      Email address cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                      Avatar URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={editedAvatarUrl}
                      onChange={(e) => setEditedAvatarUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 bg-[#0A74FF] text-white px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white border border-black shadow-[2px_2px_0px_#000000] p-6">
                <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Security Settings
                </h2>

                {passwordSuccess && (
                  <div className="mb-6 bg-[#98C9A3] border border-black p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Password changed successfully!</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-6 bg-red-100 border border-red-500 text-red-700 p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{passwordError}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261] pr-12"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57524D] hover:text-[#1C1A17]"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261] pr-12"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57524D] hover:text-[#1C1A17]"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-sm text-[#57524D] mt-1">
                          Must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261] pr-12"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57524D] hover:text-[#1C1A17]"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={savingPassword || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 bg-[#0A74FF] text-white px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        {savingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="bg-white border border-black shadow-[2px_2px_0px_#000000]  p-6">
                <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Preferences
                </h2>

                {preferencesSuccess && (
                  <div className="mb-6 bg-[#98C9A3] border border-black p-4  flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Preferences saved!</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-4">
                      Appearance
                    </h3>
                    <div className="space-y-4">
                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between p-4 border border-black cursor-pointer hover:bg-[#E9E5E0] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                          <div className="text-left">
                            <div className="font-bold">Dark Mode</div>
                            <div className="text-sm text-[#57524D]">
                              {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            </div>
                          </div>
                        </div>
                        <div className={`w-12 h-6 border border-black relative transition-colors ${isDarkMode ? 'bg-[#E67E22]' : 'bg-[#E9E5E0]'}`}>
                          <div className={`absolute top-0 w-6 h-full bg-black border-r border-black transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 border border-black  cursor-pointer hover:bg-[#E9E5E0] transition-colors">
                        <div>
                          <div className="font-bold">Email Notifications</div>
                          <div className="text-sm text-[#57524D]">
                            Receive emails about important updates
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="w-5 h-5 text-[#E67E22] border border-black focus:ring-2 focus:ring-[#E67E22]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-black  cursor-pointer hover:bg-[#E9E5E0] transition-colors">
                        <div>
                          <div className="font-bold">Progress Updates</div>
                          <div className="text-sm text-[#57524D]">
                            Get notified when you complete milestones
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={progressUpdates}
                          onChange={(e) => setProgressUpdates(e.target.checked)}
                          className="w-5 h-5 text-[#E67E22] border border-black focus:ring-2 focus:ring-[#E67E22]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-black  cursor-pointer hover:bg-[#E9E5E0] transition-colors">
                        <div>
                          <div className="font-bold">Weekly Digest</div>
                          <div className="text-sm text-[#57524D]">
                            Receive a summary of your weekly activity
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={weeklyDigest}
                          onChange={(e) => setWeeklyDigest(e.target.checked)}
                          className="w-5 h-5 text-[#E67E22] border border-black focus:ring-2 focus:ring-[#E67E22]"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPreferences}
                    className="flex items-center gap-2 bg-[#0A74FF] text-white px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingPreferences ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'support' && (
              <div className="space-y-6">
                <div className="bg-white border border-black shadow-[2px_2px_0px_#000000]  p-6">
                  <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6 flex items-center gap-2">
                    <LifeBuoy className="w-6 h-6" />
                    Support Center
                  </h2>

                  {ticketSuccess && (
                    <div className="mb-6 bg-[#98C9A3] border border-black p-4  flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Support ticket submitted successfully! We'll get back to you soon.</span>
                    </div>
                  )}

                  {ticketError && (
                    <div className="mb-6 bg-red-100 border border-red-500 text-red-700 p-4  flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">{ticketError}</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-black  bg-[#E9E5E0]">
                        <Ticket className="w-6 h-6 mb-2" />
                        <h3 className="font-bold uppercase tracking-tight mb-1">Open a Ticket</h3>
                        <p className="text-sm text-[#57524D] mb-2">Track your support request</p>
                        <button
                          onClick={() => {
                            setShowTicketForm(true);
                            setTicketError(null);
                          }}
                          className="text-sm font-bold text-[#E67E22] hover:underline"
                        >
                          Create Ticket →
                        </button>
                      </div>

                      <div className="p-4 border border-black  bg-[#E9E5E0]">
                        <Globe className="w-6 h-6 mb-2" />
                        <h3 className="font-bold uppercase tracking-tight mb-1">Help Center</h3>
                        <p className="text-sm text-[#57524D] mb-2">Browse documentation</p>
                        <a
                          href="#"
                          className="text-sm font-bold text-[#E67E22] hover:underline flex items-center gap-1"
                        >
                          Visit Help Center
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {showTicketForm && (
                      <div className="border border-black  p-6 bg-[#F8F5F2]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg uppercase tracking-tight">Create Support Ticket</h3>
                          <button
                            onClick={() => setShowTicketForm(false)}
                            className="text-[#57524D] hover:text-[#1C1A17]"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                              Subject *
                            </label>
                            <input
                              type="text"
                              value={ticketSubject}
                              onChange={(e) => setTicketSubject(e.target.value)}
                              className="w-full px-4 py-3 border border-black  font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                              placeholder="Brief description of your issue"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                                Category *
                              </label>
                              <select
                                value={ticketCategory}
                                onChange={(e) => setTicketCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-black  font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                              >
                                <option value="general">General Question</option>
                                <option value="technical">Technical Issue</option>
                                <option value="billing">Billing & Payment</option>
                                <option value="feature_request">Feature Request</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                                Priority *
                              </label>
                              <select
                                value={ticketPriority}
                                onChange={(e) => setTicketPriority(e.target.value)}
                                className="w-full px-4 py-3 border border-black  font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-tight">
                              Description *
                            </label>
                            <textarea
                              value={ticketDescription}
                              onChange={(e) => setTicketDescription(e.target.value)}
                              rows={6}
                              className="w-full px-4 py-3 border border-black  font-semibold focus:outline-none focus:ring-2 focus:ring-[#F4A261] resize-none"
                              placeholder="Provide detailed information about your issue or question..."
                            />
                          </div>

                          <button
                            onClick={handleSubmitTicket}
                            disabled={submittingTicket}
                            className="flex items-center gap-2 bg-[#0A74FF] text-white px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-black shadow-[2px_2px_0px_#000000]  p-6">
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Your Support Tickets
                  </h3>

                  {loadingTickets ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
                      <p className="mt-2 text-[#57524D] font-semibold">Loading tickets...</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-[#57524D]">
                      <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No support tickets yet</p>
                      <p className="text-sm">Create a ticket to get help from our support team</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => {
                        const statusColors: Record<string, string> = {
                          open: 'bg-[#5B7DB1] text-white',
                          in_progress: 'bg-[#E67E22] text-black',
                          resolved: 'bg-[#98C9A3] text-black',
                          closed: 'bg-[#E9E5E0] text-[#57524D]'
                        };

                        const priorityLabels: Record<string, string> = {
                          low: 'Low',
                          medium: 'Medium',
                          high: 'High'
                        };

                        return (
                          <div
                            key={ticket.id}
                            className="border border-black  p-4 hover:bg-[#E9E5E0] transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{ticket.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className={`px-2 py-1 font-bold uppercase text-xs ${statusColors[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ')}
                                  </span>
                                  <span className="px-2 py-1 bg-white border border-black font-bold uppercase text-xs">
                                    {ticket.category.replace('_', ' ')}
                                  </span>
                                  <span className="text-[#57524D]">
                                    Priority: {priorityLabels[ticket.priority]}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-[#57524D] mb-2 line-clamp-2">
                              {ticket.description}
                            </p>
                            <p className="text-xs text-[#57524D]">
                              Created: {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                              {new Date(ticket.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
