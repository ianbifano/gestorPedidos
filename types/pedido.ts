export type EstadoPedido = 'Pendiente' | 'En proceso' | 'Entregado';

export interface Pedido {
  id: number;
  cliente_id: number;
  descripcion: string;
  monto: number;
  estado: EstadoPedido;
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
}

export interface UpdatePedidoInput {
  estado?: EstadoPedido;
  descripcion?: string;
  monto?: number;
}
