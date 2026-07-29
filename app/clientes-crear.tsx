import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClientes } from '@/hooks/use-clientes';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function CrearClienteScreen() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCliente, error } = useClientes();
  const router = useRouter();
  const scheme = useColorScheme();
  const C = Colors[scheme];
  const S = styles(C);

  const handleCreate = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (nombre.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }
    const telefonoTrimmed = telefono.trim();
    if (telefonoTrimmed && telefonoTrimmed.length < 7) {
      Alert.alert('Error', 'El teléfono no parece válido');
      return;
    }
    try {
      setLoading(true);
      await createCliente(nombre.trim(), telefonoTrimmed || undefined);
      Alert.alert('Éxito', 'Cliente creado correctamente');
      router.back();
    } catch {
      Alert.alert('Error', error || 'No se pudo crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={S.container}>
      <Text style={S.label}>Nombre del cliente *</Text>
      <TextInput
        style={S.input}
        placeholder="Ingrese nombre"
        placeholderTextColor={C.textSecondary}
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />
      <Text style={S.label}>Teléfono</Text>
      <TextInput
        style={S.input}
        placeholder="Ingrese teléfono (opcional)"
        placeholderTextColor={C.textSecondary}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        editable={!loading}
      />
      {error && <Text style={S.error}>{error}</Text>}
      <TouchableOpacity style={[S.button, loading && S.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={S.buttonText}>Crear Cliente</Text>}
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
  button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
  buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
  error: { color: C.danger, padding: 10, backgroundColor: C.danger + '18', borderRadius: 8, marginBottom: 10, fontSize: 13 },
});
