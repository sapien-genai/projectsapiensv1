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
  return <section id="solutions" aria-labelledby="solutions-title" className="sp-solutions">
    <div className="sp-section-heading"><p className="sp-eyebrow">01 / Solutions built with OpenAI</p><h2 id="solutions-title">Powerful technology.<br/>Practical applications.</h2></div>
    <div className="sp-solutions-layout">
      <div className="sp-solution-list" role="group" aria-label="Explore our solutions">
        {solutions.map((item, index) => <button key={item.name} type="button" aria-pressed={selected === index} aria-controls="solution-detail" onClick={() => setSelected(index)} className="sp-solution-choice"><span className="sp-solution-number">0{index+1}</span><span>{item.name}</span><ArrowUpRight size={20} aria-hidden="true"/></button>)}
      </div>
      <div id="solution-detail" className="sp-solution-panel" aria-live="polite" aria-atomic="true">
        <div key={selected} className="solution-detail-enter">
          <div className="sp-solution-top"><Icon size={28} aria-hidden="true"/><span>0{selected + 1} / 06</span></div>
          <h3>{solution.headline}</h3><p>{solution.description}</p>
          <ol className="sp-solution-flow" aria-label="Example workflow">{solution.steps.map((step,i) => <li key={step}><small>0{i+1}</small><span>{step}</span></li>)}</ol>
          <p className="sp-eyebrow">What we could build</p><p>{solution.example}</p>
          <p className="sp-deliverables">{solution.deliverables}</p>
          <a href="#contact" className="sp-solution-cta">Let’s scope your project <ArrowUpRight size={18} aria-hidden="true"/></a>
        </div>
      </div>
    </div>
    <nav aria-label="Service details" className="mt-8 flex flex-wrap gap-x-8 gap-y-4"><a className="sp-solution-cta" href="/custom-ai-agents/">Explore custom AI agent development <ArrowUpRight size={18} aria-hidden="true" /></a><a className="sp-solution-cta" href="/voice-ai-development/">Explore voice AI development <ArrowUpRight size={18} aria-hidden="true" /></a></nav>
    <p className="sp-solution-note">Available as focused projects, fractional AI leadership, or ongoing advisory. We agree on scope, integrations, and platform requirements together.</p>
  </section>;
}
