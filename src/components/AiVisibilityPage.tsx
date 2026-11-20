import CompanyFooter from './CompanyFooter';
import { useEffect, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CompanyHeader from './CompanyHeader';
import ClientInquiryForm from './ClientInquiryForm';
import VisibilityChecker from './VisibilityChecker';
import { VISIBILITY_QUESTIONS, VISIBILITY_ASSISTANTS } from '../data/aiVisibility';
import './CompanyHome.css';
import './CompanyPreview.css';

function Section({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <section className="grid gap-6 border-t border-[#172820]/20 py-14 md:grid-cols-[1fr_2fr] md:gap-16 md:py-20">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">{label}</p>
    <div><h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2><div className="mt-7 space-y-5 leading-relaxed text-[#526055]">{children}</div></div>
  </section>;
}
const linkStyle = 'font-semibold text-[#172820] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';
const description = 'Find out how ChatGPT, Claude and Gemini describe your business. Get a free website diagnosis and practical action plan, with optional implementation from Project Sapiens.';

export default function AiVisibilityPage() {
  useEffect(() => {
    document.title = 'AI Brand Visibility — Project Sapiens';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, []);
  return <div className="company-site min-h-screen bg-[#f4f2ec] text-[#172820] selection:bg-[#d8eb94]">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="mx-auto max-w-6xl px-6 md:px-10">
      <header className="company-hero py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">AI brand visibility</p>
        <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl md:text-7xl">When someone asks AI about your category, what does it say about you?</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#526055]">People now ask {VISIBILITY_ASSISTANTS.slice(0, -1).join(', ')}, and {VISIBILITY_ASSISTANTS[VISIBILITY_ASSISTANTS.length - 1]} for a recommendation, often before they open a search engine. We test how those assistants describe your business, show you where the picture is missing or wrong, and help you fix what they read.</p>
        <a href="#instant-report" className={`${linkStyle} mt-7 inline-flex min-h-11 items-center gap-2`}>Run a free instant report <ArrowUpRight aria-hidden="true" size={19} /></a>
      </header>
      <div className="pb-14 md:pb-20"><VisibilityChecker /><p className="mt-6 text-[#526055]">Already have an account? <a className={linkStyle} href="/ai-visibility/dashboard/">Open your workspace</a>.</p></div>
      <Section label="Your next step" title="The diagnosis is free. The next step is yours."><p>Read your page evidence, assistant answers and prioritized action plan. Use the recommendations yourself or share them with your developer. Save the report in your workspace with Google or email sign-in.</p><p>If you want us to do the work, implementation starts at $299 for an agreed scope. Optional monthly tracking repeats fixed questions and records answers, sources and coverage. Neither is required to use your free report.</p><a className={linkStyle} href="/ai-visibility/dashboard/">Open your workspace</a></Section>
      <Section label="Why it matters" title="Search ranks pages. AI describes companies.">
        <p>A search engine returns a list and leaves the choice to the reader. An AI assistant writes one answer, names a handful of companies, and explains each in a sentence. If that sentence is vague, out of date, or about a different company with a similar name, the reader never sees your website to learn otherwise.</p>
        <p>Ranking well in Google does not settle the question. An assistant can only repeat what it was able to read and connect: your own pages, your documentation, and what other sources say about you. The work is to find out what it currently understands, then make the accurate version easy to find.</p>
      </Section>
      <Section label="What we look at" title="Four areas for a deeper review.">
        {VISIBILITY_QUESTIONS.map((item, i) => <div key={item.name} className="border-b border-[#172820]/20 pb-7 last:border-0"><p className="font-mono text-xs text-[#68745b]">0{i + 1} / {item.name}</p><h3 className="mt-2 text-xl font-semibold text-[#172820]">{item.question}</h3><p className="mt-3">{item.detail}</p></div>)}
      </Section>
      <Section label="Included for free" title="A diagnosis you can act on.">
        <ul className="list-disc space-y-3 pl-5">
          <li><strong className="text-[#172820]">Your business and existing content.</strong> An inferred description of what you offer and who you serve, plus a sample of up to eight public pages. Existing pages and structured data inform the plan.</li>
          <li><strong className="text-[#172820]">Actual assistant answers.</strong> One named-business question and up to two category questions per assistant, with sources and missing answers shown. Mentions are distinct from recommendations.</li>
          <li><strong className="text-[#172820]">Specific changes.</strong> Page-linked findings, priorities, proposed steps and example wording, with responsibility, approximate effort and verification instructions.</li>
          <li><strong className="text-[#172820]">An honest account of coverage.</strong> Observed findings, items to verify and opportunities are labelled separately. We do not claim to measure your traffic, backlinks or search rankings.</li>
        </ul>
      </Section>
      <Section label="How it works" title="Understand it. Fix it. Check what changes.">
        <ol className="space-y-6">{[
          ['Run your free report', 'Enter your website. We sample public pages and ask ChatGPT, Claude and Gemini about your business and category.'],
          ['Review your diagnosis', 'Provide your email to open the full report free. Check the inferred business details, evidence and suggested actions. You can save it in your workspace.'],
          ['Choose how to implement', 'Do it yourself, work with your developer, or request help from us. Implementation starts at $299; we agree specific changes, access, timing and price before payment. Larger projects are quoted separately.'],
          ['Measure over time', 'Record the changes you publish. Optional monthly tracking repeats its own fixed question set; compare matching questions and models and account for normal variation.'],
        ].map(([title, body], i) => <li key={title}><h3 className="font-semibold text-[#172820]">{i + 1}. {title}</h3><p className="mt-2">{body}</p></li>)}</ol>
      </Section>
      <Section label="What to expect" title="Evidence, without promises nobody can keep.">
        <p>No one can guarantee a place in an AI answer. The models change, the same question can return different answers, and none of the companies behind them sell placement in the answer itself. We report what we observed and when.</p>
        <p>What you can control is what you publish and how clearly a machine can read it. That is where the recommendations focus: plain statements of what you do and for whom, pages that load without a browser, consistent facts across the places assistants draw from.</p>
        <p>For the thinking behind this work, read the Field Note <a className={linkStyle} href="/field-notes/ai-brand-visibility/">AI Brand Visibility</a>.</p>
      </Section>
      <Section label="A good fit" title="For businesses and professionals whose customers ask before they buy.">
        <p>The report is most useful when people research your category before choosing: professional services, software, healthcare and local practices, specialist retailers, and independent experts whose name is the brand.</p>
        <p>You do not need a marketing team or an existing search program. A website and a clear idea of who you serve is enough to start.</p>
      </Section>
      <ClientInquiryForm previewOnly={import.meta.env.DEV} topic="AI visibility report" />
    </main>
    <CompanyFooter />
  </div>;
}
