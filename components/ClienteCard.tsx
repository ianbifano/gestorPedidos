import { Cliente } from '@/types/cliente';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClienteCardProps {
  cliente: Cliente;
  onPress?: () => void;
}

function ClienteCardComponent({ cliente, onPress }: ClienteCardProps) {
  return (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{cliente.nombre}</Text>
        <Text style={styles.clientPhone}>{cliente.telefono || 'Sin teléfono'}</Text>
      </View>
      <Text style={styles.createdAt}>
        Registrado: {new Date(cliente.created_at).toLocaleDateString('es-AR')}
      </Text>
    </TouchableOpacity>
  );
}

export const ClienteCard = React.memo(ClienteCardComponent);

const styles = StyleSheet.create({
  clientCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardHeader: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});
