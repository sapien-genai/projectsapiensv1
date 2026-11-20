import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      <a href="/ai-visibility/" onClick={() => setOpen(false)}>AI Visibility</a>
      <a href="/ai-solutions/" onClick={() => setOpen(false)}>AI Solutions</a>
      <a href="/#work" onClick={() => setOpen(false)}>Our Work</a>
      <a href="/about/" onClick={() => setOpen(false)}>About</a>
      <a href="/field-notes/" onClick={() => setOpen(false)}>Field Notes</a>
      <a href="/ai-visibility/dashboard/" className="sp-account-link" onClick={() => setOpen(false)}>{signedIn ? 'My workspace' : 'Sign in'}</a>
      <a className="sp-contact-link" href="/ai-visibility/#instant-report" onClick={() => setOpen(false)}>Get your free AI report</a>
    </nav>
  </header>;
}
