import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Pencil } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import type { Trip } from '@/lib/types';

interface BudgetCardProps {
  trip: Trip;
  total: number;
  spent: number;
  remaining: number;
  perDay: number;
  days: number;
  expenseCount: number;
  memberCount: number;
  onSetLimit: (initial: string) => void;
}

export default function BudgetCard({
  trip,
  total,
  spent,
  remaining,
  perDay,
  days,
  expenseCount,
  memberCount,
  onSetLimit,
}: BudgetCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View>
            <Text style={styles.eyebrow}>{total > 0 ? `Trip budget · ${days} days` : 'Total spent'}</Text>
            {total > 0 ? (
              <>
                <View style={styles.budgetAmountRow}>
                  <Text style={styles.budgetCurrency}>{'\u20B1'}</Text>
                  <Text style={styles.budgetAmount}>{total.toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => onSetLimit(String(total))} hitSlop={8}>
                    <Pencil size={13} color={colors.text3} strokeWidth={1.8} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.budgetPerDay}>{formatCurrency(perDay, 'PHP')}/day target</Text>
              </>
            ) : (
              <>
                <Text style={styles.trackAmount}>{formatCurrency(spent, trip.costCurrency ?? 'PHP')}</Text>
                <Text style={styles.trackSub}>
                  {expenseCount} expense{expenseCount !== 1 ? 's' : ''} · {days} days ·{' '}
                  <Text style={{ color: colors.accent }} onPress={() => onSetLimit('')}>Set a limit</Text>
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Progress bar — only with limit */}
        {total > 0 && (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (spent / total) * 100)}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Spent <Text style={styles.progressBold}>{formatCurrency(spent, 'PHP')}</Text></Text>
              <Text style={styles.progressText}>Left <Text style={[styles.progressBold, { color: colors.accent }]}>{formatCurrency(remaining, 'PHP')}</Text></Text>
            </View>
          </>
        )}

        {/* Lodging one-liner */}
        {trip.accommodation && (
          <View style={styles.lodgingRow}>
            <View style={styles.lodgingCheck}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Polyline points="20 6 9 17 4 12" stroke={colors.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lodgingTitle} numberOfLines={1}>Lodging · {trip.accommodation}</Text>
              <Text style={styles.lodgingSub}>Paid in full · {memberCount} travelers</Text>
            </View>
            {trip.cost != null && <Text style={styles.lodgingAmount}>{formatCurrency(trip.cost, trip.costCurrency ?? 'PHP')}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  eyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: c.text3 },
  budgetCard: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 18 },
  budgetHeader: { marginBottom: 14 },
  budgetAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  budgetCurrency: { fontSize: 18, color: c.text3, fontWeight: '600' },
  budgetAmount: { fontSize: 34, fontWeight: '500', letterSpacing: -0.3, color: c.text },
  budgetPerDay: { fontSize: 11, color: c.text3, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: c.card2, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: c.accent },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 12, color: c.text3 },
  progressBold: { fontWeight: '600', color: c.text, letterSpacing: -0.3 },
  lodgingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  lodgingCheck: { width: 24, height: 24, borderRadius: 6, backgroundColor: c.accentBg, borderWidth: 1, borderColor: c.accentBorder, alignItems: 'center', justifyContent: 'center' },
  lodgingTitle: { fontSize: 12, fontWeight: '600', color: c.text },
  lodgingSub: { fontSize: 10.5, color: c.text3, marginTop: 1 },
  lodgingAmount: { fontSize: 13, fontWeight: '600', color: c.text2, letterSpacing: -0.3 },
  trackAmount: { fontSize: 34, fontWeight: '500', letterSpacing: -0.3, color: c.text, marginTop: 4 },
  trackSub: { fontSize: 12, color: c.text3, marginTop: 4 },
});
