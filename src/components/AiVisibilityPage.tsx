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
const description = 'Find out how ChatGPT, Claude, Gemini, and Perplexity describe your company, where the picture is missing or wrong, and what to change. An AI Brand Visibility Report from Project Sapiens.';

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
      <Section label="Your next step" title="Check it. Improve it. Keep measuring."><p>Save your free report with Google or email sign-in. From your workspace, choose a one-time fix package with website-specific drafts and a publishing checklist, or monthly tracking across ChatGPT, Claude, and Gemini using the same questions.</p><p>You review and publish the drafts. We record what the assistants actually say over time, with their sources and test coverage. No guaranteed increases in mentions or automatic edits to your website.</p><a className={linkStyle} href="/ai-visibility/dashboard/">Create your free account</a></Section>
      <Section label="Why it matters" title="Search ranks pages. AI describes companies.">
        <p>A search engine returns a list and leaves the choice to the reader. An AI assistant writes one answer, names a handful of companies, and explains each in a sentence. If that sentence is vague, out of date, or about a different company with a similar name, the reader never sees your website to learn otherwise.</p>
        <p>Ranking well in Google does not settle the question. An assistant can only repeat what it was able to read and connect: your own pages, your documentation, and what other sources say about you. The work is to find out what it currently understands, then make the accurate version easy to find.</p>
      </Section>
      <Section label="What we look at" title="Four areas for a deeper review.">
        {VISIBILITY_QUESTIONS.map((item, i) => <div key={item.name} className="border-b border-[#172820]/20 pb-7 last:border-0"><p className="font-mono text-xs text-[#68745b]">0{i + 1} / {item.name}</p><h3 className="mt-2 text-xl font-semibold text-[#172820]">{item.question}</h3><p className="mt-3">{item.detail}</p></div>)}
      </Section>
      <Section label="Optional consulting" title="Need a deeper, human-led review?">
        <p>The instant report above asks each assistant a few questions once. The full AI Brand Visibility Report is the same idea done thoroughly, by a person, for your market.</p>
        <ul className="list-disc space-y-3 pl-5">
          <li><strong className="text-[#172820]">A side-by-side scorecard.</strong> Recognition, discovery, and accuracy for each of {VISIBILITY_ASSISTANTS.join(', ')}, set against how you appear in Google for the same questions.</li>
          <li><strong className="text-[#172820]">The evidence.</strong> The prompts we ran, the answers that came back, the companies named ahead of you, and the sources each assistant cited, all dated.</li>
          <li><strong className="text-[#172820]">A technical read of your site.</strong> Whether crawlers can reach your pages, whether the content exists without JavaScript, and what your structured data and metadata say.</li>
          <li><strong className="text-[#172820]">A prioritized list of changes.</strong> What to clarify, what to document, what to connect, and which outside sources to strengthen, ordered by expected effect and effort.</li>
        </ul>
        <p>We walk through the report with you. If you want help making the changes, that can follow as a separate engagement, with a second measurement afterward to see what moved.</p>
      </Section>
      <Section label="How it works" title="From a short intake to a clear next step.">
        <ol className="space-y-6">{[
          ['Tell us about the business', 'Your company, your category, the competitors you are compared with, and the questions your customers ask before they buy.'],
          ['We run the questions', 'We write a prompt set in your customers’ words and run it across the assistants more than once, because answers vary from one run to the next. We review your site and public footprint alongside.'],
          ['You get the report', 'A written report and a working session to go through the findings and decide what is worth doing first.'],
          ['Fix, then measure again', 'You make the changes or we make them with you. We repeat the same prompt set later so the comparison is like for like.'],
        ].map(([title, body], i) => <li key={title}><h3 className="font-semibold text-[#172820]">{i + 1}. {title}</h3><p className="mt-2">{body}</p></li>)}</ol>
        <p>Scope, timing, and fee are agreed before work begins.</p>
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
