import { useSetting } from './useSetting';

export type ThemePreference = 'light' | 'dark' | 'system';

export function useThemePreference() {
  const { value, updateValue } = useSetting<ThemePreference>(
    'themePreference',
    (v) => (v === 'light' || v === 'dark' || v === 'system' ? v : 'system') as ThemePreference,
    (v) => v
  );

  return {
    themePreference: value ?? 'system',
    setThemePreference: updateValue,
  };
}

