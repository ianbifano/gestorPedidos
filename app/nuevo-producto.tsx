import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { useProductos } from '@/hooks/use-productos';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';

export default function NuevoProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);

  const { createProducto, error } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();

  const handleCreate = async () => {
    if (!nombre.trim()) {
      showToast('Debe ingresar un nombre', 'error');
      return;
    }

    if (!precio.trim() || isNaN(Number(precio))) {
      showToast('Debe ingresar un precio válido', 'error');
      return;
    }

    try {
      setLoading(true);

      await createProducto(
        nombre.trim(),
        descripcion.trim(),
        Number(precio),
        null, // categoria
        1,    // comercio_id (ajustar luego)
        true
      );

      showToast('✓ Producto creado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : error || 'No se pudo crear el producto';

      showToast(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Nombre *</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese nombre"
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />

      <Text style={styles.label}>Descripción</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ingrese descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      <Text style={styles.label}>Precio *</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Crear Producto</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonCancel}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonCancel: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttonCancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
});