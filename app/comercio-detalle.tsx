import { ConfirmModal } from '@/components/ConfirmModal';
import { ProductCard } from '@/components/ProductCard';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { supabase } from '@/constants/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { useProductos } from '@/hooks/use-productos';
import { Producto } from '@/types/producto';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ComercioDetalle = {
  id: number;
  nombre: string;
  created_at: string;
};

export default function ComercioDetalleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { show: showToast } = useToast();
  const { deleteProducto, togglePublicado, toggleDisponible } = useProductos();
  const { deleteComercio } = useComercios();

  const [comercio, setComercio] = useState<ComercioDetalle | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);

  const id = params.id ? Number(params.id) : null;
  const nombre = params.nombre as string;

  const fetchComercioProductos = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [comercioResult, productosResult] = await Promise.all([
        supabase.from('comercios').select('*').eq('id', id).single(),
        supabase.from('productos').select('*').eq('comercio_id', id).order('nombre'),
      ]);

      if (comercioResult.error) throw comercioResult.error;
      if (productosResult.error) throw productosResult.error;

      setComercio(comercioResult.data);
      setProductos(productosResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comercio');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchComercioProductos();
    }, [fetchComercioProductos])
  );

  const handleDelete = (producto: Producto) => {
    setProductoAEliminar(producto);
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;
    const product = productoAEliminar;
    setProductoAEliminar(null);
    try {
      await deleteProducto(product.id);
      showToast('Producto eliminado', 'success');
      fetchComercioProductos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      Alert.alert('Error', msg);
      console.error('[Eliminar producto]', err);
    }
  };

  const cancelarEliminar = () => {
    setProductoAEliminar(null);
  };

  const handleEdit = (producto: Producto) => {
    router.push(
      `/editar-producto?id=${producto.id}&nombre=${encodeURIComponent(producto.nombre)}&descripcion=${encodeURIComponent(producto.descripcion ?? '')}&precio=${producto.precio}&comercio_id=${producto.comercio_id}` as any
    );
  };

  const handleTogglePublicado = async (producto: Producto) => {
    try {
      const nuevoEstado = producto.publicado === false ? true : false;
      await togglePublicado(producto.id, nuevoEstado);
      showToast(nuevoEstado ? 'Producto publicado' : 'Producto despublicado', 'success');
      fetchComercioProductos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    }
  };

  const handleToggleDisponible = async (producto: Producto) => {
    try {
      const nuevoEstado = !producto.disponible;
      await toggleDisponible(producto.id, nuevoEstado);
      showToast(nuevoEstado ? 'Producto habilitado' : 'Producto deshabilitado', 'success');
      fetchComercioProductos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar', 'error');
    }
  };

  const handleAddProduct = () => {
    router.push(`/nuevo-producto?comercio_id=${id}` as any);
  };

  const handleEditComercio = () => {
    router.push(`/editar-comercio?id=${id}&nombre=${encodeURIComponent(comercio?.nombre ?? '')}` as any);
  };

  const handleDeleteComercio = () => {
    Alert.alert(
      'Eliminar comercio',
      `¿Seguro que querés eliminar "${comercio?.nombre}"? Se eliminarán todos sus productos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComercio(id!);
              showToast('Comercio eliminado', 'success');
              router.back();
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Error al eliminar comercio', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={C.tint} />
      </ThemedView>
    );
  }

  if (error || !comercio) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol size={48} pack="material" name="error-outline" color={C.icon} />
        <Text style={[styles.errorText, { color: C.icon }]}>{error || 'Comercio no encontrado'}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: C.tint }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: C.text }]}>{comercio.nombre}</Text>
            <Text style={[styles.headerSubtitle, { color: C.icon }]}>
              {productos.length} producto{productos.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionButton, { backgroundColor: C.lightGray }]}
              onPress={handleEditComercio}>
              <IconSymbol size={18} pack="material" name="edit" color={C.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerActionButton, { backgroundColor: C.danger + '22' }]}
              onPress={handleDeleteComercio}>
              <IconSymbol size={18} pack="material" name="delete" color={C.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol size={64} pack="material" name="inventory-2" color={C.icon} />
          <Text style={[styles.emptyText, { color: C.icon }]}>No hay productos</Text>
          <TouchableOpacity style={[styles.addFirstButton, { backgroundColor: C.tint }]} onPress={handleAddProduct}>
            <Text style={styles.addFirstButtonText}>+ Agregar primer producto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/producto-detalle?id=${item.id}` as any)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublicado={handleTogglePublicado}
              onToggleDisponible={handleToggleDisponible}
            />
          )}
        />
      )}

      <TouchableOpacity style={[styles.floatingButton, { backgroundColor: C.tint }]} onPress={handleAddProduct}>
        <IconSymbol size={24} pack="material" name="add" color="#FFFFFF" />
      </TouchableOpacity>

      <ConfirmModal
        visible={!!productoAEliminar}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${productoAEliminar?.nombre ?? ''}"?`}
        onConfirm={confirmarEliminar}
        onCancel={cancelarEliminar}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  addFirstButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
