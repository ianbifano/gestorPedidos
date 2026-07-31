import { supabase } from '@/constants/supabase';
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type UserRole = 'cliente' | 'dueno';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: UserRole;
  isDueno: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('cliente');

  const fetchRole = useCallback(async (authEmail: string) => {
    try {
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', authEmail)
        .maybeSingle();

      if (userErr || !userData) {
        setRole('cliente');
        return;
      }

      const { data: roles, error: rolesErr } = await supabase
        .from('users_x_comercios')
        .select('rol')
        .eq('user_id', userData.user_id);

      if (rolesErr) throw rolesErr;

      const isDueno = roles?.some((r) => r.rol === 'dueno') ?? false;
      setRole(isDueno ? 'dueno' : 'cliente');
    } catch {
      setRole('cliente');
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (session?.user?.email) {
      await fetchRole(session.user.email);
    }
  }, [session?.user, fetchRole]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setLoading(false);
        if (data.session?.user?.email) {
          fetchRole(data.session.user.email);
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (nextSession?.user?.email) {
        fetchRole(nextSession.user.email);
      } else {
        setRole('cliente');
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchRole]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    role,
    isDueno: role === 'dueno',
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
    },
    signUp: async (username: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) throw error;

      return {
        needsEmailConfirmation: !data.session,
      };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    refreshRole,
  }), [loading, session, role, refreshRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
