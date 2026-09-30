import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import { cacheSet } from '@/lib/cache';
import {
  addFlight,
  createTrip,
} from '@/lib/api';
import { MS_PER_DAY } from '@/lib/utils';
import type { Path } from '@/components/onboarding/shared';
import { PathPicker } from '@/components/onboarding/PathPicker';
import { PlanFlow } from '@/components/onboarding/PlanFlow';
import { UploadFlow } from '@/components/onboarding/UploadFlow';
import { InvitedFlow } from '@/components/onboarding/InvitedFlow';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'traveler';

  const [path, setPath] = useState<Path>(null);

  const finish = useCallback(async (payload: any) => {
    try {
      // Clear old cache before setting up new trip
      await cacheSet('trip:active', null);
      await cacheSet('trip:phase:override', null);

      if (payload.kind === 'plan') {
        const today = new Date();
        const startDate = new Date(today.getTime() + 30 * MS_PER_DAY).toISOString().slice(0, 10);
        const endDate = new Date(today.getTime() + 37 * MS_PER_DAY).toISOString().slice(0, 10);
        await createTrip({
          name: `Trip to ${payload.dest}`,
          destination: payload.dest,
          startDate,
          endDate,
        });
      } else if (payload.kind === 'upload' && payload.scanned) {
        const s = payload.scanned;
        if (!s.destination || !s.startDate || !s.endDate) {
          Alert.alert('Missing info', 'Could not read destination or dates from your screenshots. Try again or plan manually.');
          return;
        }
        const tripId = await createTrip({
          name: `Trip to ${s.destination}`,
          destination: s.destination,
          startDate: s.startDate,
          endDate: s.endDate,
          members: s.members,
          accommodation: s.accommodation,
          address: s.address,
          checkIn: s.checkIn,
          checkOut: s.checkOut,
          roomType: s.roomType,
          bookingRef: s.bookingRef,
          cost: s.cost,
          costCurrency: s.costCurrency,
        });
        // Insert scanned flights
        if (s.flights?.length > 0) {
          for (const f of s.flights) {
            await addFlight({
              tripId,
              direction: f.direction || 'Outbound',
              flightNumber: f.flightNumber,
              airline: f.airline,
            }).catch(() => {}); // Don't block trip creation on flight insert failure
          }
        }
      } else if (payload.kind === 'invited' && !payload.skipped && payload.flightNum && payload.tripId) {
        await addFlight({
          tripId: payload.tripId,
          direction: 'Outbound',
          flightNumber: payload.flightNum,
          airline: payload.airline || undefined,
        });
      }

      await cacheSet('onboarding_complete', true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home' as never);
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.message ?? 'Could not set up your trip. Please try again.');
    }
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      {!path && <PathPicker onPick={setPath} onSkip={() => { cacheSet('onboarding_complete', true); router.replace('/(tabs)/home' as never); }} name={firstName} colors={colors} />}
      {path === 'plan' && <PlanFlow onBack={() => setPath(null)} onDone={finish} colors={colors} />}
      {path === 'upload' && <UploadFlow onBack={() => setPath(null)} onDone={finish} colors={colors} />}
      {path === 'invited' && <InvitedFlow onBack={() => setPath(null)} onDone={finish} colors={colors} />}
    </SafeAreaView>
  );
}
