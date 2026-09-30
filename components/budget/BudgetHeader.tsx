import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import type { Trip } from '@/lib/types';
import type { BudgetMode, TabId } from './categories';

interface BudgetHeaderProps {
  trip: Trip;
  days: number;
  mode: BudgetMode;
  tab: TabId;
  onModeChange: (m: BudgetMode) => void;
  onTabChange: (t: TabId) => void;
  onAdd: () => void;
}

export default function BudgetHeader({
  trip,
  days,
  mode,
  tab,
  onModeChange,
  onTabChange,
  onAdd,
}: BudgetHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget</Text>
          <Text style={styles.subtitle}>{trip.destination ?? 'Trip'} · {days} days</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Mode pill — Budget / Group */}
      <View style={styles.modePadding}>
        <View style={styles.segControl}>
          {(['budget', 'group'] as const).map(m => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                style={[styles.segBtn, active && styles.segBtnActive]}
                onPress={() => onModeChange(m)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>
                  {m === 'budget' ? 'Budget' : 'Group'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tab row — Overview / Fate */}
      <View style={styles.tabRow}>
        {(['overview', 'fate'] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => onTabChange(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'overview' ? 'Overview' : 'Who Pays?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', letterSpacing: -0.8, color: c.text },
  subtitle: { fontSize: 11, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: c.text3, marginTop: 2 },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: c.black, borderRadius: radius.sm },
  addBtnText: { fontSize: 12, fontWeight: '600', color: c.onBlack },

  // Mode pill
  modePadding: { paddingHorizontal: 16, paddingBottom: 10 },
  segControl: { flexDirection: 'row', backgroundColor: c.card2, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.pill },
  segBtnActive: { backgroundColor: c.card },
  segText: { fontSize: 13, fontWeight: '600', color: c.text3 },
  segTextActive: { color: c.text },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.border, gap: 18 },
  tabBtn: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabBtnActive: { borderBottomColor: c.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: c.text3 },
  tabTextActive: { color: c.text },
});
