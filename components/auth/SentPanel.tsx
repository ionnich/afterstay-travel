import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/ThemeContext';
import { spacing } from '@/constants/theme';
import { PrimaryButton, SuccessIcon, primaryStyles } from './AuthControls';

interface SentPanelProps {
  colors: ThemeColors;
  target: string;
  session: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export default function SentPanel({ colors, target, session, onBack, onContinue }: SentPanelProps) {
  return (
    <View style={[styles.body, { alignItems: 'center' }]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.topBackBtn, { alignSelf: 'flex-start' }]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Back to email"
      >
        <Text style={[styles.topBackText, { color: colors.text2 }]}>{'\u2190'} Back</Text>
      </TouchableOpacity>
      <View style={styles.sentContent}>
        {/* Success icon */}
        <SuccessIcon colors={colors} />

        {/* Text block */}
        <View style={styles.sentTextBlock}>
          <Text style={[styles.sentHeading, { color: colors.text }]}>Check your inbox</Text>
          <Text style={[styles.sentSubtext, { color: colors.text2 }]}>
            We sent a magic link to{'\n'}
            <Text style={{ color: colors.text, fontWeight: '600' }}>{target}</Text>
          </Text>
        </View>

        {/* Continue button */}
        <View style={{ width: '100%', marginTop: 4 }}>
          <PrimaryButton
            onPress={onContinue}
            disabled={!session}
            colors={colors}
          >
            <Text style={[primaryStyles.text, { color: !session ? colors.text3 : colors.onBlack }]}>
              Continue to Afterstay
            </Text>
          </PrimaryButton>
        </View>

        {/* Back link */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.sentBackLink}
          accessibilityRole="button"
          accessibilityLabel="Use a different email"
        >
          <Text style={[styles.sentBackLinkText, { color: colors.text3 }]}>
            Use a different email
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  topBackBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  topBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sentContent: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 6,
  },
  sentTextBlock: {
    alignItems: 'center',
  },
  sentHeading: {
    fontSize: 22,
    letterSpacing: -0.02 * 22,
    fontWeight: '500',
    marginBottom: 6,
  },
  sentSubtext: {
    fontSize: 13,
    lineHeight: 13 * 1.5,
    textAlign: 'center',
    maxWidth: 280,
  },
  sentBackLink: {
    padding: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  sentBackLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
