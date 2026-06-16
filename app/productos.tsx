import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { useProductos } from '@/hooks/use-productos';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductosScreen() {
  const { productos, loading, deleteProducto } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();

  // -------------------------
  // DELETE
  // -------------------------
  const handleDelete = async (id: number) => {
    console.log('DELETE CLICK ID:', id);

    if (!id || isNaN(id)) {
      showToast('ID inválido', 'error');
      return;
    }

    const confirmar = window.confirm(
      '¿Desea eliminar este producto?'
    );

    if (!confirmar) return;

    try {
      await deleteProducto(id);

      console.log('DELETE OK');

      showToast('Producto eliminado', 'success');
    } catch (err) {
      console.log('DELETE ERROR:', err);

      showToast('Error al eliminar producto', 'error');
    }
  };

  // -------------------------
  // LOADING
  // -------------------------
  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <ThemedView style={styles.container}>
      {/* BOTÓN CREAR */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/nuevo-producto')}
      >
        <Text style={styles.addButtonText}>+ Nuevo Producto</Text>
      </TouchableOpacity>

      {/* LISTA */}
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay productos registrados
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.precio}>${item.precio}</Text>
            <Text style={styles.estado}>
              {item.disponible ? 'Disponible' : 'No disponible'}
            </Text>

            {/* ACCIONES */}
            <View style={styles.actions}>
              {/* EDITAR */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  router.push({
                    pathname: '/editar-producto',
                    params: {
                      id: String(item.id),
                      nombre: item.nombre,
                      descripcion: item.descripcion || '',
                      precio: String(item.precio),
                    },
                  });
                }}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              {/* ELIMINAR */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(Number(item.id))}
              >
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

// -------------------------
// STYLES
// -------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  precio: {
    fontSize: 16,
    marginTop: 4,
  },
  estado: {
    marginTop: 4,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});