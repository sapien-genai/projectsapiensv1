import { ArrowUpRight, ArrowUp } from 'lucide-react';
import Flock from './flock/Flock';
import './CompanyFooter.css';

export default function CompanyFooter() {
  return <footer className="sapiens-footer" aria-label="Project Sapiens footer">
    <div className="sapiens-footer-inner">
      <div className="sapiens-footer-invitation relative">
        {/* The flock at rest: a still formation, heading the same way as the invitation. */}
        <Flock formation="vee" still count={11} size={11} color="255,255,255" className="absolute right-[18%] top-2 hidden h-44 w-72 -rotate-[38deg] lg:block" />
        <p className="sapiens-footer-kicker">Your next chapter starts here</p>
        <a href="/#contact" className="sapiens-footer-headline">Let’s build<br />what’s next.<ArrowUpRight aria-hidden="true" /></a>
        <p>Human ambition. Applied intelligence.</p>
      </div>
      <div className="sapiens-footer-grid">
        <div className="sapiens-footer-brand">
          <a href="/" aria-label="Project Sapiens home"><img src="/brand/project-sapiens-wordmark.png" width="250" height="100" alt="Project Sapiens" loading="lazy" /></a>
          <p>Independent expertise.<br />Hands-on delivery.</p>
          <a href="/openai-partner-network/" className="sapiens-footer-partner">Member of the<br /><strong>OpenAI Partner Network</strong><ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <nav aria-label="Footer company links"><h2>Explore</h2><a href="/about/">About us</a><a href="/#solutions">AI solutions</a><a href="/custom-ai-agents/">Custom AI agents</a><a href="/voice-ai-development/">Voice AI development</a><a href="/ai-visibility/">AI brand visibility</a><a href="/#work">Our work</a><a href="/work-with-us/">Work with us</a><a href="/field-notes/">Field Notes</a></nav>
        <nav aria-label="Footer trust links"><h2>Trust & legal</h2><a href="/terms/">Terms of Service</a><a href="/privacy/">Privacy</a><a href="/openai-partner-network/#data-title">Security & data</a><a href="/openai-partner-network/">Our OpenAI relationship</a></nav>
        <nav aria-label="Footer connect links"><h2>Connect</h2><a href="/#contact">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></a><span className="sapiens-footer-pending">Social media <small>Links to come</small></span><a href="/academy/login">Academy / learning platform <ArrowUpRight size={16} aria-hidden="true" /></a></nav>
      </div>
      <div className="sapiens-footer-bottom"><span>© {new Date().getFullYear()} Project Sapiens, Inc.</span><span>Built for what’s next.</span><a href="#">Back to top <ArrowUp size={16} aria-hidden="true" /></a></div>
    </div>
  </footer>;
}
