import type { MomentDisplay } from './types';

// GPS -> map-percentage conversion
export const BOUNDS = {
  north: 11.99,
  south: 11.95,
  west: 121.915,
  east: 121.935,
};

export function gpsToMapPos(lat: number, lng: number): { x: number; y: number } {
  const x = 38 + ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 32;
  const y = 10 + ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * 84;
  return {
    x: Math.max(20, Math.min(80, x)),
    y: Math.max(8, Math.min(95, y)),
  };
}

// Fallback positions by location name keywords (matching prototype posByImg)
export const FALLBACK_POSITIONS: Record<string, { x: number; y: number }> = {
  puka: { x: 55, y: 16 },
  'mt. luho': { x: 62, y: 28 },
  'mt luho': { x: 62, y: 28 },
  luho: { x: 62, y: 28 },
  diniwid: { x: 44, y: 40 },
  crystal: { x: 70, y: 36 },
  ariel: { x: 34, y: 46 },
  nonie: { x: 54, y: 48 },
  canyon: { x: 56, y: 52 },
  "d'mall": { x: 50, y: 54 },
  dmall: { x: 50, y: 54 },
  'station 2': { x: 46, y: 60 },
  willy: { x: 44, y: 66 },
  mandala: { x: 58, y: 62 },
  'station 1': { x: 45, y: 82 },
  'white beach': { x: 46, y: 60 },
};

export function positionOf(m: MomentDisplay): { x: number; y: number } {
  const moment = m as MomentDisplay & { latitude?: number; longitude?: number };
  if (moment.latitude && moment.longitude) {
    return gpsToMapPos(moment.latitude, moment.longitude);
  }
  const loc = (m.place ?? m.location ?? '').toLowerCase();
  for (const [key, pos] of Object.entries(FALLBACK_POSITIONS)) {
    if (loc.includes(key)) return pos;
  }
  return { x: 50, y: 50 };
}

export const HOME = { x: 55, y: 52 };

// Area labels — matching prototype positions verbatim
export const AREA_LABELS = [
  { label: 'Puka Beach', x: 76, y: 15, align: 'left' as const },
  { label: 'Mt. Luho', x: 75, y: 28, align: 'left' as const },
  { label: 'Diniwid', x: 27, y: 40, align: 'right' as const },
  { label: 'Station 2', x: 76, y: 52, align: 'left' as const },
  { label: 'Station 1', x: 24, y: 82, align: 'right' as const },
  { label: 'Crystal Cove', x: 78, y: 38, align: 'left' as const },
  { label: "Ariel's Pt.", x: 24, y: 48, align: 'right' as const },
];

// Island SVG path — verbatim from prototype
export const ISLAND_PATH =
  'M 52 10 Q 62 11 64 18 Q 66 24 62 28 Q 60 32 64 34 Q 68 38 66 44 Q 64 48 58 50 Q 54 52 54 56 Q 56 62 54 68 Q 52 74 56 80 Q 60 86 58 90 Q 54 94 48 92 Q 42 88 42 82 Q 44 74 42 68 Q 40 62 44 56 Q 46 52 42 50 Q 36 48 38 42 Q 42 36 44 32 Q 46 28 42 24 Q 40 18 44 14 Q 48 10 52 10 Z';
