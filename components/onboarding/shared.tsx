import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, ThemeColors } from '@/constants/ThemeContext';

export type Path = null | 'plan' | 'upload' | 'invited';

export function BrandRow({ step, of, colors }: { step?: number; of?: number; colors: ThemeColors }) {
  return (
    <View style={shared.brandRow}>
      <Text style={[shared.brandText, { color: colors.text2 }]}>
        after<Text style={{ color: colors.accent, fontStyle: 'italic', fontWeight: '500' }}>stay</Text>
      </Text>
      {step && of ? (
        <View style={shared.dots}>
          {Array.from({ length: of }, (_, i) => (
            <View
              key={i}
              style={[
                shared.dot,
                {
                  width: i + 1 === step ? 18 : 6,
                  backgroundColor: i < step ? colors.accent : colors.border2,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function Header({
  onBack, kicker, title, sub, colors,
}: {
  onBack?: () => void; kicker?: string; title: string; sub?: string; colors: ThemeColors;
}) {
  return (
    <View style={shared.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={shared.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={16} color={colors.text3} strokeWidth={2} />
          <Text style={[shared.backText, { color: colors.text3 }]}>Back</Text>
        </TouchableOpacity>
      )}
      {kicker && (
        <Text style={[shared.kicker, { color: colors.accent }]}>{kicker}</Text>
      )}
      <Text style={[shared.title, { color: colors.text }]}>{title}</Text>
      {sub && <Text style={[shared.sub, { color: colors.text2 }]}>{sub}</Text>}
    </View>
  );
}

export function PrimaryBtn({
  children, onPress, disabled, colors,
}: {
  children: React.ReactNode; onPress: () => void; disabled?: boolean; colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[shared.primaryBtn, { backgroundColor: disabled ? colors.card2 : colors.black, borderColor: disabled ? colors.border : colors.black }]}
    >
      {typeof children === 'string' ? (
        <Text style={[shared.primaryText, { color: disabled ? colors.text3 : colors.onBlack }]}>{children}</Text>
      ) : children}
    </TouchableOpacity>
  );
}

export function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={shared.ghostBtn} activeOpacity={0.7}>
      <Text style={[shared.ghostText, { color: colors.text2 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function FieldLabel({ label, colors }: { label: string; colors: ThemeColors }) {
  return <Text style={[shared.fieldLabel, { color: colors.text3 }]}>{label}</Text>;
}

export function Input({
  value, onChange, placeholder, prefix, colors, autoFocus,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  prefix?: string; colors: ThemeColors; autoFocus?: boolean;
}) {
  return (
    <View style={[shared.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {prefix && (
        <Text style={[shared.inputPrefix, { color: colors.text2, borderRightColor: colors.border }]}>{prefix}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        style={[shared.input, { color: colors.text }]}
        autoFocus={autoFocus}
      />
    </View>
  );
}

export const shared = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },

  // Brand row
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingTop: 6 },
  brandText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
  dots: { marginLeft: 'auto', flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { height: 6, borderRadius: 99 },

  // Header
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  backText: { fontSize: 12, fontWeight: '600' },
  kicker: { fontSize: 10, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 28, lineHeight: 30, letterSpacing: -0.8, fontWeight: '500', marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 21, maxWidth: 320 },

  // Section
  section: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 24, gap: 12 },

  // Buttons
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, borderWidth: 1 },
  primaryText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.14 },
  ghostBtn: { paddingVertical: 13, alignItems: 'center' },
  ghostText: { fontSize: 13, fontWeight: '600' },

  // Fields
  fieldLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: -4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderWidth: 1, borderRadius: 12, height: 50 },
  inputPrefix: { fontSize: 14, fontWeight: '600', paddingRight: 8, borderRightWidth: 1 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', letterSpacing: -0.15 },

  // Path cards
  cards: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16, gap: 12 },
  pathCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 1 },
  pathIcon: { width: 64, height: 64, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pathKicker: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 3 },
  pathLabel: { fontSize: 17, lineHeight: 20, letterSpacing: -0.34, marginBottom: 4 },
  pathSub: { fontSize: 12, lineHeight: 17 },
  pathArrow: { width: 28, height: 28, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { paddingHorizontal: 22, paddingBottom: 12, textAlign: 'center', fontSize: 11.5, lineHeight: 17 },
  skipBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, marginBottom: 32 },
  skipText: { fontSize: 13, fontWeight: '500', letterSpacing: -0.1 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },

  // Vibes
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vibeCard: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  vibeEmoji: { fontSize: 22 },
  vibeLabel: { fontSize: 12.5, fontWeight: '600', letterSpacing: -0.12 },

  // Options (when/arrival)
  optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: 12, borderWidth: 1 },
  optionText: { fontSize: 13.5, fontWeight: '600', letterSpacing: -0.13 },

  // Stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, borderWidth: 1 },
  stepperValue: { fontSize: 13.5, fontWeight: '600' },
  stepperHint: { fontSize: 11, marginTop: 2 },
  stepperBtns: { flexDirection: 'row', gap: 8 },
  stepperBtn: { width: 34, height: 34, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Footnote
  footnote: { marginTop: -4, fontSize: 11, textAlign: 'center', lineHeight: 16 },

  // Upload checklist
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  checkIcon: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  checkTitle: { fontSize: 13.5, fontWeight: '600', letterSpacing: -0.13 },
  checkSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  optionalTag: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },

  // Dropzone
  dropzone: { alignItems: 'center', padding: 22, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed' },
  dropzoneIcon: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dropzoneTitle: { fontSize: 14, fontWeight: '600', letterSpacing: -0.14 },
  dropzoneSub: { fontSize: 11.5, marginTop: 4 },

  // Scanning
  scanCircle: { width: 120, height: 120, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  scanText: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  scanSub: { fontSize: 13, marginTop: 6 },

  // Trip card (invited)
  tripCard: { padding: 18, borderRadius: 18, borderWidth: 1, alignItems: 'center', gap: 4 },
  tripCardLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 4 },
  tripCardDest: { fontSize: 22, fontWeight: '500', letterSpacing: -0.44 },
  tripCardDates: { fontSize: 12.5 },

  // Info list (invited)
  infoList: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '600', letterSpacing: -0.13 },
  infoVal: { fontSize: 11.5, marginTop: 1 },

  // Baggage
  bagRow: { flexDirection: 'row', gap: 8 },
  bagBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  bagText: { fontSize: 12.5, fontWeight: '600', letterSpacing: -0.12 },
});
