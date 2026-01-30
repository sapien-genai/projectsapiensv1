import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface UsageStatus {
  plan: 'free' | 'pro';
  limit: number;
  used: number;
  remaining: number;
  resets_at: string;
}

interface BillingContextType {
  usageStatus: UsageStatus | null;
  loading: boolean;
  error: string | null;
  refreshUsageStatus: () => Promise<void>;
  isAtLimit: boolean;
  percentUsed: number;
  checkoutLoading: boolean;
  checkoutError: string | null;
  startCheckout: () => Promise<void>;
  clearCheckoutError: () => void;
  portalLoading: boolean;
  portalError: string | null;
  startPortal: () => Promise<void>;
  clearPortalError: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const fetchUsageStatus = async () => {
    if (!user) {
      setUsageStatus(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-usage-status`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage status');
      }

      const data = await response.json();
      setUsageStatus(data);
    } catch (err) {
      console.error('Error fetching usage status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStatus();
  }, [user]);

  const startCheckout = async () => {
    if (!user) {
      setCheckoutError('You must be logged in to upgrade.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to start checkout');
      }

      const data = await response.json();
      if (!data?.url) {
        throw new Error('Checkout URL missing');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Error starting checkout:', err);
      setCheckoutError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const startPortal = async () => {
    if (!user) {
      setPortalError('You must be logged in to manage billing.');
      return;
    }

    setPortalLoading(true);
    setPortalError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to start billing portal');
      }

      const data = await response.json();
      if (!data?.url) {
        throw new Error('Billing portal URL missing');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Error starting billing portal:', err);
      setPortalError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const isAtLimit = usageStatus ? usageStatus.used >= usageStatus.limit : false;
  const percentUsed = usageStatus ? (usageStatus.used / usageStatus.limit) * 100 : 0;

  return (
    <BillingContext.Provider
      value={{
        usageStatus,
        loading,
        error,
        refreshUsageStatus: fetchUsageStatus,
        isAtLimit,
        percentUsed,
        checkoutLoading,
        checkoutError,
        startCheckout,
        clearCheckoutError: () => setCheckoutError(null),
        portalLoading,
        portalError,
        startPortal,
        clearPortalError: () => setPortalError(null),
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
