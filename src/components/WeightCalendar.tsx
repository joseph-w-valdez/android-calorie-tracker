import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMonthWeightData } from '@/src/hooks/useMonthWeightData';
import { formatDateLocal, getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

interface WeightCalendarProps {
  year?: number;
  month?: number;
  refreshKey?: number;
  onDatePress?: (date: string, weight: number | null) => void;
}

export function WeightCalendar({ year, month, refreshKey, onDatePress }: WeightCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const currentYear = year || today.getFullYear();
  const currentMonth = month || today.getMonth() + 1;
  
  const monthData = useMonthWeightData(currentYear, currentMonth, refreshKey);
  const todayString = getTodayLocal();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDatePress = (date: string, weight: number | null) => {
    if (onDatePress) {
      onDatePress(date, weight);
    } else {
      // Fallback to navigation if no callback provided
      router.push({
        pathname: '/(tabs)/edit',
        params: { date },
      });
    }
  };

  const getDateData = (day: number): { date: string; weight: number | null } | null => {
    if (day < 1 || day > daysInMonth) return null;
    const date = new Date(currentYear, currentMonth - 1, day);
    const dateString = formatDateLocal(date);
    const data = monthData.find(d => d.date === dateString);
    return { date: dateString, weight: data?.weight || null };
  };

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth - 1]} {currentYear}
        </Text>
        <Text style={styles.subtitle}>Monthly Weight</Text>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateData = getDateData(day);
          if (!dateData) return null;

          const isToday = dateData.date === todayString;
          const hasWeight = dateData.weight !== null;

          // Find previous entry in the month
          let previousWeight: number | null = null;
          if (hasWeight && dateData.weight !== null) {
            // Find the most recent entry before this date in the month
            for (let prevDay = day - 1; prevDay >= 1; prevDay--) {
              const prevDateData = getDateData(prevDay);
              if (prevDateData && prevDateData.weight !== null) {
                previousWeight = prevDateData.weight;
                break;
              }
            }
          }

          const weightDiff = hasWeight && dateData.weight !== null && previousWeight !== null
            ? dateData.weight - previousWeight
            : null;

          return (
            <Pressable
              key={dateData.date}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
              ]}
              onPress={() => handleDatePress(dateData.date, dateData.weight)}
              android_ripple={{ color: '#333' }}
            >
              <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                {day}
              </Text>
              {hasWeight && (
                <>
                  <Text style={styles.weightText}>
                    {dateData.weight?.toFixed(1)}
                  </Text>
                  {weightDiff !== null && (
                    <Text style={[
                      styles.weightDiffText,
                      weightDiff > 0 ? styles.weightDiffPositive : weightDiff < 0 ? styles.weightDiffNegative : styles.weightDiffNeutral
                    ]}>
                      {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                    </Text>
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  monthTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '400',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    minHeight: 60, // Fixed height to accommodate weight and difference text
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  todayCell: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4a9eff',
    borderWidth: 2,
  },
  dayNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  todayNumber: {
    color: '#4a9eff',
    fontWeight: 'bold',
  },
  weightText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#4a9eff',
  },
  weightDiffText: {
    fontSize: 8,
    fontWeight: '400',
    marginTop: 1,
  },
  weightDiffPositive: {
    color: '#f87171', // Red for weight gain
  },
  weightDiffNegative: {
    color: '#4ade80', // Green for weight loss
  },
  weightDiffNeutral: {
    color: '#aaa', // Gray for no change
  },
});

