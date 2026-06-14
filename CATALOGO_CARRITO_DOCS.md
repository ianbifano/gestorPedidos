# Catálogo de Productos y Carrito de Compras

## 📋 Descripción General

Se ha implementado un sistema completo de **Catálogo de Productos** y **Carrito de Compras** para que los clientes finales puedan explorar y seleccionar productos. El sistema utiliza **Context API** para la gestión global del estado del carrito.

## 🏗️ Arquitectura Implementada

### 1. **Tipos TypeScript** (`types/product.ts`)
```typescript
- Product: Interface para datos de productos
- CartItem: Interface para items en el carrito
- CartSummary: Interface para resumen de compra (totales, impuestos, etc.)
```

### 2. **Contexto de Carrito** (`contexts/CartContext.tsx`)
Proporciona estado global del carrito con las siguientes funcionalidades:
- ✅ Agregar productos al carrito
- ✅ Eliminar productos
- ✅ Actualizar cantidades
- ✅ Limpiar carrito
- ✅ Cálculo automático de subtotal, impuestos (21% IVA) y total
- ✅ Resumen detallado de la compra

**Uso:**
```typescript
const { items, addItem, removeItem, updateQuantity, getSummary } = useCart();
```

### 3. **Componentes**

#### `ProductCard.tsx`
Tarjeta individual de producto que muestra:
- Icono/placeholder de imagen
- Nombre y descripción
- Categoría
- Precio
- Botón "Agregar al carrito"
- Diseño responsive y adaptado a temas claros/oscuros

#### `CartSummary.tsx`
Resumen completo del carrito con:
- Lista de productos agregados
- Controles para modificar cantidades (+/-)
- Botón para eliminar productos
- Cálculo detallado de costos
- Botón "Proceder al Pago" (integrable)
- Mensaje cuando el carrito está vacío

#### `CartBadge.tsx`
Insignia/badge que muestra la cantidad de productos en el carrito:
- Se muestra solo cuando hay items
- Aparece en el tab del carrito
- Soporta hasta 99+ items

### 4. **Vistas**

#### `app/(tabs)/catalogo.tsx` (Nueva pestaña)
Pantalla principal de compras:
- Grid de 2 columnas de productos
- Header informativo
- Botón flotante inferior que muestra:
  - Cantidad de items en el carrito
  - Total de la compra
  - Enlace rápido al carrito
- Toast de confirmación al agregar productos
- Manejo de estado vacío

#### `app/(tabs)/carrito.tsx` (Nueva pestaña)
Pantalla dedicada al carrito:
- Integra el componente `CartSummary`
- Accesible desde la barra de navegación
- Sincronización en tiempo real

### 5. **Datos Iniciales** (`constants/Productos.ts`)

Mock data actualizado con 6 productos de ejemplo:
```typescript
- Hamburguesa Doble (8500)
- Pizza Muzarella (12000)
- Empanada de Carne (1200)
- Milanesa de Pollo (6500)
- Ensalada César (4500)
- Bebida Gaseosa (1800)
```

Cada producto incluye: `id`, `nombre`, `descripcion`, `precio`, `categoria`, `disponible`

## 📁 Estructura de Carpetas

```
app/
├── (tabs)/
│   ├── _layout.tsx          (Actualizado: nuevas pestañas)
│   ├── catalogo.tsx         ✨ NUEVO
│   ├── carrito.tsx          ✨ NUEVO
│   ├── index.tsx            (Existente)
│   ├── explore.tsx          (Existente)
│   └── clientes.tsx         (Existente)
├── _layout.tsx              (Actualizado: CartProvider)
└── ...

components/
├── ProductCard.tsx          ✨ NUEVO
├── CartSummary.tsx          ✨ NUEVO
├── CartBadge.tsx            ✨ NUEVO
└── ...

contexts/
├── CartContext.tsx          ✨ NUEVO
└── ...

types/
├── product.ts               ✨ NUEVO
└── ...

constants/
├── Productos.ts             (Actualizado: tipos + más datos)
└── ...
```

## 🔧 Configuración e Integración

### Paso 1: CartProvider en Root Layout
El archivo `app/_layout.tsx` ha sido actualizado para envolver toda la app con `CartProvider`:

```typescript
<CartProvider>
  <ToastProvider>
    <Stack>
      {/* ... */}
    </Stack>
  </ToastProvider>
</CartProvider>
```

### Paso 2: Nuevas Pestañas en Tabs Layout
El archivo `app/(tabs)/_layout.tsx` incluye dos nuevas pestañas:

1. **Catálogo** (shopping-bag icon)
   - Posición: Segunda pestaña
   - Header: "Catálogo de Productos"

2. **Carrito** (shopping-cart icon)
   - Posición: Cuarta pestaña
   - Header: "Mi Carrito"
   - Con CartBadge mostrando cantidad

## 🎨 Diseño y UX

### Características de Diseño
- ✅ **Responsive**: Adapta a cualquier tamaño de pantalla
- ✅ **Tema consistente**: Usa los colores del sistema (claro/oscuro)
- ✅ **Accesibilidad**: Botones de tamaño adecuado, texto claro
- ✅ **Feedback visual**: Toasts, badges, cambios de estado
- ✅ **Navegación intuitiva**: Botón flotante desde catálogo al carrito

### Colores Utilizados
Se utilizan los colores del tema existente:
- **Primary**: Azul (`#007AFF`)
- **Accent**: Naranja (`#FF9500`)
- **Success**: Verde (`#34C759`)
- **Danger**: Rojo (`#FF3B30`)

## 💳 Funcionalidades Clave

### 1. Agregar al Carrito
```typescript
addItem(product, cantidad)
// Se actualiza automáticamente si el producto ya existe
```

### 2. Modificar Cantidades
```typescript
updateQuantity(productId, nuevaCantidad)
// Se elimina automáticamente si cantidad es 0
```

### 3. Cálculo Automático de Impuestos
- IVA: 21%
- Cálculo automático en `getSummary()`

### 4. Sincronización en Tiempo Real
- El carrito se actualiza en todas las pantallas
- El badge se actualiza automáticamente
- El total flota sincronizado

## 🔌 Próximas Integraciones

### Autenticación
- Preparado para integrar `AuthContext` cuando esté disponible
- Se puede proteger la vista de catálogo verificando rol `cliente final`

### Productos Dinámicos
- Reemplazar `PRODUCTOS` con endpoint API
- Ejemplo:
```typescript
useEffect(() => {
  const fetchProducts = async () => {
    const response = await fetch('/api/productos');
    setProducts(await response.json());
  };
  fetchProducts();
}, []);
```

### Pago
- El botón "Proceder al Pago" está listo para integrar pasarela
- Proporciona `summary` con todos los datos necesarios

### Pedidos
- El carrito puede conectarse con la vista de "Crear Pedido"
- `clearCart()` después de confirmar pago/pedido

## 📝 Uso en Componentes

### Ejemplo 1: Usar el carrito en un componente
```typescript
import { useCart } from '@/contexts/CartContext';

export function MiComponente() {
  const { items, addItem, getSummary } = useCart();
  const summary = getSummary();
  
  return (
    <Text>Total: ${summary.total}</Text>
  );
}
```

### Ejemplo 2: Agregar producto
```typescript
const handleAgregar = () => {
  const producto = { id: '1', nombre: 'Pizza', precio: 12000 };
  addItem(producto, 2); // Agrega 2 unidades
};
```

## 🧪 Pruebas Manuales

1. **Navegar a Catálogo**
   - ✅ Verifica que se carguen todos los productos
   - ✅ Verifica que el grid sea responsive

2. **Agregar productos**
   - ✅ Haz clic en "Agregar"
   - ✅ Verifica toast de confirmación
   - ✅ Verifica que badge se actualice

3. **Botón flotante**
   - ✅ Verifica que muestre cantidad y total correctamente
   - ✅ Haz clic para ir al carrito

4. **Carrito**
   - ✅ Verifica que lista los productos
   - ✅ Prueba aumentar/disminuir cantidades
   - ✅ Prueba eliminar productos
   - ✅ Verifica cálculo de totales

5. **Sincronización**
   - ✅ Desde catálogo agrega producto
   - ✅ Ve al carrito y verifica que esté ahí
   - ✅ Regresa al catálogo y verifica badge

## 🐛 Validación Realizada

- ✅ TypeScript: Sin errores de tipo
- ✅ ESLint: Sin errores nuevos (solo advertencias pre-existentes)
- ✅ Imports: Todos correctamente configurados
- ✅ Contexto: Correctamente envuelto en el root layout
- ✅ Navegación: Las nuevas rutas están integradas

## 📋 Checklist de Funcionalidades

- [x] Catálogo de productos con grid responsive
- [x] Tarjetas de producto con información
- [x] Botón "Agregar al carrito"
- [x] Estado global del carrito (Context API)
- [x] Vista dedicada del carrito
- [x] Modificar cantidades en carrito
- [x] Eliminar productos del carrito
- [x] Cálculo automático de totales
- [x] Cálculo de impuestos (IVA 21%)
- [x] Badge mostrando cantidad de items
- [x] Botón flotante desde catálogo
- [x] Toast de confirmación
- [x] Sincronización en tiempo real
- [x] Soporte para temas claro/oscuro
- [x] Código TypeScript seguro
- [x] Integración con navegación Expo Router

## 🚀 Próximos Pasos Sugeridos

1. **Integración de Autenticación**
   - Validar que el usuario sea "cliente final"
   - Proteger vistas con ProtectedRoute

2. **API de Productos**
   - Conectar con endpoint del ABM de productos
   - Agregar carga y paginación

3. **Persistencia del Carrito**
   - Guardar en AsyncStorage
   - Restaurar al iniciar la app

4. **Pasarela de Pago**
   - Integrar con proveedor (Mercado Pago, Stripe, etc.)
   - Crear pedido después del pago exitoso

5. **Historial de Compras**
   - Vincular con la pestaña "Pedidos"
   - Mostrar detalles de compras anteriores
