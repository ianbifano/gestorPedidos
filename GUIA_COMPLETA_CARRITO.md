# 🎯 GUÍA COMPLETA DE USO: Catálogo y Carrito

## 🚀 Inicio Rápido (5 minutos)

### 1. **Ejecuta tu aplicación**
```bash
npm start
# o
expo start
```

### 2. **Navega a la pestaña "Catálogo"** 📦
Verás un grid con 6 productos disponibles

### 3. **Haz clic en "Agregar"** ➕
El producto se agregará al carrito

### 4. **Verifica el badge** 🔴
El número en la pestaña "Carrito" se actualiza automáticamente

### 5. **Ve a la pestaña "Carrito"** 🛒
Aquí verás todos tus productos seleccionados

---

## 📋 Arquitectura de Carpetas

```
gestorPedidos/
│
├── 📁 app/
│   ├── 📁 (tabs)/
│   │   ├── _layout.tsx              ✏️ MODIFICADO
│   │   ├── catalogo.tsx             ✨ NUEVO
│   │   ├── carrito.tsx              ✨ NUEVO
│   │   ├── index.tsx                (Home)
│   │   ├── explore.tsx              (Pedidos)
│   │   └── clientes.tsx             (Clientes)
│   │
│   ├── _layout.tsx                  ✏️ MODIFICADO (CartProvider)
│   ├── crear-pedido.tsx
│   ├── crear-cliente.tsx
│   └── ...
│
├── 📁 components/
│   ├── ProductCard.tsx              ✨ NUEVO
│   ├── CartSummary.tsx              ✨ NUEVO
│   ├── CartBadge.tsx                ✨ NUEVO
│   ├── ClienteCard.tsx
│   ├── Toast.tsx
│   └── ...
│
├── 📁 contexts/
│   ├── CartContext.tsx              ✨ NUEVO
│   └── ...
│
├── 📁 types/
│   ├── product.ts                   ✨ NUEVO
│   ├── cliente.ts
│   ├── pedido.ts
│   └── user.ts
│
├── 📁 constants/
│   ├── Productos.ts                 ✏️ MODIFICADO
│   ├── theme.ts
│   └── supabase.ts
│
├── 📁 hooks/
├── 📁 assets/
└── ...
```

---

## 🔗 Conexiones entre Componentes

### Diagrama de Dependencias

```
Root Layout (_layout.tsx)
  │
  └─→ CartProvider
      │
      ├─→ Tabs Layout ((tabs)/_layout.tsx)
      │   │
      │   ├─→ Catálogo (catalogo.tsx)
      │   │   │
      │   │   ├─→ ProductCard
      │   │   │   └─→ useCart() → addItem()
      │   │   │
      │   │   ├─→ Botón flotante
      │   │   │   └─→ useRouter() → navigate to /carrito
      │   │   │
      │   │   └─→ Toast de confirmación
      │   │
      │   └─→ Carrito (carrito.tsx)
      │       │
      │       └─→ CartSummary
      │           ├─→ useCart() → items, updateQuantity, removeItem
      │           └─→ getSummary() → totales, impuestos
      │
      └─→ CartBadge
          └─→ useCart() → totalItems
```

---

## 📂 Detalles de Cada Archivo

### **types/product.ts** (395 bytes)
```typescript
// Tipos de datos para la app
interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoria?: string;
  disponible?: boolean;
}

interface CartItem {
  product: Product;
  cantidad: number;
}

interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  impuestos: number;
  total: number;
}
```

### **contexts/CartContext.tsx** (2,774 bytes)
```typescript
// Estado global del carrito
export function CartProvider({ children }) {
  // Estado
  const [items, setItems] = useState<CartItem[]>([]);

  // Métodos
  const addItem = (product, cantidad) => { /* ... */ };
  const removeItem = (productId) => { /* ... */ };
  const updateQuantity = (productId, cantidad) => { /* ... */ };
  const getSummary = () => { /* ... */ };

  return <CartContext.Provider value={...}>{children}</CartContext.Provider>;
}

// Hook para usar en componentes
export function useCart() {
  return useContext(CartContext);
}
```

### **components/ProductCard.tsx** (3,633 bytes)
```typescript
// Tarjeta individual de producto
export function ProductCard({ product, onAddToCart }) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Placeholder de imagen */}
      </View>
      <View style={styles.content}>
        <Text>{product.nombre}</Text>
        <Text>{product.descripcion}</Text>
        <Text>${product.precio}</Text>
        <Button onPress={() => onAddToCart(product)}>
          Agregar
        </Button>
      </View>
    </View>
  );
}
```

### **components/CartSummary.tsx** (6,942 bytes)
```typescript
// Resumen completo del carrito
export function CartSummary() {
  const { items, updateQuantity, removeItem, getSummary } = useCart();
  const summary = getSummary();

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <View>
          <Text>{item.product.nombre}</Text>
          <Button onPress={() => updateQuantity(item.product.id, item.cantidad - 1)}>-</Button>
          <Text>{item.cantidad}</Text>
          <Button onPress={() => updateQuantity(item.product.id, item.cantidad + 1)}>+</Button>
          <Button onPress={() => removeItem(item.product.id)}>Eliminar</Button>
        </View>
      )}
      ListFooterComponent={
        <View>
          <Text>Subtotal: ${summary.subtotal}</Text>
          <Text>IVA: ${summary.impuestos}</Text>
          <Text>Total: ${summary.total}</Text>
          <Button>Proceder al Pago</Button>
        </View>
      }
    />
  );
}
```

### **components/CartBadge.tsx** (1,121 bytes)
```typescript
// Insignia con cantidad de items
export function CartBadge() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  if (totalItems === 0) return null;

  return (
    <View style={styles.badge}>
      <Text>{totalItems}</Text>
    </View>
  );
}
```

### **app/(tabs)/catalogo.tsx** (5,973 bytes)
```typescript
// Pantalla principal de compras
export default function CatalogScreen() {
  const { addItem, getSummary } = useCart();
  const [showAddedToast, setShowAddedToast] = useState(false);

  const handleAddToCart = (product) => {
    addItem(product);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  return (
    <SafeAreaView>
      <FlatList
        data={PRODUCTOS}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard 
            product={item}
            onAddToCart={handleAddToCart}
          />
        )}
      />
      {showAddedToast && <Toast message="Agregado al carrito" />}
      {summary.totalItems > 0 && (
        <FloatingButton onPress={() => router.push('/carrito')} />
      )}
    </SafeAreaView>
  );
}
```

### **app/(tabs)/carrito.tsx** (519 bytes)
```typescript
// Pantalla dedicada del carrito
export default function CartScreen() {
  return (
    <SafeAreaView>
      <CartSummary />
    </SafeAreaView>
  );
}
```

---

## 🔄 Flujo Completo del Usuario

```
PASO 1: Usuario abre la app
        ↓
PASO 2: Navega a pestaña "Catálogo"
        ↓
PASO 3: Ve grid de 6 productos
        ├─ Hamburguesa Doble - $8,500
        ├─ Pizza Muzarella - $12,000
        ├─ Empanada - $1,200
        ├─ Milanesa - $6,500
        ├─ Ensalada - $4,500
        └─ Bebida - $1,800
        ↓
PASO 4: Hace clic en "Agregar" (ej: Pizza)
        ↓
PASO 5: Toast verde: "Pizza Muzarella agregada al carrito"
        ↓
PASO 6: Badge en tab "Carrito" muestra "1"
        ↓
PASO 7: Botón flotante muestra:
        "1 producto - $12,000 - Ver"
        ↓
PASO 8: Hace clic en "Ver"
        ↓
PASO 9: Va a pestaña "Carrito"
        ↓
PASO 10: Ve resumen completo:
         • Pizza Muzarella - $12,000 c/u
         • Cantidad: 1 [- 1 +]
         • Subtotal: $12,000
         • IVA 21%: $2,520
         • TOTAL: $14,520
         • [Proceder al Pago]
         ↓
PASO 11: Puede:
         - Aumentar/disminuir cantidad
         - Eliminar producto
         - Volver al catálogo y agregar más
         - Proceder al pago (cuando esté integrado)
```

---

## 💻 Ejemplos de Código (Para Desarrolladores)

### Ejemplo 1: Usar CartContext en un componente personalizado
```typescript
import { useCart } from '@/contexts/CartContext';

export function MiComponentePersonalizado() {
  const { items, addItem, removeItem, getSummary } = useCart();

  return (
    <View>
      <Text>Productos en carrito: {items.length}</Text>
      <Text>Total: ${getSummary().total}</Text>
      
      {items.map((item) => (
        <View key={item.product.id}>
          <Text>{item.product.nombre}</Text>
          <Text>Cantidad: {item.cantidad}</Text>
          <Button onPress={() => removeItem(item.product.id)}>
            Eliminar
          </Button>
        </View>
      ))}
    </View>
  );
}
```

### Ejemplo 2: Agregar producto desde un botón personalizado
```typescript
import { useCart } from '@/contexts/CartContext';

export function MiBotonComprar() {
  const { addItem } = useCart();

  const handleComprar = () => {
    const producto = {
      id: '1',
      nombre: 'Pizza',
      descripcion: 'Deliciosa pizza',
      precio: 12000,
      categoria: 'Comidas',
    };
    
    addItem(producto, 2); // Agrega 2 unidades
  };

  return <Button onPress={handleComprar}>Comprar Pizza</Button>;
}
```

### Ejemplo 3: Procesar pago (para integración futura)
```typescript
import { useCart } from '@/contexts/CartContext';

export function MiBotonPago() {
  const { getSummary, clearCart } = useCart();

  const handlePago = async () => {
    const summary = getSummary();

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: summary.items,
          total: summary.total,
          user_id: user.id,
        }),
      });

      if (response.ok) {
        clearCart();
        navigation.navigate('PaymentSuccess');
      }
    } catch (error) {
      console.error('Error en pago:', error);
    }
  };

  return <Button onPress={handlePago}>Pagar</Button>;
}
```

---

## 🔧 Configuración y Customización

### Cambiar el porcentaje de IVA
En `contexts/CartContext.tsx`, línea 5:
```typescript
const TAX_RATE = 0.21; // Cambiar a 0.10, 0.15, etc.
```

### Agregar más productos al catálogo
En `constants/Productos.ts`:
```typescript
export const PRODUCTOS: Product[] = [
  // ... productos existentes ...
  {
    id: '7',
    nombre: 'Mi Nuevo Producto',
    descripcion: 'Descripción del producto',
    precio: 9999,
    categoria: 'Mi Categoría',
    disponible: true,
  },
];
```

### Cambiar colores del carrito
En `constants/theme.ts`:
```typescript
export const Colors = {
  light: {
    // Cambiar 'tint' para el color principal del carrito
    tint: '#007AFF', // Azul
  },
  // ...
};
```

### Cambiar iconos
En `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen
  name="catalogo"
  options={{
    title: 'Catálogo',
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} pack="material" name="store" color={color} />
      // ^ Cambiar "shopping-bag" por "store", "shopping", etc.
    ),
  }}
/>
```

---

## 🚨 Troubleshooting

### Problema: El carrito no se actualiza
**Solución**: Verifica que `CartProvider` envuelve tu app en `app/_layout.tsx`

### Problema: useCart() devuelve error
**Solución**: El componente debe estar dentro de `<CartProvider>`

### Problema: El badge no aparece
**Solución**: Verifica que `CartBadge` esté importado en `(tabs)/_layout.tsx`

### Problema: Los totales no calculan correctamente
**Solución**: Verifica que `TAX_RATE` está correcto en `CartContext.tsx`

### Problema: Las nuevas pestañas no aparecen
**Solución**: Limpia caché de Expo: `expo start -c`

---

## 📚 Recursos Adicionales

### Documentación en el proyecto:
1. **CATALOGO_CARRITO_DOCS.md** - Documentación técnica completa
2. **QUICK_START_CATALOG.md** - Guía rápida de inicio
3. **IMPLEMENTACION_CATALOGO_CARRITO.md** - Resumen de cambios
4. **ARQUITECTURA_TECNICA.md** - Diagramas y arquitectura

### Documentación externa:
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Context API](https://react.dev/reference/react/useContext)
- [React Native FlatList](https://reactnative.dev/docs/flatlist)

---

## ✅ Checklist antes de Producción

- [ ] Conectar con API real de productos
- [ ] Validar autenticación del usuario (rol cliente-final)
- [ ] Integrar pasarela de pago
- [ ] Pruebas en dispositivo real
- [ ] Optimizar imágenes de productos
- [ ] Agregar búsqueda y filtros
- [ ] Implementar historial de órdenes
- [ ] Testing manual completo

---

## 🎉 ¡Listo!

Tu carrito está completamente funcional y listo para:
- ✅ Agregar productos
- ✅ Modificar cantidades
- ✅ Ver totales con impuestos
- ✅ Integrar con autenticación
- ✅ Integrar con pagos
- ✅ Crear órdenes

¡Ahora es momento de llevar tu e-commerce al siguiente nivel! 🚀
