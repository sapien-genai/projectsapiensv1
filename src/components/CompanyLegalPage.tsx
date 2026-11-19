import { useEffect } from 'react';
import CompanyHeader from './CompanyHeader';
import CompanyFooter from './CompanyFooter';
import { companyLegal } from '../data/companyLegal';
import './CompanyPreview.css';
import './CompanyLegalPage.css';

export default function CompanyLegalPage({ kind }: { kind: keyof typeof companyLegal }) {
  const page = companyLegal[kind];
  useEffect(() => { document.title = `${page.title} — Project Sapiens`; }, [page.title]);
  return <div className="company-site ps-legal">
    <a className="sp-skip" href="#main">Skip to content</a><CompanyHeader />
    <main id="main" className="ps-legal-shell">
      <div className="ps-legal-intro"><p className="ps-legal-eyebrow">Project Sapiens / Trust & legal</p><h1>{page.title}</h1><p>{page.intro}</p><p className="ps-legal-date">Last updated: November 19, 2026</p>
      {import.meta.env.DEV && <p className="ps-legal-draft">Draft for review · Not published</p>}</div>
      <div className="ps-legal-layout"><nav aria-label="On this page"><p>On this page</p>{page.sections.map(([title],i)=><a key={title} href={`#section-${i+1}`}>{String(i+1).padStart(2,'0')} / {title}</a>)}<a className="ps-legal-other" href={kind === 'privacy' ? '/terms/' : '/privacy/'}>{kind === 'privacy' ? 'Terms of Service' : 'Privacy Policy'} →</a></nav>
      <article>{page.sections.map(([title, paragraphs],i)=><section key={title} id={`section-${i+1}`}><h2><span>{String(i+1).padStart(2,'0')}</span>{title}</h2>{paragraphs.map(text=><p key={text}>{text.split('tony@projectsapiens.xyz').map((part,j)=><span key={j}>{j>0 && <a href="mailto:tony@projectsapiens.xyz">tony@projectsapiens.xyz</a>}{part}</span>)}</p>)}</section>)}</article></div>
    </main><CompanyFooter />
  </div>;
}
