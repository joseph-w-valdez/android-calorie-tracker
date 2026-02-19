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
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { TrendChart } from '@/src/components/TrendChart';
import { Calendar } from '@/src/components/Calendar';
import { AddEntryModal } from '@/src/components/AddEntryModal';
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export function CaloriesScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
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
      marginBottom: 12,
    },
    editText: {
      color: colors.primary,
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
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    statValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    statGood: {
      color: colors.statGood,
    },
    statBad: {
      color: colors.statBad,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 8,
    },
    ctaButton: {
      backgroundColor: colors.primary,
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
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    placeholderText: {
      color: colors.textTertiary,
      fontSize: 14,
      fontStyle: 'italic',
    },
  });
}

