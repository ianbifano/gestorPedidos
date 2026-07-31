import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CartBadge } from '@/components/CartBadge';
import { HapticTab } from '@/components/haptic-tab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useComercios } from '@/hooks/use-comercios';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();
  const { comercios, fetchComercios } = useComercios();
  const C = Colors[colorScheme];
  const tieneComercios = comercios.length > 0;

  useFocusEffect(
    useCallback(() => {
      fetchComercios();
    }, [fetchComercios])
  );

  const headerRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
      <ThemeToggle />
      <TouchableOpacity onPress={() => signOut()}>
        <Text style={{ color: C.tint, fontSize: 15, fontWeight: '600' }}>Salir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: C.tabIconSelected,
          tabBarInactiveTintColor: C.tabIconDefault,
          headerShown: true,
          headerStyle: { backgroundColor: C.card },
          headerTintColor: C.text,
          tabBarButton: HapticTab,
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: {
            backgroundColor: C.card,
            borderTopColor: C.border,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerRight,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: 'Gestor de Pedidos',
            headerLargeTitle: true,
            tabBarIcon: ({ color }) => <IconSymbol size={28} pack="material" name="house" color={color} />,
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
            title: tieneComercios ? 'Pedidos' : 'Mis Compras',
            headerTitle: tieneComercios ? 'Mis Pedidos' : 'Mis Compras',
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
      </Tabs>
    </View>
  );
}
