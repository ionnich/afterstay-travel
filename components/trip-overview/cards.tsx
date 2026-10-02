import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronDown, Copy } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { useTheme, ThemeColors } from '@/constants/ThemeContext';
import { elevation, radius, spacing } from '@/constants/theme';
import { updateTripProperty } from '@/lib/api';

export function CollapsibleCard({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getCardStyles(colors), [colors]);
  const [open, setOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 1 : 0);

  const toggle = () => {
    rotation.value = withTiming(open ? 0 : 1, { duration: 200 });
    setOpen(!open);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.cardHeader} accessibilityLabel={`${open ? 'Collapse' : 'Expand'} ${title}`} accessibilityRole="button">
        {icon}
        <Text style={[styles.cardTitle, { flex: 1 }]}>{title}</Text>
        <Animated.View style={animatedStyle}>
          <ChevronDown size={16} color={colors.text2} />
        </Animated.View>
      </Pressable>
      {open && children}
    </View>
  );
}

export function SimpleCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getCardStyles(colors), [colors]);
  return <View style={styles.card}>{children}</View>;
}

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getCardStyles(colors), [colors]);
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function CopyRow({
  label,
  value,
  notionKey,
  tripId,
  onUpdate,
}: {
  label: string;
  value: string;
  notionKey?: string;
  tripId?: string;
  onUpdate?: (newValue: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getCardStyles(colors), [colors]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleCopy = () => {
    if (value) Clipboard.setStringAsync(value);
  };

  const handleSave = async () => {
    if (!notionKey || !tripId) return;
    setSaving(true);
    try {
      await updateTripProperty(tripId, notionKey, draft);
      onUpdate?.(draft);
      setEditing(false);
      Alert.alert('Saved!', `${label} updated successfully.`);
    } catch (err: any) {
      Alert.alert('Error', `Failed to save ${label}: ${err?.message ?? 'Unknown error'}. Try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View style={styles.editRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.editInputRow}>
          <TextInput
            style={styles.editInput}
            value={draft}
            onChangeText={setDraft}
            autoFocus
            placeholderTextColor={colors.text3}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          <Pressable onPress={handleSave} disabled={saving} style={styles.editSaveBtn}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.editSaveText}>Save</Text>
            )}
          </Pressable>
          <Pressable onPress={() => { setDraft(value); setEditing(false); }}>
            <Text style={styles.editCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!value && !notionKey) return null;

  return (
    <Pressable onPress={notionKey ? () => { setDraft(value); setEditing(true); } : undefined} style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.copyRow}>
        <Text style={[styles.infoValue, !value && styles.emptyValue]}>
          {value || 'Tap to add'}
        </Text>
        {value ? (
          <Pressable onPress={handleCopy} hitSlop={8}>
            <Copy size={14} color={colors.text2} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

export function EditableInfoRow({
  label,
  value,
  notionKey,
  tripId,
  onUpdate,
}: {
  label: string;
  value: string;
  notionKey: string;
  tripId: string;
  onUpdate?: (newValue: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getCardStyles(colors), [colors]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTripProperty(tripId, notionKey, draft);
      onUpdate?.(draft);
      setEditing(false);
      Alert.alert('Saved!', `${label} updated successfully.`);
    } catch (err: any) {
      Alert.alert('Error', `Failed to save ${label}: ${err?.message ?? 'Unknown error'}. Try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View style={styles.editRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.editInputRow}>
          <TextInput
            style={styles.editInput}
            value={draft}
            onChangeText={setDraft}
            autoFocus
            placeholderTextColor={colors.text3}
          />
          <Pressable onPress={handleSave} disabled={saving} style={styles.editSaveBtn}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.editSaveText}>Save</Text>
            )}
          </Pressable>
          <Pressable onPress={() => { setDraft(value); setEditing(false); }}>
            <Text style={styles.editCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !value && styles.emptyValue]}>
        {value || 'Tap to add'}
      </Text>
    </Pressable>
  );
}

const getCardStyles = (colors: ThemeColors) => StyleSheet.create({
  // card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  infoLabel: { color: colors.text2, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '500' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyValue: { color: colors.text3, fontStyle: 'italic' },
  editRow: { paddingVertical: spacing.xs, gap: spacing.xs },
  editInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bg3,
  },
  editSaveBtn: {
    backgroundColor: colors.green,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  editSaveText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  editCancelText: { color: colors.text2, fontSize: 12 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.bg3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
