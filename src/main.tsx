import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Company pages are pre-rendered at build time (scripts/build-share-pages.ts).
// Hydrate only when the markup on the page is for the route being shown;
// anything else (academy routes, payment callbacks) renders from scratch.
const path = window.location.pathname.replace(/\/+$/, '') || '/';
const payment = new URLSearchParams(window.location.search).get('payment');
if (root.dataset.prerendered === path && payment !== 'success' && payment !== 'cancel') {
  hydrateRoot(root, app);
} else {
  root.removeAttribute('data-prerendered');
  createRoot(root).render(app);
}
