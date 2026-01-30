import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntitlements, FullEntitlement } from '../utils/entitlements';

export function useEntitlements() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<FullEntitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) {
      setEntitlements(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getEntitlements(user.id);
      setEntitlements(data);
    } catch (err) {
      console.error('Error loading entitlements:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entitlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  return {
    entitlements,
    loading,
    error,
    refresh,
    isPro: entitlements?.plan === 'pro',
    hasFeature: (feature: keyof FullEntitlement['features']) =>
      entitlements?.features[feature] === true,
  };
}
