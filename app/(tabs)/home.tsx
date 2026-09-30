import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Compass } from 'lucide-react-native';

import AfterStayLoader from '@/components/AfterStayLoader';
import { AnticipationHero } from '@/components/home/AnticipationHero';
import { HomeMomentsPreview } from '@/components/home/HomeMomentsPreview';
import { FlightCard } from '@/components/home/FlightCard';
import { PhaseCard, TripPhase } from '@/components/home/PhaseCard';
import { CollapsibleSection, SectionHeader } from '@/components/home/Sections';
import EmptyState from '@/components/shared/EmptyState';
import { FloatingActionButton } from '@/components/shared/FloatingActionButton';
import ProfileRow from '@/components/home/ProfileRow';
import { QuickAccessGrid } from '@/components/home/QuickAccessGrid';
import { WeatherForecastCard } from '@/components/home/WeatherForecastCard';
import { useTheme, ThemeColors } from '@/constants/ThemeContext';
import { spacing } from '@/constants/theme';
import { useTabBarVisibility } from '@/app/(tabs)/_layout';
import { cacheGet, cacheSet } from '@/lib/cache';
import {
  getActiveTrip,
  getExpenses,
  getFlights,
  getGroupMembers,
  getMoments,
} from '@/lib/api';
import type { Flight, GroupMember, Moment, Trip } from '@/lib/types';
import { formatDatePHT, safeParse, MS_PER_DAY } from '@/lib/utils';

// No fallback photos — hero shows gradient when trip has no hotel photos
const FALLBACK_PHOTOS: string[] = [];

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const didInitialLoad = useRef(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const { setVisible: setTabBarVisible } = useTabBarVisibility();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const [phase, setPhase] = useState<TripPhase>('upcoming');
  const [totalSpent, setTotalSpent] = useState(0);
  const [todaySpent, setTodaySpent] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string>();
  const [members, setMembers] = useState<GroupMember[]>([]);

  const load = useCallback(async (force = false) => {
    try {
      setError(undefined);
      let t = await getActiveTrip(force);
      // Retry twice if RLS returned 0 rows (auth token race)
      if (!t && !force) {
        await new Promise(r => setTimeout(r, 800));
        t = await getActiveTrip(true);
      }
      if (!t && !force) {
        await new Promise(r => setTimeout(r, 1500));
        t = await getActiveTrip(true);
      }
      // Only update state if we got a trip — never overwrite cache with null
      if (t) {
        setTrip(t);
        await cacheSet('trip:active', t);
      }
      if (t) {
        const [fs, ms, members] = await Promise.all([
          getFlights(t.id).catch((e) => { if (__DEV__) console.warn('[Home] flights error:', e); return [] as Flight[]; }),
          getMoments(t.id).catch((e) => { if (__DEV__) console.warn('[Home] moments error:', e); return [] as Moment[]; }),
          getGroupMembers(t.id).catch((e) => { if (__DEV__) console.warn('[Home] members error:', e); return [] as GroupMember[]; }),
        ]);
        if (__DEV__) console.log(`[Home] loaded: ${fs.length} flights, ${ms.length} moments, ${members.length} members`);
        setFlights(fs);
        setMoments(ms);
        setMembers(members);
        await cacheSet(`flights:${t.id}`, fs);

        const primary = members.find((m) => m.role === 'Primary');
        if (primary) {
          setUserName(primary.name);
          if (primary.profilePhoto) setUserAvatar(primary.profilePhoto);
        }

        // Compute trip phase from flight data
        const outbound = fs.find((f) => f.direction === 'Outbound');
        if (outbound) {
          const departMs = safeParse(outbound.departTime).getTime();
          const arriveMs = safeParse(outbound.arriveTime).getTime();
          const nowMs = Date.now();

          // Clear stale phase override if trip changed
          const cachedTripId = await cacheGet<string>('trip:phase:tripId');
          if (cachedTripId && cachedTripId !== t.id) {
            await cacheSet('trip:phase:override', null);
          }
          await cacheSet('trip:phase:tripId', t.id);

          const override = await cacheGet<TripPhase>('trip:phase:override');
          // Only use override if it makes sense for current time
          // (e.g., don't stay "upcoming" if flight already departed)
          const computedPhase: TripPhase =
            nowMs < departMs ? 'upcoming' :
            nowMs < arriveMs ? 'inflight' :
            nowMs < arriveMs + 4 * 3600000 ? 'arrived' : 'active';

          if (override && override === computedPhase) {
            setPhase(override);
          } else if (override) {
            // Override is stale — clear it and use computed
            await cacheSet('trip:phase:override', null);
            setPhase(computedPhase);
          } else if (nowMs < departMs) {
            setPhase('upcoming');
          } else if (nowMs >= departMs && nowMs < arriveMs) {
            setPhase('inflight');
          } else if (nowMs >= arriveMs && nowMs < arriveMs + 4 * 3600000) {
            setPhase('arrived');
          } else {
            setPhase('active');
          }
        }

        // Fetch expenses once — compute summary + today's totals locally
        const allExpenses = await getExpenses(t.id).catch(() => []);
        setTotalSpent(allExpenses.reduce((sum, e) => sum + e.amount, 0));

        const todayIso = new Date().toISOString().slice(0, 10);
        const todayExps = allExpenses.filter((e) => e.date === todayIso);
        setTodaySpent(todayExps.reduce((sum, e) => sum + e.amount, 0));
        setTodayCount(todayExps.length);
        // If no outbound flight, determine phase from trip dates
        if (!outbound) {
          const tripStart = safeParse(t.startDate).getTime();
          const daysAway = (tripStart - Date.now()) / MS_PER_DAY;
          setPhase(daysAway > 7 ? 'planning' : 'upcoming');
        }
      } else {
        setFlights([]);
        setMoments([]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to load trip');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    load();
    didInitialLoad.current = true;
    return () => { alive = false; };
  }, [load]);

  // Refresh budget + trip data when tab gets focus (e.g. after editing budget)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!didInitialLoad.current) return; // skip first mount
      const tripId = trip?.id;
      if (!tripId) return;
      // Lightweight refresh — just expenses + trip (for budgetLimit changes)
      Promise.all([
        getActiveTrip(),
        getExpenses(tripId).catch(() => []),
      ]).then(([freshTrip, allExpenses]) => {
        if (freshTrip) setTrip(freshTrip);
        setTotalSpent(allExpenses.reduce((sum, e) => sum + e.amount, 0));
        const todayIso = new Date().toISOString().slice(0, 10);
        const todayExps = allExpenses.filter((e) => e.date === todayIso);
        setTodaySpent(todayExps.reduce((sum, e) => sum + e.amount, 0));
        setTodayCount(todayExps.length);
      }).catch(() => {});
    });
    return unsubscribe;
  }, [navigation, trip?.id]);

  // Always show branded loader for at least 3 seconds on cold start
  useEffect(() => {
    if (!loading) return;
    setShowLoader(true);
    // Minimum 3s loader — ensures fresh data arrives before content shows
    const t = setTimeout(() => setLoaderDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Hide tab bar during initial load
  useEffect(() => {
    const isInitialLoading = loading || (showLoader && !loaderDone);
    setTabBarVisible(!isInitialLoading);
  }, [loading, showLoader, loaderDone, setTabBarVisible]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const boardFlight = useCallback(async () => {
    setPhase('inflight');
    await cacheSet('trip:phase:override', 'inflight');
  }, []);

  const landFlight = useCallback(async () => {
    setPhase('arrived');
    await cacheSet('trip:phase:override', 'arrived');
  }, []);

  const goExplore = useCallback(async () => {
    setPhase('active');
    await cacheSet('trip:phase:override', 'active');
  }, []);

  // Hero gallery photos — must be above early returns (hooks order)
  const hotelPhotos = useMemo<string[]>(() => {
    if (!trip?.hotelPhotos) return FALLBACK_PHOTOS;
    try {
      const parsed = JSON.parse(trip.hotelPhotos);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : FALLBACK_PHOTOS;
    } catch {
      return FALLBACK_PHOTOS;
    }
  }, [trip?.hotelPhotos]);

  // Date range label
  const dateRange = useMemo(
    () => trip ? `${formatDatePHT(trip.startDate)} \u2013 ${formatDatePHT(trip.endDate)}` : '',
    [trip?.startDate, trip?.endDate],
  );

  // Countdown computation
  const tripStartMs = trip ? safeParse(trip.startDate).getTime() : 0;
  const tripEndMs = trip ? safeParse(trip.endDate).getTime() : 0;
  const nowMs = Date.now();
  const totalNights = Math.max(
    1,
    tripStartMs && tripEndMs ? Math.ceil((tripEndMs - tripStartMs) / MS_PER_DAY) : 1,
  );
  const totalDays = totalNights;

  const countdown = useMemo(() => {
    if (!tripStartMs) return { status: 'upcoming' as const, totalDays };
    if (nowMs < tripStartMs) {
      return { status: 'upcoming' as const, totalDays };
    }
    if (nowMs > tripEndMs + MS_PER_DAY) {
      return { status: 'completed' as const, totalDays };
    }
    const dayNumber = Math.floor((nowMs - tripStartMs) / MS_PER_DAY) + 1;
    return { status: 'active' as const, dayNumber, totalDays };
  }, [nowMs, tripStartMs, tripEndMs, totalDays]);

  // Quick access tiles
  const quickAccessTiles = useMemo(() => [
    { id: 'checkin', iconName: 'checkin', label: 'Check-in', value: trip?.checkIn || '3:00 PM' },
    { id: 'checkout', iconName: 'checkout', label: 'Checkout', value: trip?.checkOut || '12:00 PM' },
    { id: 'wifi', iconName: 'wifi', label: 'WiFi', value: trip?.wifiSsid || 'Not set' },
    { id: 'door', iconName: 'door', label: 'Door code', value: trip?.doorCode ? '\u2022\u2022\u2022\u2022' : '\u2014' },
  ], [trip?.checkIn, trip?.checkOut, trip?.wifiSsid, trip?.doorCode]);

  // Room info
  const roomInfo = useMemo(
    () => trip?.roomType
      ? `${trip.roomType} × 2 · ${totalNights} nights · ${dateRange}`
      : undefined,
    [trip?.roomType, totalNights, dateRange],
  );

  // Show branded loader until both: 3s minimum passed AND data loaded
  if (!loaderDone || loading) {
    return <AfterStayLoader />;
  }

  if (!trip) {
    // Actual network error — show retry
    if (error) {
      return (
        <SafeAreaView style={styles.fullCenter}>
          <Text style={styles.errorTitle}>Couldn't load trip</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retry}
            onPress={() => {
              setLoading(true);
              load();
            }}
            accessibilityLabel="Retry loading trip"
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
    // No trip — welcoming empty state
    return (
      <SafeAreaView style={styles.fullCenter}>
        <EmptyState
          icon={Compass}
          title="Your next adventure starts here"
          subtitle="Create a trip to unlock your dashboard — add flights, budget, places, and more."
          actionLabel="Get Started"
          onAction={() => router.push('/onboarding')}
          secondaryLabel="Join a friend's trip"
          onSecondary={() => router.push('/onboarding')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentLt}
          />
        }
      >
        {/* 1. Top bar */}
        <ProfileRow userName={userName} avatarUrl={userAvatar} tripLabel={trip.destination ? `${trip.destination} trip` : undefined} />

        {/* 2. Hero slideshow */}
        <AnticipationHero
          photos={hotelPhotos}
          hotelName={trip.accommodation}
          destination={trip.destination || ''}
          dateRange={dateRange}
          verified={true}
          roomInfo={roomInfo}
          bookingRef={trip.bookingRef ? `Agoda #${trip.bookingRef}` : undefined}
          members={members}
        />

        {/* 3. Phase card */}
        <View style={styles.phaseSection}>
          <Animated.View
            key={phase}
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(200)}
          >
            <PhaseCard
              phase={phase}
              trip={trip}
              flights={flights}
              countdown={countdown}
              totalSpent={totalSpent}
              todaySpent={todaySpent}
              todayCount={todayCount}
              onBoard={boardFlight}
              onLanded={landFlight}
              onStart={goExplore}
            />
          </Animated.View>
        </View>

        {/* 4. Moments preview — first after trip card */}
        <SectionHeader
          kicker={`Moments · Day ${countdown.status === 'active' ? countdown.dayNumber ?? 1 : 1}`}
          title="Trip so far"
        />
        <HomeMomentsPreview
          moments={moments}
          members={members}
          onViewAll={() => router.push('/moments-slideshow' as never)}
        />

        {/* 5. Weather — collapsible */}
        <CollapsibleSection
          kicker="Weather"
          title={phase === 'active'
            ? `${trip.destination ?? 'Destination'} right now`
            : `${trip.destination ?? 'Destination'} this week`}
        >
          <WeatherForecastCard destination={trip.destination} />
        </CollapsibleSection>

        {/* 6. Flight card */}
        {(() => {
          const activeFlight = phase === 'active'
            ? flights.find((f) => f.direction === 'Return')
            : flights.find((f) => f.direction === 'Outbound');
          const dirLabel = phase === 'active' ? 'Return' : 'Outbound';
          const destCity = activeFlight?.to ?? (phase === 'active' ? 'Home' : trip.destination ?? 'Destination');
          return (
            <>
              <SectionHeader
                kicker={`Transit · ${dirLabel}`}
                title={`Flight to ${destCity}`}
              />
              <FlightCard
                flight={activeFlight}
                direction={phase === 'active' ? 'return' : 'outbound'}
              />
            </>
          );
        })()}

        {/* 7. Quick access — collapsible */}
        <CollapsibleSection
          kicker="Stay · Quick access"
          title="Everything for check-in"
          defaultOpen={false}
        >
          <QuickAccessGrid tiles={quickAccessTiles} />
        </CollapsibleSection>

        {/* Bottom spacer — tall enough to scroll past FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>
      <FloatingActionButton />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    fullCenter: {
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
    },
    errorTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
    errorText: { color: colors.text2, fontSize: 13, textAlign: 'center' },
    retry: {
      marginTop: spacing.md,
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 16,
    },
    retryText: { color: colors.white, fontWeight: '700' },
    phaseSection: {
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
  });
