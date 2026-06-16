import { supabase } from '@/constants/supabase';
import { Producto } from '@/types/producto';
import { useEffect, useState } from 'react';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // FETCH
  // -------------------------
  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('productos')
        .select('*');

      if (error) {
        console.log('FETCH ERROR:', error);
        throw error;
      }

      setProductos(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // CREATE
  // -------------------------
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

      const { data, error } = await supabase
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
        .select();

      if (error) {
        console.log('CREATE ERROR:', error);
        throw error;
      }

      const newProduct = data?.[0];

      if (newProduct) {
        setProductos((prev) => [...prev, newProduct]);
      }

      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
      throw err;
    }
  };

  // -------------------------
  // UPDATE (ROBUSTO)
  // -------------------------
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

      if (!id || isNaN(id)) {
        throw new Error('ID inválido');
      }

      const { error } = await supabase
        .from('productos')
        .update({
          nombre,
          descripcion,
          precio,
          categoria,
          disponible,
        })
        .eq('id', id);

      if (error) {
        console.log('UPDATE ERROR:', error);
        throw error;
      }

      // 🔥 refresca SIEMPRE desde DB (evita bugs de estado)
      await fetchProductos();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
      throw err;
    }
  };

  // -------------------------
  // DELETE (ROBUSTO)
  // -------------------------
  const deleteProducto = async (id: number) => {
  try {
    console.log('DELETE START:', id);

    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .select();

    console.log('DELETE RESPONSE:', data);

    if (error) {
      console.log('DELETE SUPABASE ERROR:', error);
      throw error;
    }

    await fetchProductos();

    console.log('DELETE FINISHED');
  } catch (err) {
    console.log('DELETE CATCH:', err);
    throw err;
  }
};

  // -------------------------
  // INIT
  // -------------------------
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