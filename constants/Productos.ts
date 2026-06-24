import { Product } from '@/types/product';

export const PRODUCTOS: Product[] = [
  {
    id: '1',
    nombre: 'Hamburguesa Doble',
    descripcion: 'Deliciosa hamburguesa con queso fundido, tocino crujiente y salsas caseras',
    precio: 8500,
    categoria: 'Comidas',
    disponible: true,
  },
  {
    id: '2',
    nombre: 'Pizza Muzarella',
    descripcion: 'Pizza a la piedra con queso fresco y salsa de tomate casera. 8 generosas porciones',
    precio: 12000,
    categoria: 'Comidas',
    disponible: true,
  },
  {
    id: '3',
    nombre: 'Empanada de Carne',
    descripcion: 'Empanadas caseras con relleno de carne cortada a cuchillo',
    precio: 1200,
    categoria: 'Entrada',
    disponible: true,
  },
  {
    id: '4',
    nombre: 'Milanesa de Pollo',
    descripcion: 'Pechuga de pollo empanada, dorada al punto y crujiente',
    precio: 6500,
    categoria: 'Comidas',
    disponible: true,
  },
  {
    id: '5',
    nombre: 'Ensalada César',
    descripcion: 'Lechuga fresca, queso parmesano, croutones caseros y aderezo César',
    precio: 4500,
    categoria: 'Entrada',
    disponible: true,
  },
  {
    id: '6',
    nombre: 'Bebida Gaseosa',
    descripcion: 'Gaseosa fría de 500ml. Sabores disponibles: Cola, Naranja, Limón',
    precio: 1800,
    categoria: 'Bebidas',
    disponible: true,
  },
];