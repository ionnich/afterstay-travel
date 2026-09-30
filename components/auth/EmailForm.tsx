import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/ThemeContext';
import { spacing } from '@/constants/theme';
import {
  DividerOr,
  FieldLabel,
  PrimaryButton,
  StyledInput,
  primaryStyles,
} from './AuthControls';
import { ArrowIcon } from './AuthIcons';

interface EmailFormProps {
  colors: ThemeColors;
  isSignUp: boolean;
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  isEmailValid: boolean;
  onChangeEmail: (text: string) => void;
  onChangePassword: (text: string) => void;
  onToggleSignUp: () => void;
  onAuthAction: () => void;
  onSendMagicLink: () => void;
  onBack: () => void;
}

export default function EmailForm({
  colors,
  isSignUp,
  email,
  password,
  error,
  loading,
  isEmailValid,
  onChangeEmail,
  onChangePassword,
  onToggleSignUp,
  onAuthAction,
  onSendMagicLink,
  onBack,
}: EmailFormProps) {
  return (
    <View style={styles.body}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.topBackBtn}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Back to sign-in options"
      >
        <Text style={[styles.topBackText, { color: colors.text2 }]}>{'\u2190'} Back</Text>
      </TouchableOpacity>

      {/* Heading */}
      <View style={styles.headingBlock}>
        <Text style={[styles.subHeading, { color: colors.text }]}>
          {isSignUp ? 'Create an account' : 'Sign in with email'}
        </Text>
        <Text style={[styles.subText, { color: colors.text2 }]}>
          {isSignUp ? 'Join Afterstay to start planning your trips.' : "We'll send a secure link — no password to remember."}
        </Text>
      </View>

      {/* Fields */}
      <View style={styles.fieldGroup}>
        <View>
          <FieldLabel colors={colors}>Email</FieldLabel>
          <StyledInput
            value={email}
            onChangeText={onChangeEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            colors={colors}
          />
        </View>

        <View>
          <FieldLabel colors={colors}>Password</FieldLabel>
          <StyledInput
            value={password}
            onChangeText={onChangePassword}
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
            colors={colors}
          />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        ) : null}

        {/* Sign In / Sign Up (password) */}
        <PrimaryButton
          onPress={onAuthAction}
          disabled={!isEmailValid || !password || loading}
          colors={colors}
        >
          {loading ? (
            <ActivityIndicator color={colors.onBlack} size="small" />
          ) : (
            <>
              <Text style={[primaryStyles.text, { color: !isEmailValid || !password ? colors.text3 : colors.onBlack }]}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
              <ArrowIcon />
            </>
          )}
        </PrimaryButton>

        {/* Toggle Sign In / Sign Up */}
        <TouchableOpacity
          onPress={onToggleSignUp}
          style={styles.toggleAuth}
        >
          <Text style={[styles.toggleAuthText, { color: colors.text2 }]}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              {isSignUp ? 'Sign In' : 'Create one'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* OR divider */}
        <DividerOr colors={colors} />

        {/* Send magic link */}
        <TouchableOpacity
          onPress={onSendMagicLink}
          disabled={!isEmailValid || loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send magic link instead"
          style={[
            styles.ghostButton,
            {
              borderColor: colors.accentBorder,
              opacity: !isEmailValid ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.ghostButtonText, { color: colors.accent }]}>
            Send magic link instead
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back link */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.backLink}
        accessibilityRole="button"
        accessibilityLabel="Back to sign-in options"
      >
        <Text style={[styles.backLinkText, { color: colors.text3 }]}>
          {'\u2190'} Back to sign-in options
        </Text>
      </TouchableOpacity>
    </View>
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
  subHeading: {
    fontSize: 24,
    lineHeight: 24 * 1.1,
    letterSpacing: -0.03 * 24,
    fontWeight: '500',
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    lineHeight: 13 * 1.45,
  },
  fieldGroup: {
    gap: spacing.md + 2,
  },
  ghostButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  backLink: {
    alignSelf: 'center',
    padding: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  toggleAuth: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleAuthText: {
    fontSize: 13,
  },
});
