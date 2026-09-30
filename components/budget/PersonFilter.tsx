import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import { formatCurrency } from '@/lib/utils';
import type { GroupMember } from '@/lib/types';

interface PersonFilterProps {
  members: GroupMember[];
  personFilter: string | null;
  spendingByPerson: Record<string, number>;
  onSelect: (name: string | null) => void;
}

export default function PersonFilter({
  members,
  personFilter,
  spendingByPerson,
  onSelect,
}: PersonFilterProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Filter by person</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personRow}>
        <TouchableOpacity
          style={[styles.personChip, !personFilter && styles.personChipActive]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.personChipText, !personFilter && styles.personChipTextActive]}>All</Text>
        </TouchableOpacity>
        {members.map(m => {
          const active = personFilter === m.name;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.personChip, active && styles.personChipActive]}
              onPress={() => onSelect(active ? null : m.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={[styles.personChipText, active && styles.personChipTextActive]}>{m.name.split(' ')[0]}</Text>
                {(spendingByPerson[m.name] ?? 0) > 0 && (
                  <Text style={[styles.personChipAmount, active && { color: colors.accent }]}>{formatCurrency(spendingByPerson[m.name], 'PHP')}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  eyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: c.text3 },
  personRow: { gap: 6, paddingTop: 6 },
  personChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  personChipActive: { borderColor: c.accentBorder, backgroundColor: c.accentBg },
  personChipText: { fontSize: 12, fontWeight: '600', color: c.text },
  personChipTextActive: { color: c.accent },
  personChipAmount: { fontSize: 9.5, color: c.text3, marginTop: 1 },
  avatar: { width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#fffaf0' },
});
