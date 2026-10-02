// ── Color utilities ─────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
}
function mix(hex: string, target: string, t: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}
function darken(hex: string, t: number): string {
  return mix(hex, '#000000', t);
}
function lighten(hex: string, t: number): string {
  return mix(hex, '#ffffff', t);
}
function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── Base surfaces (shared across themes, split by mode) ─────────────────────
const baseDark = {
  bg: '#141210',
  bg2: '#1b1814',
  bg3: '#231e19',
  canvas: '#0f0d0b',
  card: '#1f1b17',
  card2: '#262019',
  elevated: '#2c251e',
  border: '#2e2822',
  border2: '#3e362e',
  ink: '#f2ece3',
  text: '#f1ebe2',
  text2: '#b8afa3',
  text3: '#857d70',
  textDim: '#544b41',
  warn: '#e2b361',
  danger: '#c4554a',
  warnBg: 'rgba(217, 164, 65, 0.14)',
  warnBorder: 'rgba(217, 164, 65, 0.32)',
  warnInk: '#e2b361',
  black: '#f1ebe2',
  onBlack: '#18140f',
  white: '#ffffff',
} as const;

const baseLight = {
  bg: '#f6efe2',
  bg2: '#efe6d2',
  bg3: '#e8dcc0',
  canvas: '#faf4e8',
  card: '#fefaf0',
  card2: '#f4ecd8',
  elevated: '#fffcf3',
  border: '#e8dcc0',
  border2: '#d6c498',
  ink: '#2b1d0c',
  text: '#3d2a12',
  text2: '#6b5131',
  text3: '#9a7d52',
  textDim: '#c2a472',
  warn: '#8e5f14',
  danger: '#9c3a2d',
  warnBg: 'rgba(184, 137, 43, 0.16)',
  warnBorder: 'rgba(184, 137, 43, 0.32)',
  warnInk: '#7a5a18',
  black: '#2a1d0d',
  onBlack: '#f9f1de',
  white: '#ffffff',
} as const;

// ── Themes (accent identity per mode) ──────────────────────────────────────
export type ThemeId = 'sand' | 'ocean' | 'forest' | 'rose' | 'dusk';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  dark: { accent: string; gold: string; coral: string };
  light: { accent: string; gold: string; coral: string };
}

export const THEMES: ThemeDefinition[] = [
  { id: 'sand', label: 'Sand', dark: { accent: '#d8ab7a', gold: '#d9a441', coral: '#e38868' }, light: { accent: '#a64d1e', gold: '#b8892b', coral: '#c66a36' } },
  { id: 'ocean', label: 'Ocean', dark: { accent: '#63c6d4', gold: '#e0c46a', coral: '#5b9bd4' }, light: { accent: '#1e7f8c', gold: '#a8842b', coral: '#3a6fa8' } },
  { id: 'forest', label: 'Forest', dark: { accent: '#8fc279', gold: '#d4b84a', coral: '#d4826a' }, light: { accent: '#4a7a3a', gold: '#a8842b', coral: '#a8563a' } },
  { id: 'rose', label: 'Rose', dark: { accent: '#e092a8', gold: '#d9b441', coral: '#e07868' }, light: { accent: '#b8547a', gold: '#a8842b', coral: '#a84838' } },
  { id: 'dusk', label: 'Dusk', dark: { accent: '#9b8fd4', gold: '#d4a341', coral: '#c46a9e' }, light: { accent: '#5b4f9e', gold: '#a8842b', coral: '#8e4a74' } },
];

function accentSet(a: string, gold: string, coral: string) {
  const accentDk = darken(a, 0.22);
  const accentLt = lighten(a, 0.18);
  return {
    accent: a,
    accentDk,
    accentLt,
    accentDim: alpha(a, 0.14),
    accentBg: alpha(a, 0.10),
    accentBorder: alpha(a, 0.32),
    info: accentDk,
    success: a,
    gold,
    coral,
    fab1: accentDk,
    fab2: coral,
    fab3: accentLt,
    fab4: gold,
    chart1: a,
    chart2: coral,
    chart3: accentLt,
    chart4: gold,
    chart5: accentDk,
    // Legacy aliases (accent-derived)
    green: a,
    green2: accentLt,
    blue: accentDk,
    purple: accentDk,
    pink: coral,
  };
}

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bg: string; bg2: string; bg3: string; canvas: string; card: string; card2: string; elevated: string; border: string; border2: string; ink: string;
  text: string; text2: string; text3: string; textDim: string;
  accent: string; accentDk: string; accentLt: string; accentDim: string; accentBg: string; accentBorder: string;
  warn: string; info: string; success: string; danger: string;
  fab1: string; fab2: string; fab3: string; fab4: string;
  chart1: string; chart2: string; chart3: string; chart4: string; chart5: string;
  black: string; onBlack: string;
  gold: string; coral: string;
  warnBg: string; warnBorder: string; warnInk: string;
  green: string; green2: string; blue: string; amber: string; red: string; purple: string; pink: string; white: string;
}

export function getThemeColors(themeId: ThemeId, mode: ThemeMode): ThemeColors {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const base = mode === 'dark' ? baseDark : baseLight;
  const acc = mode === 'dark' ? theme.dark : theme.light;
  return {
    ...base,
    ...accentSet(acc.accent, acc.gold, acc.coral),
    amber: base.warn,
    red: base.danger,
  };
}

// Default palette (static styles + backwards-compat imports reference the
// sand/dark theme; runtime components use `useTheme()` for the active theme).
export const colors = getThemeColors('sand', 'dark');

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.8 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.7 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.5 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.text2 },
  sectionLabel: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 1.7, color: colors.text3 },
  eyebrow: { fontSize: 10, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 1.8, color: colors.text3 },
  mono: { fontFamily: 'SpaceMono', fontSize: 14 },
  display: { fontWeight: '500' as const, letterSpacing: -0.8 },
} as const;

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.30,
    shadowRadius: 6,
    elevation: 4,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;
