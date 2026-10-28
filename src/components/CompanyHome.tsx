import { ArrowUpRight, Radio, AudioLines } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './CompanyHome.css';

const pastWork = [
  { file: 'riowhite.png', name: 'Rio 2016' },
  { file: 'PyeongChang_2018_Winter_Olympics.png', name: 'PyeongChang 2018' },
  { file: 'olympicchannelwhite.png', name: 'Olympic Channel' },
  { file: 'newbalancewhite.png', name: 'New Balance' },
  { file: 'virginatlanticwhite.png', name: 'Virgin Atlantic' },
  { file: 'broncoswhite.png', name: 'Denver Broncos' },
];

const fieldNotes = [
  { number: '06', title: 'What We Choose to Delegate', topic: 'AI & judgment', description: 'What meaningful human control requires when AI systems can act on our behalf.', slug: 'the-nuclear-lesson' },
  { number: '05', title: 'What “Attention Is All You Need” Actually Changed', topic: 'Research & product decisions', description: 'What the Transformer paper changed—and how those ideas shape the products we build.', slug: 'attention-is-all-you-need' },
  { number: '02', title: 'AI Brand Visibility', topic: 'AI & discovery', description: 'Why being understood by AI may become as important as being found in search.', slug: 'ai-brand-visibility' },
];

export default function CompanyHome() {
  const mainRef = useRef<HTMLElement>(null);
  const [logosPaused, setLogosPaused] = useState(false);
  useEffect(() => { document.title = 'Project Sapiens — Practical AI products'; }, []);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('company-entered');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    mainRef.current?.querySelectorAll('[data-company-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  const link = 'inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';
  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[#172820] selection:bg-[#d8eb94]">
      <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-[#172820]/20 px-6 py-6 md:px-10">
        <a href="/" className="flex min-h-11 items-center gap-3 font-bold tracking-tight"><img src="/sapien-mark.svg" alt="" aria-hidden="true" className="company-sapien-mark h-[17px] w-[17px] shrink-0 md:h-[18px] md:w-[18px]" /> PROJECT SAPIENS</a>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-6 text-sm">
          <a className={link} href="#work">Our work</a><a className={link} href="#field-notes">Field Notes</a><a className={link} href="#company">Company</a><a className={link} href="mailto:tony@projectsapiens.xyz">Get in touch <ArrowUpRight aria-hidden="true" size={16} /></a>
        </nav>
      </header>
      <main ref={mainRef} id="main" className="mx-auto max-w-6xl px-6 md:px-10">
        <section className="py-20 md:py-28">
          <p className="mb-7 text-xs font-bold uppercase tracking-[0.2em]">Independent thinking. Practical intelligence.</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-7xl md:text-8xl">Complex information.<br /><span className="text-[#68745b]">Useful experiences.</span></h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#526055]">We build practical AI products, explore how intelligent systems should work, and share what we learn along the way.</p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2"><a href="#work" className={link}>Explore our work <ArrowUpRight aria-hidden="true" size={19} /></a><a href="#field-notes" className={link}>Read Field Notes <ArrowUpRight aria-hidden="true" size={19} /></a></div>
        </section>
        <section aria-labelledby="past-work-title" className="mb-16 border-y border-[#172820]/20 py-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="past-work-title" className="text-xs font-bold uppercase tracking-[0.2em]">Experience on a global stage</h2><p className="mt-2 text-sm text-[#526055]">Selected past work by Tony Marks and the Sapien AI team.</p></div>
            <button type="button" onClick={() => setLogosPaused(value => !value)} aria-pressed={logosPaused} className="company-logo-toggle min-h-11 text-sm font-semibold underline underline-offset-4">{logosPaused ? 'Resume logos' : 'Pause logos'}</button>
          </div>
          <div className="company-logo-window mt-7">
            <div className="company-logo-track" style={{ animationPlayState: logosPaused ? 'paused' : undefined }}>
              {[0, 1].map(copy => <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="company-logo-group">
                {pastWork.map(client => <li key={client.name} className="flex h-24 w-36 shrink-0 items-center justify-center"><img src={`/clients/${client.file}`} alt={copy === 0 ? client.name : ''} className="max-h-20 w-28 object-contain" style={{ filter: 'brightness(0) opacity(0.6)' }} /></li>)}
              </ul>)}
            </div>
          </div>
        </section>
        <section id="work" aria-labelledby="work-title" className="scroll-mt-8 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">Current work</p>
          <h2 id="work-title" className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">What we’re building and exploring.</h2>
          <div className="mt-9 grid gap-6 md:grid-cols-2">
            <article data-company-reveal className="flex flex-col rounded-3xl bg-[#172820] p-7 text-[#f4f2ec] md:p-9">
              <div className="flex items-center justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8eb94]">Live product</p><Radio aria-hidden="true" className="text-[#d8eb94]" size={28} /></div>
              <h3 className="mt-9"><img src="/hotline-sports-logo.png" alt="Hotline Sports" width="460" height="48" className="h-auto w-full max-w-[350px]" /></h3>
              <p className="mt-6 text-2xl leading-snug text-[#d8eb94]">Find the game.<br />Find your way to watch.</p>
              <p className="mb-6 mt-5 leading-relaxed text-white/80">Schedules, broadcast information, and personalized watch options come together in one guide—helping fans decide what to watch and where to find it.</p>
              <a href="https://hotlinesports.com" className={`${link} mt-auto text-[#d8eb94]`}>Visit Hotline Sports <ArrowUpRight aria-hidden="true" size={19} /></a>
            </article>
            <article data-company-reveal className="flex flex-col rounded-3xl border border-[#172820]/20 p-7 md:p-9">
              <div className="flex items-center justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">Ongoing research</p><AudioLines aria-hidden="true" size={28} className="text-[#68745b]" /></div>
              <h3 className="mt-9 text-3xl font-semibold tracking-tight">Pronunciation intelligence.</h3>
              <p className="mt-6 text-2xl leading-snug text-[#68745b]">Getting a name right matters.</p>
              <p className="mb-6 mt-5 leading-relaxed text-[#526055]">Research into helping speech systems pronounce people’s names accurately, using verified references and phoneme mappings. An exploration rooted in real experience building voice products for sports.</p>
              <a className={`${link} mt-auto`} href="https://tonymarks.com/writing/pronunciation-intelligence">Explore the research <ArrowUpRight aria-hidden="true" size={19} /></a>
            </article>
          </div>
        </section>
        <section id="field-notes" aria-labelledby="field-notes-title" className="scroll-mt-8 border-b border-[#172820]/20 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">From the work</p><h2 id="field-notes-title" className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Field Notes</h2><p className="mt-5 max-w-xl leading-relaxed text-[#526055]">What we’re learning about AI, products, and the decisions behind them. Written by founder Tony Marks.</p></div>
            <a href="https://tonymarks.com/#field-notes" className={link}>All Field Notes <ArrowUpRight aria-hidden="true" size={19} /></a>
          </div>
          <div className="mt-10 grid gap-9 md:grid-cols-3">
            {fieldNotes.map(note => <article key={note.slug} data-company-reveal className="flex flex-col border-t border-[#172820]/20 pt-5">
              <a href={`https://tonymarks.com/writing/${note.slug}`} className="group flex h-full flex-col rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                <img src={`/field-notes/field-note-${note.number}.png`} alt="" width="1200" height="630" loading="lazy" decoding="async" className="mb-6 aspect-[1200/630] w-full rounded-xl object-cover" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#68745b]">No. {note.number} · {note.topic}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">{note.title}</h3>
                <p className="mb-5 mt-3 text-sm leading-relaxed text-[#526055]">{note.description}</p>
                <span className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Read on tonymarks.com <ArrowUpRight aria-hidden="true" size={17} /></span>
              </a>
            </article>)}
          </div>
        </section>
        <section id="company" className="grid scroll-mt-8 gap-6 border-b border-[#172820]/20 py-16 md:grid-cols-[1fr_2fr] md:gap-16">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">The company</p><h2 className="mt-5 text-3xl font-semibold tracking-tight">Built from experience.</h2></div>
          <div><p className="leading-relaxed text-[#526055]">Founded by Tony Marks, Project Sapiens brings experience in conversational AI, voice, and digital products to the practical challenges of building useful software.</p><a className={`${link} mt-5`} href="https://tonymarks.com">Meet the founder <ArrowUpRight aria-hidden="true" size={17} /></a></div>
        </section>
        <section className="py-16 md:py-20"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">Partnerships & select collaborations</p><h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Something worth building together?</h2><a href="mailto:tony@projectsapiens.xyz" className={`${link} mt-6 text-lg`}>tony@projectsapiens.xyz <ArrowUpRight aria-hidden="true" size={20} /></a></section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[#172820]/20 px-6 py-7 text-sm text-[#526055] md:px-10"><p>© {new Date().getFullYear()} Project Sapiens, Inc.</p><a href="/academy/login" className={link}>Learning platform sign in <ArrowUpRight aria-hidden="true" size={16} /></a></footer>
    </div>
  );
}
