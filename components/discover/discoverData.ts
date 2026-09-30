import { type DiscoverPlace } from '@/components/discover/DiscoverPlaceCard';
import { type NearbyPlace } from '@/lib/api';
import { distanceFromHotel, formatDistance } from '@/lib/distance';
import type { Place, PlaceCategory } from '@/lib/types';

export type TabId = 'places' | 'planner' | 'saved';
export type TravelMode = 'walk' | 'car';
export type DistanceOrigin = 'hotel' | 'me';
export type FilterState = {
  minRating: number;
  openNow: boolean;
  nearby: boolean;
  maxPrice: number;
};

// Map UI category IDs to Google Places API types/keywords
export const CATEGORY_SEARCH_MAP: Record<string, { type?: string; keyword?: string }> = {
  beach: { keyword: 'beach' },
  food: { type: 'restaurant', keyword: 'food' },
  activity: { keyword: 'water sports activities tours' },
  nightlife: { type: 'bar', keyword: 'nightlife bar club' },
  photo: { keyword: 'viewpoint scenic photo spot' },
  wellness: { type: 'spa', keyword: 'spa wellness massage yoga' },
  coffee: { type: 'cafe', keyword: 'coffee cafe espresso' },
  atm: { type: 'atm', keyword: 'atm cash withdraw money changer' },
  shopping: { type: 'store', keyword: 'shopping mall market souvenir' },
  landmark: { type: 'tourist_attraction', keyword: 'landmark monument attraction viewpoint' },
};

// Map Google Places types to display labels
export function resolveTypeLabel(types: string[]): string {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    cafe: 'Cafe',
    spa: 'Spa',
    beach: 'Beach',
    park: 'Park',
    shopping_mall: 'Shopping',
    store: 'Shopping',
    tourist_attraction: 'Attraction',
    point_of_interest: 'Landmark',
    natural_feature: 'Nature',
    gym: 'Wellness',
    lodging: 'Hotel',
    church: 'Culture',
  };
  for (const t of types) {
    if (typeMap[t]) return typeMap[t];
  }
  return 'Place';
}

// Map Google Places type to PlaceCategory for storage
export function resolveCategory(types: string[]): PlaceCategory {
  const mapping: Record<string, PlaceCategory> = {
    restaurant: 'Eat',
    bar: 'Nightlife',
    cafe: 'Coffee',
    spa: 'Wellness',
    gym: 'Wellness',
    tourist_attraction: 'Do',
    natural_feature: 'Nature',
    park: 'Nature',
    shopping_mall: 'Essentials',
    store: 'Essentials',
    church: 'Culture',
  };
  for (const t of types) {
    if (mapping[t]) return mapping[t];
  }
  return 'Do';
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k reviews`;
  if (count === 0) return 'No reviews';
  return `${count} reviews`;
}

export function mapNearbyToDiscoverPlace(place: NearbyPlace): DiscoverPlace {
  const km = distanceFromHotel(place.lat, place.lng);
  return {
    n: place.name,
    t: resolveTypeLabel(place.types),
    r: place.rating,
    rv: formatReviewCount(place.total_ratings),
    d: formatDistance(km),
    dn: km,
    price: place.price_level ?? 0,
    openNow: place.open_now ?? false,
    img: place.photo_url ?? 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
    placeId: place.place_id,
    lat: place.lat,
    lng: place.lng,
    totalRatings: place.total_ratings,
    types: place.types,
  };
}

export function mapSavedPlaceToDiscoverPlace(place: Place): DiscoverPlace {
  const km = place.latitude && place.longitude
    ? distanceFromHotel(place.latitude, place.longitude)
    : 0;
  return {
    n: place.name,
    t: place.category,
    r: place.rating ?? 0,
    rv: formatReviewCount(place.totalRatings ?? 0),
    d: place.distance ?? formatDistance(km),
    dn: km,
    price: 0,
    openNow: true,
    img: place.photoUrl ?? 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
  };
}

// Itinerary style ID → interests for the Anthropic API
export const STYLE_TO_INTERESTS: Record<string, string[]> = {
  relaxed: ['spa', 'beach', 'sunset viewing', 'cafes'],
  adventure: ['water sports', 'island hopping', 'snorkeling', 'hiking'],
  foodie: ['local restaurants', 'street food', 'seafood', 'markets'],
  family: ['kid-friendly beaches', 'easy activities', 'family dining'],
  culture: ['history', 'local markets', 'cultural sites', 'community'],
};

// ── Data ────────────────────────────────────────────────────────────────

export const ITINERARY_STYLES = [
  { id: 'relaxed', label: 'Relaxed', sub: 'Slow mornings, spa, sunsets' },
  { id: 'adventure', label: 'Adventure', sub: 'Water sports, trails, reefs' },
  { id: 'foodie', label: 'Foodie', sub: 'Local eats, markets, bars' },
  { id: 'family', label: 'Family', sub: 'Kid-safe, easy access' },
  { id: 'culture', label: 'Culture', sub: 'History, markets, locals' },
] as const;

// Sample fallback places shown when the API returns no results
export const PLACES: readonly DiscoverPlace[] = [
  {
    n: 'Puka Shell Beach',
    t: 'Beach',
    r: 4.7,
    rv: '3.2k reviews',
    d: '4.2 km',
    dn: 4.2,
    price: 0,
    openNow: true,
    img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
  },
  {
    n: "D'Mall",
    t: 'Shopping',
    r: 4.3,
    rv: '1.8k reviews',
    d: '1.6 km',
    dn: 1.6,
    price: 2,
    openNow: true,
    img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  },
  {
    n: "Willy's Rock",
    t: 'Landmark',
    r: 4.5,
    rv: '2.1k reviews',
    d: '900 m',
    dn: 0.9,
    price: 0,
    openNow: true,
    img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  },
  {
    n: "Jonah's Fruit Shake",
    t: 'Restaurant',
    r: 4.6,
    rv: '890 reviews',
    d: '1.2 km',
    dn: 1.2,
    price: 1,
    openNow: false,
    img: 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=800&q=80',
  },
];

export const PLACE_CATEGORY_CHIPS = [
  'All',
  'Beach',
  'Food',
  'Coffee',
  'Activity',
  'Shopping',
  'ATM',
  'Landmark',
] as const;

export const DEFAULT_FILTERS: FilterState = {
  minRating: 0,
  openNow: false,
  nearby: false,
  maxPrice: 3,
};

// ── Helpers ─────────────────────────────────────────────────────────────

export function countActiveFilters(f: FilterState): number {
  return (
    (f.minRating > 0 ? 1 : 0) +
    (f.openNow ? 1 : 0) +
    (f.nearby ? 1 : 0) +
    (f.maxPrice < 3 ? 1 : 0)
  );
}

export function applyPlaceFilters(
  list: readonly DiscoverPlace[],
  f: FilterState,
): DiscoverPlace[] {
  return list.filter((p) => {
    // Hide hotels/lodging — user already has accommodation
    const t = (p.t ?? '').toLowerCase();
    const types = (p.types ?? []).map(s => s.toLowerCase());
    if (t === 'hotel' || t === 'lodging' || types.includes('lodging') || types.includes('hotel')) return false;
    if (f.minRating && p.r < f.minRating) return false;
    if (f.openNow && !p.openNow) return false;
    // "nearby" filter is applied AFTER distance computation in placesWithDistance
    if (f.maxPrice < 3 && p.price > f.maxPrice) return false;
    return true;
  });
}

// ── Top Picks ───────────────────────────────────────────────────────────

export function getTopPicks(places: readonly DiscoverPlace[], distFn: (lat?: number, lng?: number) => number): DiscoverPlace[] {
  const seen = new Set<string>();
  return [...places]
    .filter(p => p.r >= 4.0 && p.img)
    .map(p => ({ p, dist: distFn(p.lat, p.lng) }))
    .filter(x => x.dist > 0 && x.dist < 50)
    .sort((a, b) => a.dist - b.dist)
    .map(x => x.p)
    .filter(p => {
      if (seen.has(p.n)) return false;
      seen.add(p.n);
      return true;
    })
    .slice(0, 5);
}
