import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  type DiscoverPlace,
  friendlyCategory,
} from '@/components/discover/DiscoverPlaceCard';
import {
  addPlace,
  generateItinerary,
  getActiveTrip,
  getGroupMembers,
  getSavedPlaces,
  savePlace,
  searchNearby,
  voteOnPlace,
  type ItineraryDay,
  type PlannerPace,
  type PlannerScope,
} from '@/lib/api';
import { cacheGet, cacheSet } from '@/lib/cache';
import { distanceFromHotel, distanceFromPoint } from '@/lib/distance';
import { MS_PER_DAY } from '@/lib/utils';
import type { Place, PlaceCategory, PlaceVote } from '@/lib/types';
import {
  applyPlaceFilters,
  CATEGORY_SEARCH_MAP,
  countActiveFilters,
  DEFAULT_FILTERS,
  ITINERARY_STYLES,
  mapNearbyToDiscoverPlace,
  mapSavedPlaceToDiscoverPlace,
  PLACES,
  resolveCategory,
  STYLE_TO_INTERESTS,
  type DistanceOrigin,
  type FilterState,
  type TabId,
  type TravelMode,
} from '@/components/discover/discoverData';

export interface PlannerItem {
  id: string;
  time: string;
  title: string;
  note: string | null;
}

export interface DiscoverState {
  tab: TabId;
  setTab: (t: TabId) => void;
  travelMode: TravelMode;
  distanceOrigin: DistanceOrigin;
  userLocation: { lat: number; lng: number } | null;
  prompt: string;
  setPrompt: (v: string) => void;
  style: string;
  setStyle: (v: string) => void;
  saved: Set<string>;
  setSaved: React.Dispatch<React.SetStateAction<Set<string>>>;
  recommended: Set<string>;
  setRecommended: React.Dispatch<React.SetStateAction<Set<string>>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  q: string;
  setQ: (v: string) => void;
  tripId: string | null;
  places: readonly DiscoverPlace[];
  placesLoading: boolean;
  placesError: string | null;
  savedPlaces: Place[];
  setSavedPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  savedLoading: boolean;
  itineraryLoading: boolean;
  itineraryError: string | null;
  placeCategoryChip: string;
  setPlaceCategoryChip: (v: string) => void;
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  showMapModal: boolean;
  setShowMapModal: (v: boolean) => void;
  detailPlaceId: string | null;
  detailPlaceName: string;
  showDetail: boolean;
  setShowDetail: (v: boolean) => void;
  refreshing: boolean;
  tripDest: string;
  plannerActiveDay: number;
  setPlannerActiveDay: (v: number) => void;
  plannerItems: Record<number, PlannerItem[]>;
  plannerDays: { n: number; label: string; date: string }[];
  getDistanceKm: (placeLat?: number, placeLng?: number) => number;
  handleAnchorChange: (a: 'hotel' | 'me') => void;
  handleTravelModeChange: (m: 'walk' | 'car') => void;
  toggleSave: (name: string) => void;
  toggleRecommend: (name: string) => void;
  handleGenerateItinerary: () => void;
  handleAddToPlanner: (place: DiscoverPlace) => void;
  handleExplore: (placeId: string | undefined, name: string) => void;
  removePlannerItem: (id: string) => void;
  toggleShowFilters: () => void;
  activeFilterCount: number;
  filteredPlaces: DiscoverPlace[];
  placesWithDistance: { place: DiscoverPlace; distanceKm: number }[];
  handleRefresh: () => void;
}

export function useDiscover(): DiscoverState {
  const [tab, setTab] = useState<TabId>('places');
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [distanceOrigin, setDistanceOrigin] = useState<DistanceOrigin>('hotel');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('relaxed');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [recommended, setRecommended] = useState<Set<string>>(() => new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [q, setQ] = useState('');

  // API-wired state
  const [tripId, setTripId] = useState<string | null>(null);
  const [places, setPlaces] = useState<readonly DiscoverPlace[]>(PLACES);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);
  const [itineraryScope, setItineraryScope] = useState<PlannerScope>('today');
  const [pace, setPace] = useState<PlannerPace>('relaxed');
  const [placeCategoryChip, setPlaceCategoryChip] = useState('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const [showMapModal, setShowMapModal] = useState(false);

  // PlaceDetailSheet state
  const [detailPlaceId, setDetailPlaceId] = useState<string | null>(null);
  const [detailPlaceName, setDetailPlaceName] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const placesCache = useRef<Record<string, readonly DiscoverPlace[]>>({});

  const [tripDest, setTripDest] = useState('');
  const [tripStartDate, setTripStartDate] = useState<string | undefined>();
  const [tripEndDate, setTripEndDate] = useState<string | undefined>();
  const [tripDays, setTripDays] = useState<number | undefined>();
  const [tripHotel, setTripHotel] = useState('');
  const [tripGroupSize, setTripGroupSize] = useState(0);
  const [tripBudget, setTripBudget] = useState(0);
  const [tripBudgetCurrency, setTripBudgetCurrency] = useState('PHP');

  // Manual day planner state
  const [plannerActiveDay, setPlannerActiveDay] = useState(1);
  const [plannerItems, setPlannerItems] = useState<Record<number, PlannerItem[]>>({});

  // Compute trip day labels from real dates
  const plannerDays = useMemo(() => {
    if (!tripStartDate || !tripDays) return [];
    const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return Array.from({ length: tripDays }, (_, i) => {
      const d = new Date(tripStartDate + 'T00:00:00+08:00');
      d.setDate(d.getDate() + i);
      return {
        n: i + 1,
        label: DAY_NAMES[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });
  }, [tripStartDate, tripDays]);

  const plannerDayItems = useMemo(() =>
    (plannerItems[plannerActiveDay] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time)),
    [plannerItems, plannerActiveDay],
  );

  const plannerTotalCount = useMemo(() =>
    Object.values(plannerItems).reduce((n, arr) => n + arr.length, 0),
    [plannerItems],
  );

  const removePlannerItem = useCallback((id: string) => {
    setPlannerItems(prev => ({
      ...prev,
      [plannerActiveDay]: (prev[plannerActiveDay] ?? []).filter(x => x.id !== id),
    }));
  }, [plannerActiveDay]);

  // Compute distance from the selected origin (hotel or current location)
  const getDistanceKm = useCallback((placeLat?: number, placeLng?: number): number => {
    if (!placeLat || !placeLng) return 0;
    if (distanceOrigin === 'me' && userLocation) {
      return distanceFromPoint(userLocation.lat, userLocation.lng, placeLat, placeLng);
    }
    return distanceFromHotel(placeLat, placeLng);
  }, [distanceOrigin, userLocation]);

  // Fetch GPS when user switches to "me"
  const switchToMyLocation = useCallback(async () => {
    // Always re-fetch GPS so distances stay fresh as user moves
    try {
      const Location = require('expo-location') as typeof import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Enable location permissions in Settings to use "From Me".');
        setDistanceOrigin('hotel');
        return;
      }
      // Use High accuracy for better distance comparison vs hotel
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.High });
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setUserLocation(coords);
      setDistanceOrigin('me');
    } catch {
      Alert.alert('Location unavailable', 'Could not get your location. Using hotel distance.');
      setDistanceOrigin('hotel');
    }
  }, []);

  const handleAnchorChange = useCallback((a: 'hotel' | 'me') => {
    if (a === 'me') {
      switchToMyLocation();
    } else {
      setDistanceOrigin('hotel');
    }
    cacheSet('discover:anchor', a);
  }, [switchToMyLocation]);

  const handleTravelModeChange = useCallback((m: 'walk' | 'car') => {
    setTravelMode(m);
    cacheSet('discover:travelMode', m);
  }, []);

  // Restore cached anchor/travel mode (after switchToMyLocation is defined)
  useEffect(() => {
    cacheGet<'hotel' | 'me'>('discover:anchor').then((v) => {
      if (v === 'me') {
        switchToMyLocation();
      } else if (v) {
        setDistanceOrigin(v);
      }
    });
    cacheGet<'walk' | 'car'>('discover:travelMode').then((v) => { if (v) setTravelMode(v); });
  }, [switchToMyLocation]);

  // Load trip ID on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const trip = await getActiveTrip();
        if (!cancelled && trip) {
          setTripId(trip.id);
          setTripDest(trip.destination ?? '');
          setTripStartDate(trip.startDate);
          setTripEndDate(trip.endDate);
          setTripHotel(trip.accommodation ?? '');
          setTripBudget(trip.budgetLimit ?? 0);
          setTripBudgetCurrency(trip.costCurrency ?? 'PHP');
          const members = await getGroupMembers(trip.id).catch(() => []);
          setTripGroupSize(Math.max(1, members.length));
          if (trip.startDate && trip.endDate) {
            const ms = new Date(trip.endDate + 'T00:00:00+08:00').getTime() - new Date(trip.startDate + 'T00:00:00+08:00').getTime();
            setTripDays(Math.max(1, Math.ceil(ms / MS_PER_DAY) + 1));
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('[DiscoverScreen] load trip context failed:', e);
      }
    };
    placesCache.current = {};
    load();
    return () => { cancelled = true; };
  }, []);

  // Load saved places when Saved tab is selected or tripId changes
  const loadSavedPlaces = useCallback(async () => {
    if (!tripId) return;
    setSavedLoading(true);
    try {
      const result = await getSavedPlaces(tripId);
      setSavedPlaces(result);
      setSaved(new Set(result.filter((p) => p.saved !== false).map((p) => p.name)));
    } catch (e) {
      if (__DEV__) console.warn('[DiscoverScreen] load saved places failed:', e);
    } finally {
      setSavedLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (tab === 'saved' && tripId) {
      loadSavedPlaces();
    }
  }, [tab, tripId, loadSavedPlaces]);

  // Search places via Google Places API
  const searchPlaces = useCallback(async (keyword?: string, type?: string, skipCache = false) => {
    const cacheKey = `${type ?? ''}_${keyword ?? ''}`;

    // Use cache if available and not forced refresh
    if (!skipCache && placesCache.current[cacheKey]) {
      setPlaces(placesCache.current[cacheKey]);
      return;
    }

    setPlacesLoading(true);
    setPlacesError(null);
    try {
      const results = await searchNearby(type, keyword);
      if (results.length > 0) {
        const mapped = results.map(mapNearbyToDiscoverPlace);
        placesCache.current[cacheKey] = mapped;
        setPlaces(mapped);
      } else {
        setPlaces(PLACES);
        setPlacesError('No results found. Showing curated places.');
      }
    } catch {
      setPlaces(PLACES);
      setPlacesError('Could not load places. Showing curated places.');
    } finally {
      setPlacesLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load places when category chip changes
  useEffect(() => {
    if (tab !== 'places') return;
    if (placeCategoryChip === 'All') {
      searchPlaces();
    } else {
      const chipKey = placeCategoryChip.toLowerCase();
      const searchConfig = CATEGORY_SEARCH_MAP[chipKey];
      searchPlaces(searchConfig?.keyword ?? chipKey, searchConfig?.type);
    }
  }, [placeCategoryChip, tab, searchPlaces]);

  // Debounced search input
  useEffect(() => {
    if (tab !== 'places') return;
    if (!q.trim()) {
      // Reset to category-based search when query is cleared
      if (placeCategoryChip === 'All') {
        searchPlaces();
      }
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      searchPlaces(q.trim());
    }, 500);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [q, tab, placeCategoryChip, searchPlaces]);

  const toggleSave = useCallback(async (name: string) => {
    // Optimistic local update
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Persist the saved place
    if (!tripId) return;
    const existingPlace = savedPlaces.find((p) => p.name === name);
    if (existingPlace) {
      try {
        await savePlace(existingPlace.id, !existingPlace.saved);
      } catch {
        // Revert on failure
        setSaved((s) => {
          const next = new Set(s);
          if (existingPlace.saved) next.add(name);
          else next.delete(name);
          return next;
        });
      }
    } else {
      // Find the place data in current places list to save it
      const placeData = places.find((p) => p.n === name);
      if (placeData) {
        try {
          await addPlace({
            tripId,
            name: placeData.n,
            category: (placeData.types ? resolveCategory(placeData.types) : 'Do') as PlaceCategory,
            distance: placeData.d,
            rating: placeData.r,
            source: 'Manual',
            vote: 'Pending' as PlaceVote,
            photoUrl: placeData.img,
            googlePlaceId: placeData.placeId,
            latitude: placeData.lat,
            longitude: placeData.lng,
            totalRatings: placeData.totalRatings,
            saved: true,
          });
        } catch {
          setSaved((s) => {
            const next = new Set(s);
            next.delete(name);
            return next;
          });
        }
      }
    }
  }, [tripId, savedPlaces, places]);

  const toggleRecommend = useCallback(async (name: string) => {
    // Optimistic local update
    setRecommended((s) => {
      const next = new Set(s);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Persist as a suggested place
    if (!tripId) return;
    const existingPlace = savedPlaces.find((p) => p.name === name);
    if (existingPlace) {
      try {
        await voteOnPlace(existingPlace.id, '\uD83D\uDC4D Yes' as PlaceVote);
      } catch {
        setRecommended((s) => {
          const next = new Set(s);
          next.delete(name);
          return next;
        });
      }
    } else {
      const placeData = places.find((p) => p.n === name);
      if (placeData) {
        try {
          await addPlace({
            tripId,
            name: placeData.n,
            category: (placeData.types ? resolveCategory(placeData.types) : 'Do') as PlaceCategory,
            distance: placeData.d,
            rating: placeData.r,
            source: 'Suggested',
            vote: '\uD83D\uDC4D Yes' as PlaceVote,
            photoUrl: placeData.img,
            googlePlaceId: placeData.placeId,
            latitude: placeData.lat,
            longitude: placeData.lng,
            totalRatings: placeData.totalRatings,
            saved: true,
          });
        } catch {
          setRecommended((s) => {
            const next = new Set(s);
            next.delete(name);
            return next;
          });
        }
      }
    }
  }, [tripId, savedPlaces, places]);

  // Generate itinerary via Anthropic
  const handleGenerateItinerary = useCallback(async () => {
    setItineraryLoading(true);
    setItineraryError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const chosenStyle = itineraryScope === 'surprise'
        ? ITINERARY_STYLES[Math.floor(Math.random() * ITINERARY_STYLES.length)].id
        : style;
      const interests = STYLE_TO_INTERESTS[chosenStyle] ?? ['beach', 'food', 'activities'];
      const promptInterests = prompt.trim()
        ? [...interests, prompt.trim()]
        : interests;
      const result = await generateItinerary({
        scope: itineraryScope,
        pace,
        interests: promptInterests,
        tripDays,
        startDate: tripStartDate,
        destination: tripDest || undefined,
        hotelName: tripHotel || undefined,
        groupSize: tripGroupSize || undefined,
        budget: tripBudget || undefined,
        budgetCurrency: tripBudgetCurrency,
      });
      setItinerary(result);
      // Populate planner items from AI result
      const newItems: Record<number, PlannerItem[]> = {};
      for (const day of result) {
        newItems[day.day] = (day.activities ?? []).map((act, i) => ({
          id: `ai-${day.day}-${i}`,
          time: act.timeSlot?.replace(/[^\d:]/g, '').slice(0, 5) || `${9 + i}:00`,
          title: act.name,
          note: act.duration ? `${act.duration} · ${act.cost ?? ''}` : null,
        }));
      }
      setPlannerItems(newItems);
      if (result.length > 0) {
        setPlannerActiveDay(result[0].day);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary';
      setItineraryError(message);
    } finally {
      setItineraryLoading(false);
    }
  }, [style, prompt, itineraryScope, pace, tripDays, tripStartDate]);

  const handleAddToPlanner = useCallback((place: DiscoverPlace) => {
    if (plannerDays.length === 0) {
      Alert.alert('No Trip', 'No trip dates set. Create a trip first.');
      return;
    }
    const options = plannerDays.map((d) => ({
      text: `Day ${d.n} · ${d.date}`,
      onPress: () => {
        setPlannerItems((prev) => {
          const existing = prev[d.n] ?? [];
          const newItem = {
            id: `${place.placeId ?? place.n}-${Date.now()}`,
            time: '12:00',
            title: place.n,
            note: `${friendlyCategory(place.t)} · ${place.d}`,
          };
          return {
            ...prev,
            [d.n]: [...existing, newItem].sort((a, b) => a.time.localeCompare(b.time)),
          };
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Added', `${place.n} added to Day ${d.n}`);
      },
    }));
    Alert.alert('Add to Planner', `Add "${place.n}" to which day?`, [
      ...options,
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [plannerDays]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const filteredPlaces = useMemo(() => applyPlaceFilters(places, filters), [places, filters]);


  // Pre-compute distances, filter nearby, sort by nearest first.
  const placesWithDistance = useMemo(() => {
    const withDist = filteredPlaces.map((p) => ({
      place: p,
      distanceKm: getDistanceKm(p.lat, p.lng),
    }));
    const filtered = filters.nearby
      ? withDist.filter((p) => p.distanceKm > 0 && p.distanceKm <= 2)
      : withDist;
    return filtered.sort((a, b) => {
      // Open places first, then by distance
      const openA = a.place.openNow ? 0 : 1;
      const openB = b.place.openNow ? 0 : 1;
      if (openA !== openB) return openA - openB;
      return a.distanceKm - b.distanceKm;
    });
  }, [filteredPlaces, getDistanceKm, filters.nearby]);

  // Stable filter callbacks — prevent FilterChip re-renders
  const toggleOpenNow = useCallback(() => setFilters((f) => ({ ...f, openNow: !f.openNow })), []);
  const toggleNearby = useCallback(() => setFilters((f) => ({ ...f, nearby: !f.nearby })), []);
  const toggleRating = useCallback(() => setFilters((f) => ({ ...f, minRating: f.minRating >= 4.5 ? 0 : 4.5 })), []);
  const toggleShowFilters = useCallback(() => setShowFilters((s) => !s), []);

  const handleExplore = useCallback((placeId: string | undefined, name: string) => {
    setDetailPlaceId(placeId ?? null);
    setDetailPlaceName(name);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    placesCache.current = {};
    const chipKey = placeCategoryChip.toLowerCase();
    const search = CATEGORY_SEARCH_MAP[chipKey];
    searchPlaces(search?.keyword, search?.type, true);
  }, [placeCategoryChip, searchPlaces]);

  return {
    tab, setTab,
    travelMode, distanceOrigin, userLocation,
    prompt, setPrompt, style, setStyle,
    saved, setSaved, recommended, setRecommended,
    showFilters, setShowFilters, filters, setFilters,
    q, setQ,
    tripId,
    places, placesLoading, placesError,
    savedPlaces, setSavedPlaces, savedLoading,
    itineraryLoading, itineraryError,
    placeCategoryChip, setPlaceCategoryChip,
    visibleCount, setVisibleCount,
    showMapModal, setShowMapModal,
    detailPlaceId, detailPlaceName, showDetail, setShowDetail,
    refreshing,
    tripDest,
    plannerActiveDay, setPlannerActiveDay,
    plannerItems, plannerDays,
    getDistanceKm,
    handleAnchorChange, handleTravelModeChange,
    toggleSave, toggleRecommend,
    handleGenerateItinerary, handleAddToPlanner, handleExplore,
    removePlannerItem, toggleShowFilters,
    activeFilterCount, filteredPlaces, placesWithDistance,
    handleRefresh,
  };
}
