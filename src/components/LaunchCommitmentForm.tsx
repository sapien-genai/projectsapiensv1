import { useState, useEffect } from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LaunchCommitmentFormProps {
  onComplete?: () => void;
}

export default function LaunchCommitmentForm({ onComplete }: LaunchCommitmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [badgeAwarded, setBadgeAwarded] = useState(false);

  const [formData, setFormData] = useState({
    student_name: '',
    start_date: new Date().toISOString().split('T')[0],
    why: '',
    metric_1: '',
    metric_2: '',
    metric_3: '',
    metric_4: '',
    accountability_person: '',
    checkin_schedule: '',
    backup_action: '',
    backup_help: '',
    reward: '',
    signature: '',
    signed_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    checkExistingCommitment();
  }, [user]);

  const checkExistingCommitment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('launch_commitments')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing commitment:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setFormData({
          student_name: data.student_name,
          start_date: data.start_date,
          why: data.why,
          metric_1: data.metric_1,
          metric_2: data.metric_2,
          metric_3: data.metric_3,
          metric_4: data.metric_4,
          accountability_person: data.accountability_person,
          checkin_schedule: data.checkin_schedule,
          backup_action: data.backup_action,
          backup_help: data.backup_help,
          reward: data.reward,
          signature: data.signature,
          signed_date: data.signed_date
        });
        setCompleted(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading commitment:', error);
      setLoading(false);
    }
  };

  const awardBadge = async () => {
    if (!user) return;

    // Check if badge already awarded
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_id', 'command-center-master')
      .maybeSingle();

    if (!existingBadge) {
      await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: 'command-center-master',
          earned_at: new Date().toISOString()
        });
      setBadgeAwarded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    await supabase
      .from('launch_commitments')
      .upsert({
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    await awardBadge();
    setCompleted(true);
    setSubmitting(false);

    if (onComplete) {
      onComplete();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="bg-[#FF6A00] border border-black p-6 text-center">
        <p className="text-black font-bold">Loading...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-[#FF6A00] border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000]">
        <div className="text-center mb-6">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" strokeWidth={2} />
          <h3 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-2">
            Commitment Signed!
          </h3>
          <p className="text-black font-bold">You're officially committed to 30 days of AI mastery.</p>
        </div>

        {badgeAwarded && (
          <div className="bg-yellow-400 border border-black p-4 mb-6 flex items-center gap-3">
            <Award className="w-8 h-8 text-black" strokeWidth={2} />
            <div>
              <p className="font-extrabold text-black uppercase tracking-tight">Badge Unlocked!</p>
              <p className="text-sm text-black">Command Center Master</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-black p-6 space-y-4 text-black">
          <h4 className="font-extrabold uppercase tracking-tight mb-4">Your Commitment</h4>

          <div>
            <p className="font-bold text-sm mb-1">I, {formData.student_name},</p>
            <p className="text-sm">commit to using my AI Command Center daily for 30 days starting {new Date(formData.start_date).toLocaleDateString()}.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-1">MY WHY:</p>
            <p className="text-sm">{formData.why}</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-1">MY METRICS:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• {formData.metric_1}</li>
              <li>• {formData.metric_2}</li>
              <li>• {formData.metric_3}</li>
              <li>• {formData.metric_4}</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-sm mb-1">MY ACCOUNTABILITY:</p>
            <p className="text-sm">Sharing with: {formData.accountability_person}</p>
            <p className="text-sm">Check-ins: {formData.checkin_schedule}</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-1">MY BACKUP PLAN:</p>
            <p className="text-sm">If something breaks: {formData.backup_action}</p>
            <p className="text-sm">Will ask: {formData.backup_help}</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-1">MY REWARD:</p>
            <p className="text-sm">{formData.reward}</p>
          </div>

          <div className="pt-4 border-t-2 border-black">
            <p className="text-sm">Signed: <span className="font-bold">{formData.signature}</span></p>
            <p className="text-sm">Date: <span className="font-bold">{new Date(formData.signed_date).toLocaleDateString()}</span></p>
          </div>
        </div>

        <p className="text-xs text-black mt-4 text-center">
          Screenshot or save this. Review it on Day 15 when motivation dips.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FF6A00] border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000]">
      <h3 className="text-xl font-extrabold uppercase tracking-tight text-black mb-6">
        Launch Commitment
      </h3>

      <div className="space-y-6">
        <div className="bg-white border border-black p-4">
          <p className="text-sm text-black mb-4">
            Complete this commitment statement to launch your Command Center and earn your badge:
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Your Name *</label>
              <input
                type="text"
                value={formData.student_name}
                onChange={(e) => handleChange('student_name', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">MY WHY</h4>
          <label className="block text-sm text-black mb-2">I'm doing this because...</label>
          <textarea
            value={formData.why}
            onChange={(e) => handleChange('why', e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
            rows={3}
            placeholder="What you want to change/improve"
            required
          />
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">MY METRICS</h4>
          <p className="text-sm text-black mb-3">I'll track these to measure success:</p>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.metric_1}
              onChange={(e) => handleChange('metric_1', e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Metric 1: e.g., time saved"
              required
            />
            <input
              type="text"
              value={formData.metric_2}
              onChange={(e) => handleChange('metric_2', e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Metric 2: e.g., stress level"
              required
            />
            <input
              type="text"
              value={formData.metric_3}
              onChange={(e) => handleChange('metric_3', e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Metric 3: e.g., work quality"
              required
            />
            <input
              type="text"
              value={formData.metric_4}
              onChange={(e) => handleChange('metric_4', e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Metric 4: e.g., things completed"
              required
            />
          </div>
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">MY ACCOUNTABILITY</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-black mb-2">I'm sharing this commitment with:</label>
              <input
                type="text"
                value={formData.accountability_person}
                onChange={(e) => handleChange('accountability_person', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Person's name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-black mb-2">I'll check in weekly on:</label>
              <input
                type="text"
                value={formData.checkin_schedule}
                onChange={(e) => handleChange('checkin_schedule', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Day/time (e.g., Sundays at 7pm)"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">MY BACKUP PLAN</h4>
          <p className="text-sm text-black mb-3">If something breaks or doesn't work:</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-black mb-2">What I'll do:</label>
              <input
                type="text"
                value={formData.backup_action}
                onChange={(e) => handleChange('backup_action', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your backup action"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-black mb-2">Who I'll ask for help:</label>
              <input
                type="text"
                value={formData.backup_help}
                onChange={(e) => handleChange('backup_help', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Person or resource"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">MY REWARD</h4>
          <label className="block text-sm text-black mb-2">When I complete 30 days successfully:</label>
          <textarea
            value={formData.reward}
            onChange={(e) => handleChange('reward', e.target.value)}
            className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
            rows={2}
            placeholder="How you'll celebrate"
            required
          />
        </div>

        <div className="bg-white border border-black p-4">
          <h4 className="font-bold text-black mb-3">SIGNATURE</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-black mb-2">Type your full name to sign:</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => handleChange('signature', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your signature"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-black mb-2">Date:</label>
              <input
                type="date"
                value={formData.signed_date}
                onChange={(e) => handleChange('signed_date', e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-black text-white border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'SIGNING...' : 'SIGN COMMITMENT & EARN BADGE'}
        </button>

        <p className="text-xs text-black text-center">
          By signing, you commit to using your AI Command Center daily for 30 days.
        </p>
      </div>
    </form>
  );
}
