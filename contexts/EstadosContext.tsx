import { supabase } from '@/constants/supabase';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type EstadoItem = { id: number; nombre: string };

type EstadosContextValue = {
  estados: EstadoItem[];
  loading: boolean;
  getEstadoNombre: (id: number) => string;
};

const EstadosContext = createContext<EstadosContextValue | undefined>(undefined);

export function EstadosProvider({ children }: { children: React.ReactNode }) {
  const [estados, setEstados] = useState<EstadoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      // Asegurar que la sesión esté activa antes de la query
      await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('pedidos_estados')
        .select('id, estado')
        .order('id', { ascending: true });

      if (error) {
        console.error('EstadosContext error:', error.message, error.code);
      }

      if (data && data.length > 0) {
        setEstados(data.map((row: any) => ({ id: row.id, nombre: row.estado })));
      } else {
        // Fallback mientras se resuelve el acceso a la tabla
        console.warn('EstadosContext: sin datos de BD, usando valores locales', { data, error });
        setEstados([
          { id: 1, nombre: 'Pendiente' },
          { id: 2, nombre: 'En Preparacion' },
          { id: 3, nombre: 'Demorado' },
          { id: 4, nombre: 'Cancelado' },
          { id: 5, nombre: 'En Camino' },
          { id: 6, nombre: 'Entregado' },
        ]);
      }
      setLoading(false);
    };

    cargar();
  }, []);

  const getEstadoNombre = useCallback(
    (id: number) => estados.find((e) => e.id === id)?.nombre ?? 'Desconocido',
    [estados]
  );

  const value = useMemo(
    () => ({ estados, loading, getEstadoNombre }),
    [estados, loading, getEstadoNombre]
  );

  return <EstadosContext.Provider value={value}>{children}</EstadosContext.Provider>;
}

export function useEstados() {
  const ctx = useContext(EstadosContext);
  if (!ctx) throw new Error('useEstados debe usarse dentro de EstadosProvider');
  return ctx;
}
