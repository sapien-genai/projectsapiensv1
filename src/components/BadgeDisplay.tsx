import React, { useState, useEffect } from 'react';
import { Trophy, Award, ArrowLeft } from 'lucide-react';
import { BadgeCard } from './BadgeCard';
import { badgeDefinitions, getBadgesByCategory } from '../data/badgeDefinitions';
import type { Badge } from '../data/badgeDefinitions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  featured: boolean;
  notified: boolean;
}

interface BadgeDisplayProps {
  onBack?: () => void;
}

const categoryLabels: Record<string, string> = {
  progress: 'Progress Badges',
  consistency: 'Consistency Badges',
  lab: 'Lab Badges',
  prompt: 'Prompt Mastery',
  network: 'Network Badges',
  specialization: 'Specialization Badges',
  achievement: 'Achievement Badges',
};

export function BadgeDisplay({ onBack }: BadgeDisplayProps) {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'progress', 'consistency', 'lab', 'prompt', 'network', 'specialization', 'achievement'];

  useEffect(() => {
    if (user) {
      loadUserBadges();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserBadges = async () => {
    try {
      // Check and award any earned badges based on current progress
      if (user) {
        try {
          await supabase.rpc('check_and_award_badges', { p_user_id: user.id });
        } catch (badgeCheckError) {
          console.error('Error checking badges:', badgeCheckError);
        }
      }

      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const earnedCount = earnedBadgeIds.size;
  const badgeMap = new Map(badgeDefinitions.map(b => [b.id, b]));
  const totalPoints = userBadges.reduce((sum, ub) => {
    const badge = badgeMap.get(ub.badge_id);
    return sum + (badge?.points || 0);
  }, 0);

  const getBadgesToDisplay = () => {
    if (selectedCategory === 'all') {
      return badgeDefinitions;
    }
    return getBadgesByCategory(selectedCategory as Badge['category']);
  };

  const badgesToDisplay = getBadgesToDisplay();
  const earnedInCategory = badgesToDisplay.filter(b => earnedBadgeIds.has(b.id)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
          <p className="mt-4 font-extrabold uppercase tracking-tight">Loading...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-10 h-10" strokeWidth={2} />
            <h1 className="font-extrabold text-3xl md:text-4xl uppercase tracking-tighter">My Badges</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0A74FF] border border-black p-6 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-extrabold uppercase tracking-tight mb-1">Badges Earned</p>
                  <p className="text-white text-4xl font-extrabold">{earnedCount}</p>
                  <p className="text-white text-xs font-semibold uppercase tracking-wide mt-1">
                    of {badgeDefinitions.length}
                  </p>
                </div>
                <Award className="w-12 h-12 text-white opacity-50" strokeWidth={2} />
              </div>
            </div>

            <div className="bg-[#FFD700] border border-black p-6 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-xs font-extrabold uppercase tracking-tight mb-1">Total Points</p>
                  <p className="text-black text-4xl font-extrabold">{totalPoints}</p>
                  <p className="text-black text-xs font-semibold uppercase tracking-wide mt-1">
                    points earned
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-black opacity-30" strokeWidth={2} />
              </div>
            </div>

            <div className="bg-[#FF6A00] border border-black p-6 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-xs font-extrabold uppercase tracking-tight mb-1">Completion</p>
                  <p className="text-black text-4xl font-extrabold">
                    {badgeDefinitions.length > 0 ? Math.round((earnedCount / badgeDefinitions.length) * 100) : 0}%
                  </p>
                  <p className="text-black text-xs font-semibold uppercase tracking-wide mt-1">
                    badges unlocked
                  </p>
                </div>
                <Award className="w-12 h-12 text-black opacity-30" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(category => {
              const count = category === 'all'
                ? earnedCount
                : getBadgesByCategory(category as Badge['category']).filter(b => earnedBadgeIds.has(b.id)).length;
              const total = category === 'all'
                ? badgeDefinitions.length
                : getBadgesByCategory(category as Badge['category']).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 border border-black font-extrabold text-sm uppercase tracking-tight transition-all ${
                    selectedCategory === category
                      ? 'bg-black text-white shadow-[4px_4px_0px_#FF6A00]'
                      : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                >
                  {category === 'all' ? 'All Badges' : categoryLabels[category]} ({count}/{total})
                </button>
              );
            })}
          </div>
        </div>

        {selectedCategory !== 'all' && (
          <div className="mb-6 bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
            <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-2">
              {categoryLabels[selectedCategory]}
            </h2>
            <p className="text-sm font-semibold">
              {earnedInCategory} of {badgesToDisplay.length} earned
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badgesToDisplay.map(badge => {
            const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
            const earned = !!userBadge;

            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earned}
                earnedAt={userBadge?.earned_at}
                featured={userBadge?.featured}
              />
            );
          })}
        </div>

        {!user && (
          <div className="mt-12 bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <p className="text-center text-lg font-semibold mb-4">
              Sign in to start earning badges and track your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
