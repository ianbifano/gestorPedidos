export interface Pedido {
  id: number;
  user_id: string;
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
  comercio?: {
    nombre: string;
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
