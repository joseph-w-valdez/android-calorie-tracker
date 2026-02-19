import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/src/constants/styles';
import { validatePositiveNumber } from '@/src/utils/validators';
import { formatDateFull } from '@/src/utils/dateFormatters';

interface WeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  currentWeight?: number | null;
  date?: string | null;
}

export function WeightModal({ visible, onClose, onSave, currentWeight, date }: WeightModalProps) {
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    setWeightInput(currentWeight?.toString() || '');
  }, [currentWeight, visible]);

  const handleSave = () => {
    const validation = validatePositiveNumber(weightInput, 'weight');
    if (!validation.valid) {
      Alert.alert('Error', validation.error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(parseFloat(weightInput));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {date ? `Weight for ${formatDateFull(date)}` : 'Edit Weight'}
          </Text>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="Enter weight"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonSave]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    color: Colors.text,
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xl,
  },
  label: {
    color: Colors.text,
    fontSize: FontSizes.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
    fontSize: FontSizes.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
  },
  buttonCancel: {
    backgroundColor: Colors.inputBackground,
  },
  buttonSave: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '500',
  },
});

