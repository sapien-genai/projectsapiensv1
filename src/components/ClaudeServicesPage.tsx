import CompanyFooter from './CompanyFooter';
import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CompanyHeader from './CompanyHeader';
import './CompanyHome.css';
import './CompanyPreview.css';
import './AboutPage.css';

// Mirrors PartnerNetworkPage. Project Sapiens is NOT yet a member of the Claude Partner Network:
// do not add a membership claim here until Anthropic has approved the application in writing.
export default function ClaudeServicesPage() {
  useEffect(() => {
    document.title = 'Claude Services — Project Sapiens';
  }, []);
  return <div className="company-site ps-about">
    <a className="ps-about-skip" href="#main">Skip to content</a><CompanyHeader />
    <main id="main" className="ps-about-shell">
      <section className="ps-about-hero"><p className="ps-about-label">Project Sapiens / <span className="sp-claude-clay">Claude services</span></p><h1>Claude at work.<br />In your work<span>.</span></h1><div className="ps-about-hero-bottom"><p>Project Sapiens helps you put Claude, Anthropic’s AI system, to practical use: choosing the right plan, connecting it to the tools you already rely on, and building custom assistants and agents where they earn their place.</p><span>Independent expertise.<br />Hands-on delivery.</span></div></section>
      <section className="ps-about-section" aria-labelledby="claude-what-title"><p className="ps-about-label">01 / What we do with Claude</p><div><h2 id="claude-what-title">From first rollout<br />to custom builds.</h2><p className="ps-about-lead">Some teams need help getting started. Others need something built. We do both, and we tell you which one you actually need.</p><div className="ps-about-principles">{[
        ['Roll out Claude to your team.', 'Pick a plan, set up workspaces and permissions, connect the company tools Claude should be able to reach, and show people how to use it on the work they already do.'],
        ['Build on the Claude API.', 'Custom assistants, document workflows, and agents that use your systems. We design the prompts, tools, evaluations, and human approval steps, then ship it.'],
        ['Put Claude Code to work.', 'Help your engineers adopt Claude Code: repository setup, project instructions, review habits, and guardrails that fit how your team already ships software.'],
      ].map(([title,body],i)=><div key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></div>)}</div><a className="ps-about-link" href="https://claude.com/" target="_blank" rel="noopener noreferrer">About Claude at Anthropic <ArrowUpRight size={18}/></a></div></section>
      <section className="ps-about-section" aria-labelledby="claude-experience-title"><p className="ps-about-label">02 / The experience we bring</p><div><h2 id="claude-experience-title">We use it<br />before we recommend it.</h2><p>Claude is one of the assistants behind our own <a className="ps-about-inline" href="/ai-visibility/">AI Visibility reports</a>, running in production alongside models from OpenAI and Google. We know where each one is strong because we measure them side by side.</p><p>Founder Tony Marks founded Sapien AI in 2017. His work spans conversational assistants, voice interfaces, intelligent search, and custom AI applications across sports, travel, retail, and enterprise software. Earlier projects reflect Tony’s work and the Sapien AI team’s experience; today’s engagements are delivered through Project Sapiens.</p><a className="ps-about-link" href="/about/#founder">Meet the founder <ArrowUpRight size={18}/></a></div></section>
      <section className="ps-about-section" aria-labelledby="claude-guide-title"><p className="ps-about-label">03 / How an engagement runs</p><div><h2 id="claude-guide-title">Your business.<br />A clear path forward.</h2><p className="ps-about-lead">We work alongside your team to connect business priorities with the right Claude capabilities, integrations, and operating practices.</p><div className="ps-about-principles">{[
        ['Find the right fit.', 'Identify a useful starting point, assess your existing systems, and decide whether the answer is a Claude plan, a connection to your tools, or a custom build.'],
        ['Build with evidence.', 'Prototype, integrate, and evaluate against real tasks. Define what good performance looks like and where a person needs to stay involved.'],
        ['Plan for everyday use.', 'Prepare for rollout, ownership, monitoring, and change, so the work keeps running after we hand it over.'],
      ].map(([title,body],i)=><div key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></div>)}</div><p className="ps-about-caption">Project Sapiens is an independent firm. Anthropic provides Claude and its platform; we define our delivery responsibilities with you. We are not affiliated with, endorsed by, or acting on behalf of Anthropic. We also build with OpenAI and Google models and recommend what fits the work.</p></div></section>
      <section className="ps-about-partner" aria-labelledby="claude-data-title"><p className="ps-about-label">04 / Data protection & security</p><h2 id="claude-data-title">Trust belongs<br />in the design.</h2><p>Anthropic states that, by default, it does not use inputs or outputs from its commercial products, such as Claude for Work and the API, to train its models. Consumer plans follow different terms, which is one reason plan choice matters.</p><p>Those platform protections are one part of the system. We work with your team to define how data should move through your application, who can access it, and what should be retained.</p><a className="ps-about-link" href="https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training" target="_blank" rel="noopener noreferrer">Read Anthropic’s commercial data-use policy <ArrowUpRight size={18}/></a></section>
      <section className="ps-about-section" aria-labelledby="claude-controls-title"><p className="ps-about-label">Putting it into practice</p><div><h2 id="claude-controls-title">Make the boundaries clear.</h2><div className="ps-about-work">{[
        ['Use only the data you need.', 'Map the information involved, minimize sensitive content, and decide what is appropriate to send to a model before connecting a workflow.'],
        ['Control access and actions.', 'Scope what Claude can reach and do, protect credentials, and define human approval for consequential actions. Evaluate the application as well as the model.'],
        ['Agree on retention and oversight.', 'Review logging, retention, residency needs, and third-party integrations with your security and IT teams. Document responsibilities and an operating plan.'],
      ].map(([title,body])=><div key={title} style={{borderTop:'1px solid #dadfd9',padding:'22px 0'}}><h3>{title}</h3><p>{body}</p></div>)}</div><p className="ps-about-caption">Available controls depend on the selected plan, configuration, eligibility, and contract. We review these against your requirements; nothing on this page is a security certification or a guarantee of regulatory compliance.</p></div></section>
      <section className="ps-about-cta"><p className="ps-about-label">Start with your business</p><h2>What would Claude<br />do for your team?</h2><p>Let’s discuss the opportunity, your systems, and the requirements that matter.</p><a className="ps-about-button" href="/#contact">Talk through your project <ArrowUpRight size={20}/></a><a className="ps-about-link" href="/work-with-us/">How we work <ArrowUpRight size={18}/></a></section>
    </main><CompanyFooter />
  </div>;
}
