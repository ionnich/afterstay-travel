import { Car, Compass, ShoppingBag, UtensilsCrossed } from 'lucide-react-native';
import type { Expense } from '@/lib/types';

export type BudgetMode = 'budget' | 'group';
export type TabId = 'overview' | 'fate';
export type BudgetState = 'cruising' | 'low' | 'over';

export const CATEGORIES = [
  { name: 'Food & Drink', matchKey: 'Food', icon: UtensilsCrossed, colorKey: 'chart1' as const },
  { name: 'Transport', matchKey: 'Transport', icon: Car, colorKey: 'chart2' as const },
  { name: 'Activities', matchKey: 'Activity', icon: Compass, colorKey: 'chart3' as const },
  { name: 'Shopping', matchKey: 'Shopping', icon: ShoppingBag, colorKey: 'chart4' as const },
];

export function smartTitle(e: Expense): string {
  let desc = e.description.trim()
    .replace(/^payment transaction at /i, '')
    .replace(/^ride booking service with /i, '')
    .replace(/^dinner for multiple people with /i, '')
    .replace(/^purchase at /i, '')
    .replace(/^online payment to /i, '')
    .replace(/ in \w[\w\s]*$/i, '');
  if (e.placeName && e.placeName.length > 2) {
    const catMap: Record<string, string> = { Food: 'Food', Transport: 'Ride', Activity: 'Activity', Shopping: 'Shopping', Accommodation: 'Stay', Other: '' };
    const prefix = catMap[e.category] ?? '';
    desc = prefix ? `${prefix} at ${e.placeName}` : e.placeName;
  }
  if (desc.length > 0) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  if (desc.length > 35) desc = desc.slice(0, 32) + '\u2026';
  return desc || e.description.slice(0, 35);
}
