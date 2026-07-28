import { PedidoCard } from '@/components/PedidoCard';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useEstados } from '@/contexts/EstadosContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePedidos } from '@/hooks/use-pedidos';
import { Pedido } from '@/types/pedido';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const BADGE_COLORS: Record<number, string> = {
  1: '#FFB74D', 2: '#42A5F5', 3: '#FF7043',
  4: '#EF5350', 5: '#AB47BC', 6: '#66BB6A',
};

function getBadgeColor(estado: number) {
  return { backgroundColor: BADGE_COLORS[estado] || '#999' };
}

export default function PedidosScreen() {
  const { isDueno } = useAuth();
  const { pedidos, pedidosCliente, loading, error, fetchPedidos, fetchPedidosCliente } = usePedidos();
  const router = useRouter();
  const params = useLocalSearchParams();
  const estado = params.estado ? parseInt(params.estado as string) : undefined;
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);
  const { getEstadoNombre } = useEstados();

  useFocusEffect(
    useCallback(() => {
      if (isDueno) {
        fetchPedidos();
        fetchPedidosCliente();
      } else {
        fetchPedidosCliente();
      }
    }, [isDueno, fetchPedidos, fetchPedidosCliente])
  );

  const filteredPedidos = useMemo(() => {
    let source: Pedido[];
    if (isDueno) {
      const combined = [...pedidos, ...pedidosCliente];
      const seen = new Set<number>();
      source = combined.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    } else {
      source = pedidosCliente;
    }
    if (estado !== undefined) {
      return source.filter((p) => p.estado === estado);
    }
    return source;
  }, [isDueno, pedidos, pedidosCliente, estado]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!isDueno) {
    return (
      <ThemedView style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        {filteredPedidos.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol size={64} pack="material" name="receipt-long" color={C.icon} />
            <Text style={[styles.emptyStateText, { color: C.icon }]}>
              Todavía no tenés compras
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: C.icon }]}>
              Cuando realices un pedido, aparecerá aquí para que puedas hacer el seguimiento.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPedidos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clientPedidoCard}
                onPress={() => router.push(`/pedido-detalle?id=${item.id}`)}>
                <View style={styles.clientPedidoHeader}>
                  <Text style={[styles.clientPedidoId, { color: C.text }]}>Pedido #{item.id}</Text>
                  <View style={[styles.miniBadge, getBadgeColor(item.estado)]}>
                    <Text style={styles.miniBadgeText}>{getEstadoNombre(item.estado)}</Text>
                  </View>
                </View>
                {item.comercio && (
                  <View style={[styles.comercioTag, { backgroundColor: C.lightGray }]}>
                    <IconSymbol size={12} pack="material" name="store" color={C.tint} />
                    <Text style={[styles.comercioTagText, { color: C.tint }]}>{item.comercio.nombre}</Text>
                  </View>
                )}
                <Text style={[styles.clientPedidoDesc, { color: C.icon }]} numberOfLines={2}>
                  {item.descripcion}
                </Text>
                <View style={styles.clientPedidoFooter}>
                  <Text style={[styles.clientPedidoMonto, { color: C.tint }]}>
                    ${item.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.clientPedidoDate, { color: C.icon }]}>
                    {new Date(item.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
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
          <TouchableOpacity style={styles.buttonCreate} onPress={() => router.push('/crear-pedido')}>
            <Text style={styles.buttonText}>+ Crear Pedido</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPedidos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PedidoCard pedido={item} onPress={() => router.push(`/pedido-detalle?id=${item.id}`)} />
          )}
          scrollEnabled={true}
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
    listContent: { paddingVertical: 8, gap: 10 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
    emptyStateText: { fontSize: 16, color: C.icon, marginTop: 12, marginBottom: 6 },
    emptyStateSubtext: { fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
    buttonCreate: { backgroundColor: C.tint, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10 },
    clientPedidoCard: {
      backgroundColor: C.card,
      borderRadius: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: C.border,
    },
    clientPedidoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    clientPedidoId: { fontSize: 15, fontWeight: '700' },
    miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    miniBadgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
    comercioTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 8,
    },
    comercioTagText: { fontSize: 12, fontWeight: '600' },
    clientPedidoDesc: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
    clientPedidoFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },
    clientPedidoMonto: { fontSize: 15, fontWeight: '700' },
    clientPedidoDate: { fontSize: 12 },
  });
}
