import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { buildTripCalendarUrl } from '@/lib/calendarInvite';
import { formatDatePHT } from '@/lib/utils';
import {
  addPackingItem,
  getActiveTrip,
  getFlights,
  getGroupMembers,
  getHighlights,
  getLifetimeStats,
  getPackingList,
  getPastTrips,
  getTripFiles,
  togglePacked,
  updateMemberEmail,
  updateMemberPhone,
  updateMemberPhoto,
} from '@/lib/api';
import type {
  Flight,
  GroupMember,
  Highlight,
  PackingItem,
  Trip,
  TripFile,
} from '@/lib/types';
import {
  groupPackingItems,
  mapFlightToDisplay,
  mapTripToPastDisplay,
  MEMBER_COLORS,
} from './tripConstants';
import type { TabKey } from './tripConstants';

export function useTripScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editMember, setEditMember] = useState<GroupMember | null>(null);
  const [editField, setEditField] = useState<'email' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Trip data
  const [trip, setTrip] = useState<Trip | null>(null);
  const [membersData, setMembersData] = useState<GroupMember[]>([]);
  const [flightsData, setFlightsData] = useState<Flight[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [filesData, setFilesData] = useState<TripFile[]>([]);
  const [pastTripsData, setPastTripsData] = useState<Trip[]>([]);
  const [highlightsData, setHighlightsData] = useState<Highlight[]>([]);
  const [lifetimeStats, setLifetimeStats] = useState<{
    totalTrips: number;
    totalCountries: number;
    totalNights: number;
    totalMiles: number;
    totalSpent: number;
  } | null>(null);

  const load = useCallback(async (force = false) => {
    try {
      const t = await getActiveTrip(force);
      setTrip(t);
      if (t) {
        const [ms, fs, pk, tf] = await Promise.all([
          getGroupMembers(t.id).catch(() => [] as GroupMember[]),
          getFlights(t.id).catch(() => [] as Flight[]),
          getPackingList(t.id).catch(() => [] as PackingItem[]),
          getTripFiles(t.id).catch(() => [] as TripFile[]),
        ]);
        setMembersData(ms);
        setFlightsData(fs);
        setPackingItems(pk);
        setFilesData(tf);
      }
      // Load lifetime data (userId not required for now — loads all)
      const [stats, highlights, past] = await Promise.all([
        getLifetimeStats('').catch(() => null),
        getHighlights('').catch(() => [] as Highlight[]),
        getPastTrips('').catch(() => [] as Trip[]),
      ]);
      if (stats) setLifetimeStats(stats);
      setHighlightsData(highlights);
      setPastTripsData(past);
    } catch (e) {
      if (__DEV__) console.warn('[TripScreen] load trip data failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  useEffect(() => {
    load();
  }, [load]);

  // Derived display data
  const flightsDisplay = useMemo(
    () => flightsData.map(mapFlightToDisplay),
    [flightsData],
  );

  const packingState = useMemo(
    () => groupPackingItems(packingItems),
    [packingItems],
  );

  // Compute packing stats
  const packingStats = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const items of Object.values(packingState)) {
      for (const item of items) {
        total++;
        if (item.d) done++;
      }
    }
    return { total, done };
  }, [packingState]);

  const togglePackingItem = (group: string, itemText: string) => {
    setPackingItems((prev) =>
      prev.map((it) =>
        it.item === itemText ? { ...it, packed: !it.packed } : it,
      ),
    );
    const item = packingItems.find((it) => it.item === itemText);
    if (item) {
      togglePacked(item.id, !item.packed).catch(() => {
        // revert on failure
        setPackingItems((prev) =>
          prev.map((it) =>
            it.item === itemText ? { ...it, packed: !it.packed } : it,
          ),
        );
      });
    }
  };

  const pastTripsDisplay = useMemo(
    () => pastTripsData.map(mapTripToPastDisplay),
    [pastTripsData],
  );

  // Summary computed values
  const totalTrips = (lifetimeStats?.totalTrips ?? pastTripsDisplay.length) + 1;
  const totalSpent = lifetimeStats?.totalSpent ?? pastTripsDisplay.reduce((s, t) => s + t.spent, 0);
  const totalNights = lifetimeStats?.totalNights ?? pastTripsDisplay.reduce((s, t) => s + t.nights, 0);
  const totalMiles = lifetimeStats?.totalMiles ?? 0;
  const countriesCount = lifetimeStats?.totalCountries ?? new Set(pastTripsDisplay.map((t) => t.flag)).size;

  const highlightsForStrip = useMemo(() => {
    if (highlightsData.length > 0) {
      return highlightsData.map((h, i) => ({
        icon: '\u2B50',
        label: h.displayText,
        sub: '',
        tint: MEMBER_COLORS[i % MEMBER_COLORS.length],
      }));
    }
    return [];
  }, [highlightsData]);

  // Trip destination label
  const destLabel = trip?.destination ?? '';
  const dateRangeLabel = trip
    ? `${formatDatePHT(trip.startDate)}\u2013${formatDatePHT(trip.endDate)}`
    : '';

  // Hotel photos
  const hotelPhotos = useMemo(() => {
    if (!trip?.hotelPhotos) return [];
    try {
      const parsed: unknown = JSON.parse(trip.hotelPhotos);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }, [trip?.hotelPhotos]);

  // Button handlers
  const handleShare = () => {
    Share.share({ message: `Check out our trip to ${trip?.destination ?? 'somewhere amazing'}!` });
  };

  const handleMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleInvite = () => {
    router.push('/invite');
  };

  const handleMemberEdit = (member: GroupMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMember(member);
    setEditField(null);
    setEditValue('');
  };

  const handleMemberAction = async (action: string) => {
    if (!editMember) return;
    const member = editMember;

    if (action === 'calendar') {
      setEditMember(null);
      if (!trip) return;
      const url = buildTripCalendarUrl({
        trip,
        flights: flightsData,
        members: membersData,
        inviteEmail: member.email || undefined,
      });
      Linking.openURL(url).catch(() => {});
    } else if (action === 'invite') {
      setEditMember(null);
      const msg = `Join our trip on AfterStay! Download the app and use your invite code to see all the trip details.`;
      const target = member.phone
        ? `sms:${member.phone}?body=${encodeURIComponent(msg)}`
        : member.email
          ? `mailto:${member.email}?subject=${encodeURIComponent('Join our trip on AfterStay')}&body=${encodeURIComponent(msg)}`
          : null;
      if (target) {
        Linking.openURL(target).catch(() => {});
      } else {
        router.push('/invite');
      }
    } else if (action === 'photo') {
      setEditMember(null);
      if (Platform.OS === 'ios') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Photo Library Access', 'Please enable photo library access in Settings.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
          ]);
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets[0]) {
        await updateMemberPhoto(member.id, result.assets[0].uri).catch(() => {});
        load();
      }
    } else if (action === 'email') {
      setEditField('email');
      setEditValue(member.email ?? '');
    } else if (action === 'phone') {
      setEditField('phone');
      setEditValue(member.phone ?? '');
    } else if (action === 'save') {
      if (editField === 'email' && editValue.trim()) {
        await updateMemberEmail(member.id, editValue.trim()).catch(() => {});
      } else if (editField === 'phone' && editValue.trim()) {
        await updateMemberPhone(member.id, editValue.trim()).catch(() => {});
      }
      setEditMember(null);
      setEditField(null);
      load();
    }
  };

  const handleMemberChat = async (member: GroupMember) => {
    if (member.phone) {
      const url = `sms:${member.phone}`;
      try {
        await Linking.openURL(url);
      } catch {
        if (__DEV__) console.warn('Failed to open URL:', url);
      }
    } else if (member.email) {
      const url = `mailto:${member.email}`;
      try {
        await Linking.openURL(url);
      } catch {
        if (__DEV__) console.warn('Failed to open URL:', url);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddPackingItem = async () => {
    const text = newItemText.trim();
    if (!text) return;
    const tempId = `temp-${Date.now()}`;
    const newItem: PackingItem = {
      id: tempId,
      item: text,
      category: 'Other',
      packed: false,
      owner: '',
    };
    setPackingItems((prev) => [...prev, newItem]);
    setNewItemText('');
    setAddingItem(false);
    try {
      await addPackingItem({ item: text, category: 'Other', tripId: trip?.id });
      // Refresh to get the real ID from the server
      if (trip) {
        const updated = await getPackingList(trip.id).catch(() => [] as PackingItem[]);
        setPackingItems(updated);
      }
    } catch {
      // Revert on failure
      setPackingItems((prev) => prev.filter((it) => it.id !== tempId));
    }
  };

  const handleUpload = () => {
    router.push('/add-file');
  };

  const handleDownload = async (fileUrl: string) => {
    try {
      await WebBrowser.openBrowserAsync(fileUrl);
    } catch {
      if (__DEV__) console.warn('Failed to open browser:', fileUrl);
    }
  };

  return {
    activeTab,
    setActiveTab,
    addOpen,
    setAddOpen,
    loading,
    refreshing,
    onRefresh,
    trip,
    membersData,
    flightsDisplay,
    hotelPhotos,
    pastTripsDisplay,
    highlightsForStrip,
    totalTrips,
    totalSpent,
    totalNights,
    totalMiles,
    countriesCount,
    destLabel,
    dateRangeLabel,
    packingState,
    packingStats,
    filesData,
    addingItem,
    setAddingItem,
    newItemText,
    setNewItemText,
    togglePackingItem,
    handleAddPackingItem,
    handleUpload,
    handleDownload,
    editMember,
    editField,
    editValue,
    setEditMember,
    setEditField,
    setEditValue,
    handleMemberEdit,
    handleMemberAction,
    handleMemberChat,
    handleInvite,
    handleShare,
    handleMore,
    load,
  };
}

