import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { ArrowLeft, Hotel } from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@/constants/ThemeContext';
import EmptyState from '@/components/shared/EmptyState';
import { PropertyTab } from '@/components/guide/PropertyTab';
import { NearbyTab } from '@/components/guide/NearbyTab';
import { NotesTab } from '@/components/guide/NotesTab';
import { PROPERTY, HOTEL_PHOTO } from '@/components/guide/guideConstants';
import type { ThemeColors } from '@/components/guide/guideConstants';
import { getActiveTrip } from '@/lib/api';
import { formatDatePHT } from '@/lib/utils';
import type { Trip } from '@/lib/types';

type TabId = 'property' | 'nearby' | 'notes';

export default function GuideScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [tab, setTab] = useState<TabId>('property');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrip = useCallback((force = false) => {
    getActiveTrip(force).then((t) => { if (t) setTrip(t); }).catch((e) => { if (__DEV__) console.warn('[GuideScreen] load active trip failed:', e); }).finally(() => setRefreshing(false));
  }, []);

  useEffect(() => { loadTrip(); }, [loadTrip]);

  // Canyon Hotels backward compat — show hardcoded data only for Canyon trips
  const isCanyon = trip?.accommodation?.toLowerCase().includes('canyon') ?? false;
  const hasAccommodation = !!(trip?.accommodation);

  const hotelName = hasAccommodation ? trip!.accommodation : (isCanyon ? PROPERTY.name : '');
  const hotelAddr = trip?.address ?? (isCanyon ? PROPERTY.desc : '');
  const checkInTime = trip?.checkIn ?? (isCanyon ? PROPERTY.checkIn : '');
  const checkOutTime = trip?.checkOut ?? (isCanyon ? PROPERTY.checkOut : '');
  const destLabel = trip?.destination ?? '';
  const checkInDate = trip ? formatDatePHT(trip.startDate) : '';
  const checkOutDate = trip ? formatDatePHT(trip.endDate) : '';

  const hotelPhotoUrl = (() => {
    if (!trip?.hotelPhotos) return HOTEL_PHOTO;
    try {
      const parsed = JSON.parse(trip.hotelPhotos);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : HOTEL_PHOTO;
    } catch {
      return HOTEL_PHOTO;
    }
  })();

  // No trip at all — show empty state
  if (!trip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Guide</Text>
          </View>
        </View>
        <EmptyState
          icon={Hotel}
          title="No trip yet"
          subtitle="Create a trip to see your property guide, nearby essentials, and group notes."
          actionLabel="Get Started"
          onAction={() => router.push('/onboarding')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Guide</Text>
          <Text style={styles.subtitle}>{hotelName || destLabel} {hotelName && destLabel ? `\u00B7 ${destLabel}` : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityLabel="Search"
          accessibilityRole="button"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          activeOpacity={0.7}
        >
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Circle cx={11} cy={11} r={8} />
            <Line x1={21} y1={21} x2={16.6} y2={16.6} />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={styles.segWrapper}>
        <View style={styles.seg}>
          {(['property', 'nearby', 'notes'] as const).map((id) => {
            const label =
              id === 'property'
                ? 'Property'
                : id === 'nearby'
                  ? 'Nearby'
                  : 'Notes';
            return (
              <TouchableOpacity
                key={id}
                style={[styles.segBtn, tab === id && styles.segBtnActive]}
                onPress={() => {
                  setTab(id);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.segText, tab === id && styles.segTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTrip(true); }} tintColor={colors.accent} />}
      >
        {/* ═══════ PROPERTY TAB ═══════ */}
        {tab === 'property' && (
          <PropertyTab
            colors={colors}
            hotelName={hotelName}
            hotelAddr={hotelAddr}
            checkInTime={checkInTime}
            checkOutTime={checkOutTime}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            hotelPhotoUrl={hotelPhotoUrl}
            trip={trip}
            hasAccommodation={hasAccommodation}
            isCanyon={isCanyon}
            onAddHotel={() => router.push('/(tabs)/trip')}
          />
        )}

        {/* ═══════ NEARBY TAB ═══════ */}
        {tab === 'nearby' && (
          <NearbyTab colors={colors} hotelName={hotelName} trip={trip} isCanyon={isCanyon} />
        )}

        {/* ═══════ NOTES TAB ═══════ */}
        {tab === 'notes' && (
          <NotesTab colors={colors} isCanyon={isCanyon} />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: -0.66,
      color: colors.text,
    },
    subtitle: {
      fontSize: 11,
      color: colors.text3,
      letterSpacing: 1.76,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: 2,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Segmented control
    segWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    seg: {
      flexDirection: 'row',
      padding: 3,
      backgroundColor: colors.card2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      gap: 2,
    },
    segBtn: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 9,
      alignItems: 'center',
    },
    segBtnActive: {
      backgroundColor: colors.card,
    },
    segText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text3,
      letterSpacing: -0.12,
    },
    segTextActive: {
      color: colors.text,
    },
  });
