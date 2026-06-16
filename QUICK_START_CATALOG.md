# 🛒 Guía Rápida: Catálogo y Carrito

## ¿Qué se implementó?

Se creó un sistema completo de **compra online** con:
- 📱 Pantalla de **Catálogo** con productos en grid
- 🛒 Pantalla de **Carrito** para gestionar compras
- 🎯 **Estado global** del carrito (Context API)
- 💾 Cálculo automático de **totales e impuestos**

## 🎯 Ubicación en la App

La app ahora tiene 5 pestañas en lugar de 3:

1. **Home** - Existente
2. **Catálogo** ✨ NUEVO - Ver productos
3. **Pedidos** - Existente
4. **Carrito** ✨ NUEVO - Gestionar compras
5. **Clientes** - Existente

## 📂 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `types/product.ts` | Tipos TypeScript para productos y carrito |
| `contexts/CartContext.tsx` | Estado global del carrito |
| `components/ProductCard.tsx` | Tarjeta individual de producto |
| `components/CartSummary.tsx` | Resumen y gestión del carrito |
| `components/CartBadge.tsx` | Insignia con cantidad de items |
| `app/(tabs)/catalogo.tsx` | Pantalla principal de compras |
| `app/(tabs)/carrito.tsx` | Pantalla del carrito |

## 📊 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `app/_layout.tsx` | Agregado CartProvider |
| `app/(tabs)/_layout.tsx` | Nuevas pestañas: catalogo y carrito |
| `constants/Productos.ts` | Actualizado con más datos y tipos |

## 🚀 Uso Básico

### Agregar al carrito desde cualquier componente:
```typescript
import { useCart } from '@/contexts/CartContext';

function MiComponente() {
  const { addItem } = useCart();
  
  const handleComprar = () => {
    addItem({ id: '1', nombre: 'Pizza', precio: 12000 });
  };
  
  return <Button onPress={handleComprar}>Comprar</Button>;
}
```

### Obtener resumen del carrito:
```typescript
const { getSummary } = useCart();
const summary = getSummary();
console.log(`Total: $${summary.total}`); // Total con impuestos
```

## 🔄 Flujo de Usuario

```
┌─────────────────┐
│  Home/Catálogo  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Ver Productos       │
│  (Grid 2 columnas)   │
└────────┬─────────────┘
         │
         ▼ (Click "Agregar")
┌──────────────────────┐
│  Toast confirmación  │
│  Badge actualizado   │
└────────┬─────────────┘
         │
         ▼ (Click botón flotante)
┌──────────────────────┐
│  Carrito             │
│  - Listar productos  │
│  - Modificar cant.   │
│  - Ver totales       │
│  - Proceder al pago  │
└──────────────────────┘
```

## 🎨 Características Destacadas

✅ **Responsive** - Funciona en móvil, tablet y web  
✅ **Temas** - Soporta modo claro y oscuro automáticamente  
✅ **Sincronización** - El carrito se actualiza en tiempo real  
✅ **Impuestos** - Cálculo automático de IVA 21%  
✅ **Feedback** - Toasts y badges para confirmaciones  
✅ **Seguro** - TypeScript con tipos completos  

## 🔌 Próximas Integraciones

### 1. Autenticación
```typescript
// Proteger catálogo para clientes finales
const { user } = useAuth();
if (user?.rol !== 'cliente-final') return <NeedAuth />;
```

### 2. API Dinámica
```typescript
useEffect(() => {
  fetch('/api/productos')
    .then(r => r.json())
    .then(setProducts);
}, []);
```

### 3. Pago
```typescript
// En CartSummary.tsx, reemplazar "Proceder al Pago"
const handlePago = async () => {
  const result = await initiateMercadoPago(summary);
  if (result.success) clearCart();
};
```

### 4. Crear Pedido
```typescript
// Desde carrito
const { createOrder } = useOrderAPI();
const handleCheckout = () => {
  createOrder(summary.items);
  clearCart();
};
```

## 💡 Tips Importantes

1. **El contexto CartProvider** está en `app/_layout.tsx`, así que el carrito funciona en toda la app

2. **Los productos** están en `constants/Productos.ts`, reemplaza con API cuando esté lista

3. **El IVA es 21%**, ajusta en `CartContext.tsx` si cambias

4. **El badge se actualiza automático**, no necesitas hacer nada extra

5. **Toast de confirmación** aparece 2 segundos al agregar

## 📋 Checklist antes de Producción

- [ ] Conectar con API de productos
- [ ] Validar rol del usuario (cliente final)
- [ ] Integrar pasarela de pago
- [ ] Crear pedido después del pago
- [ ] Persistir carrito en AsyncStorage
- [ ] Agregar más categorías de productos
- [ ] Pruebas de edge cases (carrito vacío, productos sin stock, etc.)
- [ ] Traducir strings a múltiples idiomas si es necesario

## ❓ FAQs

**P: ¿Cómo cambio el porcentaje de impuestos?**  
R: En `CartContext.tsx`, línea 5: `const TAX_RATE = 0.21;`

**P: ¿Cómo agrego más productos?**  
R: En `constants/Productos.ts`, agrega a la array `PRODUCTOS`

**P: ¿Cómo persisto el carrito entre sesiones?**  
R: Importa `AsyncStorage` y guarda/restaura en `CartContext.tsx`

**P: ¿Cómo cargo productos desde una API?**  
R: Ver sección "API Dinámica" en Próximas Integraciones

---

¡Listo para vender! 🎉
