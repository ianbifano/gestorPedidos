import { useToast } from '@/components/Toast';
import { ThemedView } from '@/components/themed-view';
import { useProductos } from '@/hooks/use-productos';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function EditarProductoScreen() {
  const router = useRouter();
  const { updateProducto } = useProductos();
  const { show: showToast } = useToast();

  const { id, nombre, descripcion, precio } = useLocalSearchParams();

  // -------------------------
  // VALIDACIÓN DE ID
  // -------------------------
  const idNumber = Number(id);

  // -------------------------
  // STATE SAFE (evita undefined)
  // -------------------------
  const [nombreState, setNombreState] = useState(
    (nombre as string) ?? ''
  );
  const [descripcionState, setDescripcionState] = useState(
    (descripcion as string) ?? ''
  );
  const [precioState, setPrecioState] = useState(
    (precio as string) ?? ''
  );

  // -------------------------
  // UPDATE
  // -------------------------
  const handleUpdate = async () => {
    try {
      // VALIDACIONES
      if (!id || isNaN(idNumber)) {
        showToast('ID inválido', 'error');
        return;
      }

      if (!nombreState.trim()) {
        showToast('Nombre obligatorio', 'error');
        return;
      }

      const precioNumber = Number(precioState);

      if (isNaN(precioNumber)) {
        showToast('Precio inválido', 'error');
        return;
      }

      await updateProducto(
        idNumber,
        nombreState,
        descripcionState,
        precioNumber,
        null,
        true
      );

      showToast('Producto actualizado', 'success');
      router.back();
    } catch (err) {
      console.log('UPDATE ERROR:', err);
      showToast('Error al actualizar producto', 'error');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombreState}
        onChangeText={setNombreState}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcionState}
        onChangeText={setDescripcionState}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={precioState}
        onChangeText={setPrecioState}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});