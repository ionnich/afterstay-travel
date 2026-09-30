import { useRouter } from 'expo-router';
import {
  Bed,
  CheckSquare,
  ChevronLeft,
  DollarSign,
  MapPin,
  Plane,
  Luggage,
  Users,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, ThemeColors } from '@/constants/ThemeContext';
import { radius, spacing, typography } from '@/constants/theme';
import {
  getActiveTrip,
  getChecklist,
  getExpenses,
  getFlights,
  getGroupMembers,
  getPackingList,
  getSavedPlaces,
} from '@/lib/api';
import type {
  ChecklistItem,
  Expense,
  Flight,
  GroupMember,
  PackingItem,
  Place,
  Trip,
} from '@/lib/types';
import { safeParse, MS_PER_DAY } from '@/lib/utils';
import {
  CollapsibleCard,
  CopyRow,
  EditableInfoRow,
  ProgressBar,
  SimpleCard,
} from '@/components/trip-overview/cards';

// ---------- helpers ----------

function formatDate(iso: string): string {
  if (!iso) return '—';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = safeParse(iso);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const pht = new Date(utcMs + 8 * 60 * 60 * 1000);
  return `${MONTHS[pht.getMonth()]} ${pht.getDate()}`;
}

function formatTime(iso: string): string {
  if (!iso) return '—';
  const d = safeParse(iso);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const pht = new Date(utcMs + 8 * 60 * 60 * 1000);
  let h = pht.getHours();
  const m = pht.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getCountdown(startDate: string, endDate: string): string {
  const now = new Date();
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  if (now >= start && now <= end) return 'Trip in progress!';
  if (now > end) return 'Trip completed';
  const diffMs = start.getTime() - now.getTime();
  const days = Math.ceil(diffMs / MS_PER_DAY);
  if (days === 1) return '1 day to go!';
  return `${days} days to go!`;
}

function progressColor(pct: number, colors: any): string {
  if (pct >= 80) return colors.green;
  if (pct >= 50) return colors.amber;
  return colors.red;
}

// ---------- main screen ----------

interface OverviewData {
  trip: Trip;
  flights: Flight[];
  members: GroupMember[];
  packing: PackingItem[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  places: Place[];
}

export default function TripOverviewScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setError(undefined);
      const trip = await getActiveTrip();
      if (!trip) {
        setError('No active trip found.');
        return;
      }
      const [flights, members, packing, expenses, checklist, places] = await Promise.all([
        getFlights(trip.id).catch(() => [] as Flight[]),
        getGroupMembers(trip.id).catch(() => [] as GroupMember[]),
        getPackingList(trip.id).catch(() => [] as PackingItem[]),
        getExpenses(trip.id).catch(() => [] as Expense[]),
        getChecklist(trip.id).catch(() => [] as ChecklistItem[]),
        getSavedPlaces(trip.id).catch(() => [] as Place[]),
      ]);
      setData({ trip, flights, members, packing, expenses, checklist, places });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.green2} />
        <Text style={styles.loadingText}>Loading overview...</Text>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Could not load overview</Text>
        <Text style={styles.errorText}>{error ?? 'Unknown error'}</Text>
        <Pressable style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { trip, flights, members, packing, expenses, checklist, places } = data;

  const updateField = (field: keyof Trip, newValue: string) => {
    setData({ ...data, trip: { ...trip, [field]: newValue } });
  };

  // derived
  const outbound = flights.find(f => f.direction === 'Outbound');
  const returnFlight = flights.find(f => f.direction === 'Return');
  const packedCount = packing.filter(p => p.packed).length;
  const packPct = packing.length > 0 ? Math.round((packedCount / packing.length) * 100) : 0;
  const doneCount = checklist.filter(c => c.done).length;
  const checkPct = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryCounts: Record<string, number> = {};
  for (const e of expenses) {
    categoryCounts[e.category] = (categoryCounts[e.category] ?? 0) + e.amount;
  }
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const placeCategoryCounts: Record<string, number> = {};
  for (const p of places) {
    placeCategoryCounts[p.category] = (placeCategoryCounts[p.category] ?? 0) + 1;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 10 }}>Trip Overview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SimpleCard>
          <Text style={styles.destination}>{trip.destination || trip.name}</Text>
          <Text style={styles.dateRange}>
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}  ·  {trip.nights} night{trip.nights !== 1 ? 's' : ''}
          </Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{getCountdown(trip.startDate, trip.endDate)}</Text>
          </View>
        </SimpleCard>

        {/* Accommodation */}
        {trip.accommodation ? (
          <CollapsibleCard icon={<Bed size={18} color={colors.purple} />} title="Accommodation">
            <Text style={styles.accomName}>{trip.accommodation}</Text>
            {trip.address ? <Text style={styles.accomAddress}>{trip.address}</Text> : null}
            <View style={styles.divider} />
            <EditableInfoRow label="Check-in" value={trip.checkIn ?? ''} notionKey="Check-in Time" tripId={trip.id} onUpdate={v => updateField('checkIn', v)} />
            <EditableInfoRow label="Check-out" value={trip.checkOut ?? ''} notionKey="Check-out Time" tripId={trip.id} onUpdate={v => updateField('checkOut', v)} />
            <EditableInfoRow label="Room" value={trip.roomType} notionKey="Room Type" tripId={trip.id} onUpdate={v => updateField('roomType', v)} />
            <CopyRow label="Booking ref" value={trip.bookingRef ?? ''} notionKey="Booking Ref" tripId={trip.id} onUpdate={v => updateField('bookingRef', v)} />
            <CopyRow label="WiFi" value={trip.wifiSsid ?? ''} notionKey="WiFi Network" tripId={trip.id} onUpdate={v => updateField('wifiSsid', v)} />
            <CopyRow label="Password" value={trip.wifiPassword ?? ''} notionKey="WiFi Password" tripId={trip.id} onUpdate={v => updateField('wifiPassword', v)} />
            <CopyRow label="Door code" value={trip.doorCode ?? ''} notionKey="Door Code" tripId={trip.id} onUpdate={v => updateField('doorCode', v)} />
          </CollapsibleCard>
        ) : null}

        {/* Flights */}
        {flights.length > 0 ? (
          <CollapsibleCard icon={<Plane size={18} color={colors.blue} />} title="Flights">
            {outbound ? (
              <View style={styles.flightRow}>
                <Text style={styles.flightDir}>OUT</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flightRoute}>
                    {outbound.from} → {outbound.to}
                  </Text>
                  <Text style={styles.flightMeta}>
                    {outbound.flightNumber}  ·  {formatDate(outbound.departTime)} {formatTime(outbound.departTime)}
                  </Text>
                </View>
              </View>
            ) : null}
            {returnFlight ? (
              <View style={[styles.flightRow, { marginTop: spacing.sm }]}>
                <Text style={[styles.flightDir, { backgroundColor: colors.amber + '20', color: colors.amber }]}>RET</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flightRoute}>
                    {returnFlight.from} → {returnFlight.to}
                  </Text>
                  <Text style={styles.flightMeta}>
                    {returnFlight.flightNumber}  ·  {formatDate(returnFlight.departTime)} {formatTime(returnFlight.departTime)}
                  </Text>
                </View>
              </View>
            ) : null}
          </CollapsibleCard>
        ) : null}

        {/* Group */}
        {members.length > 0 ? (
          <CollapsibleCard icon={<Users size={18} color={colors.green2} />} title={`Group (${members.length})`}>
            <View style={styles.memberList}>
              {members.map(m => (
                <View key={m.id} style={styles.memberChip}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  {m.role === 'Primary' ? (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>Primary</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </CollapsibleCard>
        ) : null}

        {/* Packing */}
        {packing.length > 0 ? (
          <CollapsibleCard icon={<Luggage size={18} color={colors.amber} />} title="Packing" defaultOpen={false}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {packedCount} of {packing.length} packed
              </Text>
              <Text style={[styles.progressPct, { color: progressColor(packPct, colors) }]}>{packPct}%</Text>
            </View>
            <ProgressBar pct={packPct} color={progressColor(packPct, colors)} />
          </CollapsibleCard>
        ) : null}

        {/* Budget */}
        {expenses.length > 0 ? (
          <CollapsibleCard icon={<DollarSign size={18} color={colors.green} />} title="Budget" defaultOpen={false}>
            <Text style={styles.budgetTotal}>
              {expenses[0]?.currency ?? 'PHP'} {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.budgetMeta}>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              {topCategory ? `  ·  Top: ${topCategory[0]}` : ''}
            </Text>
          </CollapsibleCard>
        ) : null}

        {/* Checklist */}
        {checklist.length > 0 ? (
          <CollapsibleCard icon={<CheckSquare size={18} color={colors.green2} />} title="Checklist" defaultOpen={false}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {doneCount} of {checklist.length} done
              </Text>
              <Text style={[styles.progressPct, { color: progressColor(checkPct, colors) }]}>{checkPct}%</Text>
            </View>
            <ProgressBar pct={checkPct} color={progressColor(checkPct, colors)} />
          </CollapsibleCard>
        ) : null}

        {/* Places */}
        {places.length > 0 ? (
          <CollapsibleCard icon={<MapPin size={18} color={colors.pink} />} title={`Saved Places (${places.length})`} defaultOpen={false}>
            <View style={styles.placeCategories}>
              {Object.entries(placeCategoryCounts).map(([cat, count]) => (
                <View key={cat} style={styles.placeCatChip}>
                  <Text style={styles.placeCatText}>
                    {cat}: {count}
                  </Text>
                </View>
              ))}
            </View>
          </CollapsibleCard>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- styles ----------

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  loadingText: { color: colors.text2, fontSize: 13 },
  errorTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  errorText: { color: colors.text2, fontSize: 13, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  retryText: { color: colors.white, fontWeight: '700' },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + 16,
    gap: spacing.md,
  },

  // trip header
  destination: { ...typography.h1, color: colors.text },
  dateRange: { color: colors.text2, fontSize: 14, marginTop: spacing.xs },
  countdownBadge: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  countdownText: { color: colors.green2, fontSize: 14, fontWeight: '700' },

  // accommodation
  accomName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  accomAddress: { color: colors.text2, fontSize: 13, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // flights
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flightDir: {
    backgroundColor: colors.blue + '20',
    color: colors.blue,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  flightRoute: { color: colors.text, fontSize: 14, fontWeight: '600' },
  flightMeta: { color: colors.text2, fontSize: 12, marginTop: 2 },

  // group
  memberList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  memberName: { color: colors.text, fontSize: 13, fontWeight: '500' },
  roleBadge: {
    backgroundColor: colors.purple + '30',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  roleBadgeText: { color: colors.purple, fontSize: 10, fontWeight: '700' },

  // progress
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: { color: colors.text2, fontSize: 13 },
  progressPct: { fontSize: 15, fontWeight: '700' },

  // budget
  budgetTotal: { color: colors.text, fontSize: 22, fontWeight: '700' },
  budgetMeta: { color: colors.text2, fontSize: 13, marginTop: 2 },

  // places
  placeCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  placeCatChip: {
    backgroundColor: colors.bg3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  placeCatText: { color: colors.text2, fontSize: 12, fontWeight: '500' },
});
