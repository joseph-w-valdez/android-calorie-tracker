import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as ThemeColors } from '@/constants/theme';

/**
 * Hook to get theme-aware colors based on current color scheme
 */
export function useThemeColors() {
  const colorScheme = useColorScheme() ?? 'dark';
  return ThemeColors[colorScheme];
}

