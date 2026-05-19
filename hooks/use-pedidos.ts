import { supabase } from '@/constants/supabase';
import { CreatePedidoInput, EstadoPedido, Pedido, UpdatePedidoInput } from '@/types/pedido';
import { useCallback, useEffect, useState } from 'react';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async (estado?: EstadoPedido) => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          cliente:cliente_id (nombre, telefono)
        `)
        .order('created_at', { ascending: false });

      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setPedidos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPedido = async (input: CreatePedidoInput) => {
    try {
      setError(null);
      const { data, error: err } = await supabase
        .from('pedidos')
        .insert([
          {
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
      setPedidos([data, ...pedidos]);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear pedido';
      setError(msg);
      throw err;
    }
  };

  const updatePedido = async (id: number, input: UpdatePedidoInput) => {
    try {
      setError(null);
      const { data, error: err } = await supabase
        .from('pedidos')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          cliente:cliente_id (nombre, telefono)
        `
        )
        .single();

      if (err) throw err;
      setPedidos(
        pedidos.map((p) => (p.id === id ? data : p))
      );
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar pedido';
      setError(msg);
      throw err;
    }
  };

  const deletePedido = async (id: number) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setPedidos(pedidos.filter((p) => p.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar pedido';
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
