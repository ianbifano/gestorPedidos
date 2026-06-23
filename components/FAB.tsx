import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FABProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  position?: 'center' | 'right';
}

export function FAB({ onPress, icon = 'plus', label = '', position = 'right', pack = 'material' }: FABProps) {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        position === 'center' ? styles.fabCenter : styles.fabRight,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.fabContent}>
        <IconSymbol size={28} pack={pack} name={icon} color="white" />
        {label && <Text style={styles.fabLabel}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#007AFF',
    borderRadius: 56,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabRight: {
    right: 20,
  },
  fabCenter: {
    right: '50%',
    marginRight: -28,
  },
  fabContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
