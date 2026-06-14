# 🏗️ Arquitectura Técnica: Catálogo y Carrito

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         app/_layout.tsx                             │
│                          (Root Layout)                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  <CartProvider>  ← Proporciona estado global del carrito    │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  <ToastProvider>  ← Notificaciones                     │ │  │
│  │  │                                                        │ │  │
│  │  │  ┌──────────────────────────────────────────────────┐ │ │  │
│  │  │  │         <Stack> (Expo Router)                    │ │ │  │
│  │  │  │                                                  │ │ │  │
│  │  │  │  ┌────────────────────────────────────────────┐ │ │ │  │
│  │  │  │  │  (tabs)/_layout.tsx ← 5 pestañas          │ │ │ │  │
│  │  │  │  │                                            │ │ │ │  │
│  │  │  │  │  1. Home (index.tsx)                       │ │ │ │  │
│  │  │  │  │  2. Catálogo (catalogo.tsx) ✨ NUEVO      │ │ │ │  │
│  │  │  │  │  3. Pedidos (explore.tsx)                  │ │ │ │  │
│  │  │  │  │  4. Carrito (carrito.tsx) ✨ NUEVO        │ │ │ │  │
│  │  │  │  │  5. Clientes (clientes.tsx)                │ │ │ │  │
│  │  │  │  └────────────────────────────────────────────┘ │ │ │  │
│  │  │  │                                                  │ │ │  │
│  │  │  └──────────────────────────────────────────────────┘ │ │  │
│  │  │                                                        │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Estado del Carrito

```
                    ┌─────────────────────┐
                    │  CartContext.tsx    │
                    │  (Estado Global)    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼───────┐   ┌──▼──────────┐  ▼──────────────┐
        │   items: []   │   │  Métodos:   │  │ 💾 localStorage│
        │   (CartItem[])│   │             │  │ (Futuro)       │
        └───────┬───────┘   │ • addItem   │  └────────────────┘
                │            │ • removeItem│
          ┌─────▼────────┐   │ • updateQ. │
          │   useCart()  │   │ • getSumm. │
          │   (Hook)     │   │ • clearCart│
          └─────┬────────┘   └────────────┘
                │
    ┌───────────┼───────────┬──────────────┬──────────────┐
    │           │           │              │              │
    ▼           ▼           ▼              ▼              ▼
  ┌─────┐  ┌─────────┐ ┌────────┐  ┌──────────┐  ┌──────────┐
  │  1  │  │    2    │ │   3    │  │    4     │  │    5     │
  │Cata-│  │ Product │ │ Carrito│  │CartBadge │  │ CartSum. │
  │logo │  │  Card   │ │Tab     │  │  (Badge) │  │  (View)  │
  └─────┘  └─────────┘ └────────┘  └──────────┘  └──────────┘
    │          │          │             │            │
    └──────────┴──────────┴─────────────┴────────────┘
                         │
                  Todos usan useCart()
                  (Sincronización en tiempo real)
```

---

## 📦 Componentes y Sus Responsabilidades

### 1. **ProductCard.tsx**
```
Input: Product
  ├─ id
  ├─ nombre
  ├─ descripcion
  ├─ precio
  ├─ categoria
  └─ disponible

Output: UI + Events
  ├─ Muestra tarjeta visual
  ├─ onAddToCart(product)
  └─ Llama: addItem(product)
```

### 2. **CartSummary.tsx**
```
Input: useCart() hook
  ├─ items[]
  ├─ updateQuantity(id, cant)
  └─ removeItem(id)

Output: UI
  ├─ Lista de items con cantidad
  ├─ Controles +/-
  ├─ Cálculo de totales
  └─ Botón "Proceder al Pago"
```

### 3. **CartBadge.tsx**
```
Input: useCart() hook
  └─ items[]

Output: Badge visual
  └─ Muestra: cantidad de items
     (Solo si hay items > 0)
```

### 4. **catalogo.tsx**
```
Usa:
  ├─ ProductCard (componente)
  ├─ useCart() (agregar items)
  ├─ PRODUCTOS (mock data)
  ├─ useRouter (navegación)
  └─ useColorScheme (temas)

Muestra:
  ├─ Grid de productos (2 col)
  ├─ Header
  ├─ Botón flotante (carrito)
  └─ Toast confirmación
```

### 5. **carrito.tsx**
```
Usa:
  └─ CartSummary (componente)

Muestra:
  └─ Pantalla dedicada del carrito
```

---

## 🔗 Flujo de Datos

```
VISTA: catalogo.tsx
       │
       ├─→ Renderiza ProductCard
       │   │
       │   └─→ Usuario hace clic en "Agregar"
       │       │
       │       └─→ onAddToCart(product) se llama
       │           │
       │           └─→ addItem(product) de useCart()
       │               │
       │               ▼
       │           CartContext.tsx
       │           │
       │           ├─→ setItems([...items, newItem])
       │           ├─→ getSummary() recalcula
       │           └─→ TODAS las vistas se actualizan
       │
       ├─→ Toast muestra confirmación
       │
       ├─→ CartBadge se actualiza automáticamente
       │
       └─→ Botón flotante muestra nuevo total


VISTA: carrito.tsx
       │
       ├─→ Renderiza CartSummary
       │   │
       │   ├─→ Muestra items del carrito
       │   ├─→ Controles +/- llaman updateQuantity()
       │   ├─→ Botón eliminar llama removeItem()
       │   └─→ getSummary() recalcula totales
       │
       └─→ Todo sincronizado desde CartContext
```

---

## 💾 Persistencia (Actual vs Futuro)

### ✅ Actual (En Sesión)
```
CartContext (en memoria)
  └─ items[] 
     └─ Persiste mientras la app está abierta
        └─ Se pierde al cerrar la app
```

### ⏳ Futuro (Con AsyncStorage)
```
CartContext (en memoria)
  ├─→ items[]
  │
  ├─→ useEffect cuando items cambian
  │   └─→ AsyncStorage.setItem('cart', items)
  │
  └─→ useEffect en montaje
      └─→ AsyncStorage.getItem('cart')
          └─→ Restaura items al iniciar
```

**Código para agregar persistencia:**
```typescript
// Al inicio de CartContext.tsx
useEffect(() => {
  AsyncStorage.setItem('cart', JSON.stringify(items));
}, [items]);

useEffect(() => {
  AsyncStorage.getItem('cart').then(data => {
    if (data) setItems(JSON.parse(data));
  });
}, []);
```

---

## 🔌 Integraciones Actuales

```
Catálogo
│
├─ useColorScheme()          ← Para tema claro/oscuro
├─ useRouter()               ← Para navegación
├─ Colors (constants/theme)  ← Para colores
└─ PRODUCTOS (constants)     ← Mock data

CartContext
│
└─ Estado puro de React (useState)
```

---

## 🔌 Integraciones Futuras (Preparadas)

```
AuthContext (Cuando esté listo)
│
├─ Validar user.rol === 'cliente-final'
└─ Si no, mostrar NeedAuthScreen

API /productos (Cuando esté lista)
│
└─ Reemplazar PRODUCTOS array con fetch()

Payment API (Stripe, MercadoPago, etc)
│
├─ En CartSummary.tsx
├─ Botón "Proceder al Pago"
└─ Crear orden después del pago

Orders API
│
├─ createOrder(items, user_id)
└─ Guardar pedido en base de datos
```

---

## 📋 Tabla de Componentes

| Componente | Ubicación | Responsabilidad | Estado |
|-----------|-----------|-----------------|--------|
| ProductCard | components/ | Renderizar 1 producto | ✅ Listo |
| CartSummary | components/ | Pantalla carrito | ✅ Listo |
| CartBadge | components/ | Badge con cantidad | ✅ Listo |
| catalogo | app/(tabs)/ | Pantalla catálogo | ✅ Listo |
| carrito | app/(tabs)/ | Pantalla carrito | ✅ Listo |
| CartContext | contexts/ | Estado global | ✅ Listo |
| CartProvider | contexts/ | Proveedor | ✅ Listo |

---

## 🎯 Métodos de useCart()

```typescript
useCart() ← Hook

├─ items: CartItem[]
│  └─ Array de items en el carrito
│
├─ addItem(product, cantidad?)
│  ├─ Parámetros: Product, number opcional
│  └─ Acción: Agrega o suma cantidad
│
├─ removeItem(productId)
│  ├─ Parámetro: string (id)
│  └─ Acción: Elimina completamente
│
├─ updateQuantity(productId, cantidad)
│  ├─ Parámetros: string, number
│  ├─ Si cantidad <= 0: elimina automáticamente
│  └─ Acción: Actualiza cantidad
│
├─ clearCart()
│  └─ Acción: Vacía todo el carrito
│
├─ getSummary(): CartSummary
│  ├─ items: CartItem[]
│  ├─ totalItems: number
│  ├─ subtotal: number
│  ├─ impuestos: number (IVA 21%)
│  └─ total: number
│
└─ getCartTotal(): number
   └─ Retorna solo el subtotal
```

---

## 🧮 Cálculo de Precios

```
Producto: Pizza $12,000

Usuario agrega 2 pizzas:
  12,000 × 2 = $24,000 (Subtotal)

Sistema calcula IVA 21%:
  24,000 × 0.21 = $5,040

Total a pagar:
  24,000 + 5,040 = $29,040

getSummary() retorna:
{
  items: [CartItem, CartItem],
  totalItems: 2,
  subtotal: 24000,
  impuestos: 5040,
  total: 29040
}
```

---

## 🎨 Estilos y Temas

```
Colors (claro/oscuro)
├─ light:
│  ├─ text: '#1C1C1E'
│  ├─ background: '#FFFFFF'
│  ├─ tint: '#007AFF' (azul)
│  ├─ accent: '#FF9500' (naranja)
│  ├─ success: '#34C759' (verde)
│  ├─ danger: '#FF3B30' (rojo)
│  └─ border: '#E5E5EA'
│
└─ dark:
   ├─ text: '#F5F5F7'
   ├─ background: '#000000'
   ├─ tint: '#0A84FF' (azul más claro)
   ├─ accent: '#FFB340' (naranja más claro)
   ├─ success: '#34C759'
   ├─ danger: '#FF3B30'
   └─ border: '#38383A'

useColorScheme() detecta automáticamente
├─ Si preferencia del sistema es dark
└─ Aplica los colores correspondientes
```

---

## 🚀 Performance

### Optimizaciones Incluidas

```
✅ useCallback en CartContext
   └─ Previene re-renders innecesarios

✅ FlatList con keyExtractor
   └─ Virtualization, eficiente con muchos items

✅ Memo en ProductCard (listo para agregar)
   └─ No re-renderiza si props no cambian

✅ Separación de concerns
   └─ Componentes reutilizables
```

---

## 🐛 Manejo de Errores

### Casos Cubiertos

```
✅ Carrito vacío
   └─ Muestra mensaje "Tu carrito está vacío"

✅ Cantidad cero
   └─ updateQuantity(id, 0) → elimina automáticamente

✅ Producto duplicado
   └─ addItem(producto_existente) → suma cantidad

✅ Navegación entre pestañas
   └─ Estado se mantiene sincronizado

✅ useCart sin Provider
   └─ Error claro: "useCart must be used within CartProvider"
```

---

## 📈 Escalabilidad

### Preparado para crecer a:

```
1,000s de productos
├─ FlatList con virtualization
└─ Paginación o infinite scroll

Múltiples carros (en futuro)
├─ Estructura lista para user_id
└─ AsyncStorage con claves por usuario

Órdenes complejas
├─ getSummary() retorna todo necesario
└─ Easy de pasar a API de órdenes

Cupones y descuentos
├─ Agregar discount field a CartSummary
└─ Restar antes del cálculo de IVA
```

---

## ✅ Checklist de Implementación

- [x] Tipos TypeScript definidos
- [x] CartContext con lógica completa
- [x] CartProvider envuelve la app
- [x] ProductCard componente visual
- [x] CartSummary pantalla completa
- [x] CartBadge integrado
- [x] catalogo.tsx con grid y navegación
- [x] carrito.tsx como vista dedicada
- [x] Sincronización en tiempo real
- [x] Cálculo de impuestos
- [x] Soporte claro/oscuro
- [x] TypeScript sin errores
- [x] ESLint sin errores nuevos
- [x] Documentación completa

---

**Arquitectura lista para producción** ✅
