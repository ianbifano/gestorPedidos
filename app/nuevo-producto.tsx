import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { useProductos } from '@/hooks/use-productos';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';

export default function NuevoProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState<string | null>(null);

  const { createProducto, error } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();

  const seleccionarImagen = async () => {
    const permiso =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      showToast('Debe otorgar permisos para acceder a la galería', 'error');
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

      let imagenUrl: string | null = null;

      // 🔥 SUBIR IMAGEN PRIMERO
      if (imagen) {
        imagenUrl = await uploadProductoImagen(imagen);
      }

      await createProducto(
        nombre.trim(),
        descripcion.trim(),
        Number(precio),
        null,
        1,
        true,
        imagenUrl // 👈 URL ya subida
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

      <Text style={styles.label}>Imagen</Text>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={seleccionarImagen}
        disabled={loading}
      >
        <Text style={styles.imageButtonText}>
          {imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </Text>
      </TouchableOpacity>

      {imagen && (
        <Image
          source={{ uri: imagen }}
          style={styles.preview}
        />
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Crear Producto
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonCancel}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.buttonCancelText}>
          Cancelar
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}