import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BirdGlyph from './flock/BirdGlyph';

export default function CompanyHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({data}) => { if (active) setSignedIn(!!data.session); });
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return <header className="sp-header">
    <a className="sp-brand" href="/" aria-label="Project Sapiens home"><img src="/brand/project-sapiens-wordmark.png" width="250" height="100" alt="Project Sapiens" /></a>
    <button type="button" className="sp-menu-toggle" aria-expanded={open} aria-controls="company-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    <nav id="company-navigation" aria-label="Main navigation" className={open ? 'sp-nav sp-nav-open' : 'sp-nav'}>
      <a href="/#solutions" onClick={() => setOpen(false)}>Solutions</a><a href="/ai-visibility/">AI Visibility</a><a href="/#work" onClick={() => setOpen(false)}>Our work</a><a href="/about/" onClick={() => setOpen(false)}>About</a><a href="/field-notes/" onClick={() => setOpen(false)}>Field Notes</a><a href="/work-with-us/">Work with us</a><a href="/ai-visibility/dashboard/" className="sp-account-link">{signedIn ? "My workspace" : "Sign in"}</a><a className="sp-contact-link group" href="/#contact" onClick={() => setOpen(false)}>Let’s talk <BirdGlyph className="h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-1 group-hover:-translate-y-1" /></a>
    </nav>
  </header>;
}
