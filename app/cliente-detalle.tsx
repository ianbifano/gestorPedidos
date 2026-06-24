import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClientes } from '@/hooks/use-clientes';
import { usePedidos } from '@/hooks/use-pedidos';
import { useEstados } from '@/contexts/EstadosContext';
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
  const params = useLocalSearchParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

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

  const { getEstadoNombre } = useEstados();

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{cliente.nombre}</Text>
        </View>

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
                {clientePedidos.filter((p) => p.estado === 6).length}
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
                      <Text style={styles.miniBadgeText}>{getEstadoNombre(pedido.estado)}</Text>
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

const BADGE_COLORS: Record<number, string> = {
  1: '#FFB74D', 2: '#42A5F5', 3: '#FF7043',
  4: '#EF5350', 5: '#AB47BC', 6: '#66BB6A',
};

function getBadgeColor(estado: number) {
  return { backgroundColor: BADGE_COLORS[estado] || '#999' };
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    scrollContainer: { flex: 1 },
    container: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: C.text },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: C.text },
    card: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    borderTop: { borderTopWidth: 1, borderTopColor: C.border },
    infoLabel: { fontSize: 14, fontWeight: '500', color: C.icon },
    infoValue: { fontSize: 14, fontWeight: '600', color: C.text },
    statsCard: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    statLabel: { fontSize: 14, color: C.icon },
    statValue: { fontSize: 16, fontWeight: 'bold', color: C.tint },
    pedidosList: { gap: 10 },
    pedidoItem: { backgroundColor: C.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: C.border },
    pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    pedidoId: { fontSize: 14, fontWeight: 'bold', color: C.text },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    miniBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
    pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
    pedidoMonto: { fontSize: 14, fontWeight: 'bold', color: C.tint },
    pedidoDate: { fontSize: 12, color: C.icon },
    emptyText: { fontSize: 14, color: C.icon, textAlign: 'center', paddingVertical: 20 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    actionButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    editButton: { backgroundColor: C.lightGray, borderWidth: 1, borderColor: C.tint },
    deleteButton: { backgroundColor: C.lightGray, borderWidth: 1, borderColor: '#F44336' },
    actionButtonText: { fontSize: 14, fontWeight: '600', color: C.tint },
    deleteButtonText: { fontSize: 14, fontWeight: '600', color: '#F44336' },
    notFound: { fontSize: 16, color: C.icon, textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  });
}
