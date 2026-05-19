# ⚡ QUICK START - Testing Rápido

## 🚀 Para empezar en 5 minutos

### 1. Iniciar la app
```bash
cd gestorPedidos
npx expo start
```

Luego:
- **iOS:** Presionar `i`
- **Android:** Presionar `a`
- **Web:** Presionar `w`

---

## ✅ 5 Tests Críticos (5 min cada uno)

### Test 1: Crear Cliente ✓
```
1. Ir a "Clientes"
2. Tocar "+ Nuevo Cliente"
3. Nombre: "Juan García"
4. Teléfono: "1165432109"
5. Guardar
→ Debe aparecer en lista
```

### Test 2: Crear Pedido ✓
```
1. Ir a "Pedidos"
2. Tocar "➕ Crear Pedido"
3. Seleccionar "Juan García"
4. Descripción: "Reparación aire"
5. Monto: "150.50"
6. Guardar
→ Debe aparecer con estado "Pendiente"
```

### Test 3: Cambiar Estado ✓
```
1. Tocar pedido recién creado
2. Tocar "En proceso"
3. Volver atrás
4. Volver al pedido
→ Estado debe ser "En proceso"
```

### Test 4: Editar Pedido ✓
```
1. Desde detalle de pedido
2. Tocar "✏️ Editar"
3. Cambiar monto a "200.00"
4. Guardar
5. Volver atrás
→ Monto debe actualizarse en lista
```

### Test 5: Dashboard Auto-refresh ✓
```
1. Crear nuevo pedido desde Dashboard
2. Ir a "Pedidos"
3. Volver a Dashboard
→ Contador "Pendiente" debe aumentar
```

---

## 🐛 Errores Comunes (y cómo solucionarlos)

| Error | Solución |
|-------|----------|
| `Cannot find module` | `npm install` |
| `Supabase URL not found` | Verificar `.env` |
| `Toast no funciona` | Refresh de app (Ctrl+M) |
| `Validación no aparece` | Toast en fondo, mirar arriba |
| `Teléfono duplicado` | Intentar con número diferente |

---

## 📊 Checklist de Features

- [ ] Dashboard muestra contadores
- [ ] FAB (botón azul flotante) funciona
- [ ] Crear cliente funciona
- [ ] Crear pedido funciona
- [ ] Estados cambian
- [ ] Detalle muestra información
- [ ] Editar funciona
- [ ] Eliminar funciona
- [ ] Filtros funcionan
- [ ] Auto-refresh funciona

---

## 🔍 Ver Logs

```bash
# En Expo, presionar:
# iOS:     Cmd+D en Simulator
# Android: Cmd+M en emulator

# O:
npx expo start --offline  # Modo offline
```

---

## 💾 Para resetear datos

```bash
# Ir a Supabase dashboard y limpiar tablas
# O en app:
# 1. Ir a Settings
# 2. "Clear all data"
# 3. Restart app
```

---

## ✨ Features Implementadas

✅ CRUD Clientes  
✅ CRUD Pedidos  
✅ Estados dinámicos  
✅ Dashboard  
✅ Filtros  
✅ Validaciones  
✅ Toast notifications  
✅ Auto-refresh  
✅ Editar/Eliminar  
✅ Performance optimizado  

---

**¡Listo para testing!** 🎉
