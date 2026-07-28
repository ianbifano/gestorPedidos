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
  onPress?: (product: Producto) => void;
  onAddToCart?: (product: Producto) => void;
  onEdit?: (product: Producto) => void;
  onDelete?: (product: Producto) => void;
  onTogglePublicado?: (product: Producto) => void;
  onToggleDisponible?: (product: Producto) => void;
}

export function ProductCard({ product, onPress, onAddToCart, onEdit, onDelete, onTogglePublicado, onToggleDisponible }: ProductCardProps) {
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
    comercioBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      marginBottom: 6,
    },
    comercioNombre: {
      fontSize: 11,
      fontWeight: '600',
    },
    descripcion: {
      fontSize: 12,
      color: colors.icon,
      lineHeight: 16,
      marginBottom: 10,
    },
    statusBadges: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
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
      gap: 6,
    },
    button: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: '#EF5350',
    },
    toggleButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 11,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.95 }]}
      onPress={() => onPress?.(product)}>
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
        {product.comercio && (
          <View style={[styles.comercioBadge, { backgroundColor: colors.lightGray }]}>
            <IconSymbol size={12} pack="material" name="store" color={colors.tint} />
            <Text style={[styles.comercioNombre, { color: colors.tint }]}>{product.comercio.nombre}</Text>
          </View>
        )}
        {product.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={2}>{product.descripcion}</Text>
        ) : null}

        {isOwnerMode && (
          <View style={styles.statusBadges}>
            <Pressable
              style={[
                styles.badge,
                { backgroundColor: product.publicado !== false ? '#E8F5E9' : '#FFEBEE' }
              ]}
              onPress={(e) => { e.stopPropagation(); onTogglePublicado?.(product); }}>
              <IconSymbol
                size={10}
                pack="material"
                name={product.publicado !== false ? 'visibility' : 'visibility-off'}
                color={product.publicado !== false ? '#2E7D32' : '#C62828'}
              />
              <Text style={[
                styles.badgeText,
                { color: product.publicado !== false ? '#2E7D32' : '#C62828' }
              ]}>
                {product.publicado !== false ? 'Publicado' : 'Borrador'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.badge,
                { backgroundColor: product.disponible ? '#E3F2FD' : '#FFF3E0' }
              ]}
              onPress={(e) => { e.stopPropagation(); onToggleDisponible?.(product); }}>
              <IconSymbol
                size={10}
                pack="material"
                name={product.disponible ? 'check-circle' : 'pause-circle'}
                color={product.disponible ? '#1565C0' : '#E65100'}
              />
              <Text style={[
                styles.badgeText,
                { color: product.disponible ? '#1565C0' : '#E65100' }
              ]}>
                {product.disponible ? 'Activo' : 'Inactivo'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.precio}>
            ${product.precio.toLocaleString('es-AR')}
          </Text>

          {isOwnerMode ? (
            <View style={styles.ownerActions}>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
                onPress={(e) => { e.stopPropagation(); onEdit?.(product); }}>
                <Text style={styles.buttonText}>Editar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.button, styles.deleteButton, pressed && { opacity: 0.8 }]}
                onPress={(e) => { e.stopPropagation(); onDelete?.(product); }}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={(e) => { e.stopPropagation(); onAddToCart?.(product); }}>
              <Text style={styles.buttonText}>Agregar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
