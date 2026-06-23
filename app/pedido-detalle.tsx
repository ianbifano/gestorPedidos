import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePedidos } from '@/hooks/use-pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PedidoDetalleScreen() {
  const { pedidos, updatePedido, loading: pedidosLoading, deletePedido } = usePedidos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const pedido = id ? pedidos.find((p) => p.id === id) : null;
  const estadoNombre = ESTADOS_PEDIDO.find((e) => e.id === pedido?.estado)?.nombre || 'Desconocido';

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
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleEstadoChange = async (nuevoEstadoId: number) => {
    try {
      setLoadingUpdate(true);
      const nuevoNombre = ESTADOS_PEDIDO.find((e) => e.id === nuevoEstadoId)?.nombre || 'Desconocido';
      await updatePedido(pedido.id, { estado: nuevoEstadoId });
      showToast(`✓ Actualizado a ${nuevoNombre}`, 'success');
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
        <View style={styles.header}>
          <Text style={styles.title}>Pedido #{pedido.id}</Text>
          <View style={[styles.badge, getBadgeColor(pedido.estado)]}>
            <Text style={styles.badgeText}>{estadoNombre}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.card}>
            <Text style={styles.clientName}>{pedido.cliente?.nombre || 'Sin información'}</Text>
            {pedido.cliente?.telefono && (
              <Text style={styles.clientPhone}>📞 {pedido.cliente.telefono}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{pedido.descripcion}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto</Text>
          <View style={styles.card}>
            <Text style={styles.monto}>${pedido.monto.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Creado:</Text>
              <Text style={styles.infoValue}>
                {new Date(pedido.created_at).toLocaleDateString('es-AR')}{' '}
                {new Date(pedido.created_at).toLocaleTimeString('es-AR')}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>Actualizado:</Text>
              <Text style={styles.infoValue}>
                {new Date(pedido.updated_at).toLocaleDateString('es-AR')}{' '}
                {new Date(pedido.updated_at).toLocaleTimeString('es-AR')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar Estado</Text>
          <View style={styles.estadoContainer}>
            {ESTADOS_PEDIDO.map((est) => (
              <TouchableOpacity
                key={est.id}
                style={[
                  styles.estadoButton,
                  pedido.estado === est.id && styles.estadoButtonActive,
                ]}
                onPress={() => handleEstadoChange(est.id)}
                disabled={loadingUpdate || pedido.estado === est.id}>
                <Text
                  style={[
                    styles.estadoButtonText,
                    pedido.estado === est.id && styles.estadoButtonTextActive,
                  ]}>
                  {est.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

        <TouchableOpacity style={styles.button} onPress={() => router.back()} disabled={loadingUpdate}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
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
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    badgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: C.icon, textTransform: 'uppercase' },
    card: { backgroundColor: C.card, borderRadius: 8, padding: 15, borderWidth: 1, borderColor: C.border },
    clientName: { fontSize: 16, fontWeight: '600', color: C.text },
    clientPhone: { fontSize: 14, color: C.tint, marginTop: 8 },
    description: { fontSize: 14, color: C.text, lineHeight: 20 },
    monto: { fontSize: 28, fontWeight: 'bold', color: C.tint },
    infoRow: { paddingVertical: 10 },
    borderTop: { borderTopWidth: 1, borderTopColor: C.border },
    infoLabel: { fontSize: 13, color: C.icon, marginBottom: 4 },
    infoValue: { fontSize: 13, color: C.text, fontWeight: '500' },
    estadoContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    estadoButton: {
      flex: 1,
      minWidth: 100,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
    },
    estadoButtonActive: { backgroundColor: C.tint, borderColor: C.tint },
    estadoButtonText: { fontSize: 13, fontWeight: '600', color: C.tint },
    estadoButtonTextActive: { color: 'white' },
    actionButtons: { flexDirection: 'row', gap: 10 },
    actionButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    editButton: { backgroundColor: C.lightGray, borderWidth: 1, borderColor: C.tint },
    deleteButton: { backgroundColor: C.lightGray, borderWidth: 1, borderColor: '#F44336' },
    actionButtonText: { fontSize: 14, fontWeight: '600', color: C.tint },
    deleteButtonText: { fontSize: 14, fontWeight: '600', color: '#F44336' },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 20 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    notFound: { fontSize: 16, color: C.icon, marginBottom: 20, textAlign: 'center' },
  });
}
