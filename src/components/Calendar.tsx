import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors as ThemeColors } from '@/constants/theme';
import { useBMR } from '@/src/hooks/useBMR';
import { useMonthData } from '@/src/hooks/useMonthData';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatDateLocal, getTodayLocal } from '@/src/utils/dateUtils';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CalendarProps {
  year?: number;
  month?: number;
  refreshKey?: number;
}

export function Calendar({ year, month, refreshKey }: CalendarProps) {
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
        <View style={styles.headerRow}>
          <Pressable
            style={styles.navButton}
            onPress={handlePrevMonth}
            android_ripple={{ color: colors.border }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>
            <Text style={styles.subtitle}>Monthly Net Calories</Text>
          </View>
          <Pressable
            style={styles.navButton}
            onPress={handleNextMonth}
            android_ripple={{ color: colors.border }}
          >
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
              android_ripple={{ color: colors.border }}
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
      aspectRatio: 1,
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
    netText: {
      fontSize: 10,
      fontWeight: '500',
    },
    netPositive: {
      color: colors.statBad,
    },
    netNegative: {
      color: colors.statGood,
    },
    netDeficit: {
      color: colors.statGood, // Green for deficit (net < BMR)
    },
    netNotDeficit: {
      color: colors.statBad, // Red for not in deficit (net >= BMR)
    },
  });
}

