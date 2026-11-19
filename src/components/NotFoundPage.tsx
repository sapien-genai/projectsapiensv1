import { useEffect } from 'react';
import CompanyHeader from './CompanyHeader';
import CompanyFooter from './CompanyFooter';
import Flock from './flock/Flock';
import './CompanyHome.css';
import './CompanyPreview.css';

const links = [['/', 'Home'], ['/ai-visibility/', 'AI brand visibility'], ['/work-with-us/', 'Work with us'], ['/field-notes/', 'Field Notes']] as const;

/** Shown for addresses that belong to neither the company site nor the learning platform. */
export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found — Project Sapiens';
    // The host answers every unknown address with 200, so ask search engines not to index this one.
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);
  return <div className="company-site min-h-screen bg-[#f4f2ec] text-[#172820]">
    <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
    <CompanyHeader />
    <main id="main" className="mx-auto max-w-6xl px-6 md:px-10"><div className="grid items-center gap-10 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]">404 / Page not found</p>
        <h1 className="mt-7 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl">One bird left the flock.</h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#526055]">There is no page at this address. It may have moved, or the link may be mistyped.</p>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">{links.map(([href, label]) => <li key={href}><a href={href} className="font-semibold underline underline-offset-4">{label}</a></li>)}</ul>
      </div>
      {/* A single bird, wandering on its own. */}
      <Flock formation="cluster" count={1} cohesion={0} size={16} className="h-56 w-full" />
    </div></main>
    <CompanyFooter />
  </div>;
}
