import { supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Cliente } from '@/types/cliente';
import { useCallback, useEffect, useState } from 'react';

const getMsg = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : (err as any)?.message ?? fallback;

export function useClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMisComercioIds = useCallback(async (): Promise<number[]> => {
    if (!user?.email) return [];
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', user.email)
        .limit(1)
        .maybeSingle();

      if (!userData?.user_id) return [];

      const { data: vinculos } = await supabase
        .from('users_x_comercios')
        .select('comercio_id')
        .eq('user_id', userData.user_id);

      return (vinculos ?? []).map((v) => v.comercio_id).filter(Boolean);
    } catch {
      return [];
    }
  }, [user?.email]);

  const fetchClientes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const comercioIds = await getMisComercioIds();
      if (comercioIds.length === 0) {
        setClientes([]);
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .select('*')
        .in('comercio_id', comercioIds)
        .order('nombre', { ascending: true });

      if (err) throw err;
      setClientes(data || []);
    } catch (err) {
      setError(getMsg(err, 'Error al cargar clientes'));
    } finally {
      setLoading(false);
    }
  }, [user, getMisComercioIds]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return { clientes, loading, error, refetch: fetchClientes };
}
