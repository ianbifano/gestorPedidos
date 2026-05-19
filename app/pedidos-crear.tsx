import { ThemedView } from '@/components/themed-view';
import { useClientes } from '@/hooks/use-clientes';
import { usePedidos } from '@/hooks/use-pedidos';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CrearPedidoScreen() {
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);

  const { createPedido, error: pedidoError } = usePedidos();
  const { clientes, loading: clientesLoading, error: clientesError } = useClientes();
  const router = useRouter();

  const handleCreate = async () => {
    if (!clienteId) {
      Alert.alert('Error', 'Debe seleccionar un cliente');
      return;
    }
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
      await createPedido({
        cliente_id: clienteId,
        descripcion: descripcion.trim(),
        monto: montoNumber,
      });
      Alert.alert('Éxito', 'Pedido creado correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error', pedidoError || 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const selectedCliente = clientes.find((c) => c.id === clienteId);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Cliente *</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setShowClienteModal(true)}
        disabled={loading}>
        <Text style={[styles.selectButtonText, !clienteId && styles.placeholder]}>
          {selectedCliente ? selectedCliente.nombre : 'Seleccione un cliente'}
        </Text>
      </TouchableOpacity>

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

      {(pedidoError || clientesError) && (
        <Text style={styles.error}>{pedidoError || clientesError}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Crear Pedido</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonCancel}
        onPress={() => router.back()}
        disabled={loading}>
        <Text style={styles.buttonCancelText}>Cancelar</Text>
      </TouchableOpacity>

      <Modal visible={showClienteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            {clientesLoading ? (
              <ActivityIndicator size="large" />
            ) : clientes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay clientes</Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setShowClienteModal(false);
                    router.push('/clientes-crear');
                  }}>
                  <Text style={styles.linkButtonText}>+ Crear cliente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={clientes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.clienteOption}
                    onPress={() => {
                      setClienteId(item.id);
                      setShowClienteModal(false);
                    }}>
                    <Text style={styles.clienteOptionText}>{item.nombre}</Text>
                    {item.telefono && <Text style={styles.clienteTelefono}>{item.telefono}</Text>}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowClienteModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  selectButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    color: '#999',
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
  error: {
    color: 'red',
    padding: 10,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  clienteOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clienteOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  clienteTelefono: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  linkButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modalCloseButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
