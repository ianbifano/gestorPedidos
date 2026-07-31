import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useComercios } from '@/hooks/use-comercios';
import { Validators } from '@/hooks/validators';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function CrearComercioScreen() {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const { createComercio, error } = useComercios();
  const { refreshRole } = useAuth();
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const handleCreate = async () => {
    const validNombre = Validators.nombre(nombre);
    if (!validNombre.valid) {
      showToast(validNombre.error || 'Error', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('[CREAR_COMERCIO] calling createComercio with:', nombre.trim());
      const nuevo = await createComercio(nombre.trim());
      console.log('[CREAR_COMERCIO] createComercio OK, data:', nuevo);
      await refreshRole();
      showToast('✓ Comercio creado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : (error || 'No se pudo crear el comercio');
      console.error('[CREAR_COMERCIO] ERROR:', mensajeError);
      showToast(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Nombre del comercio *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Almacén Don José"
        placeholderTextColor={C.icon}
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Crear Comercio</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={loading}>
        <Text style={styles.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
    input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, fontSize: 14, color: C.text, backgroundColor: C.card },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
    buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
    error: { color: C.danger, padding: 10, backgroundColor: C.danger + '18', borderRadius: 8, marginBottom: 10, fontSize: 13 },
  });
}
