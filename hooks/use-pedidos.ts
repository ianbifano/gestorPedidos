import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/constants/supabase';
import { CreatePedidoInput, Pedido, UpdatePedidoInput } from '@/types/pedido';
import { useCallback, useEffect, useState } from 'react';

const getMsg = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : (err as any)?.message ?? fallback;

const SELECT_QUERY = `
  *,
  cliente:cliente_id (nombre, telefono),
  comercio:comercio_id (nombre)
`;

export function usePedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([]);
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

  const fetchPedidos = useCallback(async (estado?: number) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const comercioIds = await getMisComercioIds();
      if (comercioIds.length === 0) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('pedidos')
        .select(SELECT_QUERY)
        .in('comercio_id', comercioIds)
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
  }, [user, getMisComercioIds]);

  const fetchPedidosByStore = useCallback(async (storeId: number, estado?: number) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const comercioIds = await getMisComercioIds();
      if (!comercioIds.includes(storeId)) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('pedidos')
        .select(SELECT_QUERY)
        .eq('comercio_id', storeId)
        .order('created_at', { ascending: false });

      if (estado !== undefined) {
        query = query.eq('estado', estado);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPedidos(data || []);
    } catch (err) {
      setError(getMsg(err, 'Error al cargar pedidos del comercio'));
    } finally {
      setLoading(false);
    }
  }, [user, getMisComercioIds]);

  const fetchPedidosCliente = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const { data: clienteData, error: clienteErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', user.id);

      if (clienteErr) throw clienteErr;

      if (!clienteData || clienteData.length === 0) {
        setPedidosCliente([]);
        setLoading(false);
        return;
      }

      const clienteIds = clienteData.map((c) => c.id);

      const { data, error: err } = await supabase
        .from('pedidos')
        .select(SELECT_QUERY)
        .in('cliente_id', clienteIds)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPedidosCliente(data || []);
    } catch (err) {
      setError(getMsg(err, 'Error al cargar pedidos'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPedidoById = useCallback(async (pedidoId: number): Promise<Pedido | null> => {
    if (!user) return null;
    try {
      const { data, error: err } = await supabase
        .from('pedidos')
        .select(SELECT_QUERY)
        .eq('id', pedidoId)
        .maybeSingle();

      if (err) throw err;
      return data as Pedido | null;
    } catch (err) {
      setError(getMsg(err, 'Error al cargar el pedido'));
      return null;
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
        .select(SELECT_QUERY)
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
        .select(SELECT_QUERY)
        .single();

      if (err) throw err;

      setPedidos((prev) => prev.map((p) => (p.id === id ? data : p)));
      setPedidosCliente((prev) => prev.map((p) => (p.id === id ? data : p)));

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
      setPedidosCliente((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const msg = getMsg(err, 'Error al eliminar pedido');
      setError(msg);
      throw err;
    }
  };

  const resumenPorEstado = (estado: number, storeId?: number | null) => {
    const source = storeId
      ? pedidos.filter((p) => p.comercio_id === storeId)
      : pedidos;
    return source.filter((p) => p.estado === estado).length;
  };

  return {
    pedidos,
    pedidosCliente,
    loading,
    error,
    fetchPedidos,
    fetchPedidosByStore,
    fetchPedidosCliente,
    fetchPedidoById,
    createPedido,
    updatePedido,
    deletePedido,
    resumenPorEstado,
  };
}
