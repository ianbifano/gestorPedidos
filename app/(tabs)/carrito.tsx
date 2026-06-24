import { CartSummary } from '@/components/CartSummary';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { SafeAreaView } from 'react-native';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}>
      <CartSummary />
    </SafeAreaView>
  );
}
