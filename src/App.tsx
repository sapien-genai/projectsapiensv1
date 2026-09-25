import { lazy, Suspense } from 'react';
import CompanyHome from './components/CompanyHome';

const AcademyApp = lazy(() => import('./AcademyApp'));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const payment = new URLSearchParams(window.location.search).get('payment');
  // Keep existing payment callbacks and all academy deep links on the original app.
  if (path === '/' && payment !== 'success' && payment !== 'cancel') {
    return <CompanyHome />;
  }
  return <Suspense fallback={<div className="min-h-screen bg-surface p-8">Loading learning platform…</div>}><AcademyApp /></Suspense>;
}
