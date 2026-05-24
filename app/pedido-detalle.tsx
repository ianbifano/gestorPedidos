import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { usePedidos } from '@/hooks/use-pedidos';
import { EstadoPedido } from '@/types/pedido';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ESTADOS: EstadoPedido[] = ['Pendiente', 'En proceso', 'Entregado'];

export default function PedidoDetalleScreen() {
  const { pedidos, updatePedido, loading: pedidosLoading, deletePedido } = usePedidos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams ();
  const id = params.id ? parseInt(params.id as string) : null;
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const pedido = id ? pedidos.find((p) => p.id === id) : null;

  if (!id || pedidosLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!pedido) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.notFound}>Pedido no encontrado</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleEstadoChange = async (newEstado: EstadoPedido) => {
    try {
      setLoadingUpdate(true);
      await updatePedido(pedido.id, { estado: newEstado });
      showToast(`✓ Actualizado a ${newEstado}`, 'success');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
      showToast(mensaje, 'error');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pedido #{pedido.id}</Text>
          <View style={[styles.badge, getBadgeColor(pedido.estado)]}>
            <Text style={styles.badgeText}>{pedido.estado}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.card}>
            <Text style={styles.clientName}>{pedido.cliente?.nombre || 'Sin información'}</Text>
            {pedido.cliente?.telefono && (
              <Text style={styles.clientPhone}>📞 {pedido.cliente.telefono}</Text>
            )}
          </View>
        </View>

        {/* Detalles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{pedido.descripcion}</Text>
          </View>
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto</Text>
          <View style={styles.card}>
            <Text style={styles.monto}>${pedido.monto.toFixed(2)}</Text>
          </View>
        </View>

        {/* Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Creado:</Text>
              <Text style={styles.infoValue}>
                {new Date(pedido.created_at).toLocaleDateString('es-AR')} {new Date(pedido.created_at).toLocaleTimeString('es-AR')}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Actualizado:</Text>
              <Text style={styles.infoValue}>
                {new Date(pedido.updated_at).toLocaleDateString('es-AR')} {new Date(pedido.updated_at).toLocaleTimeString('es-AR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar Estado</Text>
          <View style={styles.estadoContainer}>
            {ESTADOS.map((estado) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.estadoButton,
                  pedido.estado === estado && styles.estadoButtonActive,
                ]}
                onPress={() => handleEstadoChange(estado)}
                disabled={loadingUpdate || pedido.estado === estado}>
                <Text
                  style={[
                    styles.estadoButtonText,
                    pedido.estado === estado && styles.estadoButtonTextActive,
                  ]}>
                  {estado}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => router.push(`/editar-pedido?id=${pedido.id}`)}>
              <Text style={styles.actionButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  'Eliminar Pedido',
                  '¿Estás seguro de que quieres eliminar este pedido?',
                  [
                    { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
                    {
                      text: 'Eliminar',
                      onPress: async () => {
                        try {
                          setLoadingUpdate(true);
                          await deletePedido(pedido.id);
                          showToast('✓ Pedido eliminado', 'success');
                          router.back();
                        } catch (err) {
                          const mensaje = err instanceof Error ? err.message : 'No se pudo eliminar el pedido';
                          showToast(mensaje, 'error');
                        } finally {
                          setLoadingUpdate(false);
                        }
                      },
                      style: 'destructive',
                    },
                  ]
                );
              }}>
              <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingUpdate && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {/* Botón volver */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
          disabled={loadingUpdate}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

function getBadgeColor(estado: EstadoPedido) {
  switch (estado) {
    case 'Pendiente':
      return { backgroundColor: '#FFB74D' };
    case 'En proceso':
      return { backgroundColor: '#42A5F5' };
    case 'Entregado':
      return { backgroundColor: '#66BB6A' };
    default:
      return { backgroundColor: '#999' };
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientPhone: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  monto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  infoRow: {
    paddingVertical: 10,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  estadoContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  estadoButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  estadoButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  estadoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  estadoButtonTextActive: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notFound: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
});
