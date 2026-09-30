import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight, CheckCircle, Hotel, MapPin, Plane, Wifi } from 'lucide-react-native';
import { ThemeColors } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import { joinTripByCode } from '@/lib/api';
import { formatDatePHT } from '@/lib/utils';
import type { Trip } from '@/lib/types';
import { BrandRow, FieldLabel, GhostBtn, Header, Input, PrimaryBtn, shared } from './shared';

export function InvitedFlow({ onBack, onDone, colors }: { onBack: () => void; onDone: (data: any) => void; colors: ThemeColors }) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [tripInfo, setTripInfo] = useState<Trip | null>(null);
  const [joining, setJoining] = useState(false);
  const [flightNum, setFlightNum] = useState('');
  const [airline, setAirline] = useState('');
  const [checkedBag, setCheckedBag] = useState<boolean | null>(null);
  const { user } = useAuth();
  const name = user?.name ?? user?.email?.split('@')[0] ?? '';

  const AIRLINES = ['Philippine Airlines', 'Cebu Pacific', 'AirAsia', 'Other'];

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    try {
      const result = await joinTripByCode(code.trim(), name);
      setTripInfo(result.trip);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(1);
    } catch (e: any) {
      Alert.alert('Could not join', e?.message ?? 'Invalid or expired code');
    } finally {
      setJoining(false);
    }
  };

  if (step === 0) {
    return (
      <ScrollView contentContainerStyle={shared.scrollContent}>
        <BrandRow step={1} of={2} colors={colors} />
        <Header onBack={onBack} kicker="Invited — 1 of 2" title="Enter your invite code." sub="The trip organizer shared a 6-character code with you." colors={colors} />
        <View style={shared.section}>
          <FieldLabel label="Invite Code" colors={colors} />
          <Input value={code} onChange={(t) => setCode(t.toUpperCase())} placeholder="e.g. A1B2C3" colors={colors} autoFocus />
          <PrimaryBtn onPress={handleJoin} disabled={code.trim().length < 4 || joining} colors={colors}>
            {joining ? <ActivityIndicator color={colors.onBlack} size="small" /> : (
              <>
                <Text style={[shared.primaryText, { color: code.trim().length < 4 ? colors.text3 : colors.onBlack }]}>Join trip</Text>
                <ArrowRight size={14} color={code.trim().length < 4 ? colors.text3 : colors.onBlack} strokeWidth={2} />
              </>
            )}
          </PrimaryBtn>
        </View>
      </ScrollView>
    );
  }

  // Step 1 — show trip details + add flight
  const INFO_ROWS = tripInfo ? [
    { icon: Hotel, label: 'Hotel', val: tripInfo.accommodation || 'TBD' },
    { icon: MapPin, label: 'Destination', val: tripInfo.destination },
    { icon: Plane, label: 'Dates', val: `${formatDatePHT(tripInfo.startDate)} – ${formatDatePHT(tripInfo.endDate)}` },
    { icon: Wifi, label: 'WiFi & house rules', val: 'Shared on arrival' },
  ] : [];

  return (
    <ScrollView contentContainerStyle={shared.scrollContent} keyboardShouldPersistTaps="handled">
      <BrandRow step={2} of={2} colors={colors} />
      <Header onBack={() => setStep(0)} kicker="Invited — 2 of 2" title="You're on the list." sub="Review the shared trip, then add your flight." colors={colors} />
      <View style={shared.section}>
        {/* Trip card */}
        <View style={[shared.tripCard, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
          <Text style={[shared.tripCardLabel, { color: colors.accent }]}>SHARED TRIP</Text>
          <Text style={[shared.tripCardDest, { color: colors.text }]}>{tripInfo?.destination ?? ''}</Text>
          <Text style={[shared.tripCardDates, { color: colors.text2 }]}>
            {tripInfo ? `${formatDatePHT(tripInfo.startDate)} – ${formatDatePHT(tripInfo.endDate)}` : ''}
          </Text>
        </View>

        {/* Already set up */}
        <FieldLabel label="Already set up for you" colors={colors} />
        <View style={[shared.infoList, { borderColor: colors.border }]}>
          {INFO_ROWS.map((r, i) => (
            <View key={i} style={[shared.infoRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <r.icon size={16} color={colors.accent} strokeWidth={1.8} />
              <View style={{ flex: 1 }}>
                <Text style={[shared.infoLabel, { color: colors.text }]}>{r.label}</Text>
                <Text style={[shared.infoVal, { color: colors.text3 }]}>{r.val}</Text>
              </View>
              <CheckCircle size={14} color={colors.accent} strokeWidth={2} />
            </View>
          ))}
        </View>

        {/* Flight */}
        <View style={{ height: 10 }} />
        <FieldLabel label="Your flight (optional)" colors={colors} />
        <View style={shared.chipRow}>
          {AIRLINES.map(a => (
            <TouchableOpacity
              key={a}
              onPress={() => setAirline(a)}
              style={[shared.chip, { backgroundColor: airline === a ? colors.accentBg : colors.card, borderColor: airline === a ? colors.accentBorder : colors.border }]}
            >
              <Text style={[shared.chipText, { color: airline === a ? colors.accent : colors.text2 }]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input value={flightNum} onChange={setFlightNum} placeholder="5J 891" prefix="✈" colors={colors} />

        <FieldLabel label="Checked baggage" colors={colors} />
        <View style={shared.bagRow}>
          {[
            { id: true, label: 'Yes, checking bags' },
            { id: false, label: 'Carry-on only' },
          ].map(o => (
            <TouchableOpacity
              key={String(o.id)}
              onPress={() => setCheckedBag(o.id)}
              style={[shared.bagBtn, { backgroundColor: checkedBag === o.id ? colors.accentBg : colors.card, borderColor: checkedBag === o.id ? colors.accent : colors.border }]}
            >
              <Text style={[shared.bagText, { color: checkedBag === o.id ? colors.accent : colors.text2 }]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryBtn
          onPress={() => onDone({ kind: 'invited', tripId: tripInfo?.id, flightNum, airline, checkedBag })}
          colors={colors}
        >
          <Text style={[shared.primaryText, { color: colors.onBlack }]}>Join the trip</Text>
          <ArrowRight size={14} color={colors.onBlack} strokeWidth={2} />
        </PrimaryBtn>
        <GhostBtn label="I'll add my flight later" onPress={() => onDone({ kind: 'invited', tripId: tripInfo?.id, skipped: true })} />
      </View>
    </ScrollView>
  );
}
