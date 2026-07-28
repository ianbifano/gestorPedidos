import { supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Comercio } from '@/types/comercio';
import { useCallback, useEffect, useState } from 'react';

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  return fallback;
}

export function useComercios() {
  const { user } = useAuth();
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComercios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await getUserId();
      console.log('[COMERCIOS] getUserId:', userId);

      if (!userId) {
        setComercios([]);
        return;
      }

      const { data: vinculos, error: vinculosErr } = await supabase
        .from('users_x_comercios')
        .select('comercio_id')
        .eq('user_id', userId);

      console.log('[COMERCIOS] vinculos:', vinculos, 'error:', vinculosErr);

      if (vinculosErr) throw vinculosErr;

      const ids = (vinculos ?? []).map((v) => v.comercio_id).filter(Boolean);
      console.log('[COMERCIOS] ids:', ids);

      if (ids.length === 0) {
        setComercios([]);
        return;
      }

      const { data, error: err } = await supabase
        .from('comercios')
        .select('*')
        .in('id', ids)
        .order('nombre', { ascending: true });

      console.log('[COMERCIOS] comercios:', data, 'error:', err);

      if (err) throw err;
      setComercios(data || []);
    } catch (err) {
      console.log('[COMERCIOS] FETCH ERROR:', err);
      setError(getErrorMessage(err, 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserId = async (): Promise<number | null> => {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;
    console.log('[COMERCIOS] getUserId email:', email);

    if (!email) return null;

    const { data, error: findErr } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    console.log('[COMERCIOS] getUserId found:', data, 'error:', findErr);

    if (data?.user_id) return data.user_id;

    const { data: nuevo, error } = await supabase
      .from('users')
      .insert([{
        username: authData.user.user_metadata?.username || email.split('@')[0],
        email,
        password: 'managed_by_supabase_auth',
      }])
      .select('user_id')
      .single();

    console.log('[COMERCIOS] getUserId created:', nuevo, 'error:', error);

    if (error) return null;
    return nuevo?.user_id ?? null;
  };

  const createComercio = async (nombre: string) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('comercios')
        .insert([{ nombre }])
        .select()
        .single();

      if (err) throw err;

      const userId = await getUserId();
      console.log('[COMERCIOS] createComercio userId:', userId, 'comercioId:', data?.id);

      if (userId && data) {
        const { error: vinculoErr } = await supabase
          .from('users_x_comercios')
          .insert([{ user_id: userId, comercio_id: data.id, rol: 'dueno' }]);

        console.log('[COMERCIOS] vinculo insert error:', vinculoErr);
        if (vinculoErr) throw vinculoErr;
      }

      setComercios([...comercios, data]);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al crear comercio');
      setError(msg);
      throw new Error(msg);
    }
  };

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
      setComercios(comercios.map((c) => (c.id === id ? data : c)));
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
      setComercios(comercios.filter((c) => c.id !== id));
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al eliminar comercio');
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchComercios();
  }, []);

  return { comercios, loading, error, fetchComercios, createComercio, updateComercio, deleteComercio };
}
