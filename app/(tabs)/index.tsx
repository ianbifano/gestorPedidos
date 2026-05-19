import { ThemedView } from '@/components/themed-view';
import { usePedidos } from '@/hooks/use-pedidos';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ESTADOS = ['Pendiente', 'En proceso', 'Entregado'] as const;

export default function DashboardScreen() {
  const { pedidos, loading, error, fetchPedidos } = usePedidos();
  const router = useRouter();

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

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.cardContainer}>
          {ESTADOS.map((estado) => {
            const count = pedidos.filter((p) => p.estado === estado).length;
            return (
              <TouchableOpacity
                key={estado}
                style={[styles.card, getCardColor(estado)]}
                onPress={() => router.push(`/(tabs)/explore?estado=${estado}`)}>
                <Text style={styles.cardNumber}>{count}</Text>
                <Text style={styles.cardLabel}>{estado}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Últimos Pedidos</Text>
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
                      <Text style={styles.miniBadgeText}>{pedido.estado}</Text>
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
          <Text style={styles.buttonText}>➕ Crear Pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push('/crear-cliente')}>
          <Text style={styles.buttonTextSecondary}>➕ Nuevo Cliente</Text>
        </TouchableOpacity>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>📊 Estadísticas</Text>
          <Text style={styles.statsSubtitle}>
            Total de pedidos: <Text style={styles.statValue}>{pedidos.length}</Text>
          </Text>
          <Text style={styles.statsSubtitle}>
            Últimos 7 días: <Text style={styles.statValue}>
              {pedidos.filter((p) => {
                const date = new Date(p.created_at);
                const now = new Date();
                return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
              }).length}
            </Text>
          </Text>
          <Text style={styles.statsSubtitle}>
            Tasa entrega: <Text style={styles.statValue}>
              {pedidos.length > 0 
                ? Math.round((pedidos.filter((p) => p.estado === 'Entregado').length / pedidos.length) * 100)
                : 0}%
            </Text>
          </Text>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function getCardColor(estado: string) {
  switch (estado) {
    case 'Pendiente': return { backgroundColor: '#FFF3E0' };
    case 'En proceso': return { backgroundColor: '#E3F2FD' };
    case 'Entregado': return { backgroundColor: '#E8F5E9' };
    default: return {};
  }
}

function getBadgeColor(estado: string) {
  switch (estado) {
    case 'Pendiente': return { backgroundColor: '#FFB74D' };
    case 'En proceso': return { backgroundColor: '#42A5F5' };
    case 'Entregado': return { backgroundColor: '#66BB6A' };
    default: return { backgroundColor: '#999' };
  }
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  container: { padding: 20 },
  cardContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, gap: 10 },
  card: { flex: 1, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardNumber: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  cardLabel: { fontSize: 12, fontWeight: '500' },
  section: { marginVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  seeAll: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  pedidosList: { gap: 10 },
  pedidoItem: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#EEE' },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pedidoId: { fontSize: 14, fontWeight: 'bold' },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  miniBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
  pedidoCliente: { fontSize: 13, color: '#666', marginBottom: 6 },
  pedidoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  pedidoMonto: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  pedidoDate: { fontSize: 12, color: '#999' },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  buttonPrimary: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonSecondary: { backgroundColor: '#F0F0F0', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  stats: { marginTop: 30, marginBottom: 30, padding: 15, backgroundColor: '#F5F5F5', borderRadius: 8 },
  statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  statsSubtitle: { fontSize: 14, color: '#666', marginBottom: 6 },
  statValue: { fontWeight: 'bold', color: '#007AFF' },
  error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10 },
});