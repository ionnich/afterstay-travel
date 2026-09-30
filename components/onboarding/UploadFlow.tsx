import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ArrowRight, Camera, CheckCircle, FileText, Hotel, Plane } from 'lucide-react-native';
import { ThemeColors } from '@/constants/ThemeContext';
import { compressImage } from '@/lib/compressImage';
import { scanTripDocuments } from '@/lib/api';
import { formatDatePHT } from '@/lib/utils';
import { BrandRow, FieldLabel, GhostBtn, Header, PrimaryBtn, shared } from './shared';

export function UploadFlow({ onBack, onDone, colors }: { onBack: () => void; onDone: (data: any) => void; colors: ThemeColors }) {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<any>(null);

  const CHECKLIST = [
    { icon: Plane, title: 'Flight confirmations', sub: 'Booking emails, boarding passes.' },
    { icon: Hotel, title: 'Hotel bookings', sub: 'From Agoda, Booking, Airbnb, direct.' },
    { icon: FileText, title: 'Activity vouchers', sub: 'Tours, restaurants. Optional.', optional: true },
  ];

  const pickImages = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Access',
          'Please enable photo library access in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
          ],
        );
        return;
      }
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });
    if (!res.canceled && res.assets.length > 0) {
      setImages(res.assets.map(a => a.uri));
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const prepared = await Promise.all(
        images.map(async (uri) => {
          const compressed = await compressImage(uri, 1200, 0.7);
          const base64 = await FileSystem.readAsStringAsync(compressed, { encoding: 'base64' as any });
          return { base64, mimeType: 'image/jpeg' };
        }),
      );
      const result = await scanTripDocuments(prepared);
      setScanned(result);
      setScanning(false);
      setStep(1); // Show review screen
    } catch (e: any) {
      Alert.alert('Scan failed', e?.message ?? 'Could not read your files');
      setScanning(false);
    }
  };

  if (scanning) {
    return (
      <View style={[shared.centered, { backgroundColor: colors.bg }]}>
        <View style={[shared.scanCircle, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
        <Text style={[shared.scanText, { color: colors.text }]}>Reading your bookings...</Text>
        <Text style={[shared.scanSub, { color: colors.text3 }]}>Pulling out dates, flights, and hotel details.</Text>
      </View>
    );
  }

  // Step 1 — review scanned results (must be before step 0 return)
  if (step === 1 && scanned) {
    const rows = [
      { label: 'Destination', val: scanned.destination },
      { label: 'Dates', val: scanned.startDate && scanned.endDate ? `${formatDatePHT(scanned.startDate)} – ${formatDatePHT(scanned.endDate)}` : 'Not found' },
      scanned.accommodation ? { label: 'Hotel', val: scanned.accommodation } : null,
      scanned.address ? { label: 'Address', val: scanned.address } : null,
      scanned.checkIn ? { label: 'Check-in', val: scanned.checkIn } : null,
      scanned.checkOut ? { label: 'Check-out', val: scanned.checkOut } : null,
      scanned.roomType ? { label: 'Room', val: scanned.roomType } : null,
      scanned.bookingRef ? { label: 'Booking ref', val: scanned.bookingRef } : null,
      scanned.cost != null ? { label: 'Cost', val: `${scanned.costCurrency ?? 'PHP'} ${scanned.cost.toLocaleString()}` } : null,
      scanned.members?.length ? { label: 'Travelers', val: scanned.members.join(', ') } : null,
    ].filter(Boolean) as { label: string; val: string }[];

    return (
      <ScrollView contentContainerStyle={shared.scrollContent}>
        <BrandRow step={2} of={2} colors={colors} />
        <Header
          onBack={() => { setStep(0); setScanned(null); }}
          kicker="Upload — 2 of 2"
          title="Here's what we found."
          sub="Review the details we extracted from your screenshots."
          colors={colors}
        />
        <View style={shared.section}>
          <View style={[shared.infoList, { borderColor: colors.border }]}>
            {rows.map((r, i) => (
              <View key={i} style={[shared.infoRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[shared.infoLabel, { color: colors.text }]}>{r.label}</Text>
                  <Text style={[shared.infoVal, { color: colors.text3 }]}>{r.val}</Text>
                </View>
                <CheckCircle size={14} color={colors.accent} strokeWidth={2} />
              </View>
            ))}
          </View>

          {scanned.flights?.length > 0 && (
            <>
              <FieldLabel label="Flights found" colors={colors} />
              {scanned.flights.map((f: any, i: number) => (
                <View key={i} style={[shared.checkItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[shared.checkIcon, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
                    <Plane size={16} color={colors.accent} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[shared.checkTitle, { color: colors.text }]}>{f.airline ?? ''} {f.flightNumber}</Text>
                    <Text style={[shared.checkSub, { color: colors.text2 }]}>{f.from} → {f.to} · {f.direction}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <PrimaryBtn onPress={() => onDone({ kind: 'upload', scanned })} colors={colors}>
            <Text style={[shared.primaryText, { color: colors.onBlack }]}>Create my trip</Text>
            <ArrowRight size={14} color={colors.onBlack} strokeWidth={2} />
          </PrimaryBtn>
          <GhostBtn label="Rescan" onPress={() => { setStep(0); setScanned(null); setImages([]); }} />
        </View>
      </ScrollView>
    );
  }

  // Step 0 — upload guide + file picker
  return (
    <ScrollView contentContainerStyle={shared.scrollContent}>
      <BrandRow step={1} of={2} colors={colors} />
      <Header onBack={onBack} kicker="Upload — 1 of 2" title="Send us your confirmations." sub="Screenshots or PDFs — anything with the details." colors={colors} />
      <View style={shared.section}>
        <FieldLabel label="What helps most" colors={colors} />
        {CHECKLIST.map((c, i) => (
          <View key={i} style={[shared.checkItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[shared.checkIcon, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
              <c.icon size={16} color={colors.accent} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[shared.checkTitle, { color: colors.text }]}>
                {c.title}
                {c.optional && <Text style={[shared.optionalTag, { color: colors.text3 }]}> Optional</Text>}
              </Text>
              <Text style={[shared.checkSub, { color: colors.text2 }]}>{c.sub}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={pickImages}
          style={[shared.dropzone, { borderColor: colors.border2, backgroundColor: colors.card2 }]}
        >
          <View style={[shared.dropzoneIcon, { backgroundColor: colors.card, borderColor: colors.accentBorder }]}>
            <Camera size={22} color={colors.accent} strokeWidth={1.8} />
          </View>
          <Text style={[shared.dropzoneTitle, { color: colors.text }]}>Add screenshots or PDFs</Text>
          <Text style={[shared.dropzoneSub, { color: colors.text3 }]}>
            {images.length > 0 ? `${images.length} file${images.length > 1 ? 's' : ''} selected` : 'Tap to pick from Photos'}
          </Text>
        </TouchableOpacity>

        <PrimaryBtn onPress={handleScan} disabled={images.length === 0} colors={colors}>
          <Text style={[shared.primaryText, { color: images.length === 0 ? colors.text3 : colors.onBlack }]}>
            {images.length > 0 ? 'Read my files' : 'Pick files first'}
          </Text>
          <ArrowRight size={14} color={images.length === 0 ? colors.text3 : colors.onBlack} strokeWidth={2} />
        </PrimaryBtn>
        <GhostBtn label="I'll upload later" onPress={onBack} />
      </View>
    </ScrollView>
  );
}
