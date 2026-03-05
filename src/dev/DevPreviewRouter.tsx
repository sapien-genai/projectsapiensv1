import { ReactNode, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BillingContext } from '../contexts/BillingContext';
import { MOCK_USER, MOCK_USAGE_STATUS } from './mockData';
import PricingSection from '../components/PricingSection';
import PaymentSuccessPage from '../components/PaymentSuccessPage';
import BillingCancelPage from '../components/BillingCancelPage';
import Dashboard from '../components/Dashboard';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const DEV_ROUTES: Record<string, string> = {
  '/dev/pricing-preview': 'pricing',
  '/dev/checkout-success-preview': 'checkout-success',
  '/dev/checkout-cancel-preview': 'checkout-cancel',
  '/dev/pro-dashboard-preview': 'pro-dashboard',
};

function MockAuthProvider({ children, authenticated }: { children: ReactNode; authenticated: boolean }) {
  return (
    <AuthContext.Provider
      value={{
        user: authenticated ? MOCK_USER : null,
        loading: false,
        signUp: async () => ({ error: null }),
        signIn: async () => ({ error: null }),
        signOut: async () => {},
      } as any}
    >
      {children}
    </AuthContext.Provider>
  );
}

function MockBillingProvider({
  children,
  plan,
}: {
  children: ReactNode;
  plan: 'free' | 'pro';
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const usageStatus =
    plan === 'pro'
      ? MOCK_USAGE_STATUS
      : { plan: 'free' as const, limit: 10, used: 7, remaining: 3, resets_at: new Date(Date.now() + 86_400_000).toISOString() };

  const mockStartCheckout = async () => {
    setCheckoutLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setCheckoutLoading(false);
    alert('[DEV PREVIEW] Stripe checkout would open here.');
  };

  return (
    <BillingContext.Provider
      value={{
        usageStatus,
        loading: false,
        error: null,
        refreshUsageStatus: async () => {},
        isAtLimit: usageStatus.used >= usageStatus.limit,
        percentUsed: (usageStatus.used / usageStatus.limit) * 100,
        checkoutLoading,
        checkoutError: null,
        startCheckout: mockStartCheckout,
        clearCheckoutError: () => {},
        portalLoading: false,
        portalError: null,
        startPortal: async () => {
          alert('[DEV PREVIEW] Stripe customer portal would open here.');
        },
        clearPortalError: () => {},
      } as any}
    >
      {children}
    </BillingContext.Provider>
  );
}

function DevBanner({ route }: { route: string }) {
  const labels: Record<string, string> = {
    pricing: 'Pricing Section — Free User View',
    'checkout-success': 'Payment Success Page',
    'checkout-cancel': 'Payment Cancel Page',
    'pro-dashboard': 'Dashboard — Pro User (120 sessions, 5 labs)',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 py-2 bg-[#1C1A17] text-[#F4A261] text-xs font-mono border-b border-[#F4A261]/30 select-none">
      <span className="font-bold tracking-widest uppercase">DEV PREVIEW</span>
      <span className="opacity-70">{labels[route] ?? route}</span>
      <span className="opacity-50">import.meta.env.DEV — not visible in production</span>
    </div>
  );
}

function PricingPreview() {
  return (
    <MockAuthProvider authenticated={true}>
      <MockBillingProvider plan="free">
        <div className="min-h-screen bg-[#F8F5F2]">
          <Navigation
            onAuthClick={() => {}}
            onPathsClick={() => {}}
            onLabsClick={() => {}}
            onPricingClick={() => {}}
            onCommunityClick={() => {}}
            onHelpClick={() => {}}
          />
          <div className="pt-20">
            <PricingSection onGetStarted={() => {}} />
          </div>
          <Footer onTermsClick={() => {}} onPrivacyClick={() => {}} />
        </div>
      </MockBillingProvider>
    </MockAuthProvider>
  );
}

function CheckoutSuccessPreview() {
  return (
    <MockAuthProvider authenticated={true}>
      <MockBillingProvider plan="pro">
        <PaymentSuccessPage
          onGoToDashboard={() => {}}
          onGoToLabs={() => {}}
          onGoToPaths={() => {}}
          onGoToPrompts={() => {}}
        />
      </MockBillingProvider>
    </MockAuthProvider>
  );
}

function CheckoutCancelPreview() {
  return (
    <MockAuthProvider authenticated={true}>
      <MockBillingProvider plan="free">
        <BillingCancelPage
          onTryAgain={() => {}}
          onGoToDashboard={() => {}}
          onGoToHelp={() => {}}
        />
      </MockBillingProvider>
    </MockAuthProvider>
  );
}

function ProDashboardPreview() {
  return (
    <MockAuthProvider authenticated={true}>
      <MockBillingProvider plan="pro">
        <Dashboard
          onLabsClick={() => {}}
          onNetworkClick={() => {}}
          onPromptsClick={() => {}}
          onBadgesClick={() => {}}
          onProfileClick={() => {}}
          onJournalClick={() => {}}
          onProjectsClick={() => {}}
          onCommandCenterClick={() => {}}
          onPathsListClick={() => {}}
          onAdminClick={() => {}}
          onBillingClick={() => {}}
          onHelpClick={() => {}}
          onPathSelect={() => {}}
          onLabSelect={() => {}}
        />
      </MockBillingProvider>
    </MockAuthProvider>
  );
}

const PREVIEW_COMPONENTS: Record<string, () => JSX.Element> = {
  pricing: PricingPreview,
  'checkout-success': CheckoutSuccessPreview,
  'checkout-cancel': CheckoutCancelPreview,
  'pro-dashboard': ProDashboardPreview,
};

export default function DevPreviewRouter() {
  if (!import.meta.env.DEV) return null;

  const routeKey = DEV_ROUTES[window.location.pathname];
  if (!routeKey) return null;

  const PreviewComponent = PREVIEW_COMPONENTS[routeKey];
  if (!PreviewComponent) return null;

  return (
    <div>
      <DevBanner route={routeKey} />
      <div className="pt-8">
        <PreviewComponent />
      </div>
    </div>
  );
}
