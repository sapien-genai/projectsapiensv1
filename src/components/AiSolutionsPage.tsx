import { useEffect } from 'react';
import CompanyHeader from './CompanyHeader';
import CompanyFooter from './CompanyFooter';
import OpenAISolutions from './OpenAISolutions';
import ClientInquiryForm from './ClientInquiryForm';
import './CompanyHome.css';
import './CompanyPreview.css';

export default function AiSolutionsPage() {
  useEffect(() => {
    document.title = 'AI Solutions for Your Business — Project Sapiens';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Practical AI solutions for business workflows, customer experiences, and products. Explore automation, knowledge tools, custom AI agents, and voice AI development.');
  }, []);
  return <div className="company-site min-h-screen">
    <a className="sp-skip" href="#main">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="mx-auto">
      <section className="company-hero">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#526055]">AI Solutions</p>
        <h1 className="mt-7 max-w-4xl">Make the work easier.<br />Make the idea real.</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#526055]">We design and build practical AI solutions around your business: the tasks that take too long, the information people need, and the products you want to bring to life.</p>
        <a className="mt-7 inline-flex min-h-12 items-center font-semibold underline underline-offset-4" href="#contact">Discuss a project</a>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#526055]">From a focused pilot to an existing product that needs improvement, we connect strategy, design, integration, and evaluation.</p>
      </section>
      <OpenAISolutions overview />
      <section className="border-t border-[#ddd] py-14 md:py-20" aria-labelledby="capabilities-title">
        <h2 id="capabilities-title" className="text-3xl font-semibold tracking-tight">Explore our capabilities.</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <article>
            <h3 className="text-2xl font-semibold"><a className="underline underline-offset-4" href="/custom-ai-agents/">Custom AI agents</a></h3>
            <p className="mt-4 max-w-xl leading-relaxed text-[#526055]">When a task needs reasoning across information and tools, an agent can help carry the work forward. We define its scope, connect approved sources, and build in evaluation and human approval where needed.</p>
          </article>
          <article>
            <h3 className="text-2xl font-semibold"><a className="underline underline-offset-4" href="/voice-ai-development/">Voice AI development</a></h3>
            <p className="mt-4 max-w-xl leading-relaxed text-[#526055]">Help people find information and complete useful tasks through conversation. We connect conversation design, business integrations, and testing for real-world conditions.</p>
          </article>
        </div>
      </section>
      <section className="border-t border-[#ddd] py-14 md:py-20" aria-labelledby="approach-title">
        <h2 id="approach-title" className="text-3xl font-semibold tracking-tight">Start with the problem. Agree on the result.</h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-[#526055]">We identify the task, users, and available systems, then agree on scope and success criteria. A focused prototype helps test the approach before expanding. Delivery includes the integrations, testing, and operating guidance agreed for your project.</p>
        <a className="mt-6 inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href="/work-with-us/">How we work together</a>
      </section>
      <aside className="border-t border-[#ddd] py-10">
        <h2 className="text-2xl font-semibold">Looking to understand how AI sees your business?</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[#526055]">AI Visibility is our separate diagnostic tool. Start with a free report on how ChatGPT, Claude, and Gemini describe your company, with practical recommendations.</p>
        <a className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#111] px-6 py-3 font-semibold text-white" href="/ai-visibility/#instant-report">Get your free AI report</a>
      </aside>
      <ClientInquiryForm previewOnly={import.meta.env.DEV} topic="AI Solutions" />
    </main>
    <CompanyFooter />
  </div>;
}
