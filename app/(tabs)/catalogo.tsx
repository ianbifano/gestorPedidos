import { ProductCard } from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PRODUCTOS } from '@/constants/Productos';
import { Colors } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function CatalogScreen() {
  const router = useRouter();
  const { addItem, getSummary } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string>('');

  const summary = getSummary();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 80,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.icon,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 80,
    },
    emptyText: {
      fontSize: 16,
      color: colors.icon,
      marginTop: 12,
    },
    floatingCartContainer: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      left: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.tint,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cartInfo: {
      flexDirection: 'column',
    },
    cartLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
      fontWeight: '600',
    },
    cartTotal: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    cartButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cartButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    toastContainer: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.success,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      zIndex: 1000,
    },
    toastText: {
      color: '#FFFFFF',
      fontWeight: '600',
      flex: 1,
      fontSize: 13,
    },
  });

  const handleAddToCart = (product: any) => {
    addItem(product);
    setAddedProduct(product.nombre);
    setShowAddedToast(true);

    setTimeout(() => {
      setShowAddedToast(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo de Productos</Text>
        <Text style={styles.headerSubtitle}>
          Selecciona los productos que deseas
        </Text>
      </View>

      {PRODUCTOS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            size={64}
            pack="material"
            name="shopping-bag"
            color={colors.icon}
          />
          <Text style={styles.emptyText}>
            No hay productos disponibles
          </Text>
        </View>
      ) : (
        <FlatList
          data={PRODUCTOS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.contentContainer}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAddToCart={handleAddToCart}
            />
          )}
        />
      )}

      {showAddedToast && (
        <View style={styles.toastContainer}>
          <IconSymbol
            size={20}
            pack="material"
            name="check-circle"
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>
            {addedProduct} agregado al carrito
          </Text>
        </View>
      )}

      {summary.totalItems > 0 && (
        <Pressable
          style={styles.floatingCartContainer}
          onPress={() => router.push('/(tabs)/carrito')}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartLabel}>
              {summary.totalItems} producto{summary.totalItems !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartTotal}>
              ${summary.total.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.cartButton}>
            <Text style={styles.cartButtonText}>Ver</Text>
            <IconSymbol
              size={18}
              pack="material"
              name="arrow-forward"
              color="#FFFFFF"
            />
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
