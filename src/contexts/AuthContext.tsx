import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return {
        error: {
          message: 'Username must be at least 3 characters.',
          name: 'ValidationError',
          status: 400,
        } as AuthError,
      };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return {
        error: {
          message: 'Username can only contain letters, numbers, and underscores.',
          name: 'ValidationError',
          status: 400,
        } as AuthError,
      };
    }
    if (password.length < 6) {
      return {
        error: {
          message: 'Password must be at least 6 characters.',
          name: 'ValidationError',
          status: 400,
        } as AuthError,
      };
    }

    // Pre-check username availability to avoid creating an orphaned auth user
    const { data: existing, error: checkError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (checkError) {
      logError(checkError, 'AuthContext - signUp username check');
    }
    if (existing) {
      return {
        error: {
          message: 'That username is already taken. Please choose another.',
          name: 'UsernameTakenError',
          status: 409,
        } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { username: cleanUsername },
      },
    });

    if (error) return { error };
    if (!data.user) {
      return {
        error: {
          message: 'Signup failed. Please try again.',
          name: 'SignupError',
          status: 500,
        } as AuthError,
      };
    }

    // Create the user profile. A concurrent signup could have claimed the
    // username between our pre-check and now, so still handle that case.
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: data.user.id,
      username: cleanUsername,
      email: cleanEmail,
      fluency_level: 1,
      xp: 0,
    });

    if (profileError) {
      logError(profileError, 'AuthContext - signUp profile creation');
      await supabase.auth.signOut();

      const isDuplicate =
        typeof profileError.code === 'string' && profileError.code === '23505';
      const errorInfo = getErrorMessage(profileError);

      return {
        error: {
          message: isDuplicate
            ? 'That username was just taken. Please try another.'
            : errorInfo.message || 'Failed to complete registration. Please try again.',
          name: 'ProfileCreationError',
          status: isDuplicate ? 409 : 500,
        } as AuthError,
      };
    }

    return { error: null };
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
