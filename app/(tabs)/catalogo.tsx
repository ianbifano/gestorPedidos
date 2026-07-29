import { ProductCard } from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { Producto } from '@/types/producto';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';

export default function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ modo?: string }>();
  const { isDueno } = useAuth();
  const { addItem, getSummary } = useCart();
  const { show: showToast } = useToast();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { productos, loading, fetchProductos, deleteProducto } = useProductos();
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerMode, setCustomerMode] = useState(params.modo === 'cliente');
  const { width: screenWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const isOwner = isDueno && !customerMode;

  const gap = 12;
  const horizontalPadding = isWeb ? 32 : 16;
  const minCardWidth = isWeb ? 250 : 160;
  const availableWidth = screenWidth - horizontalPadding * 2;

  const numColumns = isWeb
    ? Math.max(2, Math.floor((availableWidth + gap) / (minCardWidth + gap)))
    : 2;

  const cardWidth = (availableWidth - gap * (numColumns - 1)) / numColumns;

  useFocusEffect(
    useCallback(() => {
      fetchProductos();
    }, [fetchProductos])
  );

  const summary = getSummary();

  const filteredProductos = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const query = searchQuery.toLowerCase().trim();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query)) ||
        (p.comercio?.nombre && p.comercio.nombre.toLowerCase().includes(query))
    );
  }, [productos, searchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: horizontalPadding,
      paddingTop: 8,
      paddingBottom: 100,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
    },
    gridItem: {
      width: cardWidth,
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
    modeToggle: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 10,
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      padding: 3,
    },
    modeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 7,
      borderRadius: 6,
    },
    modeOptionActive: {
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    modeOptionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.icon,
    },
    modeOptionTextActive: {
      color: colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      paddingVertical: 2,
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
    addFirstButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.tint,
      borderRadius: 8,
    },
    addFirstButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 80,
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

  const handleAddToCart = (product: Producto) => {
    addItem({ ...product, comercio_nombre: product.comercio?.nombre } as any);
    setAddedProduct(product.nombre);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const handlePress = (product: Producto) => {
    router.push(`/producto-detalle?id=${product.id}` as any);
  };

  const handleEdit = (product: Producto) => {
    router.push(
      `/editar-producto?id=${product.id}&nombre=${encodeURIComponent(product.nombre)}&descripcion=${encodeURIComponent(product.descripcion ?? '')}&precio=${product.precio}` as any
    );
  };

  const handleDelete = (product: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que querés eliminar "${product.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProducto(product.id);
              showToast('Producto eliminado', 'success');
              fetchProductos();
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Error al eliminar', 'error');
            }
          },
        },
      ]
    );
  };

  const renderProduct = (product: Producto) => {
    return isOwner ? (
      <ProductCard product={product} onPress={handlePress} onEdit={handleEdit} onDelete={handleDelete} />
    ) : (
      <ProductCard product={product} onPress={handlePress} onAddToCart={handleAddToCart} />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Catálogo de Productos</Text>
          <Text style={styles.headerSubtitle}>
            {isOwner ? 'Administrá tu catálogo de productos' : 'Selecciona los productos que deseas'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo de Productos</Text>
        <Text style={styles.headerSubtitle}>
          {isOwner ? 'Administrá tu catálogo de productos' : 'Selecciona los productos que deseas'}
        </Text>
      </View>

      {isDueno && (
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeOption, !customerMode && styles.modeOptionActive]}
            onPress={() => setCustomerMode(false)}>
            <IconSymbol size={15} pack="material" name="edit" color={!customerMode ? colors.tint : colors.icon} />
            <Text style={[styles.modeOptionText, !customerMode && styles.modeOptionTextActive]}>
              Gestión
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeOption, customerMode && styles.modeOptionActive]}
            onPress={() => setCustomerMode(true)}>
            <IconSymbol size={15} pack="material" name="shopping-bag" color={customerMode ? colors.tint : colors.icon} />
            <Text style={[styles.modeOptionText, customerMode && styles.modeOptionTextActive]}>
              Compra
            </Text>
          </Pressable>
        </View>
      )}

      {productos.length > 0 && (
        <View style={styles.searchContainer}>
          <IconSymbol size={18} pack="material" name="search" color={colors.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por producto o comercio..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol size={18} pack="material" name="close" color={colors.icon} />
            </Pressable>
          )}
        </View>
      )}

      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol size={64} pack="material" name="shopping-bag" color={colors.icon} />
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
          {isOwner && (
            <Pressable style={styles.addFirstButton} onPress={() => router.push('/crear-producto' as any)}>
              <Text style={styles.addFirstButtonText}>+ Agregar primer producto</Text>
            </Pressable>
          )}
        </View>
      ) : filteredProductos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol size={64} pack="material" name="search-off" color={colors.icon} />
          <Text style={styles.emptyText}>No se encontraron productos</Text>
          <Text style={[styles.emptyText, { fontSize: 13 }]}>
            Probá con otro término de búsqueda
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[
            styles.gridContainer,
            isWeb && ({
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
              gap,
            } as any),
          ]}>
            {isWeb
              ? filteredProductos.map((item) => (
                  <View key={item.id}>
                    {renderProduct(item)}
                  </View>
                ))
              : filteredProductos.map((item) => (
                  <View key={item.id} style={styles.gridItem}>
                    {renderProduct(item)}
                  </View>
                ))
            }
          </View>
        </ScrollView>
      )}

      {!isOwner && showAddedToast && (
        <View style={styles.toastContainer}>
          <IconSymbol size={20} pack="material" name="check-circle" color="#FFFFFF" />
          <Text style={styles.toastText}>{addedProduct} agregado al carrito</Text>
        </View>
      )}

      {!isOwner && summary.totalItems > 0 && (
        <Pressable
          style={styles.floatingCartContainer}
          onPress={() => router.push('/(tabs)/carrito')}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartLabel}>
              {summary.totalItems} producto{summary.totalItems !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartTotal}>
              ${summary.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.cartButton}>
            <Text style={styles.cartButtonText}>Ver</Text>
            <IconSymbol size={18} pack="material" name="arrow-forward" color="#FFFFFF" />
          </View>
        </Pressable>
      )}

      {isOwner && (
        <Pressable
          style={styles.floatingCartContainer}
          onPress={() => router.push('/crear-producto' as any)}>
          <Text style={[styles.cartTotal, { flex: 1, textAlign: 'center' }]}>+ Agregar Producto</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
