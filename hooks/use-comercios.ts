import { supabase } from '@/constants/supabase';
import { Comercio } from '@/types/comercio';
import { useEffect, useState } from 'react';

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  return fallback;
}

export function useComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComercios = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('comercios')
        .select('*')
        .order('nombre', { ascending: true });

      if (err) throw err;
      setComercios(data || []);
    } catch (err) {
      console.log('FETCH COMERCIOS ERROR:', err);
      setError(getErrorMessage(err, 'Error desconocido'));
    } finally {
      setLoading(false);
    }
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
