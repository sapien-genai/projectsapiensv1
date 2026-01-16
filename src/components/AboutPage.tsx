import { ArrowLeft, User, Rocket, Building2, Target, Sparkles } from 'lucide-react';

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
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10" strokeWidth={2} />
            <h1 className="font-extrabold text-3xl md:text-4xl uppercase tracking-tighter">About Project Sapiens</h1>
          </div>
          <p className="text-lg leading-relaxed">
            Your journey to AI fluency starts here.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">Our Mission</h2>
            </div>
            <p className="text-base leading-relaxed mb-4">
              Project Sapiens empowers individuals, brands, and enterprises to master generative AI through
              structured learning paths, hands-on experimentation, and community collaboration.
            </p>
            <p className="text-base leading-relaxed">
              We believe that AI can transform the way we communicate, collaborate, and create. Our platform
              democratizes access to cutting-edge AI technologies, helping learners of all levels develop
              practical fluency with tools like ChatGPT, Claude, and beyond.
            </p>
          </div>

          <div className="bg-[#0A74FF] border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-8 h-8 text-white" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight text-white">What We Offer</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">STRUCTURED PATHS</h3>
                <p className="text-sm">Curated learning journeys from foundations to advanced AI integration</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">HANDS-ON LABS</h3>
                <p className="text-sm">Interactive sandbox environments for real-world experimentation</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">PROMPT LIBRARY</h3>
                <p className="text-sm">Community-curated collection of effective AI prompts and workflows</p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">PEER NETWORK</h3>
                <p className="text-sm">Connect with fellow learners, mentors, and AI practitioners</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">Meet The Founder</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 border-4 border-black bg-[#FF6A00] flex items-center justify-center shadow-[3px_3px_0px_#000000] flex-shrink-0">
                <User className="w-16 h-16 text-white" strokeWidth={2} />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-extrabold text-xl uppercase tracking-tight mb-1">Tony Marks</h3>
                  <p className="text-sm font-semibold uppercase tracking-wide">CEO & CO-FOUNDER, SAPIEN AI</p>
                </div>

                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    I am the CEO and Co-Founder of Sapien AI, a leading artificial intelligence company that
                    builds high performing, secure, and scalable large language models (LLM) for enterprises.
                    We also provide AI-driven site searches, conversational AI, and best in class ChatGPT
                    services to enhance customer engagement and satisfaction.
                  </p>

                  <p>
                    With over seven years of experience in the AI industry, my team and I have delivered
                    solutions for clients across various sectors, such as sports, entertainment, travel, and
                    real estate. We have built in-flight chatbots for major airlines, voice AI SDKs for the
                    NFL, NBA, and the Olympics, and data extraction for short-term rental listings.
                  </p>

                  <p>
                    In 2021, we participated in OpenAI's developer beta, where we experimented with
                    cutting-edge tools like ChatGPT, Whisper, and Dalle, and leveraged them to create more
                    value for our customers and partners.
                  </p>

                  <p>
                    My goal is to empower individuals, brands and enterprises to get the most out of
                    generative AI, and to democratize access to the latest AI technologies. I believe that
                    AI can transform the way we communicate, collaborate, and create, and that Project Sapiens
                    is at the forefront of this revolution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFD700] border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8" strokeWidth={2} />
              <h2 className="font-extrabold text-2xl uppercase tracking-tight">About Sapien AI</h2>
            </div>
            <p className="text-base leading-relaxed mb-4">
              Sapien AI is at the cutting edge of enterprise artificial intelligence. We build high-performing,
              secure, and scalable large language models tailored for business needs.
            </p>
            <div className="space-y-3">
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">ENTERPRISE AI SOLUTIONS</h3>
                <p className="text-sm">
                  Custom LLMs, AI-driven search, conversational AI, and ChatGPT integration for businesses
                </p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">PROVEN TRACK RECORD</h3>
                <p className="text-sm">
                  7+ years delivering AI solutions for sports, entertainment, travel, real estate, and aviation
                </p>
              </div>
              <div className="bg-white border border-black p-4">
                <h3 className="font-extrabold text-sm uppercase tracking-tight mb-2">INNOVATION PARTNERS</h3>
                <p className="text-sm">
                  OpenAI developer beta participant since 2021, pioneering generative AI applications
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black p-8 shadow-[3px_3px_0px_#000000]">
            <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4">Join The Revolution</h2>
            <p className="text-base leading-relaxed mb-6">
              Whether you're taking your first steps with AI or looking to integrate advanced capabilities
              into your workflow, Project Sapiens provides the structure, tools, and community to help you succeed.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-[#F4F4F4] border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight">
                Structured Learning
              </div>
              <div className="bg-[#F4F4F4] border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight">
                Hands-On Practice
              </div>
              <div className="bg-[#F4F4F4] border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight">
                Community Support
              </div>
              <div className="bg-[#F4F4F4] border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight">
                Real-World Skills
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
