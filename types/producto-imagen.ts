export interface ProductoImagen {
  id: number;
  producto_id: number;
  imagen_uri: string;
  titulo?: string;
  descripcion?: string;
  created_at: string;
}