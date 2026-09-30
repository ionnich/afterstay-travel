import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/ThemeContext';
import { spacing } from '@/constants/theme';
import { SignInButton, DividerOr, StaggeredItem } from './AuthControls';
import { AppleIcon, GoogleIcon, EmailIcon, SMSIcon } from './AuthIcons';

interface OAuthButtonsProps {
  colors: ThemeColors;
  onGoogle: () => void;
  onEmail: () => void;
}

export default function OAuthButtons({ colors, onGoogle, onEmail }: OAuthButtonsProps) {
  return (
    <View style={styles.buttonGroup}>
      {/* Apple — not yet wired */}
      <StaggeredItem index={1}>
        <View style={{ opacity: 0.45 }}>
          <SignInButton
            onPress={() => {}}
            icon={<AppleIcon />}
            label="Continue with Apple — coming soon"
            bg="#000"
            fg="#fff"
            borderColor="#000"
          />
        </View>
      </StaggeredItem>

      {/* Google */}
      <StaggeredItem index={2}>
        <SignInButton
          onPress={onGoogle}
          icon={<GoogleIcon />}
          label="Continue with Google"
          bg="#fff"
          fg="#1f1f1f"
          borderColor="#dadce0"
          shadow
        />
      </StaggeredItem>

      {/* OR divider */}
      <StaggeredItem index={3}>
        <DividerOr colors={colors} />
      </StaggeredItem>

      {/* Email */}
      <StaggeredItem index={4}>
        <SignInButton
          onPress={onEmail}
          icon={<EmailIcon />}
          label="Continue with email"
          bg={colors.card}
          fg={colors.text}
          borderColor={colors.border}
        />
      </StaggeredItem>

      {/* Phone — not yet wired */}
      <StaggeredItem index={5}>
        <View style={{ opacity: 0.45 }}>
          <SignInButton
            onPress={() => {}}
            icon={<SMSIcon />}
            label="Continue with phone — coming soon"
            bg={colors.card}
            fg={colors.text}
            borderColor={colors.border}
          />
        </View>
      </StaggeredItem>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: spacing.sm + 2,
  },
});
