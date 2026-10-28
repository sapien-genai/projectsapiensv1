import { useEffect, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CompanyHeader from './CompanyHeader';
import ClientInquiryForm from './ClientInquiryForm';
import './CompanyHome.css';

function Section({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <section className="grid gap-6 border-t border-[#172820]/20 py-14 md:grid-cols-[1fr_2fr] md:gap-16 md:py-20">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">{label}</p>
    <div><h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2><div className="mt-7 space-y-5 leading-relaxed text-[#526055]">{children}</div></div>
  </section>;
}
const linkStyle = 'font-semibold text-[#172820] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function WorkWithUsPage() {
  useEffect(() => {
    document.title = 'Work with us — Project Sapiens';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'AI strategy and product development, fractional AI leadership, and ongoing advisory retainers from Project Sapiens.');
  }, []);
  return <div className="min-h-screen bg-[#f4f2ec] text-[#172820] selection:bg-[#d8eb94]">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="mx-auto max-w-6xl px-6 md:px-10">
      <header className="py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">Work with us</p>
        <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl md:text-7xl">From a promising AI idea to a product people can use.</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#526055]">We work with founders, product teams, and established organizations that need experienced help defining, building, and improving AI products. We offer project-based engagements, fractional AI leadership, and ongoing advisory retainers through Project Sapiens, Inc.</p>
        <a href="#contact" className={`${linkStyle} mt-7 inline-flex min-h-11 items-center gap-2`}>Tell us about your project <ArrowUpRight aria-hidden="true" size={19} /></a>
      </header>
    <Section label="Where we can help" title="Start with the decision you need to make.">
      {[
        ['Define the right product', 'You see an opportunity for AI but need to decide what to build. We can work through the user need, available data, technical options, and the evidence a prototype should produce.', 'Typical focus: use-case assessment, product scope, architecture, and an evaluation plan.'],
        ['Build a working system', 'You have a defined direction and need to turn it into software. We connect product decisions with implementation, including data integration, model behavior, interface design, and deployment.', 'Typical focus: conversational and voice interfaces, enterprise knowledge and search, AI agents, and custom applications.'],
        ['Improve what already exists', 'You have a prototype or product, but reliability, usability, or operations are holding it back. We can examine the failure modes and prioritize changes against real usage.', 'Typical focus: evaluation, data quality, workflow design, product clarity, and production readiness.'],
      ].map(([title,body,detail],i) => <div key={title} className="border-b border-[#172820]/20 pb-7 last:border-0"><p className="text-xs font-mono text-[#68745b]">0{i+1}</p><h3 className="mt-2 text-xl font-semibold text-[#172820]">{title}</h3><p className="mt-3">{body}</p><p className="mt-3 text-sm text-[#68745b]">{detail}</p></div>)}
    </Section>
    <Section label="Engagement options" title="The right level of involvement for the work.">
      <h3 className="text-lg font-semibold text-[#172820]">Project-based strategy and development</h3>
      <p>A defined engagement to assess an opportunity, build a product, or improve an existing system. We agree on the scope, deliverables, and measures of success before work begins.</p>
      <h3 className="pt-3 text-lg font-semibold text-[#172820]">Fractional AI leadership</h3>
      <p>Hands-on leadership on a part-time basis to help set AI direction, prioritize a roadmap, guide product and technical decisions, and support the people delivering the work. We agree on responsibilities and a working cadence that fits your organization.</p>
      <h3 className="pt-3 text-lg font-semibold text-[#172820]">Ongoing advisory retainers</h3>
      <p>Regular access to an experienced perspective as your AI plans evolve. Advisory work can include strategy reviews, architecture and vendor decisions, product feedback, and evaluation of new opportunities. We define the focus and meeting cadence together.</p>
      <p>These options are available across industries and organization sizes. The starting point is the work you need to accomplish, rather than a particular client profile.</p>
    </Section>
    <Section label="Working together" title="Useful software starts with a shared understanding.">
      <ol className="space-y-6">{[
        ['Understand the situation', 'We start with who the product serves, what needs to change, and what you already have: data, systems, people, and constraints.'],
        ['Agree on a focused scope', 'We define the deliverable, responsibilities, and how we will judge whether the work is useful. Scope, timing, and fees are agreed before work begins.'],
        ['Build, evaluate, and refine', 'Working software and concrete evidence guide the next decision. We test the important failure cases alongside the intended experience.'],
        ['Make the next step clear', 'The engagement should leave you with a useful result and a clear understanding of what it takes to operate, extend, or hand over the work.'],
      ].map(([title,body],i) => <li key={title}><h3 className="font-semibold text-[#172820]">{i+1}. {title}</h3><p className="mt-2">{body}</p></li>)}</ol>
    </Section>
    <Section label="A good fit" title="A meaningful use case, and room to work through it.">
      <p>We’re particularly interested in products where AI needs to work with real information and real constraints: finding answers across enterprise knowledge, helping someone complete a task through conversation, or turning fragmented data into a clear decision.</p>
      <p>You don’t need a finished specification. It helps to have a clear audience, access to the people or information the product will depend on, and a willingness to evaluate what actually works.</p>
      <p>For an example of how we approach those tradeoffs, <a className={linkStyle} href="https://tonymarks.com/work/hotline-sports/">read the Hotline Sports case study</a>. For our founder’s background, <a className={linkStyle} href="https://tonymarks.com/about/">meet Tony Marks</a>.</p>
    </Section>
    <Section label="Before we talk" title="A little context makes the first conversation useful.">
      <p>Send a short description of what you’re trying to build or improve, who it’s for, and where the project stands. If you have a target timeline or budget range, include it. Please keep credentials and confidential materials out of the initial inquiry.</p>
      <p>Use the <a className={linkStyle} href="#contact">contact form</a> or email <a className={linkStyle} href="mailto:tony@projectsapiens.xyz">tony@projectsapiens.xyz</a>. We can determine fit and the right next step from there.</p>
    </Section>
      <ClientInquiryForm />
    </main>
    <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-[#172820]/20 px-6 py-7 text-sm text-[#526055] md:px-10"><p>© {new Date().getFullYear()} Project Sapiens, Inc.</p><a className={linkStyle} href="/">Back to Project Sapiens</a></footer>
  </div>;
}
