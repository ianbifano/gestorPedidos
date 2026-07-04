import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Comercio } from '@/types/comercio';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ComercioCardProps {
  comercio: Comercio;
  onPress?: () => void;
}

function ComercioCardComponent({ comercio, onPress }: ComercioCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.nombre}>{comercio.nombre}</Text>
      </View>
      <Text style={styles.createdAt}>
        Creado: {new Date(comercio.created_at).toLocaleDateString('es-AR')}
      </Text>
    </TouchableOpacity>
  );
}

export const ComercioCard = React.memo(ComercioCardComponent);

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    card: {
      backgroundColor: C.card,
      borderRadius: 8,
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: C.border,
    },
    cardHeader: {
      marginBottom: 4,
    },
    nombre: {
      fontSize: 16,
      fontWeight: '600',
      color: C.text,
    },
    createdAt: {
      fontSize: 12,
      color: C.icon,
      marginTop: 6,
    },
  });
}
