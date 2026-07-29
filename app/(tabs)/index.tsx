import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, StateColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstados } from '@/contexts/EstadosContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { usePedidos } from '@/hooks/use-pedidos';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { comercios, loading: loadingComercios, fetchComercios } = useComercios();
  const { pedidos, pedidosCliente, loading, fetchPedidosByStore, fetchPedidos, resumenPorEstado } = usePedidos();
  const { estados, getEstadoNombre } = useEstados();
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);
  const router = useRouter();
  const email = user?.email ?? '';
  const username = user?.user_metadata?.username ?? email.split('@')[0];
  const tieneComercios = comercios.length > 0;
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const activeStore = useMemo(
    () => comercios.find((c) => c.id === selectedStoreId) ?? null,
    [comercios, selectedStoreId]
  );

  useEffect(() => {
    if (tieneComercios && comercios.length > 0 && selectedStoreId === null) {
      setSelectedStoreId(comercios[0].id);
      fetchPedidosByStore(comercios[0].id);
    }
  }, [tieneComercios, comercios, selectedStoreId, fetchPedidosByStore]);

  useFocusEffect(
    useCallback(() => {
      fetchComercios();
      if (selectedStoreId) {
        fetchPedidosByStore(selectedStoreId);
      } else {
        fetchPedidos();
      }
    }, [selectedStoreId, fetchPedidosByStore, fetchPedidos, fetchComercios])
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

  if (loadingComercios) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={C.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!tieneComercios) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <ScrollView contentContainerStyle={S.scrollContent}>
          <View style={S.headerSection}>
            <View style={[S.avatarCircle, { borderColor: C.border }]}>
              <IconSymbol size={44} pack="material" name="person" color={C.icon} />
            </View>
            <Text style={S.greeting}>{username}</Text>
            <Text style={S.email}>{email}</Text>
          </View>

          <View style={S.messageCard}>
            <IconSymbol size={28} pack="material" name="store" color={C.icon} />
            <Text style={S.messageTitle}>Todavía no tenés un comercio</Text>
            <Text style={S.messageBody}>
              Crea tu primer comercio para empezar a vender y gestionar tus pedidos, o ingresá como cliente para explorar productos.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [S.optionCard, { borderColor: 'rgba(0,122,255,0.25)' }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => router.push('/(tabs)/catalogo?modo=cliente')}>
            <View style={[S.optionIconContainer, { backgroundColor: 'rgba(0,122,255,0.12)' }]}>
              <IconSymbol size={28} pack="material" name="shopping-bag" color={C.tint} />
            </View>
            <View style={S.optionContent}>
              <Text style={S.optionTitle}>Ingresar como Cliente</Text>
              <Text style={S.optionSubtitle}>Explorá productos y realizá compras</Text>
            </View>
            <IconSymbol size={22} pack="material" name="chevron-right" color={C.icon} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [S.optionCard, { borderColor: 'rgba(255,149,0,0.25)' }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => router.push('/crear-comercio')}>
            <View style={[S.optionIconContainer, { backgroundColor: 'rgba(255,149,0,0.15)' }]}>
              <IconSymbol size={28} pack="material" name="add-business" color={C.accent} />
            </View>
            <View style={S.optionContent}>
              <Text style={[S.optionTitle, { color: C.accent }]}>+ Crear mi Comercio</Text>
              <Text style={S.optionSubtitle}>Registrá tu negocio y empezá a vender</Text>
            </View>
            <IconSymbol size={22} pack="material" name="chevron-right" color={C.icon} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView contentContainerStyle={S.scrollContent}>
        <View style={S.headerSection}>
          <View style={[S.avatarCircle, { borderColor: C.border }]}>
            <IconSymbol size={44} pack="material" name="person" color={C.icon} />
          </View>
          <Text style={S.greeting}>{username}</Text>
          <Text style={S.email}>{email}</Text>
        </View>

        <View style={S.sectionHeader}>
          <IconSymbol size={18} pack="material" name="store" color={C.accent} />
          <Text style={S.sectionTitle}>Mis Comercios</Text>
          <Text style={S.sectionCount}>{comercios.length}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={S.comercioScroll}>
          {comercios.map((comercio) => {
            const isActive = comercio.id === selectedStoreId;
            return (
              <Pressable
                key={comercio.id}
                style={({ pressed }) => [
                  S.comercioChip,
                  isActive && S.comercioChipActive,
                  !isActive && { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleStoreChange(comercio.id)}>
                <IconSymbol
                  size={16}
                  pack="material"
                  name="storefront"
                  color={isActive ? '#FFFFFF' : C.icon}
                />
                <Text style={[S.comercioChipText, isActive && { color: '#FFFFFF' }]}>
                  {comercio.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeStore && (
          <>
            {loading && (
              <View style={S.dashboardLoading}>
                <ActivityIndicator size="small" color={C.tint} />
                <Text style={S.dashboardLoadingText}>Cargando pedidos...</Text>
              </View>
            )}
            <View style={S.statsRow}>
              <View style={S.statCard}>
                <Text style={[S.statNumber, { color: C.tint }]}>{stats.total}</Text>
                <Text style={S.statLabel}>Total</Text>
              </View>
              <View style={S.statCard}>
                <Text style={[S.statNumber, { color: C.success }]}>{stats.entregados}</Text>
                <Text style={S.statLabel}>Entregados</Text>
              </View>
              <View style={S.statCard}>
                <Text style={[S.statNumber, { color: C.accent, fontSize: 14 }]}>
                  ${stats.montoTotal.toLocaleString('es-AR')}
                </Text>
                <Text style={S.statLabel}>Vendido</Text>
              </View>
            </View>

            <View style={S.estadosGrid}>
              {estados.map((est) => {
                const count = resumenPorEstado(est.id, selectedStoreId);
                const sc = StateColors[est.id];
                const bgColor = scheme === 'dark' ? sc.dark : sc.light;
                return (
                  <Pressable
                    key={est.id}
                    style={[S.estadoCard, { backgroundColor: bgColor + '22' }]}
                    onPress={() => {
                      router.push(`/(tabs)/explore?estado=${est.id}&comercio_id=${selectedStoreId}` as any);
                    }}>
                    <Text style={[S.estadoNumber, { color: bgColor }]}>{count}</Text>
                    <Text style={S.estadoLabel}>{est.nombre}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={S.sectionBlock}>
              <View style={S.sectionHeaderRow}>
                <Text style={S.sectionBlockTitle}>Últimos Pedidos</Text>
                <Pressable onPress={() => router.push(`/(tabs)/explore?comercio_id=${selectedStoreId}` as any)}>
                  <Text style={S.seeAllText}>Ver todos →</Text>
                </Pressable>
              </View>

              {ultimosPedidos.length === 0 ? (
                <Text style={S.emptyText}>No hay pedidos en este comercio</Text>
              ) : (
                <View style={S.pedidosList}>
                  {ultimosPedidos.map((pedido) => (
                    <Pressable
                      key={pedido.id}
                      style={({ pressed }) => [S.pedidoItem, pressed && { opacity: 0.9 }]}
                      onPress={() => router.push(`/pedido-detalle?id=${pedido.id}` as any)}>
                      <View style={S.pedidoHeader}>
                        <Text style={S.pedidoId}>Pedido #{pedido.id}</Text>
                        <View style={[S.miniBadge, { backgroundColor: (StateColors[pedido.estado]?.[scheme === 'dark' ? 'dark' : 'light']) || '#999' }]}>
                          <Text style={S.miniBadgeText}>{getEstadoNombre(pedido.estado)}</Text>
                        </View>
                      </View>
                      <Text style={S.pedidoCliente}>{pedido.cliente?.nombre}</Text>
                      <View style={S.pedidoFooter}>
                        <Text style={S.pedidoMonto}>${pedido.monto.toFixed(2)}</Text>
                        <Text style={S.pedidoDate}>
                          {new Date(pedido.created_at).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={S.divider} />

        <Pressable
          style={({ pressed }) => [S.optionCard, { borderColor: 'rgba(0,122,255,0.25)' }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push('/(tabs)/catalogo?modo=cliente')}>
          <View style={[S.optionIconContainer, { backgroundColor: 'rgba(0,122,255,0.12)' }]}>
            <IconSymbol size={28} pack="material" name="shopping-bag" color={C.tint} />
          </View>
          <View style={S.optionContent}>
            <Text style={S.optionTitle}>Ir a Comprar</Text>
            <Text style={S.optionSubtitle}>Navegá el catálogo como cliente</Text>
          </View>
          <IconSymbol size={22} pack="material" name="chevron-right" color={C.icon} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [S.addComercioBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/crear-comercio')}>
          <IconSymbol size={18} pack="material" name="add" color={C.icon} />
          <Text style={S.addComercioText}>Agregar otro comercio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: C.textSecondary,
  },
  messageCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },
  messageBody: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSecondary,
    backgroundColor: C.card,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  comercioScroll: {
    marginBottom: 16,
  },
  comercioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  comercioChipActive: {
    backgroundColor: C.tint,
  },
  comercioChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
  },
  estadosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  estadoCard: {
    width: '31%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estadoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBlockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  seeAllText: {
    fontSize: 14,
    color: C.tint,
    fontWeight: '600',
  },
  pedidosList: {
    gap: 10,
  },
  pedidoItem: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pedidoId: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  miniBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  pedidoCliente: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 6,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  pedidoMonto: {
    fontSize: 14,
    fontWeight: '700',
    color: C.accent,
  },
  pedidoDate: {
    fontSize: 12,
    color: C.textSecondary,
  },
  dashboardLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dashboardLoadingText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
  },
  addComercioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  addComercioText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
});
