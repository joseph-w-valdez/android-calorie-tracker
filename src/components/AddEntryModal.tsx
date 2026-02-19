import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import type { Entry } from '@/src/db/schema';

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: 'food' | 'exercise', name: string, calories: number, entryId?: string) => void;
  onDelete?: (entryId: string) => void; // Delete handler (only used in edit mode)
  entry?: Entry | null; // If provided, we're in edit mode
}

export function AddEntryModal({ visible, onClose, onSubmit, onDelete, entry }: AddEntryModalProps) {
  const [type, setType] = useState<'food' | 'exercise'>('food');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (entry) {
      setType(entry.type);
      setName(entry.name);
      setCalories(entry.calories.toString());
    } else {
      setType('food');
      setName('');
      setCalories('');
    }
  }, [entry, visible]);

  const handleSubmit = () => {
    const caloriesNum = parseFloat(calories);
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return;
    }

    onSubmit(type, name.trim(), caloriesNum, entry?.id);
    setName('');
    setCalories('');
    setType('food');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setCalories('');
    setType('food');
    onClose();
  };

  const handleDelete = () => {
    if (!entry || !onDelete) return;
    
    Alert.alert(
      'Delete Entry',
      `Delete "${entry.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(entry.id);
            handleCancel();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{entry ? 'Edit Entry' : 'Add Entry'}</Text>

          {/* Type Toggle */}
          <View style={styles.typeContainer}>
            <Pressable
              style={[styles.typeButton, type === 'food' && styles.typeButtonActive]}
              onPress={() => setType('food')}
            >
              <Text style={[styles.typeButtonText, type === 'food' && styles.typeButtonTextActive]}>
                Food
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, type === 'exercise' && styles.typeButtonActive]}
              onPress={() => setType('exercise')}
            >
              <Text style={[styles.typeButtonText, type === 'exercise' && styles.typeButtonTextActive]}>
                Exercise
              </Text>
            </Pressable>
          </View>

          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#666"
            autoFocus
          />

          {/* Calories Input */}
          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="Enter calories"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {entry && onDelete && (
              <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            )}
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{entry ? 'Save' : 'Add'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4a9eff',
  },
  typeButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  deleteButtonText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4a9eff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

