import { Colors, StateColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useEstados } from '@/contexts/EstadosContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pedido } from '@/types/pedido';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PedidoCardProps {
  pedido: Pedido;
  onPress?: () => void;
}

function PedidoCardComponent({ pedido, onPress }: PedidoCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);
  const { getEstadoNombre } = useEstados();
  const estadoNombre = getEstadoNombre(pedido.estado);
  const badgeBg = StateColors[pedido.estado]?.[scheme === 'dark' ? 'dark' : 'light'] || '#999';

  return (
    <TouchableOpacity style={styles.pedidoItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
        <View style={[styles.miniBadge, { backgroundColor: badgeBg }]}>
          <Text style={styles.miniBadgeText}>{estadoNombre}</Text>
        </View>
      </View>
      {pedido.comercio && (
        <View style={[styles.comercioTag, { backgroundColor: C.lightGray }]}>
          <IconSymbol size={12} pack="material" name="store" color={C.tint} />
          <Text style={[styles.comercioTagText, { color: C.tint }]}>{pedido.comercio.nombre}</Text>
        </View>
      )}
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
  );
}

export const PedidoCard = React.memo(PedidoCardComponent);

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    pedidoItem: {
      backgroundColor: C.card,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    pedidoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    pedidoId: {
      fontSize: 14,
      fontWeight: 'bold',
      color: C.text,
    },
    miniBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    miniBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    pedidoCliente: {
      fontSize: 13,
      color: C.icon,
      marginBottom: 6,
    },
    comercioTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 6,
    },
    comercioTagText: { fontSize: 12, fontWeight: '600' },
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
      fontWeight: 'bold',
      color: C.tint,
    },
    pedidoDate: {
      fontSize: 12,
      color: C.icon,
    },
  });
}
