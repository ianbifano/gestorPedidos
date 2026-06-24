import { Colors } from '@/constants/theme';
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

  return (
    <TouchableOpacity style={styles.pedidoItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
        <View style={[styles.miniBadge, getBadgeColor(pedido.estado)]}>
          <Text style={styles.miniBadgeText}>{estadoNombre}</Text>
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
  );
}

export const PedidoCard = React.memo(PedidoCardComponent);

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
