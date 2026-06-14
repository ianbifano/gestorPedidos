import { Colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function CartBadge() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  if (totalItems === 0) return null;

  const styles = StyleSheet.create({
    badge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.danger,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
    </View>
  );
}
