import { Check, Zap, TrendingUp } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted?: () => void;
}

export default function PricingSection({ onGetStarted }: PricingSectionProps) {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Start for free, upgrade when you need more AI practice sessions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#F4F4F4] border-2 border-black p-3">
              <Zap className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl uppercase tracking-tight">FREE</h3>
              <p className="text-sm font-semibold">$0 / month</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6">
            Perfect for getting started with AI learning.
          </p>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-extrabold text-4xl">15</span>
              <span className="text-sm text-[#888888]">AI practice sessions / day</span>
            </div>
            <p className="text-xs text-[#888888]">Resets daily at midnight UTC</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>Access to all learning paths</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>Interactive lab environments</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>Progress tracking and badges</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>Project showcase</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>Learning journal</span>
            </li>
          </ul>

          <button
            onClick={onGetStarted}
            className="w-full bg-white border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            START FREE
          </button>
        </div>

        <div className="bg-[#FF6A00] border-2 border-black p-6 md:p-8 shadow-[4px_4px_0px_#000000] relative">
          <div className="absolute -top-3 -right-3 bg-black text-white border-2 border-black px-3 py-1 font-extrabold text-xs uppercase">
            BEST VALUE
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-black border-2 border-black p-3">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl uppercase tracking-tight">PRO</h3>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6 font-semibold">
            For serious learners committed to AI mastery.
          </p>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-extrabold text-4xl">120</span>
              <span className="text-sm text-black font-semibold">AI practice sessions / day</span>
            </div>
            <p className="text-xs text-black font-semibold">8x more than Free plan</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Everything in Free, plus:</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>120 daily AI practice sessions</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Priority access to new features</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Advanced analytics and insights</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Full network participation</span>
            </li>
            <li className="flex items-start gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Export your learning data</span>
            </li>
          </ul>

          <button
            disabled
            className="w-full bg-[#CCCCCC] text-black border-2 border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight cursor-not-allowed"
          >
            COMING SOON
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-block bg-white border-2 border-black p-6 shadow-[2px_2px_0px_#000000] max-w-2xl">
          <h3 className="font-extrabold text-lg uppercase mb-2">What are AI practice sessions?</h3>
          <p className="text-sm leading-relaxed">
            One session equals one successful interaction with our AI in any lab environment. This includes conversations in the Writing Lab, queries in the Analysis Lab, brainstorming in the Creative Lab, and more. Failed requests or system errors don't count toward your limit.
          </p>
        </div>
      </div>
    </section>
  );
}
