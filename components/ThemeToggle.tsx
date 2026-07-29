import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.button} activeOpacity={0.6}>
      <IconSymbol
        size={22}
        pack="material"
        name={theme === 'dark' ? 'wb-sunny' : 'dark-mode'}
        color="#888888"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    marginRight: 12,
  },
});
