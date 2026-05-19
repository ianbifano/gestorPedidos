import { ThemedView } from '@/components/themed-view';
import { ClienteCard } from '@/components/ClienteCard';
import { useClientes } from '@/hooks/use-clientes';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ClientesScreen() {
  const { clientes, loading, error, fetchClientes } = useClientes();
  const router = useRouter();

  // Refetch cuando vuelves a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchClientes();
    }, [fetchClientes])
  );

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

      <TouchableOpacity
        style={styles.buttonAdd}
        onPress={() => router.push('/crear-cliente')}>
        <Text style={styles.buttonText}>+ Nuevo Cliente</Text>
      </TouchableOpacity>

      {clientes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay clientes registrados</Text>
        </View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ClienteCard
              cliente={item}
              onPress={() => router.push(`/cliente-detalle?id=${item.id}`)}
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
  buttonAdd: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
});
