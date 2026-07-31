import { ComercioCard } from '@/components/ComercioCard';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { Comercio } from '@/types/comercio';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ComerciosScreen() {
  const { comercios, loading, error, fetchComercios, deleteComercio } = useComercios();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  useFocusEffect(
    useCallback(() => {
      fetchComercios();
    }, [fetchComercios])
  );

  const handleDelete = (comercio: Comercio) => {
    Alert.alert(
      'Eliminar comercio',
      `¿Seguro que querés eliminar "${comercio.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComercio(comercio.id);
              showToast('Comercio eliminado', 'success');
            } catch (err) {
              showToast(err instanceof Error ? err.message : 'Error al eliminar comercio', 'error');
            }
          },
        },
      ]
    );
  };

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

      <TouchableOpacity style={styles.buttonAdd} onPress={() => router.push('/crear-comercio')}>
        <Text style={styles.buttonText}>+ Nuevo Comercio</Text>
      </TouchableOpacity>

      {comercios.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay comercios registrados</Text>
        </View>
      ) : (
        <FlatList
          data={comercios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ComercioCard
              comercio={item}
              onPress={() =>
                router.push({
                  pathname: '/comercio-detalle',
                  params: { id: String(item.id), nombre: item.nombre },
                })
              }
            />
          )}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 15 },
    listContent: { paddingVertical: 8 },
    buttonAdd: { backgroundColor: C.tint, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyStateText: { fontSize: 16, color: C.icon },
    error: { color: C.danger, padding: 10, backgroundColor: C.danger + '18', borderRadius: 8, marginBottom: 10 },
  });
}
