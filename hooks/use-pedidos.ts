import { getSupabaseErrorMessage, supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePedidoInput, EstadoPedido, Pedido, UpdatePedidoInput } from '@/types/pedido';
import { useCallback, useEffect, useState } from 'react';

export function usePedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async (estado?: EstadoPedido) => {
    if (!user) {
      setPedidos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          cliente:cliente_id (nombre, telefono)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setPedidos(data || []);
    } catch (err) {
      setError(getSupabaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPedido = async (input: CreatePedidoInput) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para crear pedidos');
      }

      const { data, error: err } = await supabase
        .from('pedidos')
        .insert([
          {
            user_id: user.id,
            cliente_id: input.cliente_id,
            descripcion: input.descripcion,
            monto: input.monto,
            estado: 'Pendiente',
          },
        ])
        .select(
          `
          *,
          cliente:cliente_id (nombre, telefono)
        `
        )
        .single();

      if (err) throw err;
      setPedidos((currentPedidos) => [data, ...currentPedidos]);
      return data;
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al crear pedido');
      setError(msg);
      throw err;
    }
  };

  const updatePedido = async (id: number, input: UpdatePedidoInput) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para actualizar pedidos');
      }

      const { data, error: err } = await supabase
        .from('pedidos')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(
          `
          *,
          cliente:cliente_id (nombre, telefono)
        `
        )
        .single();

      if (err) throw err;
      setPedidos(
        (currentPedidos) => currentPedidos.map((p) => (p.id === id ? data : p))
      );
      return data;
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al actualizar pedido');
      setError(msg);
      throw err;
    }
  };

  const deletePedido = async (id: number) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para eliminar pedidos');
      }

      const { error: err } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) throw err;
      setPedidos((currentPedidos) => currentPedidos.filter((p) => p.id !== id));
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al eliminar pedido');
      setError(msg);
      throw err;
    }
  };

  const resumenPorEstado = (estado: EstadoPedido) => {
    return pedidos.filter((p) => p.estado === estado).length;
  };

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return {
    pedidos,
    loading,
    error,
    fetchPedidos,
    createPedido,
    updatePedido,
    deletePedido,
    resumenPorEstado,
  };
}
