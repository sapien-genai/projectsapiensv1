import { Book, Beaker, Users, CheckCircle } from 'lucide-react';
import OpenMoji from './OpenMoji';

const features = [
  {
    title: 'Role-specific learning paths',
    description: 'Whether you\'re a creator, business owner, or productivity enthusiast—we have a path designed for you.',
    emoji: '🗺️',
  },
  {
    title: 'Interactive AI labs',
    description: 'Practice with real AI tools in guided sandboxes. No setup, no confusion—just hands-on learning.',
    emoji: '🧪',
  },
  {
    title: 'Build real projects',
    description: 'Every path ends with a capstone project you can actually use in your work or life.',
    emoji: '🔧',
  },
  {
    title: 'Track your progress',
    description: 'See exactly where you are on your AI journey with badges, milestones, and a personal dashboard.',
    emoji: '🏆',
  },
  {
    title: 'Learn at your pace',
    description: 'Self-paced lessons that adapt to your schedule. Learn in 15 minutes or dive deep for hours.',
    emoji: '⏱️',
  },
  {
    title: 'Join a community',
    description: 'Connect with other learners, share your projects, and get feedback from peers and mentors.',
    emoji: '🌈',
  },
];

export default function Pillars() {
  return (
    <section id="features" className="bg-[#FFEB99] border-y-2 border-black py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12 md:mb-16">
          <h2 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none mb-6">
            Everything You Need to Master AI
          </h2>
          <p className="text-lg md:text-xl leading-relaxed">
            Project Sapiens gives you the tools, guidance, and practice to go from AI curious to AI confident.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <OpenMoji emoji={feature.emoji} size={32} className="flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg tracking-tight mb-2">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed opacity-80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
