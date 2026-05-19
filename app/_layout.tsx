import { Stack } from 'expo-router';
import { ToastProvider } from '@/components/Toast';

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
        }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animationEnabled: false,
          }} 
        />
        
        {/* Modals para crear */}
        <Stack.Screen
          name="crear-pedido"
          options={{
            headerTitle: 'Crear Pedido',
            presentation: 'modal',
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="crear-cliente"
          options={{
            headerTitle: 'Crear Cliente',
            presentation: 'modal',
            animationEnabled: true,
          }}
        />
        
        {/* Modals para editar */}
        <Stack.Screen
          name="editar-pedido"
          options={{
            headerTitle: 'Editar Pedido',
            presentation: 'modal',
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="editar-cliente"
          options={{
            headerTitle: 'Editar Cliente',
            presentation: 'modal',
            animationEnabled: true,
          }}
        />
        
        {/* Modal para detalle pedido */}
        <Stack.Screen
          name="pedido-detalle"
          options={{
            headerTitle: 'Detalle del Pedido',
            presentation: 'card',
            animationEnabled: true,
          }}
        />
        
        {/* Modal para detalle cliente */}
        <Stack.Screen
          name="cliente-detalle"
          options={{
            headerTitle: 'Detalle del Cliente',
            presentation: 'card',
            animationEnabled: true,
          }}
        />
      </Stack>
    </ToastProvider>
  );
}