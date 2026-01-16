import { Briefcase, Zap, Palette, Home, ArrowRight } from 'lucide-react';

const paths = [
  {
    icon: Briefcase,
    title: 'Small Business Owners',
    description: 'Automate operations, improve marketing, and make better decisions with AI.',
  },
  {
    icon: Zap,
    title: 'Productivity Enthusiasts',
    description: 'Supercharge your workflow and get more done with AI-powered tools.',
  },
  {
    icon: Palette,
    title: 'Creators & Artists',
    description: 'Create content, art, and experiences faster without losing your creative voice.',
  },
  {
    icon: Home,
    title: 'Everyday Life',
    description: 'Use AI for personal growth, learning, and daily decision-making.',
  },
];

export default function FeaturedPaths() {
  return (
    <section id="paths" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <h2 className="font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-6">
          WHO IS THIS FOR?
        </h2>
        <p className="text-lg md:text-xl leading-relaxed">
          Pick a path that matches your goals. Learn the AI skills that matter for your work and life.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {paths.map((path) => (
          <div
            key={path.title}
            className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer group"
          >
            <path.icon className="w-12 h-12 mb-6 group-hover:scale-110 transition-transform" strokeWidth={2} />

            <h3 className="font-extrabold text-2xl uppercase tracking-tight mb-3">
              {path.title}
            </h3>

            <p className="text-base leading-relaxed mb-6 opacity-80">
              {path.description}
            </p>

            <div className="flex items-center gap-2 font-extrabold text-sm uppercase tracking-tight group-hover:gap-4 transition-all">
              EXPLORE PATH
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
