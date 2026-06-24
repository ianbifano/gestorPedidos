import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function CrearProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const { createProducto } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const handleCreate = async () => {
    if (!nombre.trim()) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }
    const precioNum = parseFloat(precio.replace(',', '.'));
    if (!precio.trim() || isNaN(precioNum) || precioNum <= 0) {
      showToast('Ingresá un precio válido', 'error');
      return;
    }

    try {
      setLoading(true);
      await createProducto(nombre.trim(), descripcion.trim(), precioNum, null, 1, true, null);
      showToast('✓ Producto creado correctamente', 'success');
      router.back();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo crear el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Hamburguesa Doble"
        placeholderTextColor={C.icon}
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Descripción del producto (opcional)"
        placeholderTextColor={C.icon}
        value={descripcion}
        onChangeText={setDescripcion}
        editable={!loading}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Precio *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 1500"
        placeholderTextColor={C.icon}
        value={precio}
        onChangeText={setPrecio}
        editable={!loading}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Crear Producto</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={loading}>
        <Text style={styles.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
    input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, fontSize: 14, color: C.text, backgroundColor: C.card },
    inputMultiline: { height: 80, textAlignVertical: 'top' },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
    buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
  });
}
