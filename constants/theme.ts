/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Extended colors for app screens
    cardBackground: '#f5f5f5',
    inputBackground: '#e8e8e8',
    border: '#d0d0d0',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#0a7ea4',
    primaryDark: '#08708f',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    divider: '#e0e0e0',
    statGood: '#10b981',
    statBad: '#ef4444',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Extended colors for app screens
    cardBackground: '#1a1a1a',
    inputBackground: '#2a2a2a',
    border: '#333333',
    textSecondary: '#aaaaaa',
    textTertiary: '#666666',
    primary: '#4a9eff',
    primaryDark: '#3a7fc4',
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    divider: '#333333',
    statGood: '#4ade80',
    statBad: '#f87171',
  },
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
