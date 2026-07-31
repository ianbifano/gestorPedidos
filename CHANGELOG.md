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


## E3 - Cambios respecto a E2


Esta entrega mantiene el flujo base de E2 para autenticación, roles, catálogo y carrito, y agrega el ABM de comercios, roles derivados de la pertenencia a un comercio, productos asociados a un comercio con publicación y disponibilidad, buscador de catálogo, tema claro/oscuro y el flujo de confirmación del carrito que genera un pedido por comercio con los datos del usuario autenticado como cliente.


### Agregado


- ABM de comercios (crear, listar, editar y eliminar) en `app/comercios.tsx`, `app/crear-comercio.tsx` y `app/editar-comercio.tsx`, con pantalla de detalle en `app/comercio-detalle.tsx`.
- Contexto global de comercios en `contexts/ComerciosContext.tsx`, expuesto mediante `hooks/use-comercios.ts`, que vincula al usuario autenticado con sus comercios a través de la tabla `users_x_comercios`.
- Roles derivados dinámicamente desde `users_x_comercios`: `contexts/AuthContext.tsx` consulta los vínculos del usuario para determinar si es dueño (`isDueno`).
- Dashboard por comercio en `app/(tabs)/index.tsx` con chips para alternar entre comercios y estadísticas, estados y últimos pedidos filtrados por comercio.
- Estado vacío para usuarios sin comercios, con accesos a "Ingresar como Cliente" y "+ Crear mi Comercio".
- Asociación de productos a un comercio al crearlos en `app/crear-producto.tsx` y `app/nuevo-producto.tsx`.
- Publicación y disponibilidad de productos: toggles "Publicado/Borrador" y "Activo/Inactivo" en `components/ProductCard.tsx` y desde `app/comercio-detalle.tsx`, persistidos en `hooks/use-productos.ts` (`togglePublicado`, `toggleDisponible`).
- Modo Gestión/Compra en `app/(tabs)/catalogo.tsx` para el dueño, con filtro por comercio.
- Búsqueda en el catálogo por nombre de producto o de comercio en `app/(tabs)/catalogo.tsx`.
- Nombre del comercio vendedor visible en la tarjeta de producto (`components/ProductCard.tsx`), en el detalle (`app/producto-detalle.tsx`) y en el carrito.
- Flujo de confirmación del carrito en `hooks/use-pedido-desde-carrito.ts`: agrupa los productos por comercio, calcula IVA (21%) y crea un pedido por comercio con estado "Pendiente".
- Creación automática del cliente a partir del usuario autenticado (fila en `clientes` con `user_id`) al procesar el pago.
- Sección "Mis Compras" en `app/(tabs)/explore.tsx` para que el cliente haga el seguimiento de sus pedidos.
- Tema claro/oscuro mediante `contexts/ThemeContext.tsx` y toggle en `components/ThemeToggle.tsx`.
- Componente `components/ConfirmModal.tsx` para confirmar acciones destructivas.
- Scripts SQL de soporte en `scripts/`: RLS para `comercios`, `productos` y `pedidos`, vínculos `users_x_comercios` e índices de performance.


### Cambiado


- El rol ya no se resuelve solo con los datos del registro: ahora se deriva de los vínculos del usuario con comercios en `users_x_comercios` y se refresca tras crear un comercio (`refreshRole`).
- Los productos ahora pertenecen a un comercio (`comercio_id`) y el catálogo del dueño se filtra por comercio.
- `app/(tabs)/explore.tsx` distingue los pedidos recibidos por comercio de las compras del cliente y agrupa los pedidos por comercio.
- La pestaña de pedidos adapta su título según el usuario tenga o no comercios ("Mis Pedidos" vs "Mis Compras") en `app/(tabs)/_layout.tsx`.
- `hooks/use-pedidos.ts` filtra los pedidos por los comercios del usuario y agrega la carga de pedidos del cliente (`fetchPedidosCliente`).
- `app/editar-producto.tsx` ahora permite editar precio, disponibilidad y publicación del producto.
- El carrito conserva el comercio de cada producto para generar pedidos por comercio al confirmar la compra.
- La navegación principal incorpora el toggle de tema y el cierre de sesión en el encabezado.


### Conservado de E2


- Autenticación, registro y cierre de sesión.
- Catálogo diferenciado por rol.
- Gestión de productos con imágenes.
- Carrito de compras.
- Creación, listado, filtro, detalle, edición y eliminación de pedidos.
- Cambio de estado del pedido desde la pantalla de detalle.
- Carga dinámica de estados desde `pedidos_estados` con fallback local.
- Dashboard con resumen de pedidos por estado.
- Persistencia en Supabase.


### Sin regresiones esperadas


- El dueño sin comercios puede crear su primer comercio o comprar como cliente desde el dashboard.
- El cliente sin comercios conserva el flujo de compra de E2.
- Los pedidos existentes siguen mostrándose; los que no tienen `comercio_id` se agrupan en "Otros".
- Los estados de pedido se resuelven con los mismos mecanismos de E2 en todas las pantallas.
- La gestión de clientes y pedidos de E1 sigue disponible.


### Verificación recomendada


- Ejecutar `npm run lint` para validar reglas de Expo/ESLint.
- Ejecutar `npx tsc --noEmit` para validar TypeScript.
- Probar el flujo de dueño: registrarse, crear un comercio, crear un producto asociado, publicarlo/despublicarlo, habilitarlo/deshabilitarlo, modificar su precio y eliminar el comercio.
- Probar el flujo de cliente: navegar el catálogo, buscar por producto o comercio, agregar al carrito, procesar el pago y confirmar que el pedido aparece en "Mis Compras" y en el dashboard del comercio.
- Confirmar que el dashboard filtra estadísticas y pedidos según el comercio seleccionado.
- Confirmar que el modo Gestión/Compra del catálogo funciona para dueños.


### Pendiente para E4


- Agregar tests automatizados para roles, comercios, catálogo, carrito y estados dinámicos.
- Revisar la política RLS de `pedidos_estados` para garantizar el acceso de lectura sin depender del fallback local.
- Filtrar el catálogo del cliente para mostrar solo productos publicados y disponibles.
- Definir una pasarela de pago real (el flujo actual confirma el carrito y genera el pedido sin procesar un cobro).