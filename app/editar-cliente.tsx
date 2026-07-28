import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClientes } from '@/hooks/use-clientes';
import { useComercios } from '@/hooks/use-comercios';
import { Validators } from '@/hooks/validators';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditarClienteScreen() {
  const { clientes, updateCliente } = useClientes();
  const { comercios } = useComercios();
  const { isDueno } = useAuth();
  const { show: showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id ? parseInt(params.id as string) : null;
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comercioId, setComercioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const cliente = id ? clientes.find((c) => c.id === id) : null;

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono || '');
      setComercioId(cliente.comercio_id ?? null);
    }
  }, [cliente]);

  if (!id || !cliente) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.notFound}>Cliente no encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleSave = async () => {
    const validNombre = Validators.nombre(nombre);
    if (!validNombre.valid) {
      showToast(validNombre.error || 'Error', 'error');
      return;
    }

    const validTelefono = Validators.telefono(telefono);
    if (!validTelefono.valid) {
      showToast(validTelefono.error || 'Error', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateCliente(id, nombre.trim(), telefono.trim() || undefined, comercioId);
      showToast('✓ Cliente actualizado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'No se pudo actualizar el cliente';
      showToast(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Nombre del cliente *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese nombre"
        placeholderTextColor={C.icon}
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese teléfono (opcional)"
        placeholderTextColor={C.icon}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        editable={!loading}
      />

      {isDueno && comercios.length > 0 && (
        <>
          <Text style={styles.label}>Comercio asociado</Text>
          <View style={styles.comercioList}>
            <TouchableOpacity
              style={[
                styles.comercioOption,
                comercioId === null && styles.comercioOptionActive,
              ]}
              onPress={() => setComercioId(null)}>
              <Text
                style={[
                  styles.comercioOptionText,
                  comercioId === null && styles.comercioOptionTextActive,
                ]}>
                Ninguno
              </Text>
            </TouchableOpacity>
            {comercios.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.comercioOption,
                  comercioId === c.id && styles.comercioOptionActive,
                ]}
                onPress={() => setComercioId(c.id)}>
                <Text
                  style={[
                    styles.comercioOptionText,
                    comercioId === c.id && styles.comercioOptionTextActive,
                  ]}>
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
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
    comercioList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    comercioOption: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.card,
    },
    comercioOptionActive: { backgroundColor: C.tint, borderColor: C.tint },
    comercioOptionText: { fontSize: 13, fontWeight: '600', color: C.text },
    comercioOptionTextActive: { color: 'white' },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
    buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
    notFound: { fontSize: 16, color: C.icon, textAlign: 'center' },
  });
}
