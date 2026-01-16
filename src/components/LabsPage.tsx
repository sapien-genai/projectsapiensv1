import { Brain, BarChart3, Palette, Lightbulb, Code2, ArrowLeft } from 'lucide-react';

interface LabsPageProps {
  onLabSelect?: (labId: string) => void;
  onBack?: () => void;
}

const labs = [
  {
    id: 'writing-lab',
    icon: Brain,
    name: 'WRITING LAB',
    description: 'Generate, edit, and compare AI-written content across different models and prompts.',
    useCases: ['Copywriting', 'Translation', 'Summaries', 'Emails', 'Scripts'],
    color: '#FF6A00',
  },
  {
    id: 'analysis-lab',
    icon: BarChart3,
    name: 'ANALYSIS LAB',
    description: 'Extract insights, analyze data patterns, and generate reports from raw information.',
    useCases: ['Data Analysis', 'Trend Detection', 'Report Generation', 'Sentiment Analysis'],
    color: '#0A74FF',
  },
  {
    id: 'creative-lab',
    icon: Palette,
    name: 'CREATIVE LAB',
    description: 'Experiment with AI-generated art, design concepts, and creative ideation.',
    useCases: ['Concept Art', 'Brand Design', 'Story Ideas', 'Visual Exploration'],
    color: '#FF6A00',
  },
  {
    id: 'strategy-lab',
    icon: Lightbulb,
    name: 'STRATEGY LAB',
    description: 'Build strategic frameworks, decision trees, and problem-solving workflows.',
    useCases: ['Business Strategy', 'Decision Making', 'Problem Solving', 'Planning'],
    color: '#0A74FF',
  },
  {
    id: 'code-lab',
    icon: Code2,
    name: 'CODE LAB',
    description: 'Write, debug, and optimize code with AI assistance. Test algorithms in real-time.',
    useCases: ['Code Generation', 'Debugging', 'Optimization', 'Documentation'],
    color: '#FF6A00',
  },
];

export default function LabsPage({ onLabSelect, onBack }: LabsPageProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-8 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            BACK TO DASHBOARD
          </button>
        )}

        <div className="mb-12">
          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-none mb-4">
            EXPERIMENTATION ENVIRONMENT
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-3xl">
            Safe-failure spaces. Experimentation without consequence, instant feedback, and community comparison.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] md:hover:shadow-[8px_8px_0px_#000000] transition-shadow"
            >
              <div className="flex items-start justify-between mb-6">
                <lab.icon className="w-12 h-12" strokeWidth={2} />
                <div className="text-xs font-semibold px-3 py-1 border border-black bg-[#F4F4F4]">
                  SANDBOX
                </div>
              </div>

              <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4">
                {lab.name}
              </h2>

              <p className="text-sm leading-relaxed mb-6">
                {lab.description}
              </p>

              <div className="mb-6">
                <p className="text-xs font-extrabold uppercase tracking-tight mb-3">
                  USE CASES:
                </p>
                <div className="flex flex-wrap gap-2">
                  {lab.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="text-xs font-semibold px-3 py-1 border border-black bg-white"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onLabSelect?.(lab.id)}
                className="w-full bg-[#FF6A00] text-black border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                ENTER LAB
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white border border-black p-6 md:p-8 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000]">
          <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
            HOW LABS WORK
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-extrabold text-[#FF6A00] mb-2">01</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                EXPERIMENT FREELY
              </h4>
              <p className="text-sm leading-relaxed">
                Try different prompts, models, and approaches without fear of failure.
              </p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#FF6A00] mb-2">02</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                GET INSTANT FEEDBACK
              </h4>
              <p className="text-sm leading-relaxed">
                See results in real-time and iterate quickly on your ideas.
              </p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#FF6A00] mb-2">03</div>
              <h4 className="font-extrabold text-sm uppercase tracking-tight mb-2">
                COMPARE & LEARN
              </h4>
              <p className="text-sm leading-relaxed">
                View community approaches and discover new techniques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
