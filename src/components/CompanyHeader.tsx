import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export default function CompanyHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sp-header">
    <a className="sp-brand" href="/" aria-label="Project Sapiens home"><img src="/brand/project-sapiens-wordmark.png" width="250" height="100" alt="Project Sapiens" /></a>
    <button type="button" className="sp-menu-toggle" aria-expanded={open} aria-controls="company-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    <nav id="company-navigation" aria-label="Main navigation" className={open ? 'sp-nav sp-nav-open' : 'sp-nav'}>
      <a href="/#solutions" onClick={() => setOpen(false)}>Solutions</a><a href="/#work" onClick={() => setOpen(false)}>Our work</a><a href="/about/" onClick={() => setOpen(false)}>About</a><a href="/field-notes/" onClick={() => setOpen(false)}>Field Notes</a><a href="/work-with-us/">Work with us</a><a className="sp-contact-link" href="/#contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={18} aria-hidden="true" /></a>
    </nav>
  </header>;
}
