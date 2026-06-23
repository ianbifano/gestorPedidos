import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { useClientes } from '@/hooks/use-clientes';
import { Validators } from '@/hooks/validators';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function CrearClienteScreen() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCliente, error } = useClientes();
  const { show: showToast } = useToast();
  const router = useRouter();

  const handleCreate = async () => {
    // Validar nombre
    const validNombre = Validators.nombre(nombre);
    if (!validNombre.valid) {
      showToast(validNombre.error || 'Error', 'error');
      return;
    }

    // Validar teléfono (opcional pero si se ingresa, debe ser válido)
    const validTelefono = Validators.telefono(telefono);
    if (!validTelefono.valid) {
      showToast(validTelefono.error || 'Error', 'error');
      return;
    }

    try {
      setLoading(true);
      await createCliente(nombre.trim(), telefono.trim() || undefined);
      showToast('✓ Cliente creado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : (error || 'No se pudo crear el cliente');
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
        placeholderTextColor="#999"
        value={nombre}
        onChangeText={setNombre}
        editable={!loading}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese teléfono (opcional)"
        placeholderTextColor="#999"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Crear Cliente</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonCancel}
        onPress={() => router.back()}
        disabled={loading}>
        <Text style={styles.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonCancel: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttonCancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 13,
  },
});
