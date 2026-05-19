import { ThemedView } from '@/components/themed-view';
import { usePedidos } from '@/hooks/use-pedidos';
import { useRouter, useSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditarPedidoScreen() {
  const { pedidos, updatePedido } = usePedidos();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.id ? parseInt(params.id as string) : null;

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const pedido = id ? pedidos.find((p) => p.id === id) : null;

  useEffect(() => {
    if (pedido) {
      setDescripcion(pedido.descripcion);
      setMonto(pedido.monto.toString());
    }
  }, [pedido]);

  if (!id || !pedido) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.notFound}>Pedido no encontrado</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleSave = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }

    if (descripcion.trim().length < 5) {
      Alert.alert('Error', 'La descripción debe tener al menos 5 caracteres');
      return;
    }

    if (!monto.trim()) {
      Alert.alert('Error', 'El monto es obligatorio');
      return;
    }

    const montoNumber = parseFloat(monto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      Alert.alert('Error', 'El monto debe ser un número mayor a 0');
      return;
    }

    try {
      setLoading(true);
      await updatePedido(id, {
        descripcion: descripcion.trim(),
        monto: montoNumber,
      });
      Alert.alert('Éxito', 'Pedido actualizado correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.inputLarge]}
        placeholder="Descripción del pedido"
        placeholderTextColor="#999"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      <Text style={styles.label}>Monto *</Text>
      <View style={styles.montoContainer}>
        <Text style={styles.montoSymbol}>$</Text>
        <TextInput
          style={styles.inputMonto}
          placeholder="0.00"
          placeholderTextColor="#999"
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
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
  inputLarge: {
    textAlignVertical: 'top',
    height: 100,
  },
  montoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 20,
  },
  montoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  inputMonto: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
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
  notFound: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
