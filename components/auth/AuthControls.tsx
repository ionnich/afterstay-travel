import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';
import { EmailIcon } from './AuthIcons';

/* ─── Stagger animation helper ─── */

export function StaggeredItem({ index, children }: { index: number; children: React.ReactNode }) {
  const translateY = useSharedValue(10);
  const itemOpacity = useSharedValue(0);

  useEffect(() => {
    const delay = (0.45 + index * 0.07) * 1000;
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.bezier(0.2, 0.7, 0.2, 1) }),
    );
    itemOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.bezier(0.2, 0.7, 0.2, 1) }),
    );
  }, [index, translateY, itemOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: itemOpacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/* ─── Divider OR ─── */

export function DividerOr({ colors }: { colors: ThemeColors }) {
  return (
    <View style={dividerStyles.row}>
      <View style={[dividerStyles.line, { backgroundColor: colors.border }]} />
      <Text style={[dividerStyles.text, { color: colors.text3 }]}>OR</Text>
      <View style={[dividerStyles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 2,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.18 * 10, // 0.18em * 10
  },
});

/* ─── SignInButton ─── */

export function SignInButton({
  icon,
  label,
  bg,
  fg,
  borderColor,
  onPress,
  shadow,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  fg: string;
  borderColor: string;
  onPress: () => void;
  shadow?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        signInStyles.button,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: 1,
        },
        shadow && signInStyles.shadow,
      ]}
    >
      {icon}
      <Text style={[signInStyles.label, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const signInStyles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.01 * 14, // -0.01em
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});

/* ─── PrimaryButton ─── */

export function PrimaryButton({
  children,
  onPress,
  disabled,
  colors,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={[
        primaryStyles.button,
        {
          backgroundColor: disabled ? colors.card2 : colors.black,
          borderColor: disabled ? colors.border : colors.black,
          borderWidth: 1,
        },
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[primaryStyles.text, { color: disabled ? colors.text3 : colors.onBlack }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export const primaryStyles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.01 * 14,
  },
});

/* ─── FieldLabel ─── */

export function FieldLabel({ children, colors }: { children: string; colors: ThemeColors }) {
  return (
    <Text style={[fieldLabelStyles.label, { color: colors.text3 }]}>{children}</Text>
  );
}

const fieldLabelStyles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.14 * 10, // 0.14em
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});

/* ─── StyledInput ─── */

export function StyledInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoFocus,
  keyboardType,
  autoCapitalize,
  autoComplete,
  prefix,
  colors,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'password' | 'tel';
  prefix?: string;
  colors: ThemeColors;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        inputStyles.container,
        {
          backgroundColor: colors.card,
          borderColor: focused ? colors.accent : colors.border,
          borderWidth: 1,
        },
      ]}
    >
      {prefix ? (
        <View style={[inputStyles.prefixWrap, { borderRightColor: colors.border }]}>
          <Text style={[inputStyles.prefixText, { color: colors.text2 }]}>{prefix}</Text>
        </View>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        secureTextEntry={secureTextEntry}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[inputStyles.input, { color: colors.text }]}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 50,
  },
  prefixWrap: {
    paddingRight: 8,
    borderRightWidth: 1,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.01 * 15,
  },
});

/* ─── Success icon with pop animation ─── */

export function SuccessIcon({
  colors,
}: {
  colors: ThemeColors;
}) {
  const scale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    iconOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
  }, [scale, iconOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: iconOpacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={[
        successStyles.circle,
        {
          backgroundColor: colors.accentBg,
          borderColor: colors.accentBorder,
          borderWidth: 1,
        },
      ]}>
        <EmailIcon />
      </View>
    </Animated.View>
  );
}

const successStyles = StyleSheet.create({
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
