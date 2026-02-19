import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemePreference } from '@/src/hooks/useThemePreference';

export function useColorScheme() {
  const { themePreference } = useThemePreference();
  const systemColorScheme = useRNColorScheme();

  if (themePreference === 'system') {
    return systemColorScheme;
  }

  return themePreference;
}
