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
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const BADGE_COLORS: Record<number, string> = {
  1: '#FFB74D', 2: '#42A5F5', 3: '#FF7043',
  4: '#EF5350', 5: '#AB47BC', 6: '#66BB6A',
};

function getBadgeColor(estado: number) {
  return { backgroundColor: BADGE_COLORS[estado] || '#999' };
}

type PedidoSection = {
  title: string;
  data: Pedido[];
  isComercio: boolean;
};

function groupByComercio(pedidos: Pedido[]): PedidoSection[] {
  const map = new Map<number, Pedido[]>();
  const sinComercio: Pedido[] = [];

  for (const p of pedidos) {
    if (p.comercio_id != null) {
      const arr = map.get(p.comercio_id) ?? [];
      arr.push(p);
      map.set(p.comercio_id, arr);
    } else {
      sinComercio.push(p);
    }
  }

  const sections: PedidoSection[] = [];
  for (const [comercioId, data] of map) {
    sections.push({
      title: data[0].comercio?.nombre ?? `Comercio #${comercioId}`,
      data,
      isComercio: true,
    });
  }
  sections.sort((a, b) => a.title.localeCompare(b.title));

  if (sinComercio.length > 0) {
    sections.push({ title: 'Otros', data: sinComercio, isComercio: true });
  }

  return sections;
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

  const filterByEstado = useCallback(
    (list: Pedido[]) => estado !== undefined ? list.filter((p) => p.estado === estado) : list,
    [estado]
  );

  const sections = useMemo(() => {
    if (!isDueno) return [];

    const result: PedidoSection[] = [];

    const clienteFiltrados = filterByEstado(pedidosCliente);
    if (clienteFiltrados.length > 0) {
      result.push({ title: 'Mis Compras', data: clienteFiltrados, isComercio: false });
    }

    const duenoFiltrados = filterByEstado(pedidos);
    const comercioSections = groupByComercio(duenoFiltrados);
    result.push(...comercioSections);

    return result;
  }, [isDueno, pedidos, pedidosCliente, filterByEstado]);

  const clienteFiltrados = useMemo(() => filterByEstado(pedidosCliente), [pedidosCliente, filterByEstado]);

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

        {clienteFiltrados.length === 0 ? (
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
          <SectionList
            sections={[{ title: 'Mis Compras', data: clienteFiltrados }]}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionTitle, { color: C.text }]}>{section.title}</Text>
            )}
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
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

  return (
    <ThemedView style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {estado ? 'No hay pedidos en este estado' : 'No hay pedidos'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: section.isComercio ? C.card : C.lightGray }]}>
              <IconSymbol
                size={18}
                pack="material"
                name={section.isComercio ? 'store' : 'shopping-bag'}
                color={C.tint}
              />
              <Text style={[styles.sectionTitle, { color: C.text }]}>{section.title}</Text>
              <Text style={[styles.sectionCount, { color: C.icon }]}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item, section }) => (
            section.isComercio ? (
              <PedidoCard pedido={item} onPress={() => router.push(`/pedido-detalle?id=${item.id}`)} />
            ) : (
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
            )
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          stickySectionHeadersEnabled={false}
          renderSectionFooter={() => <View style={{ height: 6 }} />}
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
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
    emptyStateText: { fontSize: 16, color: C.icon, marginTop: 12, marginBottom: 6 },
    emptyStateSubtext: { fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
    error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 10,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      flex: 1,
    },
    sectionCount: {
      fontSize: 13,
      fontWeight: '600',
    },
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
