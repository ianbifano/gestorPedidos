import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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
