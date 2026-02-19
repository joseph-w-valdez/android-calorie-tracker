import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { WeightDay } from '@/src/hooks/useWeightTrend';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { parseDateLocal } from '@/src/utils/dateUtils';

interface WeightChartProps {
  data: WeightDay[];
}

const CHART_HEIGHT = 150;
const CHART_PADDING = 40;
const POINT_RADIUS = 4;

export function WeightChart({ data }: WeightChartProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const isLight = colors.background === '#fff';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const lineColor = colors.primary;
  const textColor = isLight ? colors.text : '#fff';

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No weight data available</Text>
      </View>
    );
  }

  // Filter out days with no weight data for calculations
  const dataPoints = data.filter(d => d.weight !== null);
  
  if (dataPoints.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No weight entries yet</Text>
      </View>
    );
  }

  // Find min and max weight for scaling
  const weights = dataPoints.map(d => d.weight!);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1; // Avoid division by zero

  // Add padding to the range
  const paddedMin = minWeight - (weightRange * 0.1);
  const paddedMax = maxWeight + (weightRange * 0.1);
  const paddedRange = paddedMax - paddedMin;

  // Calculate 7-day average
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const avgWeight = totalWeight / weights.length;

  // Get screen width for responsive chart
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for container padding (16*2) + chart padding (16*2)
  const svgWidth = chartWidth - (CHART_PADDING * 2);
  const svgHeight = CHART_HEIGHT - (CHART_PADDING * 2);

  // Calculate points for the line - include all days, mark which have data
  const allPoints: Array<{ x: number; y: number; weight: number | null; date: string; hasData: boolean }> = [];
  data.forEach((day, index) => {
    const x = (index / (data.length - 1)) * svgWidth;
    if (day.weight !== null) {
      const normalizedWeight = (day.weight - paddedMin) / paddedRange;
      const y = svgHeight - (normalizedWeight * svgHeight); // Flip Y axis (SVG origin is top-left)
      allPoints.push({ x, y, weight: day.weight, date: day.date, hasData: true });
    } else {
      allPoints.push({ x, y: 0, weight: null, date: day.date, hasData: false });
    }
  });

  // Filter to only points with data for rendering
  const points = allPoints.filter(p => p.hasData);

  // Calculate Y-axis label positions (min, mid, max)
  const yAxisLabels = [
    { value: paddedMax, y: 0 },
    { value: (paddedMin + paddedMax) / 2, y: svgHeight / 2 },
    { value: paddedMin, y: svgHeight },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>7-Day Weight Trend</Text>
        {avgWeight > 0 && (
          <Text style={styles.summary}>
            Avg: {avgWeight.toFixed(1)} lbs
          </Text>
        )}
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {yAxisLabels.map((label, i) => (
            <Line
              key={`grid-${i}`}
              x1={CHART_PADDING}
              y1={CHART_PADDING + label.y}
              x2={CHART_PADDING + svgWidth}
              y2={CHART_PADDING + label.y}
              stroke={gridColor}
              strokeWidth="1"
            />
          ))}

          {/* X-axis labels (weekday abbreviations) */}
          {data.map((day, index) => {
            const dayDate = parseDateLocal(day.date);
            const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
            const x = CHART_PADDING + (index / (data.length - 1)) * svgWidth;
            return (
              <SvgText
                key={`x-label-${day.date}`}
                x={x}
                y={CHART_HEIGHT - 8}
                fill={colors.textTertiary}
                fontSize="10"
                textAnchor="middle"
              >
                {dayLabel}
              </SvgText>
            );
          })}

          {/* Line chart - connect consecutive points with data */}
          {points.length > 1 && (
            <>
              {points.slice(1).map((point, i) => {
                const prevPoint = points[i];
                // Only draw line if points are consecutive in the original data
                const prevIndex = allPoints.findIndex(p => p.date === prevPoint.date);
                const currIndex = allPoints.findIndex(p => p.date === point.date);
                // Check if they're consecutive (no gaps)
                if (currIndex - prevIndex === 1) {
                  return (
                    <Line
                      key={`line-${prevPoint.date}-${point.date}`}
                      x1={CHART_PADDING + prevPoint.x}
                      y1={CHART_PADDING + prevPoint.y}
                      x2={CHART_PADDING + point.x}
                      y2={CHART_PADDING + point.y}
                      stroke={lineColor}
                      strokeWidth="2"
                    />
                  );
                }
                return null;
              })}
            </>
          )}

          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={`point-${point.date}`}
              cx={CHART_PADDING + point.x}
              cy={CHART_PADDING + point.y}
              r={POINT_RADIUS}
              fill={lineColor}
            />
          ))}

          {/* Tooltip text on data points */}
          {points.map((point) => (
            <SvgText
              key={`tooltip-${point.date}`}
              x={CHART_PADDING + point.x}
              y={CHART_PADDING + point.y - 10}
              fill={textColor}
              fontSize="10"
              textAnchor="middle"
            >
              {point.weight.toFixed(1)}
            </SvgText>
          ))}
        </Svg>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    summary: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    chartContainer: {
      alignItems: 'center',
      backgroundColor: colors.background === '#fff' ? '#f5f5f5' : colors.inputBackground,
      borderRadius: 8,
      padding: 10,
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });
}
