import OpenMoji from './OpenMoji';

interface HeroProps {
  onStartJourney?: () => void;
  onExploreLabs?: () => void;
}

export default function Hero({ onStartJourney, onExploreLabs }: HeroProps = {}) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto text-center">
        
        <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[0.9] mb-6 md:mb-8">
          Learn AI.<br />Build with AI.<br />Lead with AI.
        </h1>

        <p className="text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto">
          The adaptive learning platform for people who want to go beyond using AI—and start mastering it.
        </p>

        <button
          onClick={onStartJourney}
          className="bg-[#FF6A00] text-black border-2 border-black px-8 md:px-10 py-3 md:py-4 font-extrabold text-sm md:text-base tracking-tight shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all mb-4"
        >
          Start for Free
        </button>

        <p className="text-xs md:text-sm opacity-70">
          No credit card required. Start learning in 2 minutes.
        </p>
      </div>
    </section>
  );
}
