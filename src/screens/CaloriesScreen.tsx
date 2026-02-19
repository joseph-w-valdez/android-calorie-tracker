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
import { useTrend } from '@/src/hooks/useTrend';
import { useBMR } from '@/src/hooks/useBMR';
import { TrendChart } from '@/src/components/TrendChart';
import { Calendar } from '@/src/components/Calendar';
import { AddEntryModal } from '@/src/components/AddEntryModal';
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export function CaloriesScreen() {
  const today = getTodayLocal();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { entries, caloriesIn, caloriesOut, net, addEntry } = useDay(today, refreshTrigger);
  const [trendRefreshKey, setTrendRefreshKey] = useState(0);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const trendData = useTrend(7, trendRefreshKey);
  const { bmr, updateBMR } = useBMR();
  
  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
      setTrendRefreshKey(prev => prev + 1);
      setCalendarRefreshKey(prev => prev + 1);
    }, [])
  );

  // Refresh trend and calendar when entries change
  useEffect(() => {
    setTrendRefreshKey(prev => prev + 1);
    setCalendarRefreshKey(prev => prev + 1);
  }, [entries.length, caloriesIn, caloriesOut]);

  const [modalVisible, setModalVisible] = useState(false);
  const [bmrModalVisible, setBmrModalVisible] = useState(false);
  const [bmrInput, setBmrInput] = useState(bmr?.toString() || '');

  // Sync BMR input
  useEffect(() => {
    setBmrInput(bmr?.toString() || '');
  }, [bmr]);

  const handleSetBMR = () => {
    const num = parseFloat(bmrInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Please enter a valid BMR');
      return;
    }
    updateBMR(num);
    setBmrModalVisible(false);
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
          <Text style={styles.headerTitle}>Calorie Tracking</Text>
          <Text style={styles.headerSubtitle}>{formatDate(today)}</Text>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Summary</Text>
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

          {/* CTA Button */}
          <Pressable
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
            android_ripple={{ color: '#3a7fc4' }}
          >
            <Text style={styles.ctaButtonText}>+ Add Entry</Text>
          </Pressable>
        </View>

        {/* BMR Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>BMR (Basal Metabolic Rate)</Text>
            <Pressable onPress={() => {
              setBmrInput(bmr?.toString() || '');
              setBmrModalVisible(true);
            }}>
              <Text style={styles.editText}>{bmr ? 'Edit' : 'Set'}</Text>
            </Pressable>
          </View>
          {bmr ? (
            <Text style={styles.bmrValue}>{bmr} cal/day</Text>
          ) : (
            <Text style={styles.placeholderText}>Not set - tap to configure</Text>
          )}
        </View>

        {/* Trend Chart */}
        <View style={styles.card}>
          <TrendChart data={trendData} bmr={bmr} />
        </View>

        {/* Calendar */}
        <View style={styles.card}>
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
      <Modal
        visible={bmrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBmrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set BMR</Text>
            <Text style={styles.modalDescription}>
              Your Basal Metabolic Rate is the number of calories your body burns at rest.
            </Text>
            <Text style={styles.modalLabel}>BMR (calories/day)</Text>
            <TextInput
              style={styles.modalInput}
              value={bmrInput}
              onChangeText={setBmrInput}
              placeholder="Enter BMR (e.g., 2000)"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setBmrModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSetBMR}
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
    marginBottom: 12,
  },
  editText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
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
    marginHorizontal: 8,
  },
  ctaButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bmrValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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

