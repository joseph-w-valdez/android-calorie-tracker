import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/src/constants/styles';
import { formatDateFull } from '@/src/utils/dateFormatters';

interface ScreenHeaderProps {
  title: string;
  date?: string;
}

export function ScreenHeader({ title, date }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {date && <Text style={styles.subtitle}>{formatDateFull(date)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSizes.huge,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.base,
  },
});

