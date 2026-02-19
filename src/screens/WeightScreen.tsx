import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDay } from '@/src/hooks/useDay';
import { useWeightTrend } from '@/src/hooks/useWeightTrend';
import { useTargetWeight } from '@/src/hooks/useTargetWeight';
import { WeightChart } from '@/src/components/WeightChart';
import { WeightCalendar } from '@/src/components/WeightCalendar';
import { WeightModal } from '@/src/components/ui/WeightModal';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { db } from '@/src/db/database';
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export function WeightScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const today = getTodayLocal();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { weight, updateWeight } = useDay(today, refreshTrigger);
  const [weightRefreshKey, setWeightRefreshKey] = useState(0);
  const weightData = useWeightTrend(7, weightRefreshKey);
  const { targetWeight, targetDate, updateTarget } = useTargetWeight();
  
  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
      setWeightRefreshKey(prev => prev + 1);
    }, [])
  );

  // Refresh weight data when weight changes
  useEffect(() => {
    setWeightRefreshKey(prev => prev + 1);
  }, [weight]);

  const [weightInput, setWeightInput] = useState(weight?.toString() || '');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetWeightInput, setTargetWeightInput] = useState(targetWeight?.toString() || '');
  const [targetDateInput, setTargetDateInput] = useState(targetDate || '');
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightModalDate, setWeightModalDate] = useState<string | null>(null);
  const [weightModalCurrentWeight, setWeightModalCurrentWeight] = useState<number | null>(null);

  // Sync weight input with database value
  useEffect(() => {
    setWeightInput(weight?.toString() || '');
  }, [weight]);

  // Sync target inputs
  useEffect(() => {
    setTargetWeightInput(targetWeight?.toString() || '');
    setTargetDateInput(targetDate || '');
  }, [targetWeight, targetDate]);

  const handleSetTarget = () => {
    const weightNum = parseFloat(targetWeightInput);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Please enter a valid target weight');
      return;
    }
    if (!targetDateInput || targetDateInput.trim() === '') {
      Alert.alert('Error', 'Please enter a target date');
      return;
    }
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDateInput)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }
    updateTarget(weightNum, targetDateInput);
    setTargetModalVisible(false);
  };

  const handleWeightDatePress = (date: string, currentWeight: number | null) => {
    setWeightModalDate(date);
    setWeightModalCurrentWeight(currentWeight);
    setWeightModalVisible(true);
  };

  const handleSetWeightForDate = (weight: number) => {
    if (!weightModalDate) return;
    
    try {
      // Check if day exists, create if not
      const existingDays = db.getAllSync<{ id: string }>(
        'SELECT id FROM days WHERE date = ?',
        [weightModalDate]
      );
      
      if (existingDays.length > 0) {
        // Update existing day
        db.runSync('UPDATE days SET weight = ? WHERE date = ?', [weight, weightModalDate]);
      } else {
        // Create new day with weight
        const dayId = `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.runSync('INSERT INTO days (id, date, weight) VALUES (?, ?, ?)', [dayId, weightModalDate, weight]);
      }
      
      // Refresh weight data
      setWeightRefreshKey(prev => prev + 1);
      setRefreshTrigger(prev => prev + 1);
      
      // If it's today, also update the local state
      if (weightModalDate === today) {
        updateWeight(weight);
      }
      
      setWeightModalVisible(false);
      setWeightModalDate(null);
      setWeightModalCurrentWeight(null);
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Error', 'Failed to save weight');
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseDateLocal(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weight Tracking</Text>
          <Text style={styles.headerSubtitle}>{formatDate(today)}</Text>
        </View>

        {/* Current Weight Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Weight</Text>
          <View style={styles.weightInputContainer}>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={(text) => {
                setWeightInput(text);
                const num = parseFloat(text);
                if (!isNaN(num) && num > 0) {
                  updateWeight(num);
                } else if (text === '') {
                  updateWeight(null);
                }
              }}
              placeholder="Enter weight (lbs)"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <Text style={styles.weightUnit}>lbs</Text>
          </View>
        </View>

        {/* Weight Chart */}
        <View style={styles.card}>
          <WeightChart data={weightData} />
        </View>

        {/* Target Weight Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Target Weight</Text>
            <Pressable onPress={() => {
              setTargetWeightInput(targetWeight?.toString() || '');
              setTargetDateInput(targetDate || '');
              setTargetModalVisible(true);
            }}>
              <Text style={styles.editText}>{targetWeight ? 'Edit' : 'Set'}</Text>
            </Pressable>
          </View>
          {targetWeight && targetDate ? (
            <View>
              <Text style={styles.targetValue}>{targetWeight} lbs</Text>
              <Text style={styles.targetDateText}>
                Target Date: {parseDateLocal(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              {weight && (
                <>
                  <Text style={styles.targetProgressText}>
                    {weight > targetWeight 
                      ? `${(weight - targetWeight).toFixed(1)} lbs to lose`
                      : weight < targetWeight
                      ? `${(targetWeight - weight).toFixed(1)} lbs to gain`
                      : 'Goal reached!'}
                  </Text>
                  {(() => {
                    const targetDateObj = parseDateLocal(targetDate);
                    const todayDateObj = parseDateLocal(today);
                    const daysDiff = Math.ceil((targetDateObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
                    const weeksDiff = daysDiff / 7;
                    
                    if (weeksDiff > 0 && weight !== targetWeight) {
                      const weightDiff = Math.abs(weight - targetWeight);
                      const weeklyRate = weightDiff / weeksDiff;
                      
                      return (
                        <Text style={styles.targetWeeklyRateText}>
                          Estimated weight loss/week: {weeklyRate.toFixed(2)} lbs
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>Not set - tap to configure</Text>
          )}
        </View>

        {/* Weight Calendar */}
        <View style={styles.card}>
          <WeightCalendar refreshKey={weightRefreshKey} onDatePress={handleWeightDatePress} />
        </View>
      </ScrollView>

      {/* Target Weight Modal */}
      <Modal
        visible={targetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTargetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Target Weight</Text>
            <Text style={styles.modalDescription}>
              Set your target weight and the date you want to reach it.
            </Text>
            <Text style={styles.modalLabel}>Target Weight (lbs)</Text>
            <TextInput
              style={styles.modalInput}
              value={targetWeightInput}
              onChangeText={setTargetWeightInput}
              placeholder="Enter target weight"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <Text style={styles.modalLabel}>Target Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={targetDateInput}
              onChangeText={setTargetDateInput}
              placeholder="2024-12-31"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setTargetModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSetTarget}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight Edit Modal */}
      <WeightModal
        visible={weightModalVisible}
        onClose={() => {
          setWeightModalVisible(false);
          setWeightModalDate(null);
          setWeightModalCurrentWeight(null);
        }}
        onSave={handleSetWeightForDate}
        currentWeight={weightModalCurrentWeight}
        date={weightModalDate || null}
      />
    </View>
  );
}

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    editText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    weightInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 18,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    weightUnit: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    targetValue: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    targetDateText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 8,
    },
    targetProgressText: {
      color: colors.success,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    targetWeeklyRateText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    placeholderText: {
      color: colors.textTertiary,
      fontSize: 14,
      fontStyle: 'italic',
    },
  });
}

