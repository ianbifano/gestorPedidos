import { PedidoCard } from '@/components/PedidoCard';
import { ThemedView } from '@/components/themed-view';
import { usePedidos } from '@/hooks/use-pedidos';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PedidosScreen() {
  const { pedidos, loading, error, fetchPedidos } = usePedidos();
  const router = useRouter();
  const params = useLocalSearchParams();
  const estado = params.estado ? parseInt(params.estado as string) : undefined;

  useFocusEffect(
    useCallback(() => {
      fetchPedidos();
    }, [fetchPedidos])
  );

  const filteredPedidos = useMemo(() => {
    if (estado !== undefined) {
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
