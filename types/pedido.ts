export const ESTADOS_PEDIDO = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'En Preparacion' },
  { id: 3, nombre: 'Demorado' },
  { id: 4, nombre: 'Cancelado' },
  { id: 5, nombre: 'En Camino' },
  { id: 6, nombre: 'Entregado' },
] as const;

export interface Pedido {
  id: number;
  cliente_id: number;
  descripcion: string;
  monto: number;
  estado: number;
  comercio_id?: number;
  created_at: string;
  updated_at: string;
  cliente?: {
    nombre: string;
    telefono?: string;
  };
}

export interface CreatePedidoInput {
  cliente_id: number;
  descripcion: string;
  monto: number;
  comercio_id?: number;
}

export interface UpdatePedidoInput {
  estado?: number;
  descripcion?: string;
  monto?: number;
}
