import { getSupabaseErrorMessage, supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Cliente } from '@/types/cliente';
import { useCallback, useEffect, useState } from 'react';
import { normalizarTelefono } from './validators';

export function useClientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    if (!user) {
      setClientes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre', { ascending: true });

      if (err) throw err;
      setClientes(data || []);
    } catch (err) {
      setError(getSupabaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

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

      if (!user) {
        throw new Error('Debes iniciar sesión para crear clientes');
      }

      // Verificar duplicado de teléfono
      if (telefono && existeTelefono(telefono)) {
        throw new Error('Ya existe un cliente con este teléfono');
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .insert([{ user_id: user.id, nombre, telefono: telefono ? normalizarTelefono(telefono) : null }])
        .select()
        .single();

      if (err) throw err;
      setClientes((currentClientes) => [...currentClientes, data]);
      return data;
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al crear cliente');
      setError(msg);
      throw err;
    }
  };

  const updateCliente = async (id: number, nombre: string, telefono?: string) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para actualizar clientes');
      }

      // Verificar duplicado de teléfono
      if (telefono && existeTelefono(telefono, id)) {
        throw new Error('Ya existe otro cliente con este teléfono');
      }

      const { data, error: err } = await supabase
        .from('clientes')
        .update({ nombre, telefono: telefono ? normalizarTelefono(telefono) : null })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (err) throw err;
      setClientes((currentClientes) => currentClientes.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al actualizar cliente');
      setError(msg);
      throw err;
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Debes iniciar sesión para eliminar clientes');
      }

      const { error: err } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) throw err;
      setClientes((currentClientes) => currentClientes.filter((c) => c.id !== id));
    } catch (err) {
      const msg = getSupabaseErrorMessage(err, 'Error al eliminar cliente');
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return { clientes, loading, error, fetchClientes, createCliente, updateCliente, deleteCliente, existeTelefono };
}
