import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../data/services';
import CompanyHeader from './CompanyHeader';
import CompanyFooter from './CompanyFooter';
import ClientInquiryForm from './ClientInquiryForm';
import './CompanyHome.css';
import './CompanyPreview.css';

const linkStyle = 'font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function ServicePage({ slug }: { slug: string }) {
  const service = SERVICES.find(item => item.slug === slug)!;
  const related = SERVICES.find(item => item.slug === service.related)!;
  useEffect(() => {
    document.title = service.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', service.description);
  }, [service]);
  return <div className="company-site min-h-screen bg-[#f4f2ec] text-[#172820] selection:bg-[#d8eb94]">
    <a className="sp-skip" href="#main">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="mx-auto max-w-6xl px-6 md:px-10">
      <header className="py-16 md:py-24">
        <a className={`${linkStyle} text-sm`} href="/#solutions">Solutions / {service.name}</a>
        <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl md:text-7xl">{service.headline}</h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#526055]">{service.intro}</p>
        <a className={`${linkStyle} mt-7 inline-flex min-h-11 items-center gap-2`} href="#contact">Tell us what you want to build <ArrowUpRight size={19} aria-hidden="true" /></a>
        <p className="mt-6 text-sm text-[#526055]">Independent expertise. Hands-on delivery. <a className={linkStyle} href="/openai-partner-network/">Member of the OpenAI Partner Network.</a></p>
      </header>
      <section className="border-t border-[#172820]/20 py-12 md:py-16" aria-labelledby="build-title">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">What we can build</p>
        <h2 id="build-title" className="mt-5 text-3xl font-semibold tracking-tight">Start with a useful task.</h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-[#526055]">{service.audience}</p>
        <div className="mt-9 grid gap-8 md:grid-cols-3">{service.examples.map(([title, body], i) => <article key={title} className="border-t border-[#172820]/20 pt-6"><p className="text-xs font-mono text-[#68745b]">0{i + 1}</p><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-4 leading-relaxed text-[#526055]">{body}</p></article>)}</div>
        <div className="mt-10 rounded-xl bg-[#e6eadf] p-6 md:p-8"><h3 className="text-sm font-semibold">An example workflow</h3><ol className="mt-5 grid gap-6 md:grid-cols-3">{service.workflow.map((step, i) => <li key={step} className="leading-relaxed"><span className="mb-2 block text-xs font-bold text-[#526055]">STEP {i + 1}</span>{step}</li>)}</ol></div>
      </section>
      <section className="grid gap-8 border-t border-[#172820]/20 py-12 md:grid-cols-[1fr_2fr] md:gap-16 md:py-16" aria-labelledby="delivery-title">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">From prototype to production</p><h2 id="delivery-title" className="mt-5 text-3xl font-semibold tracking-tight">What the work includes.</h2></div>
        <div className="space-y-7">{service.deliverables.map(([title, body]) => <div key={title}><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 leading-relaxed text-[#526055]">{body}</p></div>)}</div>
      </section>
      <section className="border-t border-[#172820]/20 py-12 md:py-16" aria-labelledby="experience-title">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">The people behind the product</p>
        <h2 id="experience-title" className="mt-5 text-3xl font-semibold tracking-tight">Strategy and implementation, connected.</h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-[#526055]">Founded by Tony Marks, Project Sapiens brings experience in conversational AI, voice interfaces, and digital products to the work of building useful software. Engagements can take the form of focused projects, fractional AI leadership, or ongoing advisory.</p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4"><a className={linkStyle} href="/about/">Meet Tony and explore his experience</a><a className={linkStyle} href="https://tonymarks.com/work/hotline-sports/">Read the Hotline Sports case study</a><a className={linkStyle} href="/work-with-us/">How we work together</a></div>
      </section>
      <section className="border-t border-[#172820]/20 py-12 md:py-16" aria-labelledby="questions-title">
        <h2 id="questions-title" className="text-3xl font-semibold tracking-tight">Questions before we start.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">{service.questions.map(([question, answer]) => <div key={question}><h3 className="text-lg font-semibold">{question}</h3><p className="mt-3 leading-relaxed text-[#526055]">{answer}</p></div>)}</div>
        <p className="mt-10 text-[#526055]">Also exploring <a className={linkStyle} href={`/${related.slug}/`}>{related.name}</a>? We can scope the experience and the work behind it together.</p>
      </section>
      <ClientInquiryForm previewOnly={import.meta.env.DEV} topic={service.name} />
    </main>
    <CompanyFooter />
  </div>;
}
