import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Cliente } from '@/types/cliente';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClienteCardProps {
  cliente: Cliente;
  onPress?: () => void;
}

function ClienteCardComponent({ cliente, onPress }: ClienteCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.7}>
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

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    clientCard: {
      backgroundColor: C.card,
      borderRadius: 8,
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: C.border,
    },
    cardHeader: {
      marginBottom: 8,
    },
    clientName: {
      fontSize: 16,
      fontWeight: '600',
      color: C.text,
      marginBottom: 4,
    },
    clientPhone: {
      fontSize: 14,
      color: C.icon,
    },
    createdAt: {
      fontSize: 12,
      color: C.icon,
      marginTop: 6,
    },
  });
}
