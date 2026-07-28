import { Redirect, Stack, useSegments } from 'expo-router';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { EstadosProvider } from '@/contexts/EstadosContext';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';

  if (!user && !inAuthScreen) {
    return <Redirect href="/login" />;
  }

  if (user && inAuthScreen) {
    return <Redirect href="/(tabs)" />;
  }

  if (user) {
    return <EstadosProvider>{children}</EstadosProvider>;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: true,
                headerBackTitleVisible: false,
              }}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />

              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animationEnabled: false,
                }}
              />

              <Stack.Screen name="crear-pedido" options={{ headerTitle: 'Crear Pedido', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="crear-cliente" options={{ headerTitle: 'Crear Cliente', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="editar-pedido" options={{ headerTitle: 'Editar Pedido', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="editar-cliente" options={{ headerTitle: 'Editar Cliente', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="pedido-detalle" options={{ headerTitle: 'Detalle del Pedido', presentation: 'card', animationEnabled: true }} />
              <Stack.Screen name="cliente-detalle" options={{ headerTitle: 'Detalle del Cliente', presentation: 'card', animationEnabled: true }} />
              <Stack.Screen name="producto-detalle" options={{ headerTitle: 'Detalle del Producto', presentation: 'card', animationEnabled: true }} />
              <Stack.Screen name="comercio-detalle" options={{ headerTitle: 'Detalle del Comercio', presentation: 'card', animationEnabled: true }} />
              <Stack.Screen name="comercios" options={{ headerTitle: 'Mis Comercios', presentation: 'card', animationEnabled: true }} />
              <Stack.Screen name="crear-comercio" options={{ headerTitle: 'Crear Comercio', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="editar-comercio" options={{ headerTitle: 'Editar Comercio', presentation: 'modal', animationEnabled: true }} />
              <Stack.Screen name="nuevo-producto" options={{ headerTitle: 'Nuevo Producto', presentation: 'modal', animationEnabled: true }} />
            </Stack>
          </AuthGuard>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
