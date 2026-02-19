import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { MilesDay } from '@/src/hooks/useMilesTrend';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors as ThemeColors } from '@/constants/theme';
import { parseDateLocal } from '@/src/utils/dateUtils';

interface MilesChartProps {
  data: MilesDay[];
}

const CHART_HEIGHT = 150;
const CHART_PADDING = 40;
const POINT_RADIUS = 4;

export function MilesChart({ data }: MilesChartProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const isLight = colors.background === '#fff';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
  const lineColor = colors.statGood; // Green for miles/exercise
  const textColor = isLight ? colors.text : '#fff';

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No miles data available</Text>
      </View>
    );
  }

  // Include all days (including 0 miles) for calculations
  const allMiles = data.map(d => d.miles);
  const minMiles = Math.min(...allMiles);
  const maxMiles = Math.max(...allMiles);
  const milesRange = maxMiles - minMiles || 1; // Avoid division by zero

  // Add padding to the range, but ensure min is at least 0
  const paddedMin = 0; // Always start from 0 for miles
  const paddedMax = maxMiles > 0 ? maxMiles + (milesRange * 0.1) : 1; // At least 1 if all zeros
  const paddedRange = paddedMax - paddedMin;

  // Calculate 7-day average (including 0-mile days)
  const totalMiles = allMiles.reduce((sum, m) => sum + m, 0);
  const avgMiles = totalMiles / data.length;

  // Get screen width for responsive chart
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for container padding (16*2) + chart padding (16*2)
  const svgWidth = chartWidth - (CHART_PADDING * 2);
  const svgHeight = CHART_HEIGHT - (CHART_PADDING * 2);

  // Calculate points for the line - include all days, including 0 miles
  const allPoints: Array<{ x: number; y: number; miles: number; date: string }> = [];
  data.forEach((day, index) => {
    const x = (index / (data.length - 1)) * svgWidth;
    // Normalize miles (0 miles will be at the bottom)
    const normalizedMiles = (day.miles - paddedMin) / paddedRange;
    const y = svgHeight - (normalizedMiles * svgHeight); // Flip Y axis (SVG origin is top-left)
    allPoints.push({ x, y, miles: day.miles, date: day.date });
  });

  // Calculate Y-axis label positions (min, mid, max)
  const yAxisLabels = [
    { value: paddedMax, y: 0 },
    { value: (paddedMin + paddedMax) / 2, y: svgHeight / 2 },
    { value: paddedMin, y: svgHeight },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>7-Day Miles Trend</Text>
        <Text style={styles.summary}>
          Avg: {avgMiles.toFixed(1)} mi
        </Text>
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
            const dateLabel = dayDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
            const x = CHART_PADDING + (index / (data.length - 1)) * svgWidth;
            return (
              <React.Fragment key={`x-labels-${day.date}`}>
                <SvgText
                  x={x}
                  y={CHART_HEIGHT - 20}
                  fill={textColor}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {dayLabel}
                </SvgText>
                <SvgText
                  x={x}
                  y={CHART_HEIGHT - 8}
                  fill={textColor}
                  fontSize="9"
                  textAnchor="middle"
                >
                  {dateLabel}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Line chart - connect all consecutive days (including 0 miles) */}
          {allPoints.length > 1 && (
            <>
              {allPoints.slice(1).map((point, i) => {
                const prevPoint = allPoints[i];
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
              })}
            </>
          )}

          {/* Data points - show all days, including 0 miles */}
          {allPoints.map((point) => (
            <Circle
              key={`point-${point.date}`}
              cx={CHART_PADDING + point.x}
              cy={CHART_PADDING + point.y}
              r={POINT_RADIUS}
              fill={lineColor}
            />
          ))}

          {/* Tooltip text on data points - show value for all days */}
          {allPoints.map((point) => (
            <SvgText
              key={`tooltip-${point.date}`}
              x={CHART_PADDING + point.x}
              y={CHART_PADDING + point.y - 10}
              fill={textColor}
              fontSize="10"
              textAnchor="middle"
            >
              {point.miles.toFixed(1)}
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

