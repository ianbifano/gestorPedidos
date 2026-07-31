import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { supabase } from '@/constants/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProductos } from '@/hooks/use-productos';
import { uploadProductoImagen } from '@/src/services/uploadProductoImagen';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

type ComercioOption = {
  id: number;
  nombre: string;
};

export default function CrearProductoScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const paramsComercioId = params.comercio_id ? Number(params.comercio_id) : null;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComercios, setLoadingComercios] = useState(false);
  const [imagen, setImagen] = useState<string | null>(null);
  const [comercios, setComercios] = useState<ComercioOption[]>([]);
  const [selectedComercio, setSelectedComercio] = useState<number | null>(paramsComercioId);
  const [showPicker, setShowPicker] = useState(!paramsComercioId);
  const { createProducto } = useProductos();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  useEffect(() => {
    if (!paramsComercioId && user?.email) {
      fetchMisComercios();
    }
  }, [user?.email]);

  const fetchMisComercios = async () => {
    if (!user?.email) return;
    try {
      setLoadingComercios(true);
      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', user.email)
        .limit(1)
        .maybeSingle();

      if (!userData?.user_id) return;

      const { data: vinculos } = await supabase
        .from('users_x_comercios')
        .select('comercio_id')
        .eq('user_id', userData.user_id);

      const ids = (vinculos ?? []).map((v) => v.comercio_id).filter(Boolean);
      if (ids.length === 0) return;

      const { data: comerciosData } = await supabase
        .from('comercios')
        .select('id, nombre')
        .in('id', ids)
        .order('nombre', { ascending: true });

      setComercios(comerciosData || []);

      if ((comerciosData?.length ?? 0) === 1 && comerciosData) {
        setSelectedComercio(comerciosData[0].id);
        setShowPicker(false);
      }
    } catch {
      showToast('Error al cargar comercios', 'error');
    } finally {
      setLoadingComercios(false);
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

  const comercioId = selectedComercio;

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
    if (!comercioId) {
      showToast('Seleccioná un comercio', 'error');
      return;
    }

    try {
      setLoading(true);
      let imagenUrl: string | null = null;
      if (imagen) imagenUrl = await uploadProductoImagen(imagen);
      await createProducto(nombre.trim(), descripcion.trim(), precioNum, null, comercioId, true, imagenUrl);
      showToast('Producto creado correctamente', 'success');
      router.back();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo crear el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showPicker && loadingComercios) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={C.tint} />
        <Text style={[styles.label, { textAlign: 'center', marginTop: 16 }]}>Cargando comercios...</Text>
      </ThemedView>
    );
  }

  if (showPicker && comercios.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={[styles.label, { textAlign: 'center' }]}>No tenés comercios para agregar productos.</Text>
        <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (showPicker) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.title}>Seleccioná un comercio</Text>
        <FlatList
          data={comercios}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.comercioOption, { borderColor: C.border }]}
              onPress={() => {
                setSelectedComercio(item.id);
                setShowPicker(false);
              }}>
              <Text style={[styles.comercioOptionText, { color: C.text }]}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {!paramsComercioId && (
        <TouchableOpacity
          style={[styles.comercioBadge, { backgroundColor: C.cardSecondary, borderColor: C.border }]}
          onPress={() => setShowPicker(true)}>
          <Text style={[styles.comercioBadgeText, { color: C.tint }]}>
            {comercios.find(c => c.id === comercioId)?.nombre || 'Cambiar comercio'}
          </Text>
        </TouchableOpacity>
      )}

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

      <TouchableOpacity style={[styles.imageButton, { backgroundColor: C.cardSecondary, borderColor: C.border }]} onPress={seleccionarImagen} disabled={loading}>
        <Text style={[styles.imageButtonText, { color: C.text }]}>{imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
      </TouchableOpacity>
      {imagen && <Image source={{ uri: imagen }} style={styles.preview} />}

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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 20, color: C.text, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
    input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, fontSize: 14, color: C.text, backgroundColor: C.card },
    inputMultiline: { height: 80, textAlignVertical: 'top' },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
    buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
    comercioBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
    comercioBadgeText: { fontSize: 14, fontWeight: '600' },
    comercioOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
    comercioOptionText: { fontSize: 16 },
    imageButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
    imageButtonText: { fontSize: 14, fontWeight: '600' },
    preview: { width: 180, height: 180, borderRadius: 10, alignSelf: 'center', marginBottom: 12 },
  });
}
