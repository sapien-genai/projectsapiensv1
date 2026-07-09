import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CURRENT_TOS_VERSION } from '../lib/tos';
import { logError, getErrorMessage } from '../utils/errorHandling';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        logError(error, 'AuthContext - getSession');
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        setUser(session?.user ?? null);
      } catch (error) {
        logError(error, 'AuthContext - onAuthStateChange');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (!error && data.user) {
      // Create user profile - this must succeed for the user to proceed
      const { error: profileError } = await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        username,
        email,
        fluency_level: 1,
        xp: 0,
      });

      if (profileError) {
        logError(profileError, 'AuthContext - signUp profile creation');
        await supabase.auth.signOut();

        const errorInfo = getErrorMessage(profileError);
        return {
          error: {
            message: errorInfo.message || 'Failed to complete registration. Please try again.',
            name: 'ProfileCreationError',
            status: 500
          } as any
        };
      }

      // Record explicit ToS acceptance (the checkbox is required on the
      // signup form). Non-fatal: if this insert fails, the in-app
      // acceptance gate will prompt the user again on their next visit.
      const { error: tosError } = await supabase.from('tos_acceptances').insert({
        user_id: data.user.id,
        tos_version: CURRENT_TOS_VERSION,
      });

      if (tosError) {
        logError(tosError, 'AuthContext - signUp ToS acceptance');
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
