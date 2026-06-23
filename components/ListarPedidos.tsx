// Pantalla de Listar Pedidos
// Este archivo será movido a app/pedidos/index.tsx

import { ThemedView } from '@/components/themed-view';
import { usePedidos } from '@/hooks/use-pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import { useRouter, useSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ListarPedidosScreen() {
  const { pedidos, loading, error } = usePedidos();
  const router = useRouter();
  const params = useSearchParams();
  const estado = params.estado ? parseInt(params.estado as string) : undefined;

  const filteredPedidos = useMemo(() => {
    if (estado !== undefined) {
      return pedidos.filter((p) => p.estado === estado);
    }
    return pedidos;
  }, [pedidos, estado]);

  const getEstadoNombre = (id: number) => ESTADOS_PEDIDO.find((e) => e.id === id)?.nombre || 'Desconocido';

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {filteredPedidos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {estado ? 'No hay pedidos en este estado' : 'No hay pedidos'}
          </Text>
          <TouchableOpacity
            style={styles.buttonCreate}
            onPress={() => router.push('/crear-pedido')}>
            <Text style={styles.buttonText}>+ Crear Pedido</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPedidos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pedidoCard}
              onPress={() => router.push(`/pedido-detalle?id=${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
                <View style={[styles.badge, getBadgeColor(item.estado)]}>
                  <Text style={styles.badgeText}>{getEstadoNombre(item.estado)}</Text>
                </View>
              </View>
              <Text style={styles.clientName}>{item.cliente?.nombre || 'Cliente'}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.descripcion}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.monto}>${item.monto.toFixed(2)}</Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('es-AR')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
        />
      )}
    </ThemedView>
  );
}

const BADGE_COLORS: Record<number, string> = {
  1: '#FFB74D',
  2: '#42A5F5',
  3: '#FF7043',
  4: '#EF5350',
  5: '#AB47BC',
  6: '#66BB6A',
};

function getBadgeColor(estado: number) {
  return { backgroundColor: BADGE_COLORS[estado] || '#999' };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  pedidoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  monto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonCreate: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
