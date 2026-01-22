import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error?: string;
}

/**
 * Hook to check if the current user has admin privileges.
 * Uses the is_admin RPC function to verify admin status.
 * Automatically updates when auth state changes.
 */
export function useAdminStatus(): AdminStatus {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus() {
      try {
        setLoading(true);
        setError(undefined);

        // Wait for session to be available
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          setIsAdmin(false);
          setLoading(false);
          if (import.meta.env.DEV) {
            console.log('[admin] No session, user not admin');
          }
          return;
        }

        // Call the is_admin RPC function
        if (import.meta.env.DEV) {
          console.log('[admin] Calling is_admin RPC for user:', session.user.id);
        }

        const { data, error: rpcError } = await supabase.rpc('is_admin', {
          user_uuid: session.user.id,
        });

        if (cancelled) return;

        if (rpcError) {
          console.error('[admin] RPC Error:', rpcError);
          throw rpcError;
        }

        const adminStatus = Boolean(data);
        setIsAdmin(adminStatus);
        setLoading(false);

        if (import.meta.env.DEV) {
          console.log('[admin] RPC response:', { data, adminStatus, userId: session.user.id });
        }
      } catch (err: any) {
        if (cancelled) return;

        const errorMessage = err.message || 'Failed to check admin status';
        setError(errorMessage);
        setIsAdmin(false);
        setLoading(false);

        if (import.meta.env.DEV) {
          console.error('[admin] Error checking admin status:', err);
        }
      }
    }

    // Check admin status on mount
    checkAdminStatus();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log('[admin] Auth state changed:', event);
      }

      // Re-check admin status on sign in or token refresh
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setLoading(false);
        setError(undefined);
      }
    });

    // Cleanup
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading, error };
}
