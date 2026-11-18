import { lazy, Suspense } from 'react';
import CompanyHome from './components/CompanyHome';
import WorkWithUsPage from './components/WorkWithUsPage';
import AiVisibilityPage from './components/AiVisibilityPage';

const CompanyLegalPage = lazy(() => import('./components/CompanyLegalPage'));
const PartnerNetworkPage = lazy(() => import('./components/PartnerNetworkPage'));
const AboutPage = lazy(() => import('./components/CompanyAboutPage'));
const FieldNotesPage = lazy(() => import('./components/FieldNotesPage'));

const AcademyApp = lazy(() => import('./AcademyApp'));

/** `path` is supplied by the build-time pre-renderer; in the browser it comes from the address bar. */
export default function App({ path: fixedPath }: { path?: string }) {
  const path = (fixedPath ?? window.location.pathname).replace(/\/+$/, '') || '/';
  const payment = fixedPath === undefined ? new URLSearchParams(window.location.search).get('payment') : null;
  // Keep existing payment callbacks and all academy deep links on the original app.
  if (path === '/' && payment !== 'success' && payment !== 'cancel') {
    return <CompanyHome />;
  }
  if (path === '/field-notes' || path.startsWith('/field-notes/')) return <Suspense fallback={<div role="status" className="p-8">Loading Field Notes…</div>}><FieldNotesPage slug={path.slice('/field-notes/'.length) || undefined} /></Suspense>;
  if (path === '/openai-partner-network') return <Suspense fallback={<div role="status" className="p-8">Loading partner information…</div>}><PartnerNetworkPage /></Suspense>;
  if (path === '/about') return <Suspense fallback={<div role="status" className="p-8">Loading About Project Sapiens…</div>}><AboutPage /></Suspense>;
  if (path === '/terms' || path === '/privacy') return <Suspense fallback={<div role="status" className="p-8">Loading…</div>}><CompanyLegalPage kind={path === '/terms' ? 'terms' : 'privacy'} /></Suspense>;
  if (path === '/work-with-us') return <WorkWithUsPage />;
  if (path === '/ai-visibility') return <AiVisibilityPage />;
  return <Suspense fallback={<div className="min-h-screen bg-surface p-8">Loading learning platform…</div>}><AcademyApp /></Suspense>;
}
