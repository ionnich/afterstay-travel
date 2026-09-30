import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteExpense,
  getActiveTrip,
  getExpenses,
  getExpenseSummary,
  getGroupMembers,
  updateTripBudgetLimit,
} from '@/lib/api';
import { safeParse, MS_PER_DAY } from '@/lib/utils';
import type { Expense, GroupMember, Trip } from '@/lib/types';
import type { BudgetMode, BudgetState, TabId } from '@/components/budget/categories';

export interface PaymentQr {
  label: string;
  uri: string;
}

export function useBudget() {
  const router = useRouter();

  const [mode, setMode] = useState<BudgetMode>('budget');
  const [tab, setTab] = useState<TabId>('overview');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<{ total: number; byCategory: Record<string, number>; count: number }>({ total: 0, byCategory: {}, count: 0 });
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [paymentQrs, setPaymentQrs] = useState<PaymentQr[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewingQr, setViewingQr] = useState<PaymentQr | null>(null);
  const [showQrNameModal, setShowQrNameModal] = useState(false);
  const [pendingQrUri, setPendingQrUri] = useState<string | null>(null);
  const [qrNameInput, setQrNameInput] = useState('');

  // ── Data loading ──
  const load = useCallback(async (force = false) => {
    try {
      const t = await getActiveTrip(force);
      setTrip(t);
      if (t) {
        const [exps, summary, mems] = await Promise.all([
          getExpenses(t.id).catch(() => [] as Expense[]),
          getExpenseSummary(t.id).catch(() => ({ total: 0, byCategory: {}, count: 0 })),
          getGroupMembers(t.id).catch(() => [] as GroupMember[]),
        ]);
        setExpenses(exps);
        setExpenseSummary(summary);
        setMembers(mems);
        // Auto-detect mode
        if (mems.length >= 2) setMode('group');
        else setMode('budget');
      }
    } catch (e) { if (__DEV__) console.warn('[BudgetScreen] load budget data failed:', e); } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Payment QRs (multi-bank) ──
  const qrKey = trip?.id ? `payment_qrs_${trip.id}` : null;

  useEffect(() => {
    if (!qrKey) return;
    AsyncStorage.getItem(qrKey).then((raw) => {
      if (!raw) return;
      try { setPaymentQrs(JSON.parse(raw)); } catch { /* ignore */ }
    });
  }, [qrKey]);

  const saveQrs = useCallback(async (next: PaymentQr[]) => {
    setPaymentQrs(next);
    if (qrKey) await AsyncStorage.setItem(qrKey, JSON.stringify(next));
  }, [qrKey]);

  const pickPaymentQr = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setPendingQrUri(result.assets[0].uri);
    setQrNameInput('');
    setShowQrNameModal(true);
  }, []);

  const confirmAddQr = useCallback(async () => {
    if (!pendingQrUri) return;
    const label = qrNameInput.trim() || 'Payment QR';
    const next = [...paymentQrs, { label, uri: pendingQrUri }];
    await saveQrs(next);
    setPendingQrUri(null);
    setShowQrNameModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [pendingQrUri, qrNameInput, paymentQrs, saveQrs]);

  const removePaymentQr = useCallback((idx: number) => {
    const name = paymentQrs[idx]?.label ?? 'this QR';
    Alert.alert('Remove QR', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        const next = paymentQrs.filter((_, i) => i !== idx);
        saveQrs(next);
      }},
    ]);
  }, [paymentQrs, saveQrs]);

  // ── Derived values ──
  const total = trip?.budgetLimit ?? 0;
  const spent = expenseSummary.total;
  const remaining = total - spent;
  const days = useMemo(() => trip ? Math.max(1, Math.ceil(
    (safeParse(trip.endDate).getTime() - safeParse(trip.startDate).getTime()) / MS_PER_DAY
  ) + 1) : 1, [trip?.startDate, trip?.endDate]);
  const perDay = total > 0 ? Math.round(total / days) : 0;
  const bState: BudgetState = total <= 0 ? 'cruising' : remaining / total > 0.5 ? 'cruising' : remaining / total > 0.2 ? 'low' : 'over';

  const spendingByPerson = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) { map[e.paidBy || 'Unknown'] = (map[e.paidBy || 'Unknown'] ?? 0) + e.amount; }
    return map;
  }, [expenses]);

  const filteredExpenses = useMemo(() =>
    personFilter ? expenses.filter(e => e.paidBy === personFilter || e.splitType === 'Equal') : expenses,
    [expenses, personFilter],
  );

  const spendingByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) { map[e.date] = (map[e.date] ?? 0) + e.amount; }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [expenses]);

  // ── Actions ──
  const handleDeleteExpense = useCallback((id: string, desc: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Expense', `Delete "${desc}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteExpense(id).catch(() => {});
        load(true);
      }},
    ]);
  }, [load]);

  const handleEditExpense = useCallback((e: Expense) => {
    router.push({
      pathname: '/add-expense',
      params: {
        editId: e.id,
        description: e.description,
        amount: String(e.amount),
        currency: e.currency,
        category: e.category,
        date: e.date,
        paidBy: e.paidBy ?? '',
        placeName: e.placeName ?? '',
        notes: e.notes ?? '',
      },
    });
  }, [router]);

  const handleSaveBudget = useCallback(() => {
    const num = parseFloat(budgetInput.replace(/[^0-9.]/g, ''));
    if (!num || !trip) return;
    updateTripBudgetLimit(trip.id, num).catch(() => {});
    setTrip(prev => prev ? { ...prev, budgetLimit: num } : prev);
    setShowBudgetModal(false);
  }, [budgetInput, trip]);

  const displayExpenses = showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 5);

  return {
    // state
    mode,
    setMode,
    tab,
    setTab,
    trip,
    expenses,
    expenseSummary,
    members,
    refreshing,
    setRefreshing,
    personFilter,
    setPersonFilter,
    expandedExpense,
    setExpandedExpense,
    showAllExpenses,
    setShowAllExpenses,
    showBudgetModal,
    setShowBudgetModal,
    budgetInput,
    setBudgetInput,
    paymentQrs,
    showQrModal,
    setShowQrModal,
    viewingQr,
    setViewingQr,
    showQrNameModal,
    setShowQrNameModal,
    pendingQrUri,
    setPendingQrUri,
    qrNameInput,
    setQrNameInput,
    // derived
    total,
    spent,
    remaining,
    perDay,
    days,
    bState,
    spendingByPerson,
    filteredExpenses,
    spendingByDay,
    displayExpenses,
    // actions
    load,
    pickPaymentQr,
    confirmAddQr,
    removePaymentQr,
    handleDeleteExpense,
    handleEditExpense,
    handleSaveBudget,
  };
}
