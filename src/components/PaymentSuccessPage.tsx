import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, BookOpen, FlaskConical, Library, Users, Zap } from 'lucide-react';
import { useBilling } from '../contexts/BillingContext';

interface PaymentSuccessPageProps {
  onGoToDashboard: () => void;
  onGoToLabs: () => void;
  onGoToPaths: () => void;
  onGoToPrompts: () => void;
}

const steps = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Start your first learning path',
    description: 'Pick a structured path that matches your goals — from AI Foundations to Advanced Workflows. Each path is designed to build real, transferable skills.',
    action: 'Browse learning paths',
    key: 'paths',
  },
  {
    number: '02',
    icon: FlaskConical,
    title: 'Run your first AI Lab',
    description: 'Labs are interactive sandboxes where you practice prompting in real scenarios — writing, analysis, strategy, and more. Your Pro plan unlocks 120 sessions per day.',
    action: 'Open Writing Lab',
    key: 'labs',
  },
  {
    number: '03',
    icon: Library,
    title: 'Explore the Prompt Library',
    description: 'Access hundreds of battle-tested prompts organized by use case. Save your favorites and build your personal prompt toolkit.',
    action: 'View prompt library',
    key: 'prompts',
  },
  {
    number: '04',
    icon: Users,
    title: 'Join the Intentional Network',
    description: 'Connect with other professionals who are building their AI fluency. Share projects, get feedback, and grow alongside a focused community.',
    action: 'Explore the network',
    key: 'dashboard',
  },
];

export default function PaymentSuccessPage({
  onGoToDashboard,
  onGoToLabs,
  onGoToPaths,
  onGoToPrompts,
}: PaymentSuccessPageProps) {
  const { refreshUsageStatus } = useBilling();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.title = 'Welcome to Pro – Project Sapiens';
    refreshUsageStatus();
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (key: string) => {
    switch (key) {
      case 'paths': onGoToPaths(); break;
      case 'labs': onGoToLabs(); break;
      case 'prompts': onGoToPrompts(); break;
      default: onGoToDashboard(); break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div
        className={`transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Hero confirmation */}
        <div className="bg-[#1C1A17] text-[#F8F5F2]">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <div
              className={`transition-all duration-700 delay-100 ease-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F4A261] mb-8">
                <CheckCircle className="w-8 h-8 text-[#1C1A17]" strokeWidth={2} />
              </div>
            </div>

            <div
              className={`transition-all duration-700 delay-200 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-sm font-semibold tracking-widest text-[#F4A261] uppercase mb-4">
                Payment confirmed
              </p>
              <h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Welcome to Pro.
              </h1>
              <p className="text-lg text-[#9E9990] max-w-xl mx-auto leading-relaxed">
                Your account has been upgraded. You now have full access to everything Project Sapiens has to offer — 120 daily AI lab sessions, the full prompt library, and priority learning paths.
              </p>
            </div>

            <div
              className={`mt-10 transition-all duration-700 delay-300 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 rounded-xl px-8 py-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#F4A261]">120</p>
                  <p className="text-xs text-[#9E9990] mt-1">Daily AI sessions</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#F4A261]">5</p>
                  <p className="text-xs text-[#9E9990] mt-1">AI Labs</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#F4A261]">∞</p>
                  <p className="text-xs text-[#9E9990] mt-1">Learning paths</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div
            className={`transition-all duration-700 delay-400 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-4 h-4 text-[#F4A261]" strokeWidth={2} />
              <p className="text-xs font-semibold tracking-widest text-[#57524D] uppercase">
                Your next steps
              </p>
            </div>
            <h2
              className="text-2xl font-bold text-[#1C1A17] mb-10"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Where to begin
            </h2>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  className={`transition-all duration-700 ease-out`}
                  style={{
                    transitionDelay: `${500 + index * 80}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(12px)',
                  }}
                >
                  <div className="group bg-white border border-[#E9E5E0] rounded-xl p-6 hover:border-[#F4A261] hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-[#FEF3E8] flex items-center justify-center group-hover:bg-[#F4A261] transition-colors duration-200">
                          <Icon className="w-5 h-5 text-[#F4A261] group-hover:text-white transition-colors duration-200" strokeWidth={1.75} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-widest text-[#F4A261] mb-1">{step.number}</p>
                            <h3 className="text-base font-bold text-[#1C1A17] mb-2">{step.title}</h3>
                            <p className="text-sm text-[#57524D] leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAction(step.key)}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1C1A17] hover:text-[#F4A261] transition-colors duration-150 group/btn"
                        >
                          {step.action}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-150" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard CTA */}
          <div
            className={`mt-12 text-center transition-all duration-700 ease-out`}
            style={{
              transitionDelay: '900ms',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <div className="bg-[#E9E5E0] rounded-xl p-8">
              <p className="text-sm text-[#57524D] mb-6 leading-relaxed">
                Not sure where to start? Head to your dashboard — it tracks your progress, surfaces recommended lessons, and gives you a clear view of everything you've unlocked.
              </p>
              <button
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 bg-[#1C1A17] text-[#F8F5F2] px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#F4A261] hover:text-[#1C1A17] transition-all duration-200"
              >
                Go to my dashboard
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
