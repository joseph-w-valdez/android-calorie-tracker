import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { Spacing, BorderRadius } from '@/src/constants/styles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
  });
}

