import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMonthData } from '@/src/hooks/useMonthData';
import { useBMR } from '@/src/hooks/useBMR';
import { formatDateLocal, getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

interface CalendarProps {
  year?: number;
  month?: number;
  refreshKey?: number;
}

export function Calendar({ year, month, refreshKey }: CalendarProps) {
  const router = useRouter();
  const today = new Date();
  const currentYear = year || today.getFullYear();
  const currentMonth = month || today.getMonth() + 1;
  
  const monthData = useMonthData(currentYear, currentMonth, refreshKey);
  const { bmr } = useBMR();
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

  const handleDatePress = (date: string) => {
    router.push({
      pathname: '/(tabs)/edit',
      params: { date },
    });
  };

  const getDateData = (day: number): { date: string; net: number } | null => {
    if (day < 1 || day > daysInMonth) return null;
    const date = new Date(currentYear, currentMonth - 1, day);
    const dateString = formatDateLocal(date);
    const data = monthData.find(d => d.date === dateString);
    return { date: dateString, net: data?.net || 0 };
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
        <Text style={styles.subtitle}>Monthly Net Calories</Text>
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
          const hasData = dateData.net !== 0;
          
          // Determine if in deficit: net < BMR (green) or not in deficit: net >= BMR (red)
          // Only color code if BMR is set
          const isDeficit = bmr !== null && dateData.net < bmr;
          const isNotDeficit = bmr !== null && dateData.net >= bmr;

          return (
            <Pressable
              key={dateData.date}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
              ]}
              onPress={() => handleDatePress(dateData.date)}
              android_ripple={{ color: '#333' }}
            >
              <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                {day}
              </Text>
              {hasData && (
                <Text
                  style={[
                    styles.netText,
                    isDeficit ? styles.netDeficit : isNotDeficit ? styles.netNotDeficit : (dateData.net < 0 ? styles.netNegative : styles.netPositive),
                  ]}
                >
                  {dateData.net > 0 ? '+' : ''}{Math.round(dateData.net)}
                </Text>
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
    aspectRatio: 1,
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
  netText: {
    fontSize: 10,
    fontWeight: '500',
  },
  netPositive: {
    color: '#f87171',
  },
  netNegative: {
    color: '#4ade80',
  },
  netDeficit: {
    color: '#4ade80', // Green for deficit (net < BMR)
  },
  netNotDeficit: {
    color: '#f87171', // Red for not in deficit (net >= BMR)
  },
});

