import { Lock, CheckCircle, Circle, Beaker, BookOpen, Share2 } from 'lucide-react';

interface NetworkUnlockTeaserProps {
  pathsCompleted: number;
  labsCompleted: number;
  approvedProjects: number;
}

export default function NetworkUnlockTeaser({
  pathsCompleted,
  labsCompleted,
  approvedProjects,
}: NetworkUnlockTeaserProps) {
  const requirements = [
    {
      icon: BookOpen,
      label: 'Complete 1 Learning Path',
      current: pathsCompleted,
      required: 1,
      met: pathsCompleted >= 1,
    },
    {
      icon: Beaker,
      label: 'Complete 3 Labs',
      current: labsCompleted,
      required: 3,
      met: labsCompleted >= 3,
    },
    {
      icon: Share2,
      label: 'Submit 1 Project',
      current: approvedProjects,
      required: 1,
      met: approvedProjects >= 1,
    },
  ];

  const anyMet = requirements.some(r => r.met);

  return (
    <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_#000000] p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-[#E9E5E0] border-2 border-black p-4">
              <Lock className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h1 className="font-extrabold text-3xl uppercase tracking-tight mb-3">
                Network Locked
              </h1>
              <p className="text-lg leading-relaxed text-gray-700">
                The Project Network is a calm, professional space for sharing your work and
                connecting with other learners. Complete any one of these milestones to unlock access:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {requirements.map((req, index) => {
              const Icon = req.icon;
              const StatusIcon = req.met ? CheckCircle : Circle;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-5 border-2 border-black ${
                    req.met
                      ? 'bg-[#98C9A3] shadow-[4px_4px_0px_#000000]'
                      : 'bg-white'
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1">
                    <p className="font-bold text-lg">{req.label}</p>
                    <p className="text-sm text-gray-700">
                      Progress: {req.current} / {req.required}
                    </p>
                  </div>
                  <StatusIcon
                    className={`w-8 h-8 flex-shrink-0 ${
                      req.met ? 'text-white' : 'text-gray-400'
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
              );
            })}
          </div>

          {anyMet && (
            <div className="mt-6 p-4 bg-[#98C9A3] border-2 border-black">
              <p className="font-bold text-center">
                You've completed a milestone! The Network should unlock soon.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#E9E5E0] border-2 border-black p-6">
          <h2 className="font-bold text-lg uppercase tracking-tight mb-3">
            What You'll Find in the Network
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Share your projects with detailed problem statements and AI approaches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Discover projects by domain and skill level</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>View capability snapshots of other learners</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Opt into mentorship connections when ready</span>
            </li>
          </ul>
          <p className="mt-4 text-sm italic text-gray-600">
            No algorithmic feeds. No engagement metrics. Just intentional learning and collaboration.
          </p>
        </div>
      </div>
    </div>
  );
}
