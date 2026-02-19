import { AddEntryModal } from '@/src/components/AddEntryModal';
import { Calendar } from '@/src/components/Calendar';
import { TrendChart } from '@/src/components/TrendChart';
import { BMRModal } from '@/src/components/ui/BMRModal';
import { TargetWeightModal } from '@/src/components/ui/TargetWeightModal';
import { WeightCalendar } from '@/src/components/WeightCalendar';
import { WeightChart } from '@/src/components/WeightChart';
import { db } from '@/src/db/database';
import { useBMR } from '@/src/hooks/useBMR';
import { useDay } from '@/src/hooks/useDay';
import { useTargetWeight } from '@/src/hooks/useTargetWeight';
import { useTrend } from '@/src/hooks/useTrend';
import { useWeightTrend } from '@/src/hooks/useWeightTrend';
import { formatDateFull, formatDateShort } from '@/src/utils/dateFormatters';
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export function HomeScreen() {
  const today = getTodayLocal();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { entries, caloriesIn, caloriesOut, net, weight, addEntry, updateWeight } = useDay(today, refreshTrigger);
  
  // Weight edit modal state
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightModalDate, setWeightModalDate] = useState<string | null>(null);
  const [weightModalInput, setWeightModalInput] = useState('');
  const [weightModalCurrentWeight, setWeightModalCurrentWeight] = useState<number | null>(null);
  const [trendRefreshKey, setTrendRefreshKey] = useState(0);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [weightRefreshKey, setWeightRefreshKey] = useState(0);
  const trendData = useTrend(7, trendRefreshKey);
  const weightData = useWeightTrend(7, weightRefreshKey);
  const { bmr, updateBMR } = useBMR();
  const { targetWeight, targetDate, updateTarget } = useTargetWeight();
  
  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Force refresh by updating triggers
      setRefreshTrigger(prev => prev + 1);
      setTrendRefreshKey(prev => prev + 1);
      setCalendarRefreshKey(prev => prev + 1);
      setWeightRefreshKey(prev => prev + 1);
    }, [])
  );

  // Also refresh trend, calendar, and weight when entries or weight change
  useEffect(() => {
    setTrendRefreshKey(prev => prev + 1);
    setCalendarRefreshKey(prev => prev + 1);
    setWeightRefreshKey(prev => prev + 1);
  }, [entries.length, caloriesIn, caloriesOut, weight]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [bmrModalVisible, setBmrModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState(weight?.toString() || '');
  const [targetModalVisible, setTargetModalVisible] = useState(false);

  // Sync weight input with database value
  useEffect(() => {
    setWeightInput(weight?.toString() || '');
  }, [weight]);

  const handleSetBMR = (bmr: number) => {
    updateBMR(bmr);
    setBmrModalVisible(false);
  };

  const handleSetTarget = (weight: number, date: string) => {
    updateTarget(weight, date);
    setTargetModalVisible(false);
  };

  const handleWeightDatePress = (date: string, currentWeight: number | null) => {
    setWeightModalDate(date);
    setWeightModalCurrentWeight(currentWeight);
    setWeightModalInput(currentWeight?.toString() || '');
    setWeightModalVisible(true);
  };

  const handleSaveWeight = () => {
    if (!weightModalDate) return;
    
    const num = parseFloat(weightModalInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    
    try {
      // Check if day exists, create if not
      const existingDays = db.getAllSync<{ id: string }>(
        'SELECT id FROM days WHERE date = ?',
        [weightModalDate]
      );
      
      if (existingDays.length > 0) {
        // Update existing day
        db.runSync('UPDATE days SET weight = ? WHERE date = ?', [num, weightModalDate]);
      } else {
        // Create new day with weight
        const dayId = `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.runSync('INSERT INTO days (id, date, weight) VALUES (?, ?, ?)', [dayId, weightModalDate, num]);
      }
      
      // Refresh weight data
      setWeightRefreshKey(prev => prev + 1);
      setRefreshTrigger(prev => prev + 1);
      
      setWeightModalVisible(false);
      setWeightModalDate(null);
      setWeightModalInput('');
      setWeightModalCurrentWeight(null);
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Error', 'Failed to save weight');
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calorie Tracker</Text>
          <Text style={styles.headerSubtitle}>{formatDateFull(today)}</Text>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Net Calories</Text>
              <Text style={[styles.statValue, net < 0 ? styles.statGood : styles.statBad]}>
                {net > 0 ? '+' : ''}{net}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>In</Text>
              <Text style={styles.statValue}>{caloriesIn}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Out</Text>
              <Text style={styles.statValue}>{caloriesOut}</Text>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.weightInputContainer}>
            <Text style={styles.weightLabel}>Weight (lbs)</Text>
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
              placeholder="Enter weight"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          {/* CTA Button */}
          <Pressable
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
            android_ripple={{ color: '#3a7fc4' }}
          >
            <Text style={styles.ctaButtonText}>+ Add Entry</Text>
          </Pressable>
        </View>

        {/* Weight Chart */}
        <View style={styles.chartCard}>
          <WeightChart data={weightData} />
        </View>

        {/* Target Weight Section */}
        <View style={styles.bmrCard}>
          <View style={styles.bmrHeader}>
            <Text style={styles.bmrTitle}>Target Weight</Text>
            <Pressable onPress={() => {
              setTargetModalVisible(true);
            }}>
              <Text style={styles.bmrEditText}>{targetWeight ? 'Edit' : 'Set'}</Text>
            </Pressable>
          </View>
          {targetWeight && targetDate ? (
            <View>
              <Text style={styles.bmrValue}>{targetWeight} lbs</Text>
              <Text style={styles.targetDateText}>
                Target Date: {formatDateShort(targetDate)}
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
            <Text style={styles.bmrPlaceholder}>Not set - tap to configure</Text>
          )}
        </View>

        {/* Weight Calendar */}
        <View style={styles.calendarCard}>
          <WeightCalendar refreshKey={weightRefreshKey} onDatePress={handleWeightDatePress} />
        </View>

        {/* BMR Section */}
        <View style={styles.bmrCard}>
          <View style={styles.bmrHeader}>
            <Text style={styles.bmrTitle}>BMR (Basal Metabolic Rate)</Text>
            <Pressable onPress={() => {
              setBmrModalVisible(true);
            }}>
              <Text style={styles.bmrEditText}>{bmr ? 'Edit' : 'Set'}</Text>
            </Pressable>
          </View>
          {bmr ? (
            <Text style={styles.bmrValue}>{bmr} cal/day</Text>
          ) : (
            <Text style={styles.bmrPlaceholder}>Not set - tap to configure</Text>
          )}
        </View>

        {/* Trend Chart */}
        <View style={styles.chartCard}>
          <TrendChart data={trendData} bmr={bmr} />
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar refreshKey={calendarRefreshKey} />
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
      <AddEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addEntry}
      />

      {/* BMR Setting Modal */}
      <BMRModal
        visible={bmrModalVisible}
        onClose={() => setBmrModalVisible(false)}
        onSave={handleSetBMR}
        currentBMR={bmr}
      />

      {/* Weight Edit Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setWeightModalVisible(false);
          setWeightModalDate(null);
          setWeightModalInput('');
          setWeightModalCurrentWeight(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {weightModalDate ? `Edit Weight - ${formatDateShort(weightModalDate)}` : 'Edit Weight'}
            </Text>
            <Text style={styles.modalDescription}>
              Enter your weight for this date.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={weightModalInput}
              onChangeText={setWeightModalInput}
              placeholder="Enter weight (lbs)"
              placeholderTextColor="#666"
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setWeightModalVisible(false);
                  setWeightModalDate(null);
                  setWeightModalInput('');
                  setWeightModalCurrentWeight(null);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveWeight}
              >
                <Text style={styles.modalButtonSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Target Weight Modal */}
      <TargetWeightModal
        visible={targetModalVisible}
        onClose={() => setTargetModalVisible(false)}
        onSave={handleSetTarget}
        currentWeight={targetWeight}
        currentDate={targetDate}
      />
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
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  viewDetailsText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statGood: {
    color: '#4ade80',
  },
  statBad: {
    color: '#f87171',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  weightInputContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  weightLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  weightInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  ctaButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bmrCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  bmrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmrTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bmrEditText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  bmrValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bmrPlaceholder: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  calendarCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
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
  targetDateText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  targetProgressText: {
    color: '#4a9eff',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  targetWeeklyRateText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#2a2a2a',
  },
  modalButtonCancelText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonSave: {
    backgroundColor: '#4a9eff',
  },
  modalButtonSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

