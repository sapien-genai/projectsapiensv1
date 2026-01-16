import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import type { Badge } from '../data/badgeDefinitions';
import { getRarityLabel } from '../data/badgeDefinitions';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  progress?: {
    current?: number;
    total?: number;
  };
  featured?: boolean;
  onClick?: () => void;
}

function BadgeCardComponent({ badge, earned = false, earnedAt, progress, featured = false, onClick }: BadgeCardProps) {
  const Icon = useMemo(
    () => (Icons as Record<string, React.ComponentType<{ className?: string }>>)[badge.icon] || Icons.Award,
    [badge.icon]
  );

  const { hasProgress, progressPercentage } = useMemo(() => {
    const hasProgress = progress && progress.total !== undefined && progress.current !== undefined;
    const progressPercentage = hasProgress ? Math.round((progress.current! / progress.total!) * 100) : 0;
    return { hasProgress, progressPercentage };
  }, [progress]);

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border border-black p-6 transition-all ${
        earned
          ? 'shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      } ${featured ? 'shadow-[6px_6px_0px_#FFD700]' : ''}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-black text-xs font-extrabold px-3 py-1 border border-black uppercase tracking-tight">
          Featured
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`p-4 border border-black transition-all ${
            earned ? 'shadow-[2px_2px_0px_#000000]' : ''
          }`}
          style={
            earned
              ? { backgroundColor: badge.color }
              : { backgroundColor: '#E5E5E5' }
          }
        >
          <Icon
            className={`w-10 h-10 ${earned ? 'text-black' : 'text-gray-400'}`}
            strokeWidth={2}
          />
        </div>

        <div>
          <h3 className={`font-extrabold text-lg uppercase tracking-tight ${earned ? 'text-black' : 'text-gray-400'}`}>
            {earned ? badge.name : '???'}
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wide mt-1">
            {getRarityLabel(badge.rarity)} • {badge.points} PTS
          </p>
        </div>

        <p className={`text-sm leading-relaxed ${earned ? 'text-black' : 'text-gray-400'}`}>
          {earned ? badge.description : 'Complete challenges to unlock'}
        </p>

        {earned && earnedAt && (
          <p className="text-xs uppercase tracking-wide font-semibold">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}

        {!earned && hasProgress && (
          <div className="w-full">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wide mb-2">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#E5E5E5] border border-black h-4">
              <div
                className="h-full border-r-2 border-black transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: badge.color,
                }}
              />
            </div>
            <p className="text-xs font-semibold mt-2 uppercase tracking-wide">
              {progress.current}/{progress.total} {badge.criteria.details || ''}
            </p>
          </div>
        )}

        {!earned && !hasProgress && badge.criteria.details && (
          <p className="text-xs font-semibold uppercase tracking-wide bg-[#E5E5E5] px-3 py-2 border border-black">
            {badge.criteria.details}
          </p>
        )}
      </div>

      {badge.rarity === 'legendary' && earned && (
        <div className="absolute -top-1 -right-1 bg-[#FFD700] text-black text-xs font-extrabold px-2 py-1 border border-black uppercase tracking-tight rotate-12">
          Legendary!
        </div>
      )}
    </div>
  );
}

export const BadgeCard = React.memo(BadgeCardComponent);
