import { ThemedView } from '@/components/themed-view';
import { Colors, StateColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { usePedidos } from '@/hooks/use-pedidos';
import { useEstados } from '@/contexts/EstadosContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DashboardScreen() {
  const { user, isDueno } = useAuth();
  const { comercios, loading: loadingComercios } = useComercios();
  const { pedidos, pedidosCliente, loading, error, fetchPedidosByStore, fetchPedidos, resumenPorEstado } = usePedidos();
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);
  const { estados, getEstadoNombre } = useEstados();
  const tieneComercios = comercios.length > 0;

  const activeStore = useMemo(
    () => comercios.find((c) => c.id === selectedStoreId) ?? null,
    [comercios, selectedStoreId]
  );

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (tieneComercios && comercios.length > 0) {
      initialized.current = true;
      setSelectedStoreId(comercios[0].id);
      fetchPedidosByStore(comercios[0].id);
    }
  }, [tieneComercios, comercios, fetchPedidosByStore]);

  useFocusEffect(
    useCallback(() => {
      if (selectedStoreId) {
        fetchPedidosByStore(selectedStoreId);
      } else {
        fetchPedidos();
      }
    }, [selectedStoreId, fetchPedidosByStore, fetchPedidos])
  );

  const pedidosFiltrados = useMemo(() => {
    if (selectedStoreId) {
      return pedidos.filter((p) => p.comercio_id === selectedStoreId);
    }
    return pedidos;
  }, [pedidos, selectedStoreId]);

  const ultimosPedidos = useMemo(() => pedidosFiltrados.slice(0, 5), [pedidosFiltrados]);

  const stats = useMemo(() => {
    const total = pedidosFiltrados.length;
    const entregados = pedidosFiltrados.filter((p) => p.estado === 6).length;
    const ultimos7 = pedidosFiltrados.filter((p) => {
      const date = new Date(p.created_at);
      const now = new Date();
      return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    }).length;
    const montoTotal = pedidosFiltrados.reduce((sum, p) => sum + p.monto, 0);
    return { total, entregados, ultimos7, montoTotal };
  }, [pedidosFiltrados]);

  const handleStoreChange = useCallback((storeId: number) => {
    setSelectedStoreId(storeId);
    fetchPedidosByStore(storeId);
  }, [fetchPedidosByStore]);

  if (loading || loadingComercios) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!tieneComercios) {
    return (
      <ScrollView style={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <View style={styles.welcomeContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: C.tint }]}>
              <IconSymbol size={48} pack="material" name="person" color="#FFFFFF" />
            </View>
            <Text style={[styles.welcomeTitle, { color: C.text }]}>Hola, {user?.user_metadata?.username || user?.email?.split('@')[0]}</Text>
            <Text style={[styles.welcomeSubtitle, { color: C.icon }]}>
              Todavía no tenés un comercio registrado.
            </Text>
            <Text style={[styles.welcomeDescription, { color: C.icon }]}>
              Creá tu comercio para empezar a vender y gestionar tus pedidos.
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <IconSymbol size={28} pack="material" name="store" color={C.tint} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: C.text }]}>Tu cuenta</Text>
              <Text style={[styles.infoCardText, { color: C.icon }]}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.buttonPrimary, { backgroundColor: C.tint }]}
            onPress={() => router.push('/crear-comercio')}>
            <IconSymbol size={20} pack="material" name="add-business" color="#FFFFFF" />
            <Text style={styles.buttonText}>+ Crear mi comercio</Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.storeSelectorContainer}>
          <IconSymbol size={18} pack="material" name="store" color={C.tint} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeSelectorScroll}>
            <TouchableOpacity
              style={[
                styles.storeChip,
                selectedStoreId === null && { backgroundColor: C.tint },
                selectedStoreId !== null && { backgroundColor: C.lightGray, borderWidth: 1, borderColor: C.border },
              ]}
              onPress={() => {
                setSelectedStoreId(null);
                fetchPedidos();
              }}
            >
              <Text style={[
                styles.storeChipText,
                selectedStoreId === null ? { color: '#FFFFFF' } : { color: C.text },
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            {comercios.map((c) => {
              const isActive = c.id === selectedStoreId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.storeChip,
                    isActive && { backgroundColor: C.tint },
                    !isActive && { backgroundColor: C.lightGray, borderWidth: 1, borderColor: C.border },
                  ]}
                  onPress={() => handleStoreChange(c.id)}
                >
                  <Text style={[
                    styles.storeChipText,
                    isActive ? { color: '#FFFFFF' } : { color: C.text },
                  ]}>
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.storeManageBtn}
            onPress={() => router.push('/comercios')}
          >
            <IconSymbol size={20} pack="material" name="settings" color={C.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}>
            <Text style={[styles.statNumber, { color: C.tint }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: C.icon }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}>
            <Text style={[styles.statNumber, { color: '#66BB6A' }]}>{stats.entregados}</Text>
            <Text style={[styles.statLabel, { color: C.icon }]}>Entregados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}>
            <Text style={[styles.statNumber, { color: C.icon, fontSize: 16 }]}>${stats.montoTotal.toLocaleString('es-AR')}</Text>
            <Text style={[styles.statLabel, { color: C.icon }]}>Vendido</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          {estados.map((est) => {
            const count = selectedStoreId
              ? resumenPorEstado(est.id, selectedStoreId)
              : resumenPorEstado(est.id);
            const sc = StateColors[est.id];
            const bgColor = scheme === 'dark' ? sc.dark : sc.light;
            return (
              <TouchableOpacity
                key={est.id}
                style={[styles.card, { backgroundColor: bgColor + '22' }]}
                onPress={() => {
                  const params = `estado=${est.id}` + (selectedStoreId ? `&storeId=${selectedStoreId}` : '');
                  router.push(`/(tabs)/explore?${params}` as any);
                }}>
                <Text style={[styles.cardNumber, { color: bgColor }]}>{count}</Text>
                <Text style={[styles.cardLabel, { color: C.text }]}>{est.nombre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Pedidos</Text>
            <TouchableOpacity onPress={() => {
              const params = selectedStoreId ? `?storeId=${selectedStoreId}` : '';
              router.push(`/(tabs)/explore${params}` as any);
            }}>
              <Text style={styles.seeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {ultimosPedidos.length === 0 ? (
            <Text style={styles.emptyText}>No hay pedidos en este comercio</Text>
          ) : (
            <View style={styles.pedidosList}>
              {ultimosPedidos.map((pedido) => (
                <TouchableOpacity
                  key={pedido.id}
                  style={styles.pedidoItem}
                  onPress={() => router.push(`/pedido-detalle?id=${pedido.id}`)}>
                  <View style={styles.pedidoHeader}>
                    <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                    <View style={[styles.miniBadge, { backgroundColor: (StateColors[pedido.estado]?.[scheme === 'dark' ? 'dark' : 'light']) || '#999' }]}>
                      <Text style={styles.miniBadgeText}>{getEstadoNombre(pedido.estado)}</Text>
                    </View>
                  </View>
                  <Text style={styles.pedidoCliente}>{pedido.cliente?.nombre}</Text>
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

        {isDueno && pedidosCliente.length > 0 && (
          <TouchableOpacity
            style={styles.misComprasBanner}
            onPress={() => router.push('/(tabs)/explore?tab=compras')}
          >
            <IconSymbol size={20} pack="material" name="shopping-bag" color={C.tint} />
            <Text style={[styles.misComprasText, { color: C.tint }]}>
              Mis Compras ({pedidosCliente.length})
            </Text>
            <IconSymbol size={16} pack="material" name="chevron-right" color={C.tint} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push('/comercios')}>
          <IconSymbol size={16} pack="material" name="store" color={C.tint} />
          <Text style={styles.buttonTextSecondary}>Administrar Comercios</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    scrollContainer: { flex: 1 },
    container: { padding: 20 },
    welcomeContainer: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
    avatarCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    welcomeTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    welcomeSubtitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    welcomeDescription: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, marginBottom: 24 },
    infoCardContent: { flex: 1 },
    infoCardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    infoCardText: { fontSize: 13 },
    storeSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    storeSelectorScroll: { flex: 1 },
    storeChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
    },
    storeChipText: { fontSize: 14, fontWeight: '600' },
    storeManageBtn: { padding: 4 },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    statNumber: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '500' },
    cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 12, gap: 8 },
    card: { width: '31%', paddingVertical: 16, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    cardLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    section: { marginVertical: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: C.text },
    seeAll: { fontSize: 14, color: C.tint, fontWeight: '600' },
    pedidosList: { gap: 10 },
    pedidoItem: { backgroundColor: C.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border },
    pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    pedidoId: { fontSize: 14, fontWeight: 'bold', color: C.text },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    miniBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
    pedidoCliente: { fontSize: 13, color: C.icon, marginBottom: 6 },
    pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
    pedidoMonto: { fontSize: 14, fontWeight: 'bold', color: C.tint },
    pedidoDate: { fontSize: 12, color: C.icon },
    emptyText: { fontSize: 14, color: C.icon, textAlign: 'center', paddingVertical: 20 },
    error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10 },
    buttonPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
    buttonSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.lightGray, paddingVertical: 14, borderRadius: 12, marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonTextSecondary: { color: C.tint, fontSize: 15, fontWeight: '600' },
    misComprasBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.tint,
      marginTop: 8,
    },
    misComprasText: { fontSize: 15, fontWeight: '600' },
  });
}
