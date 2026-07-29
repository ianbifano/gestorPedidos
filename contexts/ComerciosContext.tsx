import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Comercio } from '@/types/comercio';

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  return fallback;
}

type ComerciosContextValue = {
  comercios: Comercio[];
  loading: boolean;
  error: string | null;
  fetchComercios: () => Promise<void>;
  createComercio: (nombre: string) => Promise<Comercio>;
  updateComercio: (id: number, nombre: string) => Promise<Comercio>;
  deleteComercio: (id: number) => Promise<void>;
};

const ComerciosContext = createContext<ComerciosContextValue | null>(null);

async function ensureUserId(email: string): Promise<number | null> {
  console.log('[ENSURE_USER_ID] START with email:', email);
  try {
    if (!email) {
      console.error('[ENSURE_USER_ID] no email provided');
      return null;
    }

    console.log('[ENSURE_USER_ID] searching users table for:', email);
    const { data: existing, error: findErr } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    console.log('[ENSURE_USER_ID] find result:', existing, 'error:', JSON.stringify(findErr));

    if (findErr) {
      console.error('[ENSURE_USER_ID] SELECT error (will try INSERT anyway):', JSON.stringify(findErr));
    } else if (existing?.user_id) {
      console.log('[ENSURE_USER_ID] existing user found, user_id:', existing.user_id);
      return existing.user_id;
    }

    const insertPayload = {
      username: email.split('@')[0],
      email: email,
      password: 'managed_by_supabase_auth',
    };
    console.log('[ENSURE_USER_ID] inserting new user with:', JSON.stringify(insertPayload));
    const { data: nuevo, error: insertErr } = await supabase
      .from('users')
      .insert([insertPayload])
      .select('user_id')
      .single();

    console.log('[ENSURE_USER_ID] insert result:', nuevo, 'error:', JSON.stringify(insertErr));

    if (insertErr) {
      console.error('[ENSURE_USER_ID] INSERT error:', JSON.stringify(insertErr));

      // If RLS blocks both SELECT and INSERT, the user needs to run
      // scripts/fix-users-rls.sql in Supabase SQL Editor
      return null;
    }
    console.log('[ENSURE_USER_ID] new user_id:', nuevo?.user_id);
    return nuevo?.user_id ?? null;
  } catch (err) {
    console.error('[ENSURE_USER_ID] UNEXPECTED ERROR:', err);
    return null;
  }
}

export function ComerciosProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComercios = useCallback(async () => {
    console.log('[FETCH_COMERCIOS] START, user email:', user?.email);
    try {
      setLoading(true);
      setError(null);
      const email = user?.email;
      if (!email) {
        console.log('[FETCH_COMERCIOS] no email, clearing');
        setComercios([]);
        return;
      }
      const userId = await ensureUserId(email);
      console.log('[FETCH_COMERCIOS] userId resolved:', userId);
      if (!userId) {
        console.log('[FETCH_COMERCIOS] no userId, clearing');
        setComercios([]);
        return;
      }
      const { data: vinculos, error: vinculosErr } = await supabase
        .from('users_x_comercios')
        .select('comercio_id')
        .eq('user_id', userId);
      console.log('[FETCH_COMERCIOS] vinculos:', vinculos, 'error:', JSON.stringify(vinculosErr));
      if (vinculosErr) throw vinculosErr;
      const ids = (vinculos ?? []).map((v) => v.comercio_id).filter(Boolean);
      console.log('[FETCH_COMERCIOS] comercio_ids from vinculos:', ids);
      if (ids.length === 0) {
        console.log('[FETCH_COMERCIOS] no comercios linked');
        setComercios([]);
        return;
      }
      const { data, error: err } = await supabase
        .from('comercios')
        .select('*')
        .in('id', ids)
        .order('nombre', { ascending: true });
      console.log('[FETCH_COMERCIOS] comercios fetched:', data, 'error:', err);
      if (err) throw err;
      setComercios(data || []);
    } catch (err) {
      console.error('[FETCH_COMERCIOS] ERROR:', err);
      setError(getErrorMessage(err, 'Error desconocido'));
    } finally {
      setLoading(false);
      console.log('[FETCH_COMERCIOS] END');
    }
  }, [user?.email]);

  const createComercio = useCallback(async (nombre: string) => {
    const email = user?.email;
    console.log('[CREATE_COMERCIO] START, nombre:', nombre, 'user email:', email);
    try {
      setError(null);

      if (!email) {
        console.error('[CREATE_COMERCIO] no user email');
        throw new Error('No se pudo identificar tu cuenta. Asegurate de haber iniciado sesión.');
      }

      console.log('[CREATE_COMERCIO] inserting into comercios with nombre:', nombre);
      const { data, error: err } = await supabase
        .from('comercios')
        .insert([{ nombre }])
        .select()
        .single();
      console.log('[CREATE_COMERCIO] insert result:', data, 'error:', err);

      if (err) {
        console.error('[CREATE_COMERCIO] SUPABASE INSERT ERROR:', JSON.stringify(err));
        throw err;
      }

      console.log('[CREATE_COMERCIO] resolving user ID for email:', email);
      const userId = await ensureUserId(email);
      console.log('[CREATE_COMERCIO] userId resolved:', userId, 'comercioId:', data?.id);

      if (!userId) {
        console.error('[CREATE_COMERCIO] could not resolve userId');
        throw new Error('No se pudo vincular tu cuenta. Probá cerrar sesión y volver a iniciarla.');
      }

      console.log('[CREATE_COMERCIO] inserting vinculo user_x_comercios:', { user_id: userId, comercio_id: data.id, rol: 'dueno' });
      const { error: vinculoErr } = await supabase
        .from('users_x_comercios')
        .insert([{ user_id: userId, comercio_id: data.id, rol: 'dueno' }]);
      console.log('[CREATE_COMERCIO] vinculo result, error:', vinculoErr);

      if (vinculoErr) {
        console.error('[CREATE_COMERCIO] VINCULO INSERT ERROR:', JSON.stringify(vinculoErr));
        throw vinculoErr;
      }

      console.log('[CREATE_COMERCIO] updating state optimistically');
      setComercios(prev => [...prev, data]);

      console.log('[CREATE_COMERCIO] forcing fetch to sync with DB');
      try {
        await fetchComercios();
      } catch (fetchErr) {
        console.warn('[CREATE_COMERCIO] fetch after create failed (non-fatal):', fetchErr);
      }

      console.log('[CREATE_COMERCIO] SUCCESS');
      return data;
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al crear comercio');
      console.error('[CREATE_COMERCIO] FINAL ERROR:', msg);
      if (err && typeof err === 'object') {
        console.error('[CREATE_COMERCIO] ERROR DETAIL:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      }
      setError(msg);
      throw new Error(msg);
    }
  }, [fetchComercios, user?.email]);

  const updateComercio = async (id: number, nombre: string) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('comercios')
        .update({ nombre })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setComercios(prev => prev.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al actualizar comercio');
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteComercio = async (id: number) => {
    try {
      setError(null);

      await supabase
        .from('users_x_comercios')
        .delete()
        .eq('comercio_id', id);

      const { error: err } = await supabase
        .from('comercios')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setComercios(prev => prev.filter((c) => c.id !== id));
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al eliminar comercio');
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchComercios();
  }, []);

  const value = useMemo(() => ({
    comercios, loading, error, fetchComercios, createComercio, updateComercio, deleteComercio,
  }), [comercios, loading, error, fetchComercios, createComercio]);

  return (
    <ComerciosContext.Provider value={value}>
      {children}
    </ComerciosContext.Provider>
  );
}

export function useComerciosContext() {
  const ctx = useContext(ComerciosContext);
  if (!ctx) throw new Error('useComerciosContext must be used within a ComerciosProvider');
  return ctx;
}
