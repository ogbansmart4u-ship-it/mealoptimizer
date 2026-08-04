import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase, EMAIL_CONFIRMATION_REQUIRED } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasShownSessionExpiredToast = useRef(false);
  const userSignedOut = useRef(false);

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
      
      // If user was signed out (not by their own action), show a message
      if (event === 'SIGNED_OUT' && !userSignedOut.current && !hasShownSessionExpiredToast.current) {
        hasShownSessionExpiredToast.current = true;
        toast.error('Your session has expired. Please log in again.', {
          duration: 5000,
        });
      }
      
      // Reset the toast flag when user signs in
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        hasShownSessionExpiredToast.current = false;
        userSignedOut.current = false;
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove dependencies to prevent infinite loops

  const signIn = async (email: string, password: string) => {
    userSignedOut.current = false;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    console.log('Sign in successful:', data.user?.email);
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    userSignedOut.current = false;
    console.log('Attempting signup with:', { email, hasPassword: !!password, metadata });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
        emailRedirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    console.log('Sign up successful:', {
      email: data.user?.email,
      id: data.user?.id,
      confirmed: data.user?.email_confirmed_at,
      hasSession: !!data.session,
    });

    // No session means Supabase requires email confirmation before the user
    // can log in. Don't set the user — throw a sentinel so callers can show
    // the right message instead of silently appearing to succeed.
    if (!data.session) {
      throw new Error(EMAIL_CONFIRMATION_REQUIRED);
    }

    setUser(data.user);
  };

  const signInWithGoogle = async () => {
    userSignedOut.current = false;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
    
    console.log('Google OAuth initiated:', data);
  };

  const signInWithApple = async () => {
    userSignedOut.current = false;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
    
    console.log('Apple OAuth initiated:', data);
  };

  const signOut = async () => {
    userSignedOut.current = true;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInWithApple, signOut, resetPassword }}>
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