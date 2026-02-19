import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import type { Entry } from '@/src/db/schema';

interface EntryRowProps {
  entry: Entry;
  onEdit?: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
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
        android_ripple={{ color: '#333' }}
      >
        <Text style={styles.name}>{entry.name}</Text>
        <Text style={styles.calories}>{entry.calories} cal</Text>
      </Pressable>
      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        android_ripple={{ color: '#f87171' }}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  calories: {
    color: '#aaa',
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
    color: '#f87171',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
});

