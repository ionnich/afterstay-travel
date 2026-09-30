import type { useTheme } from '@/constants/ThemeContext';

export type ThemeColors = ReturnType<typeof useTheme>['colors'];

export const PROPERTY = {
  name: '',
  desc: '',
  checkIn: '3:00 PM',
  checkOut: '11:00 AM',
  phone: '',
  email: '',
} as const;

export const AMENITIES: { n: string; iconId: string }[] = [];

export const NEARBY: { n: string; d: string; t: string; w: string; pin: string }[] = [];

export const NOTES: { title: string; body: string; time: string; by: string }[] = [];

export const HOTEL_PHOTO = '';

export const MAP_PINS = [
  { x: '20%', y: '30%' },
  { x: '75%', y: '25%' },
  { x: '30%', y: '75%' },
  { x: '80%', y: '70%' },
] as const;
