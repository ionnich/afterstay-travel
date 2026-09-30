import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from './categories';

interface CategoryBreakdownProps {
  byCategory: Record<string, number>;
  spent: number;
}

export default function CategoryBreakdown({ byCategory, spent }: CategoryBreakdownProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Where it's going</Text>
      <View style={styles.catList}>
        {CATEGORIES.map(cat => {
          const amount = byCategory[cat.matchKey] ?? 0;
          const pct = spent > 0 ? Math.round((amount / spent) * 100) : 0;
          const color = colors[cat.colorKey];
          const Icon = cat.icon;
          return (
            <View key={cat.name} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                <Icon size={16} color={color} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>{formatCurrency(amount, 'PHP')}</Text>
                </View>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
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
  catList: { gap: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14 },
  catIcon: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  catName: { fontSize: 13, fontWeight: '600', color: c.text },
  catAmount: { fontSize: 13, fontWeight: '600', color: c.text, letterSpacing: -0.3 },
  catBarTrack: { height: 4, borderRadius: 99, backgroundColor: c.card2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 99 },
});
