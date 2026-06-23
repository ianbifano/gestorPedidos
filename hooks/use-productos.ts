import { supabase } from '@/constants/supabase';
import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';
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

      if (error) throw error;

      setProductos(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // CREATE (con imagen)
  // -------------------------
  const createProducto = async (
    nombre: string,
    descripcion: string,
    precio: number,
    categoria: number | null,
    comercio_id: number,
    disponible: boolean = true,
    imagen: string | null = null
  ) => {
    try {
      setError(null);

      let imagenUrl: string | null = null;

      // subir imagen si existe
      if (imagen) {
        imagenUrl = await uploadProductoImagen(imagen);
      }

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
            imagen: imagenUrl,
          },
        ])
        .select();

      if (error) throw error;

      const newProduct = data?.[0];

      if (newProduct) {
        setProductos((prev) => [...prev, newProduct]);
      }

      return newProduct;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear producto'
      );
      throw err;
    }
  };

  // -------------------------
  // UPDATE
  // -------------------------
  const updateProducto = async (
  id: number,
  nombre: string,
  descripcion: string,
  precio: number,
  categoria: number | null,
  disponible: boolean,
  imagen: string | null
) => {
  try {
    setError(null);

    const { error } = await supabase
      .from('productos')
      .update({
        nombre,
        descripcion,
        precio,
        categoria,
        disponible,
        imagen, // 👈 CLAVE
      })
      .eq('id', id);

    if (error) throw error;

    await fetchProductos();
  } catch (err) {
    setError('Error al actualizar producto');
    throw err;
  }
};

  // -------------------------
  // DELETE
  // -------------------------
  const deleteProducto = async (id: number) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProductos();
    } catch (err) {
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