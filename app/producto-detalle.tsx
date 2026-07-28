import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ProductoDetalle = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  categoria: number;
  comercio_id: number;
  imagen?: string | null;
  comercio?: { nombre: string };
};

export default function ProductoDetalleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { isDueno } = useAuth();
  const { addItem } = useCart();
  const { show } = useToast();
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);

  const id = params.id ? Number(params.id) : null;

  useEffect(() => {
    if (!id) {
      setError('ID de producto no válido');
      setLoading(false);
      return;
    }

    const fetchProducto = async () => {
      try {
        const { data, error: err } = await supabase
          .from('productos')
          .select('*, comercio:comercio_id (nombre)')
          .eq('id', id)
          .single();

        if (err) throw err;
        setProducto(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  const handleAddToCart = () => {
    if (!producto) return;
    addItem({ ...producto, comercio_nombre: producto.comercio?.nombre } as any, cantidad);
    show(`${cantidad}x ${producto.nombre} agregado${cantidad > 1 ? 's' : ''} al carrito`, 'success');
    setCantidad(1);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={C.tint} />
      </ThemedView>
    );
  }

  if (error || !producto) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol size={48} pack="material" name="error-outline" color={C.icon} />
        <Text style={[styles.errorText, { color: C.icon }]}>{error || 'Producto no encontrado'}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: C.tint }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.background }]}>
      {producto.imagen ? (
        <Image source={{ uri: producto.imagen }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: C.lightGray }]}>
          <IconSymbol size={64} pack="material" name="restaurant" color={C.tint} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.nombre, { color: C.text }]}>{producto.nombre}</Text>

        {producto.comercio && (
          <View style={[styles.comercioBadge, { backgroundColor: C.lightGray }]}>
            <IconSymbol size={16} pack="material" name="store" color={C.tint} />
            <Text style={[styles.comercioNombre, { color: C.tint }]}>
              {producto.comercio.nombre}
            </Text>
          </View>
        )}

        <Text style={[styles.precio, { color: C.tint }]}>
          ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </Text>

        {producto.descripcion ? (
          <Text style={[styles.descripcion, { color: C.icon }]}>{producto.descripcion}</Text>
        ) : null}

        <View style={[styles.statusContainer, { backgroundColor: C.lightGray }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: C.text }]}>Disponibilidad:</Text>
            <View style={[styles.statusBadge, { backgroundColor: producto.disponible ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.statusText, { color: producto.disponible ? '#2E7D32' : '#C62828' }]}>
                {producto.disponible ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        {!isDueno && producto.disponible && (
          <View style={styles.cartSection}>
            <View style={styles.cantidadRow}>
              <View style={styles.cantidadSelector}>
                <TouchableOpacity
                  style={[styles.cantidadButton, { backgroundColor: C.lightGray }]}
                  onPress={() => setCantidad(prev => Math.max(1, prev - 1))}
                >
                  <Text style={[styles.cantidadButtonText, { color: C.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cantidadValue, { color: C.text }]}>{cantidad}</Text>
                <TouchableOpacity
                  style={[styles.cantidadButton, { backgroundColor: C.lightGray }]}
                  onPress={() => setCantidad(prev => prev + 1)}
                >
                  <Text style={[styles.cantidadButtonText, { color: C.text }]}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: C.tint }]} onPress={handleAddToCart}>
                <IconSymbol size={18} pack="material" name="add-shopping-cart" color="#FFFFFF" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtotalText, { color: C.icon }]}>
              Subtotal: ${(producto.precio * cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  comercioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  comercioNombre: {
    fontSize: 14,
    fontWeight: '600',
  },
  precio: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartSection: {
    marginTop: 20,
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cantidadSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cantidadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadButtonText: {
    fontSize: 22,
    fontWeight: '700',
  },
  cantidadValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 14,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
