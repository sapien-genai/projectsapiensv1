import { useEffect, useState } from 'react';
import { XCircle, ArrowRight, Zap, FlaskConical, BookOpen, Library, HelpCircle } from 'lucide-react';

interface BillingCancelPageProps {
  onTryAgain: () => void;
  onGoToDashboard: () => void;
  onGoToHelp: () => void;
}

const proHighlights = [
  {
    icon: FlaskConical,
    label: '120 AI Lab sessions per day',
    sub: 'Free plan is limited to 10',
  },
  {
    icon: BookOpen,
    label: 'All learning paths unlocked',
    sub: 'Foundations through Advanced',
  },
  {
    icon: Library,
    label: 'Full prompt library access',
    sub: 'Hundreds of battle-tested prompts',
  },
  {
    icon: Zap,
    label: 'Priority AI responses',
    sub: 'Faster turnaround in every lab',
  },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your billing settings — no fees, no questions.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The free plan lets you explore the platform indefinitely. Upgrade when you need more sessions or full path access.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All major credit and debit cards through Stripe. Your card details are never stored on our servers.',
  },
];

export default function BillingCancelPage({
  onTryAgain,
  onGoToDashboard,
  onGoToHelp,
}: BillingCancelPageProps) {
  const [visible, setVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Checkout cancelled – Project Sapiens';
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div
        className={`transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Top banner */}
        <div className="bg-[#F8F5F2] border-b border-[#E9E5E0]">
          <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <div
              className={`transition-all duration-700 delay-100 ease-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E9E5E0] mb-7">
                <XCircle className="w-7 h-7 text-[#57524D]" strokeWidth={1.75} />
              </div>
            </div>

            <div
              className={`transition-all duration-700 delay-200 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-xs font-semibold tracking-widest text-[#57524D] uppercase mb-3">
                Checkout cancelled
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold text-[#1C1A17] leading-tight mb-5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                No charge was made.
              </h1>
              <p className="text-base text-[#57524D] leading-relaxed max-w-lg mx-auto">
                You left before completing the upgrade — that's completely fine. Your free account is still active. Whenever you're ready, Pro is here.
              </p>
            </div>

            <div
              className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-300 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <button
                onClick={onTryAgain}
                className="inline-flex items-center gap-2 bg-[#1C1A17] text-[#F8F5F2] px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#F4A261] hover:text-[#1C1A17] transition-all duration-200"
              >
                Try upgrading again
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 bg-transparent text-[#57524D] border border-[#C8C4BF] px-7 py-3.5 rounded-lg font-semibold text-sm hover:border-[#1C1A17] hover:text-[#1C1A17] transition-all duration-200"
              >
                Continue with free plan
              </button>
            </div>
          </div>
        </div>

        {/* What you'd unlock */}
        <div className="max-w-2xl mx-auto px-6 py-14">
          <div
            className={`transition-all duration-700 delay-350 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <h2
              className="text-lg font-bold text-[#1C1A17] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What Pro unlocks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white border border-[#E9E5E0] rounded-xl p-5 flex items-start gap-4 transition-all duration-700 ease-out"
                  style={{
                    transitionDelay: `${420 + index * 70}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#FEF3E8] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#F4A261]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1C1A17]">{item.label}</p>
                    <p className="text-xs text-[#57524D] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div
            className={`mt-12 transition-all duration-700 delay-700 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <h2
              className="text-lg font-bold text-[#1C1A17] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Common questions
            </h2>

            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E9E5E0] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAF9] transition-colors duration-150"
                  >
                    <span className="text-sm font-semibold text-[#1C1A17]">{faq.q}</span>
                    <span
                      className={`flex-shrink-0 w-5 h-5 text-[#57524D] transition-transform duration-200 ${
                        openFaq === index ? 'rotate-45' : ''
                      }`}
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-[#57524D] leading-relaxed border-t border-[#E9E5E0] pt-4">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Help link */}
          <div
            className={`mt-10 text-center transition-all duration-700 delay-800 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <button
              onClick={onGoToHelp}
              className="inline-flex items-center gap-2 text-sm text-[#57524D] hover:text-[#1C1A17] transition-colors duration-150"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
              Have a question? Visit the Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
