import { Pedido } from '@/types/pedido';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PedidoCardProps {
  pedido: Pedido;
  onPress?: () => void;
}

function PedidoCardComponent({ pedido, onPress }: PedidoCardProps) {
  return (
    <TouchableOpacity
      style={styles.pedidoItem}
      onPress={onPress}
      activeOpacity={0.7}>
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
  );
}

export const PedidoCard = React.memo(PedidoCardComponent);

function getBadgeColor(estado: string) {
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
  pedidoItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
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
    color: '#666',
    marginBottom: 6,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pedidoMonto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pedidoDate: {
    fontSize: 12,
    color: '#999',
  },
});
