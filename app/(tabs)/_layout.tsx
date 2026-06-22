import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login' as any);
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarLabelPosition: 'below-icon',
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión">
              <IconSymbol size={24} pack="material" name="logout" color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
          ),
          tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: 'Gestor de Pedidos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="material" name="house" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Pedidos',
            headerTitle: 'Mis Pedidos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="ant" name="dropbox" color={color} />,
          }}
        />
        <Tabs.Screen
          name="clientes"
          options={{
            title: 'Clientes',
            headerTitle: 'Gestionar Clientes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="fontawesome" name="users" color={color} />,
          }}
        />
      </Tabs>
      
      {/* <FAB 
        onPress={() => router.push('/crear-pedido')}
        icon="dropbox"
        position="center"
        pack="ant"
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
