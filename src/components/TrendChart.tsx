import type { TrendDay } from '@/src/hooks/useTrend';
import { parseDateLocal } from '@/src/utils/dateUtils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TrendChartProps {
  data: TrendDay[];
  bmr?: number | null;
}

interface BarProps {
  height: number; // Height as percentage of chart height
  isPositive: boolean;
  isEmpty: boolean;
  value: number;
  date: string; // Date string (YYYY-MM-DD) for short date display
}

function Bar({ height, isPositive, isEmpty, value }: BarProps) {
  const CHART_HEIGHT = 200; // Match chartContainer height
  const CENTER_Y = CHART_HEIGHT / 2; // 100px
  const BMR_LINE_Y = CENTER_Y - 0.5; // 99.5px (matches BMR line position)
  
  // Calculate bar height in pixels
  const barHeightPx = (height / 100) * CHART_HEIGHT;
  
  if (isEmpty) {
    // Empty bar: small gray bar centered on BMR line
    const barHeight = 7; // Increased from 4px to 7px for better visibility
    return (
      <View style={styles.barWrapper}>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              styles.barEmpty,
              {
                position: 'absolute',
                top: BMR_LINE_Y - barHeight / 2, // Center on BMR line
                left: 0,
                right: 0,
                height: barHeight,
              },
            ]}
          />
        </View>
      </View>
    );
  }
  
  if (isPositive) {
    // Positive: red bar going up from center
    // Bottom edge touches the BMR line
    return (
      <View style={styles.barWrapper}>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              styles.barPositive,
              {
                position: 'absolute',
                top: BMR_LINE_Y - barHeightPx, // Bottom edge touches BMR line
                left: 0,
                right: 0,
                height: barHeightPx,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              },
            ]}
          />
        </View>
      </View>
    );
  } else {
    // Negative: green bar going down from center
    // Top edge touches the BMR line
    return (
      <View style={styles.barWrapper}>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              styles.barNegative,
              {
                position: 'absolute',
                top: BMR_LINE_Y, // Top edge touches BMR line
                left: 0,
                right: 0,
                height: barHeightPx,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
              },
            ]}
          />
        </View>
      </View>
    );
  }
}

export function TrendChart({ data, bmr }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  if (!bmr) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Set BMR to view trend</Text>
      </View>
    );
  }

  // Calculate difference from BMR for each day (net - BMR)
  const differences = data.map(d => d.net - bmr);
  
  // Find max absolute difference for scaling
  const maxDifference = Math.max(...differences.map(Math.abs), 100); // Minimum scale of 100

  // Calculate 7-day average net calories
  const totalNet = data.reduce((sum, d) => sum + d.net, 0);
  const avgNet = totalNet / data.length;
  const isDeficit = avgNet < bmr; // Deficit is when net calories < BMR

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>7-Day Calorie Trend</Text>
        <Text style={[styles.summary, isDeficit ? styles.summaryGood : styles.summaryBad]}>
          Average Net Calories: {Math.round(avgNet)}
        </Text>
      </View>

      <View style={styles.chartWrapper}>
        {/* Weekday labels above */}
        <View style={styles.labelsTopContainer}>
          {data.map((day) => {
            const dayDate = parseDateLocal(day.date);
            const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <View key={`top-${day.date}`} style={styles.labelTopWrapper}>
                <Text style={styles.weekdayLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartContainer}>
          {/* BMR center line - positioned at true center (100px from top for 200px chart) */}
          <View style={styles.bmrLine} />
          
          {/* Vertical separator lines between bars - create dashed effect */}
          {data.map((day, index) => {
            if (index === 0) return null; // Skip first separator (before first bar)
            // With space-around and flex: 1, each bar takes equal space
            // Separators should be at the boundaries between bar sections
            // Account for 8px padding on each side of barsContainer
            // Position at: padding + (index * sectionWidth)
            // Since we can't easily calculate exact pixel positions, use percentage
            // that approximates the flex distribution
            const leftPercent = (index / data.length) * 100;
            // Create dashed line using multiple small segments
            const dashHeight = 4;
            const dashGap = 4;
            const totalHeight = 200;
            const dashCount = Math.floor(totalHeight / (dashHeight + dashGap));
            
            return (
              <View
                key={`separator-${day.date}`}
                style={[
                  styles.separatorContainer,
                  { left: `${leftPercent}%` },
                ]}
              >
                {Array.from({ length: dashCount }).map((_, i) => (
                  <View
                    key={`dash-${i}`}
                    style={[
                      styles.separatorDash,
                      {
                        top: i * (dashHeight + dashGap),
                        height: dashHeight,
                      },
                    ]}
                  />
                ))}
              </View>
            );
          })}
          
          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((day, index) => {
              const hasEntries = day.caloriesIn > 0 || day.caloriesOut > 0;
              // Calculate difference from BMR: net calories - BMR
              // Negative = below BMR (deficit, green), Positive = above BMR (red)
              const difference = day.net - bmr;
              const isAboveBMR = difference >= 0; // True if net >= BMR (not in deficit)
              
              // Calculate bar height as percentage of chart height
              // Use 40% of chart height (20% above center, 20% below center)
              const barHeightPercent = hasEntries 
                ? (Math.abs(difference) / maxDifference) * 40
                : 0; // Empty bars use fixed height in Bar component

              return (
                <Bar
                  key={day.date}
                  height={barHeightPercent}
                  isPositive={isAboveBMR}
                  isEmpty={!hasEntries}
                  value={difference}
                  date={day.date}
                />
              );
            })}
          </View>
        </View>

        {/* Date labels below */}
        <View style={styles.labelsBottomContainer}>
          {data.map((day) => {
            const dayDate = parseDateLocal(day.date);
            const shortDate = dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            return (
              <View key={`bottom-${day.date}`} style={styles.labelBottomWrapper}>
                <Text style={styles.dateLabel}>{shortDate}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4ade80' }]} />
          <Text style={styles.legendText}>Below BMR</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.bmrLegendLine]} />
          <Text style={styles.legendText}>BMR</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f87171' }]} />
          <Text style={styles.legendText}>Above BMR</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryGood: {
    color: '#4ade80',
  },
  summaryBad: {
    color: '#f87171',
  },
  chartWrapper: {
    marginBottom: 16,
  },
  labelsTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 4,
  },
  labelTopWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  labelsBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 4,
  },
  labelBottomWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: '100%',
  },
  bmrLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100, // Exactly at center of 200px chart (matches CENTER_Y in Bar component)
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // White with 30% opacity
    zIndex: 0, // Lower z-index so bars appear on top
    marginTop: -0.5, // Center the 1px line perfectly
  },
  separatorContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    zIndex: 0,
  },
  separatorDash: {
    position: 'absolute',
    left: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'stretch',
    height: '100%',
    justifyContent: 'center',
  },
  barContainer: {
    width: '80%',
    height: '100%',
    position: 'relative',
    alignSelf: 'center',
  },
  bar: {
    width: '100%',
    position: 'absolute',
    borderRadius: 2,
  },
  barPositive: {
    backgroundColor: '#f87171',
  },
  barNegative: {
    backgroundColor: '#4ade80',
  },
  barEmpty: {
    backgroundColor: '#555',
  },
  weekdayLabel: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 4,
  },
  dateLabel: {
    color: '#666',
    fontSize: 9,
    marginTop: 4,
  },
  valueLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  valuePositive: {
    color: '#f87171',
  },
  valueNegative: {
    color: '#4ade80',
  },
  valueEmpty: {
    color: '#666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  bmrLegendLine: {
    backgroundColor: '#666',
    borderRadius: 0,
    height: 1,
    width: 12,
  },
  legendText: {
    color: '#aaa',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});

