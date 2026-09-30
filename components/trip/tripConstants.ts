import type { useTheme } from '@/constants/ThemeContext';
import type { Flight, PackingItem, Trip } from '@/lib/types';
import { formatDatePHT, formatTimePHT } from '@/lib/utils';
import { colors as themeColors } from '@/constants/theme';

// ---------- TYPES ----------

export type ThemeColors = ReturnType<typeof useTheme>['colors'];

export const TAB_KEYS = [
  'overview',
  'summary',
  'guide',
  'essentials',
] as const;
export type TabKey = (typeof TAB_KEYS)[number];

export interface FlightDisplayData {
  dir: string;
  airline: string;
  code: string;
  num: string;
  ref: string;
  logo: string;
  date: string;
  dep: string;
  arr: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  dur: string;
  bags: { who: string; bag: string }[];
  status: string;
}

export interface PastTripDisplay {
  flag: string;
  dest: string;
  country: string;
  dates: string;
  nights: number;
  spent: number;
  miles: number;
  rating: number;
}

// ---------- CONSTANTS ----------

export const MEMBER_COLORS = ['#a64d1e', '#b8892b', '#c66a36', '#8a5a2b', '#7e9f5b'];
export const FILE_COLORS = ['#a64d1e', '#c66a36', '#b8892b', '#d9a441', '#8a5a2b'];

// ---------- MAPPERS ----------

export function mapFlightToDisplay(f: Flight): FlightDisplayData {
  const code = f.flightNumber.split(' ')[0] ?? '';
  const num = f.flightNumber.split(' ')[1] ?? f.flightNumber;
  return {
    dir: f.direction,
    airline: f.airline,
    code,
    num,
    ref: f.bookingRef ?? '',
    logo: f.direction === 'Outbound' ? themeColors.text2 : themeColors.danger,
    date: formatDatePHT(f.departTime),
    dep: formatTimePHT(f.departTime),
    arr: formatTimePHT(f.arriveTime),
    from: f.from,
    fromCity: f.from,
    to: f.to,
    toCity: f.to,
    dur: '',
    bags: f.baggage ? [{ who: f.passenger ?? '', bag: f.baggage }] : [],
    status: 'Confirmed',
  };
}

export interface PackingGroup {
  [category: string]: { t: string; by: string; d: boolean; id: string }[];
}

export function groupPackingItems(items: PackingItem[]): PackingGroup {
  const groups: PackingGroup = {};
  for (const item of items) {
    const cat = item.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ t: item.item, by: item.owner ?? '', d: item.packed, id: item.id });
  }
  return groups;
}

const COUNTRY_FLAGS: Record<string, string> = {
  JP: '\u{1F1EF}\u{1F1F5}',
  VN: '\u{1F1FB}\u{1F1F3}',
  PH: '\u{1F1F5}\u{1F1ED}',
  TH: '\u{1F1F9}\u{1F1ED}',
  SG: '\u{1F1F8}\u{1F1EC}',
  US: '\u{1F1FA}\u{1F1F8}',
  KR: '\u{1F1F0}\u{1F1F7}',
  ID: '\u{1F1EE}\u{1F1E9}',
};

export function mapTripToPastDisplay(t: Trip): PastTripDisplay {
  return {
    flag: COUNTRY_FLAGS[t.countryCode ?? ''] ?? '\u{1F30D}',
    dest: t.destination ?? t.name,
    country: t.country ?? '',
    dates: `${formatDatePHT(t.startDate)} \u2013 ${formatDatePHT(t.endDate)}`,
    nights: t.totalNights ?? t.nights ?? 0,
    spent: t.totalSpent ?? 0,
    miles: 0,
    rating: 0,
  };
}
