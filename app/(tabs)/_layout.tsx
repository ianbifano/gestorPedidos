import { Tabs } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CartBadge } from '@/components/CartBadge';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();
  const C = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarLabelPosition: 'below-icon',
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
            headerLargeTitle: true,
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="material" name="house" color={color} />,
            headerRight: () => (
              <TouchableOpacity onPress={() => signOut()} style={{ marginRight: 16 }}>
                <Text style={{ color: C.tint, fontSize: 15, fontWeight: '600' }}>Salir</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="catalogo"
          options={{
            title: 'Catálogo',
            headerTitle: 'Catálogo de Productos',
            headerLargeTitle: true,
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="material" name="shopping-bag" color={color} />,
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
          name="carrito"
          options={{
            title: 'Carrito',
            headerTitle: 'Mi Carrito',
            headerLargeTitle: true,
            tabBarIcon: ({ color }) => (
              <View>
                <IconSymbol size={28} pack="material" name="shopping-cart" color={color} />
                <CartBadge />
              </View>
            ),
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
