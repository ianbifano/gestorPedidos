import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { useProductos } from '@/hooks/use-productos';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductosScreen() {
  const { productos, loading, deleteProducto, fetchProductosByComercios } = useProductos();
  const { comercios, loading: loadingComercios, fetchComercios } = useComercios();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);

  const comercioIds = useMemo(() => comercios.map(c => c.id), [comercios]);

  useEffect(() => {
    fetchComercios();
  }, []);

  useEffect(() => {
    if (comercioIds.length > 0) {
      fetchProductosByComercios(comercioIds);
    }
  }, [comercioIds.join(',')]);

  const handleDelete = (id: number) => {
    if (!id || isNaN(id)) {
      showToast('ID inválido', 'error');
      return;
    }

    Alert.alert(
      'Eliminar producto',
      '¿Desea eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProducto(id);
              showToast('Producto eliminado', 'success');
            } catch {
              showToast('Error al eliminar producto', 'error');
            }
          },
        },
      ]
    );
  };

  if (loadingComercios || loading) {
    return (
      <ThemedView style={S.center}>
        <ActivityIndicator size="large" color={C.tint} />
      </ThemedView>
    );
  }

  if (comercios.length === 0) {
    return (
      <ThemedView style={S.container}>
        <View style={S.center}>
          <Text style={S.emptyText}>Primero debes crear un comercio</Text>
          <TouchableOpacity style={S.addButton} onPress={() => router.push('/crear-comercio')}>
            <Text style={S.addButtonText}>+ Crear Comercio</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={S.container}>
      <TouchableOpacity style={S.addButton} onPress={() => router.push('/crear-producto')}>
        <Text style={S.addButtonText}>+ Nuevo Producto</Text>
      </TouchableOpacity>

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={S.emptyText}>No hay productos registrados</Text>}
        renderItem={({ item }) => (
          <View style={S.card}>
            {item.imagen && <Image source={{ uri: item.imagen }} style={S.imagen} />}
            <Text style={S.nombre}>{item.nombre}</Text>
            <Text style={S.precio}>${item.precio}</Text>
            <Text style={S.estado}>{item.disponible ? 'Disponible' : 'No disponible'}</Text>
            <View style={S.actions}>
              <TouchableOpacity
                style={S.editButton}
                onPress={() => router.push({ pathname: '/editar-producto', params: { id: String(item.id), nombre: item.nombre, descripcion: item.descripcion || '', precio: String(item.precio) } })}>
                <Text style={S.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.deleteButton} onPress={() => handleDelete(Number(item.id))}>
                <Text style={S.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center' },
  addButton: { backgroundColor: C.tint, padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  addButtonText: { color: '#FFF', fontWeight: '600' },
  card: { backgroundColor: C.card, padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  imagen: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10, resizeMode: 'cover' },
  nombre: { fontSize: 18, fontWeight: 'bold', color: C.text },
  precio: { fontSize: 16, marginTop: 4, color: C.accent },
  estado: { marginTop: 4, color: C.textSecondary },
  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  editButton: { backgroundColor: C.tint, padding: 8, borderRadius: 6 },
  deleteButton: { backgroundColor: C.danger, padding: 8, borderRadius: 6 },
  actionText: { color: '#FFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 30, color: C.textSecondary },
});
