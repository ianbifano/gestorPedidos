import { useToast } from '@/components/Toast';
import { ThemedView } from '@/components/themed-view';
import { useProductos } from '@/hooks/use-productos';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';
import * as ImagePicker from 'expo-image-picker';

export default function EditarProductoScreen() {
  const router = useRouter();
  const { updateProducto } = useProductos();
  const { show: showToast } = useToast();

  const { id, nombre, descripcion, precio } = useLocalSearchParams();

  const idNumber = Number(id);

  const [nombreState, setNombreState] = useState(
    (nombre as string) ?? ''
  );
  const [descripcionState, setDescripcionState] = useState(
    (descripcion as string) ?? ''
  );
  const [precioState, setPrecioState] = useState(
    (precio as string) ?? ''
  );

  const [imagen, setImagen] = useState<string | null>(null);

  // -------------------------
  // SELECT IMAGE
  // -------------------------
  const seleccionarImagen = async () => {
    const permiso =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      showToast('Sin permisos de galería', 'error');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  // -------------------------
  // UPDATE
  // -------------------------
  const handleUpdate = async () => {
    try {
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

      let imagenUrl = imagen;

      // si hay nueva imagen → subirla
      if (imagen) {
        imagenUrl = await uploadProductoImagen(imagen);
      }

      await updateProducto(
        idNumber,
        nombreState,
        descripcionState,
        precioNumber,
        null,
        true,
        imagenUrl
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

      {/* IMAGEN */}
      <TouchableOpacity
        style={styles.imageButton}
        onPress={seleccionarImagen}
      >
        <Text>
          {imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </Text>
      </TouchableOpacity>

      {imagen && (
        <Image
          source={{ uri: imagen }}
          style={styles.preview}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>
          Guardar cambios
        </Text>
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

  imageButton: {
    backgroundColor: '#E5E5E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  preview: {
    width: 180,
    height: 180,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 12,
  },
});