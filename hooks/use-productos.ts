import { supabase } from '@/constants/supabase';
import { Product } from '@/types/product';
import { useCallback, useEffect, useState } from 'react';

export function useProductos() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('productos')
        .select(`
          *,
          imagenes:productos_imagenes(imagen_uri)
        `)
        .eq('disponible', true)
        .order('nombre', { ascending: true });

      if (err) throw err;

      const mapped: Product[] = (data || []).map((item: any) => ({
        id: String(item.id),
        nombre: item.nombre,
        descripcion: item.descripcion ?? '',
        precio: item.precio,
        categoria: item.categoria ?? undefined,
        disponible: item.disponible,
        imagen: item.imagenes?.[0]?.imagen_uri ?? undefined,
      }));

      setProductos(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return {
    productos,
    loading,
    error,
    refresh: fetchProductos,
  };
}
