import CompanyFooter from './CompanyFooter';
import { lazy, Suspense, useEffect } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import CompanyHeader from './CompanyHeader';
import { FIELD_NOTES } from '../data/fieldNotes';
import './CompanyHome.css';
import './CompanyPreview.css';
import './FieldNotes.css';

const articles = {
  'the-nuclear-lesson': lazy(() => import('./FieldNotesArticles/NuclearLesson')),
  'attention-is-all-you-need': lazy(() => import('./FieldNotesArticles/AttentionIsAllYouNeed')),
  'hotline-broadcast-deep-dive': lazy(() => import('./FieldNotesArticles/HotlineBroadcastDeepDive')),
  'infrastructure-era': lazy(() => import('./FieldNotesArticles/InfrastructureEra')),
  'ai-brand-visibility': lazy(() => import('./FieldNotesArticles/AiBrandVisibility')),
  'pronunciation-intelligence': lazy(() => import('./FieldNotesArticles/PronunciationIntelligence')),
};

export default function FieldNotesPage({ slug }: { slug?: string }) {
  const note = FIELD_NOTES.find(item => item.href === `/field-notes/${slug}`);
  const Article = slug ? articles[slug as keyof typeof articles] : undefined;
  useEffect(() => {
    document.title = `${note ? note.title : slug ? 'Note not found' : 'Field Notes'} — Project Sapiens`;
    const meta = document.querySelector('meta[name="description"]');
    const oldDescription = meta?.getAttribute('content') ?? '';
    meta?.setAttribute('content', note?.excerpt ?? 'Field Notes by Tony Marks. Observations on AI, product design, voice, and the work of building useful technology.');
    return () => { meta?.setAttribute('content', oldDescription); };
  }, [note, slug]);
  if (Article) return <><a className="fn-skip" href="#main">Skip to article</a><Suspense fallback={<div className="company-site fn-loading" role="status">Loading Field Note…</div>}><Article /></Suspense><NotesFooter /></>;
  if (slug) return <div className="company-site fn-index"><CompanyHeader /><main className="fn-shell fn-intro"><p className="fn-kicker">Field Notes</p><h1>That note isn’t here.</h1><p>Explore the collection for more on AI, product design, and building.</p><a className="fn-button" href="/field-notes/">All Field Notes <ArrowRight size={18}/></a></main><NotesFooter /></div>;
  const [featured, ...rest] = FIELD_NOTES;
  return <div className="company-site fn-index">
    <a className="fn-skip" href="#main">Skip to content</a><CompanyHeader />
    <main id="main" className="fn-shell">
      <section className="fn-intro"><p className="fn-kicker">Field Notes / Project Sapiens</p><h1>Thinking<br />in public<span>.</span></h1><div className="fn-intro-bottom"><p>Observations from building at the edge of AI. On the technology, the human details, and what happens when ideas meet the real world.</p><span>By Tony Marks<br />Founder, Project Sapiens</span></div></section>
      <section aria-label="Latest Field Note" className="fn-feature"><a href={`${featured.href}/`} className="fn-feature-art" aria-label={`Read ${featured.title}`}><img src="/field-notes/the-nuclear-lesson/trinity-test-1945.jpg" alt="Historical photograph of the Trinity test in 1945" /><span>No. {featured.number} / Latest Field Note</span></a><div className="fn-feature-copy"><p className="fn-kicker">{featured.category}</p><a href={`${featured.href}/`}><h2>{featured.title}</h2></a><p>{featured.excerpt}</p><div className="fn-meta">{featured.date} <span>{featured.readTime}</span></div><a className="fn-read" href={`${featured.href}/`}>Read the note <ArrowUpRight size={22}/></a></div></section>
      <section className="fn-collection" aria-labelledby="collection-title"><div className="fn-collection-head"><h2 id="collection-title">More from the field.</h2><span>01—05 / The collection</span></div>{rest.map(item => <a className="fn-row" href={`${item.href}/`} key={item.number}><span className="fn-number">{item.number}</span><div><p className="fn-kicker">{item.category}</p><h3>{item.title}</h3><p className="fn-excerpt">{item.excerpt}</p><div className="fn-meta">{item.date} · {item.readTime}</div></div><ArrowUpRight className="fn-row-arrow" size={30}/></a>)}</section>
      <section className="fn-closing"><p className="fn-kicker">From thinking to making</p><h2>Something worth<br />building together?</h2><a className="fn-button" href="/#contact">Let’s talk <ArrowUpRight size={20}/></a></section>
    </main><NotesFooter />
  </div>;
}
function NotesFooter() { return <CompanyFooter />; }
