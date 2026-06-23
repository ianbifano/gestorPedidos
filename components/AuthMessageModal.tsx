import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AuthMessageType = 'error' | 'success' | 'info';

type AuthMessageModalProps = {
  visible: boolean;
  message: string;
  type?: AuthMessageType;
  title?: string;
  onClose: () => void;
};

const ICON_BY_TYPE = {
  error: 'close',
  success: 'check',
  info: 'info',
};

const COLOR_BY_TYPE = {
  error: '#E95858',
  success: '#34C759',
  info: '#2F5CF6',
};

export function AuthMessageModal({
  visible,
  message,
  type = 'error',
  title,
  onClose,
}: AuthMessageModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.content}>
            <View style={[styles.iconCircle, { backgroundColor: COLOR_BY_TYPE[type] }]}>
              <IconSymbol pack="material" name={ICON_BY_TYPE[type]} size={50} color="white" />
            </View>
            <View style={styles.textContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 92, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 38,
    marginTop: 26,
    minWidth: 170,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111111',
    fontSize: 24,
  },
});
