import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemePreference, type ThemePreference as ThemePref } from '@/src/hooks/useThemePreference';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Card } from '@/src/components/ui/Card';

export function SettingsScreen() {
  const { themePreference, setThemePreference } = useThemePreference();
  const colors = useThemeColors();

  const themes: { label: string; value: ThemePref }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.sectionDescription}>
            Choose your preferred color scheme
          </Text>
          <View style={styles.options}>
            {themes.map((theme) => (
              <Pressable
                key={theme.value}
                style={[
                  styles.option,
                  themePreference === theme.value && styles.optionSelected,
                ]}
                onPress={() => setThemePreference(theme.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    themePreference === theme.value && styles.optionTextSelected,
                  ]}
                >
                  {theme.label}
                </Text>
                {themePreference === theme.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
}

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    sectionDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 16,
    },
    options: {
      gap: 8,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background === '#fff' ? '#f5f5f5' : colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSelected: {
      backgroundColor: colors.background === '#fff' ? 'rgba(10, 126, 164, 0.15)' : 'rgba(74, 158, 255, 0.2)',
      borderColor: colors.primary,
    },
    optionText: {
      color: colors.text,
      fontSize: 16,
    },
    optionTextSelected: {
      fontWeight: '600',
    },
    checkmark: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
}

