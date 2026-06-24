import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Producto } from '@/types/producto';
import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface ProductCardProps {
  product: Producto;
  onAddToCart?: (product: Producto) => void;
  onEdit?: (product: Producto) => void;
  onDelete?: (product: Producto) => void;
}

export function ProductCard({ product, onAddToCart, onEdit, onDelete }: ProductCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isOwnerMode = !!(onEdit && onDelete);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 8,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    imageContainer: {
      width: '100%',
      height: 180,
      backgroundColor: colors.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.2,
    },
    content: {
      padding: 12,
      flex: 1,
    },
    nombre: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    descripcion: {
      fontSize: 12,
      color: colors.icon,
      lineHeight: 16,
      marginBottom: 10,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    precio: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.tint,
    },
    ownerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: '#EF5350',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {product.imagen ? (
          <Image source={{ uri: product.imagen }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <IconSymbol size={32} pack="material" name="restaurant" color={colors.tint} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.nombre} numberOfLines={2}>{product.nombre}</Text>
        {product.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={2}>{product.descripcion}</Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.precio}>
            ${product.precio.toLocaleString('es-AR')}
          </Text>

          {isOwnerMode ? (
            <View style={styles.ownerActions}>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
                onPress={() => onEdit!(product)}>
                <Text style={styles.buttonText}>Editar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.button, styles.deleteButton, pressed && { opacity: 0.8 }]}
                onPress={() => onDelete!(product)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={() => onAddToCart?.(product)}>
              <Text style={styles.buttonText}>Agregar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
