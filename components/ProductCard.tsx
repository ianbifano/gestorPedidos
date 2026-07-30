import { useColorScheme } from '@/hooks/use-color-scheme';
import { Producto } from '@/types/producto';
import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
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
  const isOwnerMode = !!(onEdit && onDelete);

  const styles = StyleSheet.create({
    container: {
      borderRadius: 14,
      backgroundColor: '#1E1E24',
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    imageContainer: {
      width: '100%',
      height: 160,
      backgroundColor: '#2A2A30',
      overflow: 'hidden',
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#2A2A30',
    },
    content: {
      padding: 12,
    },
    nombre: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    comercioBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignSelf: 'flex-start',
      marginBottom: 6,
    },
    comercioNombre: {
      fontSize: 10,
      fontWeight: '600',
      color: '#AAAAAA',
    },
    descripcion: {
      fontSize: 12,
      color: '#888888',
      lineHeight: 16,
      marginBottom: 8,
    },
    statusRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 5,
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
      borderTopColor: 'rgba(255,255,255,0.08)',
    },
    precio: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FF9500',
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonEdit: {
      backgroundColor: 'rgba(0,122,255,0.2)',
    },
    iconButtonDelete: {
      backgroundColor: 'rgba(255,59,48,0.2)',
    },
    iconButtonCart: {
      backgroundColor: '#007AFF',
    },
    ownerActions: {
      flexDirection: 'row',
      gap: 6,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.92 }]}
      onPress={() => onPress?.(product)}>
      <View style={styles.imageContainer}>
        {product.imagen ? (
          <Image source={{ uri: product.imagen }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <IconSymbol size={36} pack="material" name="restaurant" color="#555555" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.nombre} numberOfLines={2}>{product.nombre}</Text>

        {product.comercio && (
          <View style={styles.comercioBadge}>
            <IconSymbol size={10} pack="material" name="store" color="#AAAAAA" />
            <Text style={styles.comercioNombre} numberOfLines={1}>{product.comercio.nombre}</Text>
          </View>
        )}

        {product.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={2}>{product.descripcion}</Text>
        ) : null}

        {isOwnerMode && (
          <View style={styles.statusRow}>
            <Pressable
              style={[
                styles.badge,
                { backgroundColor: product.publicado !== false ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)' }
              ]}
              onPress={(e) => { e.stopPropagation(); onTogglePublicado?.(product); }}>
              <IconSymbol
                size={10}
                pack="material"
                name={product.publicado !== false ? 'visibility' : 'visibility-off'}
                color={product.publicado !== false ? '#4CAF50' : '#EF5350'}
              />
              <Text style={[
                styles.badgeText,
                { color: product.publicado !== false ? '#4CAF50' : '#EF5350' }
              ]}>
                {product.publicado !== false ? 'Publicado' : 'Borrador'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.badge,
                { backgroundColor: product.disponible ? 'rgba(21,101,192,0.2)' : 'rgba(230,81,0,0.2)' }
              ]}
              onPress={(e) => { e.stopPropagation(); onToggleDisponible?.(product); }}>
              <IconSymbol
                size={10}
                pack="material"
                name={product.disponible ? 'check-circle' : 'pause-circle'}
                color={product.disponible ? '#42A5F5' : '#FF9800'}
              />
              <Text style={[
                styles.badgeText,
                { color: product.disponible ? '#42A5F5' : '#FF9800' }
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
              <TouchableOpacity
                style={[styles.iconButton, styles.iconButtonEdit]}
                onPress={() => onEdit?.(product)}>
                <IconSymbol size={16} pack="material" name="edit" color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.iconButtonDelete]}
                onPress={() => onDelete?.(product)}>
                <IconSymbol size={16} pack="material" name="delete" color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.iconButton, styles.iconButtonCart]}
              onPress={() => onAddToCart?.(product)}>
              <IconSymbol size={18} pack="material" name="add-shopping-cart" color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
}
