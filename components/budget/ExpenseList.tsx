import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Package, Wallet } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import { formatCurrency, formatDatePHT } from '@/lib/utils';
import type { Expense, GroupMember } from '@/lib/types';
import SwipeableExpenseRow from './SwipeableExpenseRow';
import { CATEGORIES, smartTitle } from './categories';
import type { BudgetMode } from './categories';

interface ExpenseListProps {
  displayExpenses: Expense[];
  isEmpty: boolean;
  filteredCount: number;
  mode: BudgetMode;
  members: GroupMember[];
  expandedExpense: string | null;
  showAllExpenses: boolean;
  onToggleExpense: (id: string | null) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string, desc: string) => void;
  onToggleShowAll: () => void;
}

export default function ExpenseList({
  displayExpenses,
  isEmpty,
  filteredCount,
  mode,
  members,
  expandedExpense,
  showAllExpenses,
  onToggleExpense,
  onEdit,
  onDelete,
  onToggleShowAll,
}: ExpenseListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  if (isEmpty) {
    return (
      <View style={styles.section}>
        <View style={[styles.nudgeCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Wallet size={28} color={colors.text3} strokeWidth={1.5} />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>No expenses yet</Text>
          <Text style={{ fontSize: 13, color: colors.text2, textAlign: 'center', marginTop: 4 }}>
            Tap + Add to log your first expense
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{mode === 'group' ? 'Shared expenses' : 'Expenses'}</Text>
        {filteredCount > 5 && (
          <TouchableOpacity onPress={onToggleShowAll}>
            <Text style={styles.seeAllText}>
              {showAllExpenses ? 'Show less' : `All ${filteredCount} \u2192`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {displayExpenses.map((e) => {
        const payer = members.find(m => m.name === e.paidBy) || members[0];
        const isOpen = expandedExpense === e.id;
        const splitCount = members.length || 1;
        const each = Math.round(e.amount / splitCount);
        const catConfig = CATEGORIES.find(c => c.matchKey === e.category);
        const CatIcon = catConfig?.icon ?? Package;
        const catColor = catConfig ? colors[catConfig.colorKey] : colors.text3;

        return (
          <SwipeableExpenseRow
            key={e.id}
            colors={colors}
            onEdit={() => onEdit(e)}
            onDelete={() => onDelete(e.id, e.description)}
          >
            <TouchableOpacity
              style={styles.expenseRow}
              onPress={() => onToggleExpense(isOpen ? null : e.id)}
              activeOpacity={0.7}
            >
              <View style={styles.expenseMain}>
                <View style={[styles.expenseIcon, { backgroundColor: catColor + '18' }]}>
                  <CatIcon size={16} color={catColor} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.expenseTopRow}>
                    <Text style={styles.expenseTitle} numberOfLines={1}>{smartTitle(e)}</Text>
                    <Text style={styles.expenseAmount}>{formatCurrency(e.amount, e.currency)}</Text>
                  </View>
                  {mode === 'group' && payer ? (
                    <Text style={styles.expenseMeta}>
                      {payer.name.split(' ')[0]} paid · others owe <Text style={{ color: colors.accent, fontWeight: '600' }}>{formatCurrency(each, 'PHP')}</Text> each
                    </Text>
                  ) : (
                    <Text style={styles.expenseMeta}>{e.category} · {e.paidBy ? `by ${e.paidBy.split(' ')[0]}` : formatDatePHT(e.date)}</Text>
                  )}
                </View>
              </View>

              {/* Expanded breakdown */}
              {isOpen && mode === 'group' && (
                <View style={styles.expenseBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{payer?.name.split(' ')[0] ?? 'Payer'} paid</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(e.amount, 'PHP')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Split across {splitCount} · each</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(each, 'PHP')}</Text>
                  </View>
                  <Text style={[styles.breakdownLabel, { marginTop: 4 }]}>{e.category}</Text>
                </View>
              )}
            </TouchableOpacity>
          </SwipeableExpenseRow>
        );
      })}
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  nudgeCard: { alignItems: 'center', padding: 28, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  seeAllText: { fontSize: 12, fontWeight: '600', color: c.accent },
  expenseRow: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.card },
  expenseMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  expenseIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expenseTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  expenseTitle: { fontSize: 13, fontWeight: '600', color: c.text, flex: 1 },
  expenseAmount: { fontSize: 13, fontWeight: '600', color: c.text, letterSpacing: -0.3 },
  expenseMeta: { fontSize: 11, color: c.text3, marginTop: 2 },
  expenseBreakdown: { marginTop: 10, marginLeft: 44, padding: 10, backgroundColor: c.card2, borderWidth: 1, borderColor: c.border, borderRadius: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownLabel: { fontSize: 11, color: c.text2 },
  breakdownValue: { fontSize: 11, fontWeight: '600', color: c.text, letterSpacing: -0.3 },
});
