import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors, StateColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePedidos } from '@/hooks/use-pedidos';
import { useEstados } from '@/contexts/EstadosContext';
import { useComercios } from '@/hooks/use-comercios';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const STATUS_FLOW = [1, 2, 5, 6];

export default function PedidoDetalleScreen() {
  const { updatePedido, fetchPedidoById } = usePedidos();
  const { isDueno } = useAuth();
  const { comercios } = useComercios();
  const { show: showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const [loadingData, setLoadingData] = useState(true);
  const [pedido, setPedido] = useState<any>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [optimisticEstado, setOptimisticEstado] = useState<number | null>(null);
  const [optimisticUpdatedAt, setOptimisticUpdatedAt] = useState<string | null>(null);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const { estados, getEstadoNombre } = useEstados();

  const loadPedido = useCallback(async () => {
    if (!id) return;
    setLoadingData(true);
    const data = await fetchPedidoById(id);
    setPedido(data);
    setLoadingData(false);
  }, [id, fetchPedidoById]);

  useFocusEffect(
    useCallback(() => {
      loadPedido();
    }, [loadPedido])
  );

  const estadoActual = optimisticEstado ?? pedido?.estado ?? null;
  const updatedAtActual = optimisticUpdatedAt ?? pedido?.updated_at ?? '';
  const estadoNombre = estadoActual ? getEstadoNombre(estadoActual) : 'Desconocido';

  const userOwnsStore = useMemo(() => {
    if (!pedido?.comercio_id) return false;
    return comercios.some((c) => c.id === pedido.comercio_id);
  }, [pedido, comercios]);

  const canChangeStatus = isDueno && userOwnsStore;

  if (!id || loadingData) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={C.tint} />
      </ThemedView>
    );
  }

  if (!pedido) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <IconSymbol size={48} pack="material" name="error-outline" color={C.icon} />
        <Text style={styles.notFound}>Pedido no encontrado</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: C.tint }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleEstadoChange = async (nuevoEstadoId: number) => {
    const nuevoNombre = getEstadoNombre(nuevoEstadoId);
    const now = new Date().toISOString();

    setOptimisticEstado(nuevoEstadoId);
    setOptimisticUpdatedAt(now);

    try {
      setLoadingUpdate(true);
      await updatePedido(pedido.id, { estado: nuevoEstadoId });
      showToast(`✓ Actualizado a ${nuevoNombre}`, 'success');
    } catch (err) {
      setOptimisticEstado(null);
      setOptimisticUpdatedAt(null);
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
          <View>
            <Text style={styles.title}>Pedido #{pedido.id}</Text>
            {pedido.comercio && (
              <View style={styles.headerComercio}>
                <IconSymbol size={14} pack="material" name="store" color={C.tint} />
                <Text style={[styles.headerComercioText, { color: C.tint }]}>{pedido.comercio.nombre}</Text>
              </View>
            )}
          </View>
          {estadoActual && (
            <View style={[styles.badge, { backgroundColor: (StateColors[estadoActual]?.[scheme === 'dark' ? 'dark' : 'light']) || '#999' }]}>
              <Text style={styles.badgeText}>{estadoNombre}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.card}>
            <View style={styles.clientRow}>
              <IconSymbol size={20} pack="material" name="person" color={C.icon} />
              <Text style={styles.clientName}>{pedido.cliente?.nombre || 'Sin información'}</Text>
            </View>
            {pedido.cliente?.telefono && (
              <View style={[styles.clientRow, { marginTop: 8 }]}>
                <IconSymbol size={16} pack="material" name="phone" color={C.tint} />
                <Text style={styles.clientPhone}>{pedido.cliente.telefono}</Text>
              </View>
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
              <IconSymbol size={16} pack="material" name="calendar-today" color={C.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Creado</Text>
                <Text style={styles.infoValue}>
                  {new Date(pedido.created_at).toLocaleDateString('es-AR')}{' '}
                  {new Date(pedido.created_at).toLocaleTimeString('es-AR')}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <IconSymbol size={16} pack="material" name="update" color={C.icon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Actualizado</Text>
                <Text style={styles.infoValue}>
                  {new Date(updatedAtActual).toLocaleDateString('es-AR')}{' '}
                  {new Date(updatedAtActual).toLocaleTimeString('es-AR')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {canChangeStatus && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cambiar Estado</Text>
              {estados.map((est) => {
                const isActive = estadoActual === est.id;
                const sc = StateColors[est.id];
                const bgColor = scheme === 'dark' ? sc.dark : sc.light;
                const isPast = est.id < (estadoActual ?? 0) && STATUS_FLOW.includes(est.id);
                return (
                  <TouchableOpacity
                    key={est.id}
                    style={[
                      styles.estadoRow,
                      isActive && { backgroundColor: bgColor + '22', borderColor: bgColor },
                      !isActive && { borderColor: C.border },
                    ]}
                    onPress={() => handleEstadoChange(est.id)}
                    disabled={loadingUpdate || isActive}
                  >
                    <View style={[styles.estadoDot, { backgroundColor: isActive ? bgColor : C.icon }]} />
                    <Text style={[
                      styles.estadoRowText,
                      isActive && { color: bgColor, fontWeight: '800' },
                      !isActive && { color: C.text },
                    ]}>
                      {est.nombre}
                    </Text>
                    {isActive && (
                      <View style={[styles.estadoActiveBadge, { backgroundColor: bgColor }]}>
                        <Text style={styles.estadoActiveBadgeText}>Actual</Text>
                      </View>
                    )}
                    {!isActive && isPast && (
                      <IconSymbol size={16} pack="material" name="check-circle" color={C.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

          </>
        )}

        {!isDueno && pedido.comercio && (
          <View style={styles.section}>
            <View style={[styles.card, styles.comercioCard]}>
              <IconSymbol size={18} pack="material" name="store" color={C.tint} />
              <Text style={[styles.comercioName, { color: C.tint }]}>{pedido.comercio.nombre}</Text>
            </View>
          </View>
        )}

        {loadingUpdate && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={C.tint} />
          </View>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: C.tint }]} onPress={() => router.back()} disabled={loadingUpdate}>
          <IconSymbol size={18} pack="material" name="arrow-back" color="#FFFFFF" />
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    scrollContainer: { flex: 1 },
    container: { padding: 20 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, width: '100%' },
    title: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
    headerComercio: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    headerComercioText: { fontSize: 13, fontWeight: '600' },
    badge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
    badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
    section: { marginBottom: 20, width: '100%' },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, color: C.icon, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: { backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
    clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    clientName: { fontSize: 16, fontWeight: '600', color: C.text },
    clientPhone: { fontSize: 14, color: C.tint },
    comercioCard: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    comercioName: { fontSize: 15, fontWeight: '600' },
    description: { fontSize: 14, color: C.text, lineHeight: 20 },
    monto: { fontSize: 28, fontWeight: 'bold', color: C.tint },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
    borderTop: { borderTopWidth: 1, borderTopColor: C.border },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: C.icon, marginBottom: 2 },
    infoValue: { fontSize: 13, color: C.text, fontWeight: '500' },
    estadoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 8,
      width: '100%',
    },
    estadoDot: { width: 10, height: 10, borderRadius: 5 },
    estadoRowText: { fontSize: 15, fontWeight: '600', flex: 1 },
    estadoActiveBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    estadoActiveBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
    actionButtons: { flexDirection: 'row', gap: 10 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
    actionButtonText: { fontSize: 14, fontWeight: '700' },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, marginTop: 10, marginBottom: 20, width: '100%' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    notFound: { fontSize: 16, color: C.icon, marginBottom: 20, textAlign: 'center', marginTop: 12 },
  });
}
