export interface Producto {
  id: number;
  created_at: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  publicado: boolean;
  categoria: number;
  comercio_id: number;
  imagen?: string | null;
  comercio?: { nombre: string };
}