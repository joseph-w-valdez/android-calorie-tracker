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
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export function WeightScreen() {
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
  const [weightModalInput, setWeightModalInput] = useState('');
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
    setWeightModalInput(currentWeight?.toString() || '');
    setWeightModalVisible(true);
  };

  const handleSetWeightForDate = () => {
    if (!weightModalDate) return;
    const num = parseFloat(weightModalInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    // Use the useDay hook for the specific date
    // For now, we'll update today's weight if it's today, otherwise we'd need a different approach
    if (weightModalDate === today) {
      updateWeight(num);
    } else {
      // For historical dates, we'd need to implement a separate function
      // For now, just show an alert
      Alert.alert('Info', 'Historical weight editing will be available soon');
    }
    setWeightModalVisible(false);
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

      {/* Weight Date Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Weight for {weightModalDate ? formatDate(weightModalDate) : ''}
            </Text>
            <Text style={styles.modalLabel}>Weight (lbs)</Text>
            <TextInput
              style={styles.modalInput}
              value={weightModalInput}
              onChangeText={setWeightModalInput}
              placeholder="Enter weight"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSetWeightForDate}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editText: {
    color: '#4a9eff',
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
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  weightUnit: {
    color: '#aaa',
    fontSize: 16,
  },
  targetValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  targetDateText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  targetProgressText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  targetWeeklyRateText: {
    color: '#aaa',
    fontSize: 14,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#2a2a2a',
  },
  modalButtonSave: {
    backgroundColor: '#4a9eff',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

