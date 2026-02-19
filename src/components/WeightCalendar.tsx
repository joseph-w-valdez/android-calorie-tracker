import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMonthWeightData } from '@/src/hooks/useMonthWeightData';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { formatDateLocal, getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

interface WeightCalendarProps {
  year?: number;
  month?: number;
  refreshKey?: number;
  onDatePress?: (date: string, weight: number | null) => void;
}

export function WeightCalendar({ year, month, refreshKey, onDatePress }: WeightCalendarProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(year || today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(month || today.getMonth() + 1);

  // Sync with props if they change
  useEffect(() => {
    if (year !== undefined) setCurrentYear(year);
    if (month !== undefined) setCurrentMonth(month);
  }, [year, month]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
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
        <View style={styles.headerRow}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>
            <Text style={styles.subtitle}>Monthly Weight</Text>
          </View>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <IconSymbol name="chevron.right" size={20} color={colors.text} />
          </Pressable>
        </View>
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
              android_ripple={{ color: colors.border }}
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

function createStyles(colors: typeof ThemeColors.light) {
  return StyleSheet.create({
    container: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navButton: {
      padding: 8,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    monthTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
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
      color: colors.textSecondary,
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
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    todayCell: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.primary,
      borderWidth: 2,
    },
    dayNumber: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    },
    todayNumber: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    weightText: {
      fontSize: 9,
      fontWeight: '500',
      color: colors.primary,
    },
    weightDiffText: {
      fontSize: 8,
      fontWeight: '400',
      marginTop: 1,
    },
    weightDiffPositive: {
      color: colors.statBad, // Red for weight gain
    },
    weightDiffNegative: {
      color: colors.statGood, // Green for weight loss
    },
    weightDiffNeutral: {
      color: colors.textSecondary, // Gray for no change
    },
  });
}

