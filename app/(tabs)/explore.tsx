import { ThemedView } from '@/components/themed-view';
import { PedidoCard } from '@/components/PedidoCard';
import { usePedidos } from '@/hooks/use-pedidos';
import { EstadoPedido } from '@/types/pedido';
import { useRouter, useSearchParams, useFocusEffect } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PedidosScreen() {
  const { pedidos, loading, error, fetchPedidos } = usePedidos();
  const router = useRouter();
  const params = useSearchParams();
  const estado = params.estado as EstadoPedido | undefined;

  // Refetch cuando vuelves a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos])
  );

  const filteredPedidos = useMemo(() => {
    if (estado) {
      return pedidos.filter((p) => p.estado === estado);
    }
    return pedidos;
  }, [pedidos, estado]);

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
            {estado ? `No hay pedidos ${estado.toLowerCase()}` : 'No hay pedidos'}
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
            <PedidoCard
              pedido={item}
              onPress={() => router.push(`/pedido-detalle?id=${item.id}`)}
            />
          )}
          scrollEnabled={true}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
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
  container: {
    flex: 1,
    padding: 15,
  },
  listContent: {
    paddingVertical: 8,
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
  buttonCreate: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
});
