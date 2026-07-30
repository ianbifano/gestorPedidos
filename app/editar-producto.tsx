import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { supabase } from '@/constants/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { deleteProductoImagen, uploadProductoImagen } from '@/src/services/uploadProductoImagen';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity } from 'react-native';

export default function EditarProductoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const idNumber = Number(params.id);
  const { updateProducto } = useProductos();
  const { show: showToast } = useToast();
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [publicado, setPublicado] = useState(true);
  const [imagen, setImagen] = useState<string | null>(null);
  const [imagenOriginal, setImagenOriginal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!idNumber || isNaN(idNumber)) return;
    loadProducto();
  }, [idNumber]);

  const loadProducto = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', idNumber)
        .single();

      if (error) throw error;
      if (!data) { showToast('Producto no encontrado', 'error'); router.back(); return; }

      setNombre(data.nombre || '');
      setDescripcion(data.descripcion || '');
      setPrecio(String(data.precio));
      setDisponible(data.disponible !== false);
      setPublicado(data.publicado !== false);
      setImagen(data.imagen || null);
      setImagenOriginal(data.imagen || null);
    } catch (err) {
      showToast('Error al cargar producto', 'error');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

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

  const eliminarImagen = async () => {
    if (!imagenOriginal) return;
    try {
      await deleteProductoImagen(imagenOriginal);
      setImagen(null);
      showToast('Imagen eliminada', 'success');
    } catch {
      showToast('Error al eliminar imagen', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!idNumber || isNaN(idNumber)) { showToast('ID inválido', 'error'); return; }
      if (!nombre.trim()) { showToast('Nombre obligatorio', 'error'); return; }
      const precioNumber = Number(precio);
      if (isNaN(precioNumber)) { showToast('Precio inválido', 'error'); return; }

      setLoading(true);
      let imagenUrl: string | null = imagen;

      if (imagen && imagen !== imagenOriginal) {
        imagenUrl = await uploadProductoImagen(imagen);
      }

      await updateProducto(idNumber, nombre.trim(), descripcion.trim(), precioNumber, null, disponible, imagenUrl, publicado);
      showToast('Producto actualizado', 'success');
      router.back();
    } catch (err) {
      showToast('Error al actualizar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ThemedView style={S.center}>
        <ActivityIndicator size="large" color={C.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={S.container}>
      <Text style={S.title}>Editar Producto</Text>

      <Text style={S.label}>Nombre</Text>
      <TextInput style={S.input} placeholder="Nombre" placeholderTextColor={C.textSecondary} value={nombre} onChangeText={setNombre} />

      <Text style={S.label}>Descripción</Text>
      <TextInput style={S.input} placeholder="Descripción" placeholderTextColor={C.textSecondary} value={descripcion} onChangeText={setDescripcion} />

      <Text style={S.label}>Precio</Text>
      <TextInput style={S.input} placeholder="Precio" placeholderTextColor={C.textSecondary} value={precio} onChangeText={setPrecio} keyboardType="numeric" />

      <Text style={S.label}>Disponible</Text>
      <Switch
        value={disponible}
        onValueChange={setDisponible}
        trackColor={{ false: C.border, true: C.tint + '80' }}
        thumbColor={disponible ? C.tint : C.icon}
      />

      <Text style={S.label}>Publicado</Text>
      <Switch
        value={publicado}
        onValueChange={setPublicado}
        trackColor={{ false: C.border, true: C.tint + '80' }}
        thumbColor={publicado ? C.tint : C.icon}
      />

      {imagen ? (
        <>
          <Image source={{ uri: imagen }} style={S.preview} />
          <TouchableOpacity style={S.deleteImageButton} onPress={eliminarImagen} disabled={loading}>
            <Text style={S.deleteImageButtonText}>Eliminar imagen</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={S.imageButton} onPress={seleccionarImagen} disabled={loading}>
          <Text style={S.imageButtonText}>Seleccionar imagen</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[S.button, loading && S.buttonDisabled]} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={S.buttonText}>Guardar cambios</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={S.buttonCancel} onPress={() => router.back()} disabled={loading}>
        <Text style={S.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: C.text },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
  input: { borderWidth: 1, borderColor: C.border, padding: 10, borderRadius: 8, marginBottom: 16, color: C.text, backgroundColor: C.card },
  button: { backgroundColor: C.tint, padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
  buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
  imageButton: { backgroundColor: C.cardSecondary, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  imageButtonText: { color: C.text, fontWeight: '600' },
  deleteImageButton: { backgroundColor: C.danger, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  deleteImageButtonText: { color: '#fff', fontWeight: '600' },
  preview: { width: 180, height: 180, borderRadius: 10, alignSelf: 'center', marginBottom: 12 },
});
