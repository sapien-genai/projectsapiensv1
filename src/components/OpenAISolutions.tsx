import { useState } from 'react';
import { ArrowUpRight, AudioLines, BookOpen, Workflow, FileText, Palette, Compass } from 'lucide-react';

const solutions = [
  { name: 'Knowledge assistants', icon: BookOpen, headline: 'Your knowledge. Within reach.', description: 'Give customers and teams a conversational way to find answers in your approved documents, with source references and access controls designed around your organization.', example: 'A support assistant that finds the right product guidance and hands off when a person is needed.', steps: ['Approved sources', 'Relevant context', 'An answer with references'], deliverables: 'Knowledge integration · Conversation design · Retrieval evaluation' },
  { name: 'Workflow agents', icon: Workflow, headline: 'Less busywork. More momentum.', description: 'Connect OpenAI models to your business tools to help prepare, route, and complete repeatable work, with human approval at the steps that matter.', example: 'An inquiry workflow that summarizes a request, prepares a CRM update, and drafts a response for review.', steps: ['Incoming request', 'Connected tools', 'Ready for review'], deliverables: 'API integrations · Approval flows · Monitoring and handoff' },
  { name: 'Voice experiences', icon: AudioLines, headline: 'A conversation that goes somewhere.', description: 'Build responsive voice interfaces with OpenAI’s Realtime API, connecting spoken requests to useful information and actions.', example: 'A voice concierge that helps someone explore a service, ask follow-up questions, and find their next step.', steps: ['Spoken question', 'Context + conversation', 'A useful next step'], deliverables: 'Voice UX · Realtime integration · Conversation testing' },
  { name: 'Document intelligence', icon: FileText, headline: 'From information to understanding.', description: 'Turn documents and unstructured text into structured information, summaries, and review queues that fit the way your team works.', example: 'An intake tool that extracts key details from submitted documents and flags missing information for review.', steps: ['Documents + text', 'Extract and organize', 'Reviewable information'], deliverables: 'Document workflows · Structured outputs · Quality checks' },
  { name: 'Creative tools', icon: Palette, headline: 'Make room for more possibilities.', description: 'Build custom tools for drafting content and generating or editing images with OpenAI, keeping creative direction and final approval in your team’s hands.', example: 'A campaign workspace that turns an approved brief into draft copy and visual concepts for an editor to refine.', steps: ['Creative brief', 'Explore variations', 'Human-led refinement'], deliverables: 'Custom interfaces · Image and text workflows · Editorial controls' },
  { name: 'Strategy & evaluation', icon: Compass, headline: 'Build the right thing. Know it works.', description: 'Identify valuable use cases, prototype the experience, and evaluate quality, latency, and cost before expanding. Support your team with practical training and ongoing AI leadership.', example: 'A focused pilot with a working prototype, representative test cases, and a clear recommendation for what to do next.', steps: ['Business challenge', 'Prototype + evaluate', 'An informed decision'], deliverables: 'Opportunity assessment · Evaluation design · Team enablement' },
];

export default function OpenAISolutions() {
  const [selected, setSelected] = useState(0);
  const solution = solutions[selected];
  const Icon = solution.icon;
  return <section id="solutions" aria-labelledby="solutions-title" className="company-solutions scroll-mt-8 py-16 md:py-24">
    <div className="mb-10 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">Solutions built with OpenAI</p><h2 id="solutions-title" className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Intelligence, put to work.</h2></div>
      <p className="max-w-xl leading-relaxed text-[#526055]">Project Sapiens is a member of the OpenAI Partner Network. We design and deliver custom solutions using OpenAI technology, from the first useful prototype to an integrated product.</p>
    </div>
    <div className="grid overflow-hidden rounded-3xl border border-[#172820]/20 md:grid-cols-[0.8fr_1.6fr]">
      <div className="grid grid-cols-1 gap-1 bg-[#e9e9df] p-3 sm:grid-cols-2 md:grid-cols-1" role="group" aria-label="Explore our solutions">
        {solutions.map((item, index) => { const ItemIcon = item.icon; return <button key={item.name} type="button" aria-pressed={selected === index} aria-controls="solution-detail" onClick={() => setSelected(index)} className={`solution-choice flex min-h-16 items-center gap-3 rounded-xl px-4 py-4 text-left text-sm font-semibold ${selected === index ? 'bg-[#172820] text-[#f4f2ec]' : 'text-[#172820] hover:bg-white/60'}`}><ItemIcon size={20} aria-hidden="true" /><span>{item.name}</span><ArrowUpRight size={16} aria-hidden="true" className="ml-auto shrink-0" /></button>; })}
      </div>
      <div id="solution-detail" className="min-w-0 bg-[#172820] p-6 text-[#f4f2ec] md:p-10" aria-live="polite" aria-atomic="true">
        <div key={selected} className="solution-detail-enter">
          <div className="mb-8 flex items-center justify-between text-[#d8eb94]"><Icon size={32} aria-hidden="true" /><span className="text-xs font-mono">0{selected + 1} / 06</span></div>
          <h3 className="max-w-lg text-3xl font-semibold tracking-tight md:text-4xl">{solution.headline}</h3>
          <p className="mt-5 max-w-xl leading-relaxed text-white/80">{solution.description}</p>
          <ol className="solution-flow my-8 grid gap-2 sm:grid-cols-3" aria-label="Example workflow">{solution.steps.map((step, i) => <li key={step} style={{ animationDelay: `${i * 100}ms` }} className="rounded-xl border border-white/20 p-3"><span className="mb-3 block text-xs text-[#d8eb94]">0{i + 1}</span><span className="text-sm">{step}</span></li>)}</ol>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d8eb94]">What we could build</p><p className="mt-3 text-sm leading-relaxed text-white/80">{solution.example}</p>
          <p className="mt-5 border-t border-white/20 pt-5 text-xs leading-relaxed text-white/65">{solution.deliverables}</p>
          <a href="#contact" className="company-action mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-[#d8eb94] underline-offset-4 hover:underline">Let’s scope your project <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </div>
    <p className="mt-5 text-sm leading-relaxed text-[#526055]">Available as focused projects, fractional AI leadership, or ongoing advisory. We agree on scope, integrations, and platform requirements together.</p>
  </section>;
}
