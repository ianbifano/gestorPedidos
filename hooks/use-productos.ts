import { supabase } from '@/constants/supabase';
import { Producto } from '@/types/producto';
import { useEffect, useState } from 'react';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (err) throw err;

      setProductos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (
    nombre: string,
    descripcion: string,
    precio: number,
    categoria: number | null,
    comercio_id: number,
    disponible: boolean = true
  ) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('productos')
        .insert([
          {
            nombre,
            descripcion,
            precio,
            categoria,
            comercio_id,
            disponible,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      setProductos([...productos, data]);

      return data;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al crear producto';

      setError(msg);
      throw err;
    }
  };

  const updateProducto = async (
    id: number,
    nombre: string,
    descripcion: string,
    precio: number,
    categoria: number | null,
    disponible: boolean
  ) => {
    try {
      setError(null);

      const { data, error: err } = await supabase
        .from('productos')
        .update({
          nombre,
          descripcion,
          precio,
          categoria,
          disponible,
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      setProductos(
        productos.map((p) => (p.id === id ? data : p))
      );

      return data;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al actualizar producto';

      setError(msg);
      throw err;
    }
  };

  const deleteProducto = async (id: number) => {
    try {
      setError(null);

      const { error: err } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setProductos(productos.filter((p) => p.id !== id));
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al eliminar producto';

      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}