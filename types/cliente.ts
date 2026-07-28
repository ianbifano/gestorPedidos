export interface Cliente {
  id: number;
  user_id: string;
  nombre: string;
  telefono?: string;
  comercio_id?: number;
  created_at: string;
  comercio?: {
    nombre: string;
  };
}
