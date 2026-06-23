import { supabase } from '@/constants/supabase';
import { Cliente } from '@/types/cliente';
import { useEffect, useState } from 'react';
import { normalizarTelefono } from './validators';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (err) throw err;
      setClientes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Verifica si existe un cliente con el mismo teléfono (excepto el actual)
  const existeTelefono = (telefono: string, clienteIdActual?: number): boolean => {
    if (!telefono.trim()) return false;
    const telefonoNormalizado = normalizarTelefono(telefono);
    return clientes.some(
      (c) =>
        normalizarTelefono(c.telefono || '') === telefonoNormalizado &&
        c.id !== clienteIdActual
    );
  };

  const createCliente = async (nombre: string, telefono?: string) => {
    try {
      setError(null);

      // Verificar duplicado de teléfono
      if (telefono && existeTelefono(telefono)) {
        throw new Error('Ya existe un cliente con este teléfono');
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .insert([{ nombre, telefono: telefono ? normalizarTelefono(telefono) : null }])
        .select()
        .single();

      if (err) throw err;
      setClientes([...clientes, data]);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear cliente';
      setError(msg);
      throw err;
    }
  };

  const updateCliente = async (id: number, nombre: string, telefono?: string) => {
    try {
      setError(null);

      // Verificar duplicado de teléfono
      if (telefono && existeTelefono(telefono, id)) {
        throw new Error('Ya existe otro cliente con este teléfono');
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .update({ nombre, telefono: telefono ? normalizarTelefono(telefono) : null })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setClientes(clientes.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar cliente';
      setError(msg);
      throw err;
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar cliente';
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return { clientes, loading, error, fetchClientes, createCliente, updateCliente, deleteCliente, existeTelefono };
}
