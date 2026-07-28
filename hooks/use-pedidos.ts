import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/constants/supabase';
import { CreatePedidoInput, Pedido, UpdatePedidoInput } from '@/types/pedido';
import { useCallback, useEffect, useState } from 'react';

const getMsg = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : (err as any)?.message ?? fallback;

export function usePedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async (estado?: number) => {
    if (!user) return;
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

      if (estado !== undefined) {
        query = query.eq('estado', estado);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setPedidos(data || []);
    } catch (err) {
      setError(getMsg(err, 'Error al cargar pedidos'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPedidosCliente = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data: clienteData, error: clienteErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (clienteErr) throw clienteErr;

      if (!clienteData || clienteData.length === 0) {
        setPedidosCliente([]);
        return;
      }

      const clienteId = clienteData[0].id;

      const { data, error: err } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:cliente_id (nombre, telefono),
          comercio:comercio_id (nombre)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPedidosCliente(data || []);
    } catch (err) {
      setError(getMsg(err, 'Error al cargar pedidos'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPedido = async (input: CreatePedidoInput) => {
    try {
      setError(null);
      const payload: Record<string, unknown> = {
        cliente_id: input.cliente_id,
        descripcion: input.descripcion,
        monto: input.monto,
        estado: 1,
      };
      if (input.comercio_id !== undefined) {
        payload.comercio_id = input.comercio_id;
      }
      const { data, error: err } = await supabase
        .from('pedidos')
        .insert([payload])
        .select(`
          *,
          cliente:cliente_id (nombre, telefono)
        `)
        .single();

      if (err) throw err;
      setPedidos((currentPedidos) => [data, ...currentPedidos]);
      return data;
    } catch (err) {
      const msg = getMsg(err, 'Error al crear pedido');
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
          updated_at: new Date().toISOString().replace('T', ' ').replace('Z', ''),
        })
        .eq('id', id)
        .select(`
          *,
          cliente:cliente_id (nombre, telefono)
        `)
        .single();

      if (err) throw err;
      setPedidos(pedidos.map((p) => (p.id === id ? data : p)));
      return data;
    } catch (err) {
      const msg = getMsg(err, 'Error al actualizar pedido');
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
        .eq('id', id);

      if (err) throw err;
      setPedidos((currentPedidos) => currentPedidos.filter((p) => p.id !== id));
    } catch (err) {
      const msg = getMsg(err, 'Error al eliminar pedido');
      setError(msg);
      throw err;
    }
  };

  const resumenPorEstado = (estado: number) => {
    return pedidos.filter((p) => p.estado === estado).length;
  };

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return {
    pedidos,
    pedidosCliente,
    loading,
    error,
    fetchPedidos,
    fetchPedidosCliente,
    createPedido,
    updatePedido,
    deletePedido,
    resumenPorEstado,
  };
}
