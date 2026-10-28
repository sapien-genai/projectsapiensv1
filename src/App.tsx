import { lazy, Suspense } from 'react';
import CompanyHome from './components/CompanyHome';
import WorkWithUsPage from './components/WorkWithUsPage';

const AcademyApp = lazy(() => import('./AcademyApp'));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const payment = new URLSearchParams(window.location.search).get('payment');
  // Keep existing payment callbacks and all academy deep links on the original app.
  if (path === '/' && payment !== 'success' && payment !== 'cancel') {
    return <CompanyHome />;
  }
  if (path === '/work-with-us') return <WorkWithUsPage />;
  return <Suspense fallback={<div className="min-h-screen bg-surface p-8">Loading learning platform…</div>}><AcademyApp /></Suspense>;
}
