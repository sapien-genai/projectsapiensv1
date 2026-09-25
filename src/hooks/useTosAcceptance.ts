import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CURRENT_TOS_VERSION } from '../lib/tos';

interface TosAcceptanceState {
  accepted: boolean;
  loading: boolean;
  error?: string;
}

interface TosAcceptance extends TosAcceptanceState {
  /** Records acceptance of the current ToS version for the signed-in user. */
  recordAcceptance: () => Promise<{ error: string | null }>;
}

/**
 * Reports whether the current user has accepted the current ToS version.
 *
 * - Waits for the Supabase session before checking.
 * - Subscribes to auth state changes (login/logout re-checks).
 * - Race-safe via cancellation flag + request sequence counter.
 * - Fails OPEN on unexpected errors (e.g. migration not applied yet) so a
 *   backend problem can't lock every user out of the app; the error is
 *   surfaced on the returned state and logged in dev.
 */
export function useTosAcceptance(): TosAcceptance {
  const [state, setState] = useState<TosAcceptanceState>({ accepted: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    let requestSeq = 0;
    let lastCheckedUserId: string | undefined;
    let hasChecked = false;

    const resolveAcceptance = async (userId: string | undefined) => {
      const seq = ++requestSeq;

      const apply = (next: TosAcceptanceState) => {
        if (!cancelled && seq === requestSeq) {
          setState(next);
          if (import.meta.env.DEV) {
            console.log('[tos] acceptance', { accepted: next.accepted, error: next.error });
          }
        }
      };

      if (!userId) {
        apply({ accepted: false, loading: false });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tos_acceptances')
          .select('id')
          .eq('user_id', userId)
          .eq('tos_version', CURRENT_TOS_VERSION)
          .maybeSingle();

        if (error) {
          // Fail open: never lock users out because the check itself broke.
          apply({ accepted: true, loading: false, error: error.message });
        } else {
          apply({ accepted: Boolean(data), loading: false });
        }
      } catch (err) {
        apply({
          accepted: true,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to check ToS acceptance',
        });
      }
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        lastCheckedUserId = session?.user?.id;
        hasChecked = true;
        void resolveAcceptance(lastCheckedUserId);
      })
      .catch(() => {
        if (!cancelled) {
          setState({ accepted: false, loading: false });
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Token refreshes don't change who is signed in — skip them so the
      // app doesn't flash its loading state mid-session.
      if (event === 'TOKEN_REFRESHED') return;

      const userId = session?.user?.id;
      if (hasChecked && userId === lastCheckedUserId) return;

      lastCheckedUserId = userId;
      hasChecked = true;
      setState((prev) => (prev.loading ? prev : { ...prev, loading: true }));
      void resolveAcceptance(userId);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const recordAcceptance = useCallback(async (): Promise<{ error: string | null }> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return { error: 'You must be signed in to accept the Terms of Service.' };
    }

    const { error } = await supabase.from('tos_acceptances').upsert(
      { user_id: userId, tos_version: CURRENT_TOS_VERSION },
      { onConflict: 'user_id,tos_version', ignoreDuplicates: true }
    );

    if (error) {
      return { error: error.message };
    }

    setState({ accepted: true, loading: false });
    return { error: null };
  }, []);

  return { ...state, recordAcceptance };
}
