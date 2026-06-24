# Changelog


## E2 - Cambios respecto a E1


Esta entrega mantiene el flujo base de E1 para gestionar clientes y pedidos, y agrega autenticación, roles de usuario, gestión de productos con imágenes, catálogo diferenciado por rol, carrito de compras y carga dinámica de estados desde la base de datos.


### Agregado


- Sistema de roles al momento del registro: dueno (`dueno`) o cliente (`cliente`) persistido en `user_metadata` de Supabase en `app/register.tsx`.
- Contexto global de roles derivado desde la sesión activa en `contexts/AuthContext.tsx`, sin estado separado.
- Catálogo de productos diferenciado por rol en `app/(tabs)/catalogo.tsx`: el dueño gestiona el inventario, el cliente navega y agrega al carrito.
- Gestión completa de productos (crear, editar, eliminar) en `app/crear-producto.tsx` y `app/editar-producto.tsx`, accesibles solo para dueños.
- Subida de imagen de producto al storage de Supabase mediante `src/services/uploadProductoImagen.ts`.
- Carrito de compras con contexto global en `contexts/CartContext.tsx`, visible solo para clientes.
- Componente `components/ProductCard.tsx` con dos modos: modo dueno (botones Editar y Eliminar) y modo cliente (botón Agregar al carrito).
- Carga dinámica de estados de pedido desde la tabla `pedidos_estados` de Supabase mediante `contexts/EstadosContext.tsx`.
- Fallback local de estados cuando la tabla `pedidos_estados` no devuelve datos por restricciones RLS.
- Boton de cierre de sesión en la navegacion principal en `app/(tabs)/_layout.tsx`.


### Cambiado


- Los estados de pedido ya no están hardcodeados en `types/pedido.ts`; todos los componentes consumen `useEstados()`.
- Las pestañas Carrito y Clientes se muestran u ocultan según el rol del usuario autenticado.
- El rol queda fijo al momento del registro; no puede seleccionarse en el login.
- `components/ProductCard.tsx` fue reescrito para usar el tipo `Producto` (id numérico) en lugar del tipo anterior `Product` (id string).
- `hooks/use-productos.ts` envuelve `fetchProductos` en `useCallback` para estabilizar la referencia y evitar re-renders en cadena.
- Los errores de Supabase (`PostgrestError`) se manejan como objetos planos en `hooks/use-pedidos.ts`, corrigiendo el mensaje "Error desconocido".
- El fetch de estados en `contexts/EstadosContext.tsx` espera la sesión activa antes de consultar la base de datos.


### Conservado de E1


- Dashboard con resumen de pedidos por estado.
- Creación, listado, filtro, detalle, edición y eliminación de pedidos.
- Creación, listado, detalle, edición y eliminación de clientes.
- Cambio de estado del pedido desde la pantalla de detalle.
- Persistencia en Supabase.


### Sin regresiones esperadas


- Las features de E1 siguen disponibles luego del login.
- Los usuarios registrados sin rol asignado pueden seguir usando la app; el contexto los trata como clientes por defecto.
- Los pedidos existentes de E1 siguen mostrando su estado correctamente; los estados se resuelven desde la BD o desde el fallback local.
- Los contadores del dashboard y los filtros de la lista de pedidos usan los mismos estados que antes.
- La gestión de clientes y pedidos no se ve afectada por los cambios de catálogo.


### Verificación recomendada


- Ejecutar `npm run lint` para validar reglas de Expo/ESLint.
- Ejecutar `npx tsc --noEmit` para validar TypeScript.
- Probar el flujo de dueño: registrarse como dueño, crear producto con imagen, editarlo y eliminarlo.
- Probar el flujo de cliente: registrarse como cliente, navegar el catálogo, agregar productos al carrito.
- Confirmar que el catálogo no muestra opciones de gestión al cliente ni el carrito al dueño.
- Probar el flujo E1 completo con sesión iniciada: crear cliente, crear pedido, listar, filtrar, ver detalle, cambiar estado, editar y eliminar.
- Confirmar que los estados del pedido se muestran con nombre en todas las pantallas (inicio, detalle, lista, detalle de cliente).


### Pendiente para E3


- Agregar columna `user_id` a las tablas `pedidos` y `clientes` para aislamiento real de datos por usuario (requiere ejecutar migración en Supabase).
- Revisar política RLS de `pedidos_estados` para garantizar acceso de lectura sin depender del fallback local.
- Definir flujo de pago o confirmación del carrito para el rol cliente.
- Agregar tests automatizados para roles, catálogo, carrito y estados dinámicos.