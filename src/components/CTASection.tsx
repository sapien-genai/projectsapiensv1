interface CTASectionProps {
  onStartJourney?: () => void;
}

export default function CTASection({ onStartJourney }: CTASectionProps) {
  return (
    <section className="bg-[#FF6A00] border-y-2 border-black py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-none mb-6 md:mb-8">
          READY TO START?
        </h2>

        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-10 md:mb-12 max-w-2xl mx-auto">
          Join thousands of learners building real AI skills. Start your journey today—completely free.
        </p>

        <button
          onClick={onStartJourney}
          className="bg-black text-white border-2 border-black px-10 md:px-12 py-4 md:py-5 font-extrabold text-base md:text-lg uppercase tracking-tight shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
        >
          GET STARTED FOR FREE
        </button>
      </div>
    </section>
  );
}
