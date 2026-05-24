import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { useClientes } from '@/hooks/use-clientes';
import { usePedidos } from '@/hooks/use-pedidos';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ClienteDetalleScreen() {
  const { clientes, deleteCliente } = useClientes();
  const { pedidos } = usePedidos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams ();
  const id = params.id ? parseInt(params.id as string) : null;

  const cliente = id ? clientes.find((c) => c.id === id) : null;
  const clientePedidos = useMemo(() => {
    if (!cliente) return [];
    return pedidos
      .filter((p) => p.cliente_id === cliente.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [cliente, pedidos]);

  if (!id || !cliente) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.notFound}>Cliente no encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de que quieres eliminar a ${cliente.nombre}?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteCliente(cliente.id);
              showToast('✓ Cliente eliminado', 'success');
              router.back();
            } catch (err) {
              const mensaje = err instanceof Error ? err.message : 'No se pudo eliminar el cliente';
              showToast(mensaje, 'error');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{cliente.nombre}</Text>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{cliente.nombre}</Text>
            </View>
            {cliente.telefono && (
              <View style={[styles.infoRow, styles.borderTop]}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{cliente.telefono}</Text>
              </View>
            )}
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Creado:</Text>
              <Text style={styles.infoValue}>
                {new Date(cliente.created_at).toLocaleDateString('es-AR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total de pedidos</Text>
              <Text style={styles.statValue}>{clientePedidos.length}</Text>
            </View>
            <View style={[styles.statRow, styles.borderTop]}>
              <Text style={styles.statLabel}>Pedidos entregados</Text>
              <Text style={styles.statValue}>
                {clientePedidos.filter((p) => p.estado === 'Entregado').length}
              </Text>
            </View>
            <View style={[styles.statRow, styles.borderTop]}>
              <Text style={styles.statLabel}>Monto total</Text>
              <Text style={styles.statValue}>
                ${clientePedidos.reduce((sum, p) => sum + p.monto, 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Pedidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Pedidos</Text>
          {clientePedidos.length === 0 ? (
            <Text style={styles.emptyText}>No hay pedidos registrados</Text>
          ) : (
            <View style={styles.pedidosList}>
              {clientePedidos.map((pedido) => (
                <TouchableOpacity
                  key={pedido.id}
                  style={styles.pedidoItem}
                  onPress={() => router.push(`/pedido-detalle?id=${pedido.id}`)}>
                  <View style={styles.pedidoHeader}>
                    <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                    <View style={[styles.miniBadge, getBadgeColor(pedido.estado)]}>
                      <Text style={styles.miniBadgeText}>{pedido.estado}</Text>
                    </View>
                  </View>
                  <View style={styles.pedidoFooter}>
                    <Text style={styles.pedidoMonto}>${pedido.monto.toFixed(2)}</Text>
                    <Text style={styles.pedidoDate}>
                      {new Date(pedido.created_at).toLocaleDateString('es-AR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => router.push(`/editar-cliente?id=${cliente.id}`)}>
              <Text style={styles.actionButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function getBadgeColor(estado: string) {
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pedidosList: {
    gap: 10,
  },
  pedidoItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pedidoId: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pedidoMonto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pedidoDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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
  notFound: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
