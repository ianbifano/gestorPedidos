import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClientes } from '@/hooks/use-clientes';
import { usePedidos } from '@/hooks/use-pedidos';
import { Validators, sanitizeInput } from '@/hooks/validators';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
  const { show: showToast } = useToast();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const styles = useMemo(() => createStyles(C), [C]);

  const handleCreate = async () => {
    if (!clienteId) {
      showToast('Debe seleccionar un cliente', 'error');
      return;
    }

    const validDescripcion = Validators.descripcion(descripcion);
    if (!validDescripcion.valid) {
      showToast(validDescripcion.error || 'Error', 'error');
      return;
    }

    const validMonto = Validators.monto(monto);
    if (!validMonto.valid) {
      showToast(validMonto.error || 'Error', 'error');
      return;
    }

    try {
      setLoading(true);
      const montoNumber = parseFloat(monto);
      await createPedido({
        cliente_id: clienteId,
        descripcion: sanitizeInput(descripcion.trim()),
        monto: montoNumber,
      });
      showToast('✓ Pedido creado correctamente', 'success');
      router.back();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : (pedidoError || 'No se pudo crear el pedido');
      showToast(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedCliente = clientes.find((c) => c.id === clienteId);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.label}>Cliente *</Text>
      <TouchableOpacity style={styles.selectButton} onPress={() => setShowClienteModal(true)} disabled={loading}>
        <Text style={[styles.selectButtonText, !clienteId && styles.placeholder]}>
          {selectedCliente ? selectedCliente.nombre : 'Seleccione un cliente'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.inputLarge]}
        placeholder="Descripción del pedido"
        placeholderTextColor={C.icon}
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
          placeholderTextColor={C.icon}
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
          editable={!loading}
        />
      </View>

      {(pedidoError || clientesError) && (
        <Text style={styles.error}>{pedidoError || clientesError}</Text>
      )}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Crear Pedido</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={loading}>
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
                    router.push('/crear-cliente');
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowClienteModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

function createStyles(C: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: C.text },
    selectButton: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 20, justifyContent: 'center', backgroundColor: C.card },
    selectButtonText: { fontSize: 14, color: C.text },
    placeholder: { color: C.icon },
    input: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, fontSize: 14, color: C.text, backgroundColor: C.card },
    inputLarge: { textAlignVertical: 'top', height: 100 },
    montoContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 8, marginBottom: 20, backgroundColor: C.card },
    montoSymbol: { fontSize: 16, fontWeight: '600', marginLeft: 12, color: C.text },
    inputMonto: { flex: 1, paddingHorizontal: 8, paddingVertical: 10, fontSize: 14, color: C.text },
    button: { backgroundColor: C.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    buttonCancel: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.border },
    buttonCancelText: { color: C.tint, fontSize: 16, fontWeight: '600' },
    error: { color: 'red', padding: 10, backgroundColor: '#FFE0E0', borderRadius: 8, marginBottom: 10, fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: C.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: C.text },
    clienteOption: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    clienteOptionText: { fontSize: 16, fontWeight: '500', color: C.text },
    clienteTelefono: { fontSize: 13, color: C.icon, marginTop: 4 },
    emptyState: { alignItems: 'center', paddingVertical: 30 },
    emptyStateText: { fontSize: 16, color: C.icon, marginBottom: 15 },
    linkButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: C.tint },
    linkButtonText: { color: C.tint, fontSize: 14, fontWeight: '600' },
    modalCloseButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: C.border },
    modalCloseButtonText: { color: C.tint, fontSize: 16, fontWeight: '600' },
  });
}
