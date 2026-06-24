import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePedidos } from '@/hooks/use-pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { pedidos, loading, error, fetchPedidos } = usePedidos();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos])
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const ultimosPedidos = pedidos.slice(0, 3);

  const getEstadoNombre = (id: number) => ESTADOS_PEDIDO.find((e) => e.id === id)?.nombre || 'Desconocido';

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.cardContainer}>
          {ESTADOS_PEDIDO.map((est) => {
            const count = pedidos.filter((p) => p.estado === est.id).length;
            return (
              <TouchableOpacity
                key={est.id}
                style={[styles.card, getCardColor(est.id, scheme)]}
                onPress={() => router.push(`/(tabs)/explore?estado=${est.id}`)}>
                <Text style={styles.cardNumber}>{count}</Text>
                <Text style={styles.cardLabel}>{est.nombre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Pedidos</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {ultimosPedidos.length === 0 ? (
            <Text style={styles.emptyText}>No hay pedidos</Text>
          ) : (
            <View style={styles.pedidosList}>
              {ultimosPedidos.map((pedido) => (
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

        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push('/crear-pedido')}>
          <Text style={styles.buttonText}>+ Crear Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push('/crear-cliente')}>
          <Text style={styles.buttonTextSecondary}>+ Nuevo Cliente</Text>
        </TouchableOpacity>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Estadísticas</Text>
          <Text style={styles.statsSubtitle}>
            Total de pedidos: <Text style={styles.statValue}>{pedidos.length}</Text>
          </Text>
          <Text style={styles.statsSubtitle}>
            Últimos 7 días:{' '}
            <Text style={styles.statValue}>
              {pedidos.filter((p) => {
                const date = new Date(p.created_at);
                const now = new Date();
                return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
              }).length}
            </Text>
          </Text>
          <Text style={styles.statsSubtitle}>
            Tasa entrega:{' '}
            <Text style={styles.statValue}>
              {pedidos.length > 0
                ? Math.round((pedidos.filter((p) => p.estado === 6).length / pedidos.length) * 100)
                : 0}%
            </Text>
          </Text>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const CARD_COLORS_LIGHT: Record<number, string> = {
  1: '#FFF3E0', 2: '#E3F2FD', 3: '#FBE9E7',
  4: '#FFEBEE', 5: '#F3E5F5', 6: '#E8F5E9',
};
const CARD_COLORS_DARK: Record<number, string> = {
  1: '#3A2800', 2: '#001F3A', 3: '#3A1500',
  4: '#3A0000', 5: '#2A003A', 6: '#003A00',
};
const BADGE_COLORS: Record<number, string> = {
  1: '#FFB74D', 2: '#42A5F5', 3: '#FF7043',
  4: '#EF5350', 5: '#AB47BC', 6: '#66BB6A',
};

function getCardColor(estado: number, scheme: 'light' | 'dark') {
  const map = scheme === 'dark' ? CARD_COLORS_DARK : CARD_COLORS_LIGHT;
  return { backgroundColor: map[estado] || (scheme === 'dark' ? '#1C1C1E' : '#FFF') };
}

function getBadgeColor(estado: number) {
  return { backgroundColor: BADGE_COLORS[estado] || '#999' };
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    scrollContainer: { flex: 1 },
    container: { padding: 20 },
    cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 20, gap: 10 },
    card: { width: '30%', paddingVertical: 20, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardNumber: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: C.text },
    cardLabel: { fontSize: 12, fontWeight: '500', color: C.text },
    section: { marginVertical: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: C.text },
    seeAll: { fontSize: 14, color: C.tint, fontWeight: '600' },
    pedidosList: { gap: 10 },
    pedidoItem: { backgroundColor: C.card, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: C.border },
    pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    pedidoId: { fontSize: 14, fontWeight: 'bold', color: C.text },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    miniBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
    pedidoCliente: { fontSize: 13, color: C.icon, marginBottom: 6 },
    pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
    pedidoMonto: { fontSize: 14, fontWeight: 'bold', color: C.tint },
    pedidoDate: { fontSize: 12, color: C.icon },
    emptyText: { fontSize: 14, color: C.icon, textAlign: 'center', paddingVertical: 20 },
    buttonPrimary: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    buttonSecondary: { backgroundColor: C.lightGray, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonTextSecondary: { color: C.tint, fontSize: 16, fontWeight: '600' },
    stats: { marginTop: 30, marginBottom: 30, padding: 15, backgroundColor: C.lightGray, borderRadius: 8 },
    statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: C.text },
    statsSubtitle: { fontSize: 14, color: C.icon, marginBottom: 6 },
    statValue: { fontWeight: 'bold', color: C.tint },
    error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10 },
  });
}
