import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function NuevoProductoScreen() {
  const params = useLocalSearchParams();
  const comercioId = params.comercio_id ? Number(params.comercio_id) : 1;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagen, setImagen] = useState<string | null>(null);
  const { createProducto, error } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    if (!resultado.canceled) setImagen(resultado.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!nombre.trim()) { showToast('Debe ingresar un nombre', 'error'); return; }
    if (!precio.trim() || isNaN(Number(precio))) { showToast('Debe ingresar un precio válido', 'error'); return; }
    try {
      setLoading(true);
      let imagenUrl: string | null = null;
      if (imagen) imagenUrl = await uploadProductoImagen(imagen);
      await createProducto(nombre.trim(), descripcion.trim(), Number(precio), null, comercioId, true, imagenUrl);
      showToast('✓ Producto creado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : (error || 'No se pudo crear el producto');
      showToast(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={S.container}>
      <Text style={S.label}>Nombre *</Text>
      <TextInput style={S.input} placeholder="Ingrese nombre" placeholderTextColor={C.textSecondary} value={nombre} onChangeText={setNombre} editable={!loading} />
      <Text style={S.label}>Descripción</Text>
      <TextInput style={[S.input, S.textArea]} placeholder="Ingrese descripción" placeholderTextColor={C.textSecondary} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} editable={!loading} />
      <Text style={S.label}>Precio *</Text>
      <TextInput style={S.input} placeholder="Ingrese precio" placeholderTextColor={C.textSecondary} value={precio} onChangeText={setPrecio} keyboardType="numeric" editable={!loading} />
      <Text style={S.label}>Imagen</Text>
      <TouchableOpacity style={S.imageButton} onPress={seleccionarImagen} disabled={loading}>
        <Text style={S.imageButtonText}>{imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
      </TouchableOpacity>
      {imagen && <Image source={{ uri: imagen }} style={S.preview} />}
      {error && <Text style={S.error}>{error}</Text>}
      <TouchableOpacity style={[S.button, loading && S.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={S.buttonText}>Crear Producto</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={S.buttonCancel} onPress={() => router.back()} disabled={loading}>
        <Text style={S.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, fontSize: 14, color: C.text, backgroundColor: C.card },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageButton: { backgroundColor: C.cardSecondary, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  imageButtonText: { fontSize: 14, fontWeight: '600', color: C.text },
  preview: { width: 180, height: 180, alignSelf: 'center', borderRadius: 10, marginBottom: 20 },
  button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
  buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
  error: { color: C.danger, padding: 10, backgroundColor: C.danger + '18', borderRadius: 8, marginBottom: 10 },
});
