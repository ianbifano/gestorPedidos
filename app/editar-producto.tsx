import { useToast } from '@/components/Toast';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function EditarProductoScreen() {
  const router = useRouter();
  const { updateProducto } = useProductos();
  const { show: showToast } = useToast();
  const { id, nombre, descripcion, precio } = useLocalSearchParams();
  const idNumber = Number(id);
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);

  const [nombreState, setNombreState] = useState((nombre as string) ?? '');
  const [descripcionState, setDescripcionState] = useState((descripcion as string) ?? '');
  const [precioState, setPrecioState] = useState((precio as string) ?? '');
  const [imagen, setImagen] = useState<string | null>(null);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    if (!resultado.canceled) setImagen(resultado.assets[0].uri);
  };

  const handleUpdate = async () => {
    try {
      if (!id || isNaN(idNumber)) { showToast('ID inválido', 'error'); return; }
      if (!nombreState.trim()) { showToast('Nombre obligatorio', 'error'); return; }
      const precioNumber = Number(precioState);
      if (isNaN(precioNumber)) { showToast('Precio inválido', 'error'); return; }
      let imagenUrl = imagen;
      if (imagen) imagenUrl = await uploadProductoImagen(imagen);
      await updateProducto(idNumber, nombreState, descripcionState, precioNumber, null, true, imagenUrl);
      showToast('Producto actualizado', 'success');
      router.back();
    } catch (err) {
      console.log('UPDATE ERROR:', err);
      showToast('Error al actualizar producto', 'error');
    }
  };

  return (
    <ThemedView style={S.container}>
      <Text style={S.title}>Editar Producto</Text>
      <TextInput style={S.input} placeholder="Nombre" placeholderTextColor={C.textSecondary} value={nombreState} onChangeText={setNombreState} />
      <TextInput style={S.input} placeholder="Descripción" placeholderTextColor={C.textSecondary} value={descripcionState} onChangeText={setDescripcionState} />
      <TextInput style={S.input} placeholder="Precio" placeholderTextColor={C.textSecondary} value={precioState} onChangeText={setPrecioState} keyboardType="numeric" />
      <TouchableOpacity style={S.imageButton} onPress={seleccionarImagen}>
        <Text style={S.imageButtonText}>{imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
      </TouchableOpacity>
      {imagen && <Image source={{ uri: imagen }} style={S.preview} />}
      <TouchableOpacity style={S.button} onPress={handleUpdate}>
        <Text style={S.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: C.text },
  input: { borderWidth: 1, borderColor: C.border, padding: 10, borderRadius: 8, marginBottom: 12, color: C.text, backgroundColor: C.card },
  button: { backgroundColor: C.tint, padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  imageButton: { backgroundColor: C.cardSecondary, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  imageButtonText: { color: C.text, fontWeight: '600' },
  preview: { width: 180, height: 180, borderRadius: 10, alignSelf: 'center', marginBottom: 12 },
});
