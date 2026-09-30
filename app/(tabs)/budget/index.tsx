// Budget 2.0 — ported from prototype budget.jsx
// Structure: Track/Budget/Group pill → Overview/Fate tabs → status + budget card + categories + expenses + settle

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Wallet } from 'lucide-react-native';

import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import EmptyState from '@/components/shared/EmptyState';
import BudgetStatusBanner from '@/components/budget/BudgetStatusBanner';
import BudgetHeader from '@/components/budget/BudgetHeader';
import BudgetCard from '@/components/budget/BudgetCard';
import PaymentQrSection from '@/components/budget/PaymentQrSection';
import PersonFilter from '@/components/budget/PersonFilter';
import CategoryBreakdown from '@/components/budget/CategoryBreakdown';
import SpendingByDayChart from '@/components/budget/SpendingByDayChart';
import ExpenseList from '@/components/budget/ExpenseList';
import SettleUpSection from '@/components/budget/SettleUpSection';
import BudgetModals from '@/components/budget/BudgetModals';
import { useBudget } from '@/hooks/budget/useBudget';

export default function BudgetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const b = useBudget();

  if (!b.trip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Budget</Text>
          </View>
        </View>
        <EmptyState
          icon={Wallet}
          title="No trip yet"
          subtitle="Create a trip to start tracking expenses, set budgets, and split costs with your group."
          actionLabel="Get Started"
          onAction={() => router.push('/onboarding' as never)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BudgetHeader
        trip={b.trip}
        days={b.days}
        mode={b.mode}
        tab={b.tab}
        onModeChange={b.setMode}
        onTabChange={b.setTab}
        onAdd={() => router.push('/add-expense' as never)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={b.refreshing} onRefresh={() => { b.setRefreshing(true); b.load(true); }} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {b.tab === 'overview' && (
          <>
            {/* Status banner */}
            {b.total > 0 && (
              <View style={styles.section}>
                <BudgetStatusBanner state={b.bState} spent={b.spent} total={b.total} />
              </View>
            )}

            {/* Budget card */}
            <BudgetCard
              trip={b.trip}
              total={b.total}
              spent={b.spent}
              remaining={b.remaining}
              perDay={b.perDay}
              days={b.days}
              expenseCount={b.expenses.length}
              memberCount={b.members.length}
              onSetLimit={(initial) => { b.setBudgetInput(initial); b.setShowBudgetModal(true); }}
            />

            {/* Payment QR shortcuts */}
            <PaymentQrSection
              paymentQrs={b.paymentQrs}
              onShowQr={(qr) => { b.setViewingQr(qr); b.setShowQrModal(true); }}
              onRemoveQr={b.removePaymentQr}
              onAddQr={b.pickPaymentQr}
            />

            {/* Person filter — Group mode */}
            {b.mode === 'group' && b.members.length >= 2 && (
              <PersonFilter
                members={b.members}
                personFilter={b.personFilter}
                spendingByPerson={b.spendingByPerson}
                onSelect={b.setPersonFilter}
              />
            )}

            {/* Categories */}
            {b.spent > 0 && (
              <CategoryBreakdown byCategory={b.expenseSummary.byCategory} spent={b.spent} />
            )}

            {/* Spending by day */}
            {b.spendingByDay.length > 1 && (
              <SpendingByDayChart data={b.spendingByDay} />
            )}

            {/* Expenses */}
            <ExpenseList
              displayExpenses={b.displayExpenses}
              isEmpty={b.expenses.length === 0}
              filteredCount={b.filteredExpenses.length}
              mode={b.mode}
              members={b.members}
              expandedExpense={b.expandedExpense}
              showAllExpenses={b.showAllExpenses}
              onToggleExpense={b.setExpandedExpense}
              onEdit={b.handleEditExpense}
              onDelete={b.handleDeleteExpense}
              onToggleShowAll={() => b.setShowAllExpenses(!b.showAllExpenses)}
            />

            {/* Settle cards — Group mode only */}
            {b.mode === 'group' && b.members.length >= 2 && (
              <SettleUpSection
                members={b.members}
                spendingByPerson={b.spendingByPerson}
                spent={b.spent}
              />
            )}
          </>
        )}

        {/* Fate tab */}
        {b.tab === 'fate' && (
          <View style={styles.section}>
            <Text style={styles.eyebrow}>Who pays?</Text>
            <Text style={[styles.sectionTitle, { fontSize: 22 }]}>Let fate decide</Text>
            <Text style={styles.fateSub}>Spin the wheel or let Touch of Fate pick who pays next.</Text>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/budget/fate-decides'); }}
              style={styles.fateButton}
              accessibilityRole="button"
              accessibilityLabel="Open Fate Decides"
            >
              <Text style={styles.fateButtonText}>Open Fate Decides</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BudgetModals
        showQrModal={b.showQrModal}
        viewingQr={b.viewingQr}
        onCloseQr={() => b.setShowQrModal(false)}
        showQrNameModal={b.showQrNameModal}
        qrNameInput={b.qrNameInput}
        onChangeQrName={b.setQrNameInput}
        onDismissQrName={() => b.setShowQrNameModal(false)}
        onCancelQrName={() => { b.setShowQrNameModal(false); b.setPendingQrUri(null); }}
        onSaveQrName={b.confirmAddQr}
        showBudgetModal={b.showBudgetModal}
        budgetInput={b.budgetInput}
        onChangeBudget={b.setBudgetInput}
        onCancelBudget={() => b.setShowBudgetModal(false)}
        onSaveBudget={b.handleSaveBudget}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const getStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '500', letterSpacing: -0.8, color: c.text },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  eyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', color: c.text3 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  fateSub: { fontSize: 12, color: c.text3, marginTop: 4 },
  fateButton: { marginTop: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.accentBorder, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  fateButtonText: { fontSize: 15, fontWeight: '600', color: c.accent, letterSpacing: 0.5 },
});
