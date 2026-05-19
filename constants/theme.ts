/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Colores profesionales
const primaryLight = '#007AFF';
const primaryDark = '#0A84FF';
const accentLight = '#FF9500';
const accentDark = '#FFB340';
const successLight = '#34C759';
const dangerLight = '#FF3B30';

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#FFFFFF',
    tint: primaryLight,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryLight,
    secondary: '#5AC8FA',
    accent: accentLight,
    success: successLight,
    danger: dangerLight,
    border: '#E5E5EA',
    card: '#F9F9F9',
    lightGray: '#F2F2F7',
  },
  dark: {
    text: '#F5F5F7',
    background: '#000000',
    tint: primaryDark,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryDark,
    secondary: '#5AC8FA',
    accent: accentDark,
    success: successLight,
    danger: dangerLight,
    border: '#38383A',
    card: '#1C1C1E',
    lightGray: '#2C2C2E',
  },
};

// Estados por color
export const StateColors = {
  pending: { light: '#FFB74D', dark: '#FFA500' },
  inProcess: { light: '#42A5F5', dark: '#5AC8FA' },
  completed: { light: '#66BB6A', dark: '#34C759' },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
