import { X, Zap, Target, Users, TrendingUp } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsed?: number;
  currentLimit?: number;
}

export default function UpgradeModal({ isOpen, onClose, currentUsed, currentLimit }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
          <h2 className="font-extrabold text-3xl uppercase tracking-tighter">UPGRADE TO PRO</h2>
          <button
            onClick={onClose}
            className="hover:text-[#FF6A00] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {currentUsed !== undefined && currentLimit !== undefined && (
            <div className="bg-[#F4F4F4] border-2 border-black p-4">
              <p className="text-sm font-semibold mb-2">CURRENT USAGE TODAY:</p>
              <p className="text-2xl font-extrabold">
                {currentUsed} / {currentLimit} AI practice sessions
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="border-2 border-black p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="bg-[#FF6A00] border-2 border-black p-3">
                  <Zap className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                    FREE PLAN
                  </h3>
                  <p className="text-sm leading-relaxed mb-3">
                    Perfect for getting started with AI learning.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                      <span>15 AI practice sessions per day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                      <span>Access to all learning paths</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6A00] font-extrabold">&gt;</span>
                      <span>Interactive lab environments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-6 bg-[#FF6A00]">
              <div className="flex items-start gap-4">
                <div className="bg-black border-2 border-black p-3">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-2">
                    PRO PLAN
                  </h3>
                  <p className="text-sm leading-relaxed mb-3 font-semibold">
                    For serious learners committed to AI mastery.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-extrabold">&gt;</span>
                      <span className="font-semibold">120 AI practice sessions per day (8x more)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-extrabold">&gt;</span>
                      <span className="font-semibold">Priority access to new features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-extrabold">&gt;</span>
                      <span className="font-semibold">Advanced analytics and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-extrabold">&gt;</span>
                      <span className="font-semibold">Full network participation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-extrabold">&gt;</span>
                      <span className="font-semibold">Export your learning data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-[#F4F4F4]">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5" strokeWidth={2} />
              <h3 className="font-extrabold text-lg uppercase">WHY UPGRADE?</h3>
            </div>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Pro users can practice more intensively, build momentum faster, and complete learning paths without daily interruptions.
              </p>
              <p>
                Perfect for professionals who want to integrate AI into their workflow and career development.
              </p>
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-white text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" strokeWidth={2} />
              <p className="font-extrabold text-sm uppercase">COMING SOON</p>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Pro plan upgrades will be available soon. We are currently integrating payment processing to make upgrading seamless and secure.
            </p>
            <button
              disabled
              className="bg-[#CCCCCC] text-black border-2 border-black px-8 py-3 font-extrabold text-sm uppercase tracking-tight cursor-not-allowed"
            >
              UPGRADE TO PRO (COMING SOON)
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm font-semibold hover:text-[#FF6A00] transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
