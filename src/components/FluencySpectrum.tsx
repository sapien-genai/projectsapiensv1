export default function FluencySpectrum() {
  const levels = [
    {
      level: '01',
      title: 'COLLABORATOR',
      description: 'Learn AI fundamentals and start using AI tools effectively in your daily tasks.'
    },
    {
      level: '02',
      title: 'PRACTITIONER',
      description: 'Design workflows and combine AI tools to solve complex problems.'
    },
    {
      level: '03',
      title: 'INTEGRATOR',
      description: 'Build systems that integrate AI into your operations and decision-making.'
    },
    {
      level: '04',
      title: 'LEADER',
      description: 'Architect AI solutions and guide others in their AI transformation.'
    },
  ];

  return (
    <section id="community" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <h2 className="font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-6">
          YOUR AI JOURNEY
        </h2>
        <p className="text-lg md:text-xl leading-relaxed">
          Progress through four stages of AI mastery. Each level builds on the last—start wherever you are.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((item) => (
          <div
            key={item.level}
            className="bg-white border-2 border-black p-6 hover:shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            <div className="text-5xl font-extrabold mb-4 text-[#FF6A00]">
              {item.level}
            </div>
            <h3 className="font-extrabold text-xl uppercase tracking-tight mb-3">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed opacity-80">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
