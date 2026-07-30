import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const S = styles(C);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.overlay}>
        <View style={S.card}>
          <Text style={S.title}>{title}</Text>
          <Text style={S.message}>{message}</Text>
          <View style={S.actions}>
            <TouchableOpacity style={[S.button, S.cancelButton]} onPress={onCancel} activeOpacity={0.7}>
              <Text style={S.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.button, destructive ? S.deleteButton : S.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}>
              <Text style={S.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type ThemeColors = {
  text: string;
  textSecondary: string;
  elevated: string;
  lightGray: string;
  danger: string;
  tint: string;
};

const styles = (C: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: C.elevated,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: C.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: C.lightGray,
  },
  deleteButton: {
    backgroundColor: C.danger,
  },
  confirmButton: {
    backgroundColor: C.tint,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
