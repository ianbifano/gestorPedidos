export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoria?: string;
  disponible?: boolean;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  impuestos: number;
  total: number;
}
