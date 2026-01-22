import { ArrowLeft, User, Target, Lightbulb, Award, Users, Zap } from 'lucide-react';

interface AboutPageProps {
  onBack?: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
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

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-12">
          <h1 className="font-extrabold text-3xl md:text-5xl uppercase tracking-tighter mb-6">
            Learning to Work With AI — Intentionally
          </h1>
          <div className="space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Artificial intelligence is moving fast. Most people are being handed powerful tools — without the understanding, confidence, or frameworks to use them well.
            </p>
            <p className="font-bold">
              Project Sapiens exists to close that gap.
            </p>
            <p>
              Project Sapiens is a modern learning platform designed to help people move beyond surface-level AI usage and develop real, transferable capability through guided lessons, hands-on labs, and intentional practice.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">Why Project Sapiens Exists</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                Most AI education today falls into one of two extremes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>overly technical, built for engineers</li>
                <li>overly abstract, built for hype</li>
              </ul>
              <p className="font-semibold">
                Project Sapiens was built for the middle — for builders, professionals, creators, and leaders who want to integrate AI into their work without becoming AI researchers.
              </p>
              <p>We focus on:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>mental models, not shortcuts</li>
                <li>learning-by-doing, not passive content</li>
                <li>durable skills that outlast specific tools or models</li>
              </ul>
              <p className="font-bold text-lg mt-4">
                AI will keep changing. Human capability is what compounds.
              </p>
            </div>
          </div>

          <div className="bg-[#0A74FF] border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-white" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight text-white">How Project Sapiens Is Different</h2>
            </div>
            <div className="space-y-4 text-white text-base leading-relaxed mb-6">
              <p className="font-semibold text-lg">
                Project Sapiens is not a course library or a chatbot wrapper.
              </p>
              <p>
                It is a learning environment designed to help users:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">BUILD CONFIDENCE</h3>
                <p className="text-sm">Through practice</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">DEVELOP WORKFLOWS</h3>
                <p className="text-sm">Repeatable processes</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">UNDERSTAND AI</h3>
                <p className="text-sm">How AI behaves</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">GROW CAPABILITY</h3>
                <p className="text-sm">From beginner to integrator</p>
              </div>
            </div>
            <p className="text-white text-sm mt-4 leading-relaxed">
              The platform combines structured learning paths, interactive labs, progress tracking, reflection, and an intentional network of peers and mentors.
            </p>
          </div>

          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">Built by Someone Who's Been in the Arena</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 border-4 border-black bg-[#FF6A00] flex items-center justify-center shadow-[3px_3px_0px_#000000] flex-shrink-0">
                <User className="w-16 h-16 text-white" strokeWidth={2} />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-1">Tony Marks</h3>
                  <p className="text-sm font-semibold uppercase tracking-wide">FOUNDER, PROJECT SAPIENS</p>
                </div>

                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    Project Sapiens was founded by Tony Marks, an AI technologist and product builder with over seven years of experience designing, deploying, and scaling real-world AI systems.
                  </p>

                  <p>
                    Before AI became mainstream, Tony worked hands-on building conversational AI, natural language systems, and applied machine learning solutions for high-stakes environments, including:
                  </p>

                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Official AI experiences for multiple Olympic Games</li>
                    <li>AI-powered systems for professional NBA and NFL teams</li>
                    <li>In-flight AI experiences for Virgin Atlantic Airlines</li>
                    <li>Interactive AI-driven retail and event experiences for New Balance, including the Boston Marathon</li>
                  </ul>

                  <p>
                    These were production systems used by millions, built with real constraints around performance, security, and trust.
                  </p>

                  <p className="font-semibold text-lg border-l-4 border-black pl-4">
                    "Powerful AI is only valuable when humans know how to use it well."
                  </p>

                  <p>
                    After years of building AI for large organizations, a pattern became clear: the hardest problem wasn't the models — it was the humans.
                  </p>

                  <p>
                    People struggled with knowing what to ask, how to structure problems, when to trust outputs, and how to integrate AI into real workflows.
                  </p>

                  <p className="font-semibold">
                    Project Sapiens was created to solve that problem by helping people build true AI fluency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFD700] border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">The Long-Term Vision</h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed">
              <p className="font-semibold text-lg">
                AI will become as fundamental as the internet or electricity.
              </p>
              <p>
                Project Sapiens exists to help people adapt without panic, learn without intimidation, build without dependency, and lead without losing their humanity.
              </p>
              <p className="font-bold">
                This is not about replacing people with AI.
              </p>
              <p className="font-bold">
                It is about helping people become more capable with it.
              </p>
            </div>
          </div>

          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000] text-center">
            <p className="text-2xl md:text-3xl font-bold tracking-tight leading-relaxed">
              Learn AI. Build with AI. Lead with AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
