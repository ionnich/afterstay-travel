import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/ThemeContext';
import { spacing, radius } from '@/constants/theme';
import ConstellationHero from './ConstellationHero';
import OAuthButtons from './OAuthButtons';
import { StaggeredItem } from './AuthControls';

interface RootPanelProps {
  colors: ThemeColors;
  onGoogle: () => void;
  onEmail: () => void;
}

export default function RootPanel({ colors, onGoogle, onEmail }: RootPanelProps) {
  return (
    <>
      <ConstellationHero />

      <View style={styles.body}>
        {/* Heading block */}
        <StaggeredItem index={0}>
          <View style={styles.headingBlock}>
            <Text style={[styles.heading, { color: colors.text }]}>Welcome in.</Text>
            <Text style={[styles.subtitle, { color: colors.text2 }]}>
              Your trip doesn&apos;t end at checkout. Sign in to keep the moments, the memories, the next one.
            </Text>
          </View>
        </StaggeredItem>

        {/* Button group */}
        <OAuthButtons colors={colors} onGoogle={onGoogle} onEmail={onEmail} />

        {/* Social proof strip */}
        <StaggeredItem index={6}>
          <View style={[styles.socialProof, { backgroundColor: colors.card2, borderColor: colors.border }]}>
            <View style={styles.avatarRow}>
              {['#a64d1e', '#c66a36', '#b8892b'].map((c, i) => (
                <View
                  key={c}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: c,
                      marginLeft: i === 0 ? 0 : -6,
                      borderColor: colors.card2,
                      borderWidth: 2,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.socialText, { color: colors.text2 }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Travelers like you</Text>
              {' '}are planning their next trip on AfterStay.
            </Text>
          </View>
        </StaggeredItem>

        {/* Legal */}
        <StaggeredItem index={7}>
          <Text style={[styles.legal, { color: colors.text3 }]}>
            By continuing you agree to our{' '}
            <Text style={[styles.legalLink, { color: colors.accent, textDecorationColor: colors.accentBorder }]}>Terms</Text>
            {' '}&amp;{' '}
            <Text style={[styles.legalLink, { color: colors.accent, textDecorationColor: colors.accentBorder }]}>Privacy</Text>.
          </Text>
        </StaggeredItem>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  headingBlock: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 26,
    lineHeight: 26 * 1.1,
    letterSpacing: -0.03 * 26,
    fontWeight: '500',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 13.5 * 1.5,
    maxWidth: 310,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
  },
  socialText: {
    fontSize: 11.5,
    lineHeight: 11.5 * 1.4,
    flex: 1,
  },
  legal: {
    marginTop: spacing.lg + 2,
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 10.5 * 1.55,
    letterSpacing: 0.01 * 10.5,
  },
  legalLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
