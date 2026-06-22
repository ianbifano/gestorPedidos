import { Stack } from 'expo-router';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ToastProvider>
  );
}

function RootStack() {
  const { session, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="crear-pedido"
          options={{
            headerTitle: 'Crear Pedido',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="crear-cliente"
          options={{
            headerTitle: 'Crear Cliente',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="clientes-crear"
          options={{
            headerTitle: 'Crear Cliente',
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name="editar-pedido"
          options={{
            headerTitle: 'Editar Pedido',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="editar-cliente"
          options={{
            headerTitle: 'Editar Cliente',
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name="pedido-detalle"
          options={{
            headerTitle: 'Detalle del Pedido',
            presentation: 'card',
          }}
        />

        <Stack.Screen
          name="cliente-detalle"
          options={{
            headerTitle: 'Detalle del Cliente',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="users"
          options={{
            headerTitle: 'Usuarios',
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            headerTitle: 'Modal',
            presentation: 'modal',
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

function AuthLoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.loadingText}>Cargando sesión...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F5CF6',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});
