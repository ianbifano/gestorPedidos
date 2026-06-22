export type EstadoPedido = 'Pendiente' | 'En proceso' | 'Entregado';

export interface Cliente {
  id: number;
  user_id: string;
  nombre: string;
  telefono?: string;
  created_at: string;
}
