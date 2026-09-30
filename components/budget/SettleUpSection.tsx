import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import { formatCurrency } from '@/lib/utils';
import type { GroupMember } from '@/lib/types';

interface SettleUpSectionProps {
  members: GroupMember[];
  spendingByPerson: Record<string, number>;
  spent: number;
}

export default function SettleUpSection({ members, spendingByPerson, spent }: SettleUpSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const primaryPayer = members.reduce((top, m) =>
    (spendingByPerson[m.name] ?? 0) > (spendingByPerson[top.name] ?? 0) ? m : top,
    members[0],
  );
  const others = members.filter(m => m.name !== primaryPayer.name);
  const perPerson = spent > 0 ? Math.round(spent / members.length) : 0;

  if (others.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settle up</Text>
      {others.map(m => {
        const theirPaid = spendingByPerson[m.name] ?? 0;
        const owes = Math.max(0, perPerson - theirPaid);
        if (owes < 1) return null;
        return (
          <View key={m.id} style={styles.settleRow}>
            <View style={[styles.avatar, { backgroundColor: colors.chart2, width: 36, height: 36 }]}>
              <Text style={[styles.avatarText, { fontSize: 14 }]}>{m.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settleText}>
                <Text style={{ fontWeight: '600' }}>{m.name.split(' ')[0]}</Text>
                <Text style={{ color: colors.text3 }}> owes </Text>
                <Text style={{ fontWeight: '600' }}>{primaryPayer.name.split(' ')[0]}</Text>
              </Text>
              <Text style={styles.settleAmount}>{formatCurrency(owes, 'PHP')}</Text>
            </View>
            <TouchableOpacity
              style={styles.settleBtn}
              onPress={() => Alert.alert('Settle', `Mark ${formatCurrency(owes, 'PHP')} as settled?`, [
                { text: 'Not yet', style: 'cancel' },
                { text: 'Settled', onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
              ])}
              activeOpacity={0.7}
            >
              <Text style={styles.settleBtnText}>Settle</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  settleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 14 },
  settleText: { fontSize: 12.5, color: c.text },
  settleAmount: { fontSize: 18, fontWeight: '600', color: c.accent, letterSpacing: -0.3, marginTop: 2 },
  settleBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: c.black, borderRadius: radius.sm },
  settleBtnText: { fontSize: 12, fontWeight: '600', color: c.onBlack },
  avatar: { width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#fffaf0' },
});
