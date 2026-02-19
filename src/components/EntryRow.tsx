import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Entry } from '@/src/db/schema';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';

interface EntryRowProps {
  entry: Entry;
  onEdit?: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const handlePress = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      'Entry Options',
      `"${entry.name}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...(onEdit
          ? [
              {
                text: 'Edit',
                onPress: () => onEdit(entry),
              },
            ]
          : []),
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', `Delete "${entry.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(entry.id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.content}
        onPress={handlePress}
        onLongPress={handleLongPress}
        android_ripple={{ color: colors.border }}
      >
        <Text style={styles.name}>
          {entry.type === 'exercise' && entry.name.includes('mile')
            ? entry.name
            : entry.name}
        </Text>
        <Text style={styles.calories}>
          {entry.type === 'exercise' ? `${entry.calories} cal` : `${entry.calories} cal`}
        </Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        android_ripple={{ color: colors.error }}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      flex: 1,
    },
    calories: {
      color: colors.textSecondary,
      fontSize: 14,
      marginRight: 8,
    },
    deleteButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: 24,
      fontWeight: '300',
      lineHeight: 24,
    },
  });
}

