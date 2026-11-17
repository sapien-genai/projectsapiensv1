import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CompanyHeader from './CompanyHeader';
import './CompanyHome.css';
import './CompanyPreview.css';
import './AboutPage.css';

const milestones = [
  ['2017', 'Founded Sapien AI.', 'Tony founded Sapien AI during the early commercial wave of conversational artificial intelligence, focused on turning emerging technology into useful software.'],
  ['2021', 'Exploring generative AI.', 'His team participated in OpenAI’s developer beta, building on years of experience with conversational products.'],
  ['2025', 'A new chapter.', 'The Sapien AI domain and brand were acquired. Tony’s current work continues through Project Sapiens and his own products, including Hotline Sports.'],
];

export default function AboutPage() {
  useEffect(() => {
    if (window.location.hash === '#founder') document.getElementById('founder')?.scrollIntoView();
    document.title = 'About Project Sapiens — Meet Tony Marks';
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute('content') ?? '';
    meta?.setAttribute('content', 'Meet Project Sapiens and founder Tony Marks. Practical AI strategy, product development, and hands-on experience in conversational AI, voice, and intelligent systems.');
    return () => { meta?.setAttribute('content', previous); };
  }, []);
  return <div className="company-site ps-about">
    <a className="ps-about-skip" href="#main">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="ps-about-shell">
      <section className="ps-about-hero">
        <p className="ps-about-label">About / Project Sapiens</p>
        <h1>Curious minds.<br />Working hands<span>.</span></h1>
        <div className="ps-about-hero-bottom"><p>We turn emerging AI technology into useful products. Strategy, design, and development—connected by a simple question: does this make someone’s work or life better?</p><span>Independent expertise.<br />Hands-on delivery.</span></div>
      </section>
      <section className="ps-about-founder" id="founder" aria-labelledby="founder-title">
        <figure><img src="/images/tony-marks-portrait.jpg" alt="Pencil portrait of Tony Marks, founder of Project Sapiens" width="2048" height="2048" /><figcaption>Tony Marks / Founder, Project Sapiens</figcaption></figure>
        <div><p className="ps-about-label">The person behind the work</p><h2 id="founder-title">Meet Tony.</h2><p className="ps-about-lead">An AI founder and product builder who connects emerging technology with the details that make it useful.</p><p>Tony’s work spans conversational assistants, voice interfaces, intelligent search, and custom AI applications across sports, travel, retail, and enterprise software.</p><p>His experience includes AI projects connected to the Olympic Games, voice capabilities for professional sports, customer experiences for airlines, and an interactive retail application for New Balance.</p><p>Today, he is building Project Sapiens and Hotline Sports, exploring pronunciation intelligence, and working with organizations on AI strategy and product development.</p><a className="ps-about-link" href="/field-notes/">Read Tony’s Field Notes <ArrowUpRight size={19}/></a></div>
      </section>
      <section className="ps-about-section" aria-labelledby="approach-title"><p className="ps-about-label">01 / Our approach</p><div><h2 id="approach-title">The product has to work<br />beyond the demo.</h2><p className="ps-about-lead">A compelling prototype is a starting point. The real work is connecting it to real information, understanding where it can fail, and making it clear enough for people to use.</p><div className="ps-about-principles">{[
        ['Start with people.', 'Understand the audience, the problem, and what a better experience would look like before choosing the technology.'],
        ['Build to learn.', 'Use working software to test the important assumptions. Let evidence guide the next decision.'],
        ['Make it dependable.', 'Treat evaluation, data quality, and the path to production as part of the product itself.'],
      ].map(([title, body], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div></div></section>
      <section className="ps-about-section" aria-labelledby="experience-title"><p className="ps-about-label">02 / The experience behind it</p><div><h2 id="experience-title">A continuing practice.</h2><div className="ps-about-timeline">{milestones.map(([date, title, body]) => <div key={date}><span>{date}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div><p className="ps-about-caption">Earlier projects reflect Tony’s work and the work of the Sapien AI team.</p></div></section>
      <section className="ps-about-partner" aria-labelledby="partner-title"><p className="ps-about-label">Member of the OpenAI Partner Network</p><h2 id="partner-title">Powerful technology.<br />Practical experience.</h2><p>Project Sapiens combines OpenAI technology with independent expertise in product strategy, design, and development. We help organizations turn new capabilities into products and workflows people can use.</p><a className="ps-about-link" href="/#solutions">Explore our solutions <ArrowUpRight size={19}/></a></section>
      <section className="ps-about-section" aria-labelledby="current-title"><p className="ps-about-label">03 / What we’re exploring</p><div><h2 id="current-title">Ideas with work behind them.</h2><div className="ps-about-work">{[
        ['Hotline Sports', 'Making sports schedules, broadcasts, and watch options easier to navigate.', '/#work', 'Explore the product'],
        ['Pronunciation intelligence', 'Exploring how speech systems can get one of the most human details right: people’s names.', '/field-notes/pronunciation-intelligence/', 'Inside the research'],
        ['Field Notes', 'Observations on AI, product design, and the decisions behind working systems.', '/field-notes/', 'Read the collection'],
      ].map(([title, body, href, label]) => <a href={href} key={title}><h3>{title}</h3><p>{body}</p><span>{label} <ArrowUpRight size={18}/></span></a>)}</div></div></section>
      <section className="ps-about-cta"><p className="ps-about-label">Work with us</p><h2>Something worth<br />building together?</h2><p>Project-based strategy and development, fractional AI leadership, and ongoing advisory.</p><a className="ps-about-button" href="/work-with-us/">Explore working together <ArrowUpRight size={20}/></a><a className="ps-about-link" href="/#contact">Let’s talk <ArrowUpRight size={18}/></a></section>
    </main>
    <footer className="ps-about-footer"><span>© {new Date().getFullYear()} Project Sapiens, Inc.</span><a href="/field-notes/">Field Notes</a><a href="/">Back to Project Sapiens ↗</a></footer>
  </div>;
}
