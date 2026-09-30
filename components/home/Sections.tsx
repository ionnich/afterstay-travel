import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, ThemeColors } from '@/constants/ThemeContext';

/* ── Section header matching prototype's GroupHeader ── */
export function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={sectionHeaderStyles.container}>
      <View>
        <Text style={[sectionHeaderStyles.kicker, { color: colors.text3 }]}>
          {kicker}
        </Text>
        <Text style={[sectionHeaderStyles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.16 * 10,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.6,
  },
});

export function CollapsibleSection({
  kicker,
  title,
  defaultOpen = true,
  children,
}: {
  kicker: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={sectionHeaderStyles.container}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${open ? 'collapse' : 'expand'}`}
      >
        <View>
          <Text style={[sectionHeaderStyles.kicker, { color: colors.text3 }]}>
            {kicker}
          </Text>
          <Text style={[sectionHeaderStyles.title, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={{ color: colors.text3, fontSize: 12, fontWeight: '600' }}>
          {open ? 'Hide' : 'Show'}
        </Text>
      </Pressable>
      {open && children}
    </View>
  );
}
