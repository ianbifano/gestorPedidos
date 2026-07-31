import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/constants/supabase';
import { CartItem } from '@/types/product';
import { useCallback, useState } from 'react';

const TAX_RATE = 0.21;

type ProcesarPedidoResult = {
  pedidoIds: number[];
  cantidad: number;
};

export function usePedidoDesdeCarrito() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const procesarPedido = useCallback(async (): Promise<ProcesarPedidoResult> => {
    if (!user) {
      throw new Error('Debes iniciar sesión para procesar el pedido');
    }

    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    setLoading(true);
    setError(null);

    try {
      const clienteId = await getOrCreateCliente(user.id);

      const gruposPorComercio = agruparPorComercio(items);

      const pedidoIds: number[] = [];

      for (const [comercioIdStr, itemsDelComercio] of Object.entries(gruposPorComercio)) {
        const comercioId = Number(comercioIdStr);

        const subtotalGrupo = itemsDelComercio.reduce(
          (sum, item) => sum + item.product.precio * item.cantidad,
          0
        );
        const ivaGrupo = Math.round(subtotalGrupo * TAX_RATE * 100) / 100;
        const totalGrupo = Math.round((subtotalGrupo + ivaGrupo) * 100) / 100;

        const descripcion = itemsDelComercio
          .map(item => `${item.product.nombre} x${item.cantidad}`)
          .join(', ');

        const { data: pedido, error: pedidoError } = await supabase
          .from('pedidos')
          .insert([{
            cliente_id: clienteId,
            comercio_id: comercioId,
            descripcion,
            monto: totalGrupo,
            estado: 1, // Pendiente
          }])
          .select('id')
          .single();

        if (pedidoError) throw pedidoError;
        pedidoIds.push(pedido.id);
      }

      clearCart();

      return { pedidoIds, cantidad: pedidoIds.length };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar pedido';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, items, clearCart]);

  return {
    procesarPedido,
    loading,
    error,
  };
}

function agruparPorComercio(items: CartItem[]): Record<number, CartItem[]> {
  const grupos: Record<number, CartItem[]> = {};

  for (const item of items) {
    const comercioId = item.product.comercio_id;
    if (comercioId == null) continue;
    if (!grupos[comercioId]) {
      grupos[comercioId] = [];
    }
    grupos[comercioId].push(item);
  }

  return grupos;
}

async function getOrCreateCliente(authUserId: string): Promise<number> {
  const { data: clientes, error: clientesError } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', authUserId)
    .limit(1);

  if (clientesError) throw clientesError;

  if (clientes && clientes.length > 0) {
    return clientes[0].id;
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const { data: nuevoCliente, error: crearClienteError } = await supabase
    .from('clientes')
    .insert([{
      nombre: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Cliente',
      telefono: null,
      user_id: authUserId,
    }])
    .select('id')
    .single();

  if (crearClienteError) throw crearClienteError;
  return nuevoCliente.id;
}
