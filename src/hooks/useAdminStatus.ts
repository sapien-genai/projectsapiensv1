import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error?: string;
}

/**
 * Reusable hook that reports whether the current user is an admin.
 *
 * - Waits for the Supabase session to be available before checking.
 * - Uses the `is_admin(user_uuid uuid)` SECURITY DEFINER RPC (safe under RLS).
 * - Subscribes to auth state changes so the status updates on login/logout.
 * - Guards against race conditions with a cancellation flag and a request
 *   sequence counter (a stale response can never overwrite a newer one).
 */
export function useAdminStatus(): AdminStatus {
  const [status, setStatus] = useState<AdminStatus>({ isAdmin: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    let requestSeq = 0;

    const resolveStatus = async (userId: string | undefined) => {
      const seq = ++requestSeq;

      const apply = (next: AdminStatus) => {
        if (!cancelled && seq === requestSeq) {
          setStatus(next);
          if (import.meta.env.DEV) {
            console.log('[admin] status', { isAdmin: next.isAdmin, error: next.error });
          }
        }
      };

      if (!userId) {
        apply({ isAdmin: false, loading: false });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', { user_uuid: userId });

        if (error) {
          apply({ isAdmin: false, loading: false, error: error.message });
        } else {
          apply({ isAdmin: Boolean(data), loading: false });
        }
      } catch (err) {
        apply({
          isAdmin: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to check admin status',
        });
      }
    };

    // Initial check: wait for the session to be hydrated first.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        void resolveStatus(session?.user?.id);
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus({
            isAdmin: false,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to get session',
          });
        }
      });

    // Re-check whenever auth state changes (login, logout, token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus((prev) => (prev.loading ? prev : { ...prev, loading: true }));
      void resolveStatus(session?.user?.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return status;
}
