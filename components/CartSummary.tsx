import { Colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export function CartSummary() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items, updateQuantity, removeItem, getSummary } = useCart();

  const summary = getSummary();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.icon,
      marginTop: 12,
    },
    listContent: {
      paddingVertical: 8,
    },
    itemContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 13,
      color: colors.tint,
      fontWeight: '600',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.lightGray,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    quantityButton: {
      padding: 4,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantity: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderTopWidth: 2,
      borderTopColor: colors.border,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 14,
      color: colors.icon,
    },
    totalValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    finalTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    finalTotalLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    finalTotalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.tint,
    },
    checkoutButton: {
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.tint,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol
            size={64}
            pack="material"
            name="shopping-cart"
            color={colors.icon}
          />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.nombre}</Text>
              <Text style={styles.productPrice}>
                ${item.product.precio.toLocaleString('es-AR')} c/u
              </Text>
            </View>

            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  updateQuantity(item.product.id, item.cantidad - 1)
                }>
                <IconSymbol
                  size={16}
                  pack="material"
                  name="remove"
                  color={colors.tint}
                />
              </Pressable>
              <Text style={styles.quantity}>{item.cantidad}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  updateQuantity(item.product.id, item.cantidad + 1)
                }>
                <IconSymbol
                  size={16}
                  pack="material"
                  name="add"
                  color={colors.tint}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={() => removeItem(item.product.id)}>
              <IconSymbol
                size={20}
                pack="material"
                name="delete"
                color={colors.danger}
              />
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ${summary.subtotal.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (21%):</Text>
              <Text style={styles.totalValue}>
                ${summary.impuestos.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>
                ${summary.total.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <Pressable style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}
