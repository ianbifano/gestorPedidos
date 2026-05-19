export type EstadoPedido = 'Pendiente' | 'En proceso' | 'Entregado';

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  created_at: string;
}
