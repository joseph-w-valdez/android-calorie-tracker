import { Colors as ThemeColors } from '@/constants/theme';
import { BorderRadius, FontSizes, Spacing } from '@/src/constants/styles';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatDateFull } from '@/src/utils/dateFormatters';
import { validatePositiveNumber } from '@/src/utils/validators';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface WeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  currentWeight?: number | null;
  date?: string | null;
}

export function WeightModal({ visible, onClose, onSave, currentWeight, date }: WeightModalProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>
            {date ? `Weight for ${formatDateFull(date)}` : 'Edit Weight'}
          </Text>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="Enter weight"
            placeholderTextColor={colors.textTertiary}
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
    content: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: BorderRadius.lg,
      borderBottomRightRadius: BorderRadius.lg,
      padding: Spacing.xxl,
      paddingBottom: Spacing.xxl + 20,
      width: '100%',
      maxWidth: '100%',
      minHeight: 280,
    },
    title: {
      color: colors.text,
      fontSize: FontSizes.xxl,
      fontWeight: 'bold',
      marginBottom: Spacing.xl,
    },
    label: {
      color: colors.text,
      fontSize: FontSizes.base,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: FontSizes.lg,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.inputBackground,
    },
    buttonSave: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: colors.text,
      fontSize: FontSizes.lg,
      fontWeight: '500',
    },
  });
}

