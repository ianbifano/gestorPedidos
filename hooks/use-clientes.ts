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
        .select('*, comercio:comercio_id (nombre)')
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

  const createCliente = async (nombre: string, telefono?: string, comercio_id?: number | null) => {
    try {
      setError(null);

      if (telefono && existeTelefono(telefono)) {
        throw new Error('Ya existe un cliente con este teléfono');
      }

      const payload: Record<string, unknown> = {
        nombre,
        telefono: telefono ? normalizarTelefono(telefono) : null,
      };
      if (comercio_id !== undefined && comercio_id !== null) {
        payload.comercio_id = comercio_id;
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .insert([payload])
        .select('*, comercio:comercio_id (nombre)')
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

  const updateCliente = async (id: number, nombre: string, telefono?: string, comercio_id?: number | null) => {
    try {
      setError(null);

      if (telefono && existeTelefono(telefono, id)) {
        throw new Error('Ya existe otro cliente con este teléfono');
      }

      const payload: Record<string, unknown> = {
        nombre,
        telefono: telefono ? normalizarTelefono(telefono) : null,
      };
      if (comercio_id !== undefined) {
        payload.comercio_id = comercio_id || null;
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', id)
        .select('*, comercio:comercio_id (nombre)')
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
