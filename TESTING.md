# 🧪 TESTING - Gestor de Pedidos

## Flujo Crítico: Crear → Editar → Eliminar → Dashboard

### ✅ Test 1: Crear Cliente

**Pasos:**
1. Ir a pestaña **Clientes**
2. Tocar botón **+ Nuevo Cliente**
3. Ingresar nombre: "Juan García"
4. Ingresar teléfono: "1165432109"
5. Tocar **Guardar**

**Esperado:**
- ✓ Se cierra modal
- ✓ Cliente aparece en lista ordenado alfabéticamente
- ✓ Mensaje "Cliente creado correctamente"
- ✓ Teléfono se normaliza sin caracteres especiales

**Edge Cases:**
- ✓ Nombre vacío → Alert "El nombre es obligatorio"
- ✓ Nombre con 1 carácter → Alert "Mínimo 2 caracteres"
- ✓ Teléfono < 7 dígitos → Alert "Teléfono inválido"
- ✓ Mismo teléfono 2x → Alert "Ya existe un cliente con este teléfono"

---

### ✅ Test 2: Crear Pedido

**Pasos:**
1. Ir a pestaña **Pedidos** o **Dashboard**
2. Tocar **➕ Crear Pedido** (FAB o botón)
3. Seleccionar cliente (tocar selector)
4. Elegir "Juan García"
5. Ingresar descripción: "Reparación aire acondicionado"
6. Ingresar monto: "150.50"
7. Tocar **Guardar Pedido**

**Esperado:**
- ✓ Se cierra modal
- ✓ Pedido aparece en lista de Pedidos
- ✓ Estado inicial: "Pendiente"
- ✓ Dashboard se actualiza con nuevo contador
- ✓ Mensaje "Pedido creado correctamente"

**Edge Cases:**
- ✓ Descripción < 5 caracteres → Alert
- ✓ Monto <= 0 → Alert "El monto debe ser mayor a 0"
- ✓ Monto no número → Alert "El monto debe ser un número"
- ✓ Sin cliente → Alert "Debe seleccionar un cliente"

---

### ✅ Test 3: Ver Detalle Pedido

**Pasos:**
1. Desde lista de Pedidos, tocar el pedido recién creado
2. Verificar información completa

**Esperado:**
- ✓ Se abre pantalla de detalle
- ✓ Muestra: Pedido #X, cliente, descripción, monto, fecha
- ✓ Estado actual: "Pendiente"
- ✓ Botones visibles: Editar, Eliminar

---

### ✅ Test 4: Cambiar Estado

**Pasos:**
1. Desde detalle del pedido
2. Tocar botón **En proceso**
3. Verificar cambio

**Esperado:**
- ✓ Badge cambia de naranja a azul
- ✓ Botón "En proceso" se resalta
- ✓ Se actualiza en BD
- ✓ Al volver a lista, estado se refleja

**Estados a probar:**
- Pendiente → En proceso ✓
- En proceso → Entregado ✓
- Entregado → Pendiente ✓

---

### ✅ Test 5: Editar Pedido

**Pasos:**
1. Desde detalle, tocar botón **✏️ Editar**
2. Modificar descripción: "Reparación urgente aire"
3. Modificar monto: "200.00"
4. Tocar **Guardar Cambios**

**Esperado:**
- ✓ Se cierra modal
- ✓ Detalle se actualiza
- ✓ Listado refleja cambios
- ✓ Mensaje "Pedido actualizado correctamente"

---

### ✅ Test 6: Auto-Refresh en Pantallas

**Pasos:**
1. Crear pedido nuevo en Dashboard
2. Ir a pestaña **Pedidos**
3. Volver a **Dashboard**
4. Verificar contador actualizado

**Esperado:**
- ✓ Dashboard se actualiza automáticamente al volver
- ✓ Últimos pedidos reflejan cambios
- ✓ Estadísticas (total, 7 días, tasa entrega) actualizadas

---

### ✅ Test 7: Filtrar por Estado

**Pasos:**
1. Dashboard → tocar card "Pendiente"
2. Verifica que muestre solo pedidos Pendiente
3. Volver atrás
4. Dashboard → tocar "En proceso"
5. Verifica que muestre solo "En proceso"

**Esperado:**
- ✓ Filtrado funciona correctamente
- ✓ URL incluye parámetro `?estado=Pendiente`
- ✓ Botón "Ver todos →" vuelve a mostrar todos

---

### ✅ Test 8: Eliminar Pedido

**Pasos:**
1. Desde detalle de pedido, tocar **🗑️ Eliminar**
2. En alert, confirmar "Eliminar"

**Esperado:**
- ✓ Alert pide confirmación
- ✓ Pedido desaparece de lista
- ✓ Dashboard se actualiza
- ✓ Mensaje "Pedido eliminado"

**Cancel case:**
- ✓ Tocar "Cancelar" no elimina nada

---

### ✅ Test 9: Ver Detalle Cliente

**Pasos:**
1. Ir a **Clientes**
2. Tocar cliente "Juan García"
3. Verifica pantalla de detalle

**Esperado:**
- ✓ Muestra: nombre, teléfono, fecha registro
- ✓ Estadísticas: total pedidos, entregados, monto total
- ✓ Listado de todos los pedidos del cliente
- ✓ Botones: Editar, Eliminar

---

### ✅ Test 10: Editar Cliente

**Pasos:**
1. Desde detalle cliente, tocar **✏️ Editar**
2. Cambiar nombre: "Juan Manuel García"
3. Cambiar teléfono: "1198765432"
4. Tocar **Guardar Cambios**

**Esperado:**
- ✓ Cliente se actualiza en listado
- ✓ Detalle se actualiza
- ✓ Pedidos siguen asociados al cliente

---

### ✅ Test 11: Eliminar Cliente

**Pasos:**
1. Desde detalle cliente, tocar **🗑️ Eliminar**
2. Confirmar en alert

**Esperado:**
- ✓ Cliente desaparece de lista
- ✓ Pedidos del cliente quedan huérfanos o se manejan según RLS
- ✓ Mensaje "Cliente eliminado"

---

### ✅ Test 12: Dashboard - Últimos Pedidos

**Pasos:**
1. Crear 5 pedidos diferentes
2. Ir a Dashboard
3. Verificar sección "Últimos Pedidos"

**Esperado:**
- ✓ Muestra máximo 3 pedidos más recientes
- ✓ Ordenados por fecha descendente
- ✓ Link "Ver todos →" lleva a lista completa

---

### ✅ Test 13: Validaciones en Creación

**Pasos:**
Probar todos los edge cases:

**Cliente:**
- [ ] Nombre vacío
- [ ] Nombre < 2 caracteres
- [ ] Teléfono inválido
- [ ] Duplicado teléfono

**Pedido:**
- [ ] Sin cliente
- [ ] Descripción < 5 caracteres
- [ ] Monto = 0
- [ ] Monto negativo
- [ ] Monto no número

---

### ✅ Test 14: Navegación

**Pasos:**
1. Crear pedido desde FAB en Pedidos
2. Editar pedido desde Detalle
3. Ver cliente desde pedido
4. Volver atrás en todas las pantallas

**Esperado:**
- ✓ Navegación fluida sin errores
- ✓ Back button funciona correctamente
- ✓ Modales cierran con gestos y botones

---

### ✅ Test 15: Rendimiento

**Pasos:**
1. Crear 20+ pedidos
2. Listar todos
3. Desplazar lista hacia abajo/arriba
4. Cambiar de pestaña y volver

**Esperado:**
- ✓ Scroll fluido (sin lag)
- ✓ No se congela la app
- ✓ Transiciones suaves

---

## 📊 Matriz de Pruebas

| Test | Feature | Estado | Notas |
|------|---------|--------|-------|
| 1 | Crear Cliente | ⏳ Pendiente | |
| 2 | Crear Pedido | ⏳ Pendiente | |
| 3 | Ver Detalle | ⏳ Pendiente | |
| 4 | Cambiar Estado | ⏳ Pendiente | |
| 5 | Editar Pedido | ⏳ Pendiente | |
| 6 | Auto-Refresh | ⏳ Pendiente | |
| 7 | Filtrar Estado | ⏳ Pendiente | |
| 8 | Eliminar Pedido | ⏳ Pendiente | |
| 9 | Detalle Cliente | ⏳ Pendiente | |
| 10 | Editar Cliente | ⏳ Pendiente | |
| 11 | Eliminar Cliente | ⏳ Pendiente | |
| 12 | Dashboard Últimos | ⏳ Pendiente | |
| 13 | Validaciones | ⏳ Pendiente | |
| 14 | Navegación | ⏳ Pendiente | |
| 15 | Rendimiento | ⏳ Pendiente | |

---

## Instrucciones de Uso

1. Antes de cada test, anotar la hora
2. Seguir pasos en orden
3. Verificar cada "Esperado"
4. Si falla, anotar bug con:
   - Paso exacto donde falló
   - Comportamiento actual
   - Comportamiento esperado
   - Pasos para reproducir
5. Al finalizar, actualizar matriz

## Bugs Encontrados

(Ninguno aún)

---

**Última actualización:** 2024-05
