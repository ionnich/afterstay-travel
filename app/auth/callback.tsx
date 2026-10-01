import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AfterStayLoader from '@/components/AfterStayLoader';
import { useTheme } from '@/constants/ThemeContext';
import { spacing, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();
  const { session } = useAuth();
  const { colors } = useTheme();
  const [timedOut, setTimedOut] = useState(false);

  // Redirect once the session appears. The AuthProvider refreshes the session
  // via its Amplify Hub `signedIn` listener after signInWithRedirect exchanges
  // the OAuth code — this screen just waits for that, then redirects home.
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  // If the exchange never produced a session, surface an error instead of
  // silently bouncing back to login unauthenticated.
  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timeout);
  }, []);

  if (timedOut && !session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Sign-in failed</Text>
        <Text style={[styles.subtext, { color: colors.text2 }]}>
          We couldn't complete sign-in. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/auth/login')}
          style={[styles.button, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to sign-in"
        >
          <Text style={[styles.buttonText, { color: colors.onBlack }]}>Back to sign-in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <AfterStayLoader />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
