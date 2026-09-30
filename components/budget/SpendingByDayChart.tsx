import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { formatCurrency, formatDatePHT } from '@/lib/utils';

interface SpendingByDayChartProps {
  data: [string, number][];
}

export default function SpendingByDayChart({ data }: SpendingByDayChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const maxDaySpend = Math.max(...data.map(d => d[1]), 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spending by day</Text>
      <View style={styles.dayCard}>
        {data.slice(-7).map(([date, amt]) => {
          const pct = (amt / maxDaySpend) * 100;
          return (
            <View key={date} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{formatDatePHT(date)}</Text>
              <View style={styles.dayBarTrack}>
                <View style={[styles.dayBarFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.dayAmount}>{formatCurrency(amt, 'PHP')}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  dayCard: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14, gap: 10 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayLabel: { width: 46, fontSize: 11, fontWeight: '600', color: c.text3 },
  dayBarTrack: { flex: 1, height: 8, backgroundColor: c.card2, borderRadius: 99, overflow: 'hidden' },
  dayBarFill: { height: '100%', borderRadius: 99, backgroundColor: c.accent },
  dayAmount: { width: 72, textAlign: 'right', fontSize: 11, fontWeight: '600', color: c.text, letterSpacing: -0.3 },
});
