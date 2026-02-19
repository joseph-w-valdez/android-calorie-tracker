import { Colors as ThemeColors } from '@/constants/theme';
import type { Entry } from '@/src/db/schema';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { validatePositiveNumber, validateRequired } from '@/src/utils/validators';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: 'food' | 'exercise', name: string, calories: number, entryId?: string) => void;
  onDelete?: (entryId: string) => void; // Delete handler (only used in edit mode)
  entry?: Entry | null; // If provided, we're in edit mode
}

// Calorie burn rate per mile (walking rate)
const CALORIES_PER_MILE = 100;

export function AddEntryModal({ visible, onClose, onSubmit, onDelete, entry }: AddEntryModalProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [type, setType] = useState<'food' | 'exercise'>('food');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [miles, setMiles] = useState('');

  // Calculate calories based on miles
  const calculateCalories = (milesValue: number): number => {
    return Math.round(milesValue * CALORIES_PER_MILE);
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (entry) {
      setType(entry.type);
      if (entry.type === 'exercise') {
        // Parse miles from entry name or calculate from calories
        const milesMatch = entry.name.match(/(\d+\.?\d*)\s*miles?/i);
        if (milesMatch) {
          setMiles(milesMatch[1]);
        } else {
          // Calculate miles from calories
          const estimatedMiles = entry.calories / CALORIES_PER_MILE;
          setMiles(estimatedMiles.toFixed(1));
        }
        setName('');
        setCalories('');
      } else {
        setName(entry.name);
        setCalories(entry.calories.toString());
        setMiles('');
      }
    } else {
      setType('food');
      setName('');
      setCalories('');
      setMiles('');
    }
  }, [entry, visible]);

  const handleSubmit = () => {
    if (type === 'exercise') {
      const milesValidation = validatePositiveNumber(miles, 'miles');
      if (!milesValidation.valid) {
        Alert.alert('Error', milesValidation.error);
        return;
      }

      const milesValue = parseFloat(miles);
      const calculatedCalories = calculateCalories(milesValue);
      const entryName = `${milesValue} ${milesValue === 1 ? 'mile' : 'miles'}`;

      onSubmit('exercise', entryName, calculatedCalories, entry?.id);
      setMiles('');
    } else {
      const nameValidation = validateRequired(name.trim(), 'name');
      if (!nameValidation.valid) {
        Alert.alert('Error', nameValidation.error);
        return;
      }

      const caloriesValidation = validatePositiveNumber(calories, 'calorie amount');
      if (!caloriesValidation.valid) {
        Alert.alert('Error', caloriesValidation.error);
        return;
      }

      onSubmit('food', name.trim(), parseFloat(calories), entry?.id);
      setName('');
      setCalories('');
    }
    setType('food');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setCalories('');
    setMiles('');
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
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
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

          {type === 'food' ? (
            <>
              {/* Name Input */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />

              {/* Calories Input */}
              <Text style={styles.label}>Calories</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="Enter calories"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </>
          ) : (
            <>
              {/* Miles Input */}
              <Text style={styles.label}>Miles</Text>
              <TextInput
                style={styles.input}
                value={miles}
                onChangeText={setMiles}
                placeholder="Enter miles"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                autoFocus
              />

              {/* Calculated Calories Display */}
              {miles && !isNaN(parseFloat(miles)) && parseFloat(miles) > 0 && (
                <View style={styles.caloriesDisplay}>
                  <Text style={styles.caloriesLabel}>Estimated Calories:</Text>
                  <Text style={styles.caloriesValue}>
                    {calculateCalories(parseFloat(miles))} cal
                  </Text>
                </View>
              )}
            </>
          )}

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background === '#fff' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 0,
    },
    modal: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      padding: 24,
      paddingBottom: 44,
      width: '100%',
      maxWidth: '100%',
      minHeight: 400,
    },
    title: {
      color: colors.text,
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
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    typeButtonActive: {
      backgroundColor: colors.primary,
    },
    typeButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    typeButtonTextActive: {
      color: '#fff',
    },
    label: {
      color: colors.text,
      fontSize: 14,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 16,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    caloriesDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    caloriesLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    caloriesValue: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
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
      backgroundColor: colors.background === '#fff' ? '#ffe8e8' : '#2a1a1a',
      borderWidth: 1,
      borderColor: colors.error,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

