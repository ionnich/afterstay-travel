import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/ThemeContext';
import { useAuth } from '@/lib/auth';
import { signUp as cognitoSignUp, signInWithRedirect } from 'aws-amplify/auth';
import RootPanel from '@/components/auth/RootPanel';
import EmailForm from '@/components/auth/EmailForm';

type Panel = 'root' | 'email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, session } = useAuth();
  const router = useRouter();

  const [panel, setPanel] = useState<Panel>('root');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect when session appears (Google OAuth or email/password)
  // _layout.tsx auth gate handles the actual stack swap; this just resets to index
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const handleAuthAction = async () => {
    if (!isEmailValid || !password) return;
    setLoading(true);
    setError(null);

    if (isSignUp) {
      try {
        await cognitoSignUp({
          username: email.trim(),
          password,
          options: { userAttributes: { email: email.trim() } },
        });
        setLoading(false);
        Alert.alert('Verify your email', 'We sent a confirmation link to your email. Please check it to complete registration.');
      } catch (e) {
        setLoading(false);
        setError(e instanceof Error ? e.message : 'Sign up failed');
      }
    } else {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setLoading(false);
        setError(err);
      }
    }
    // Success: session useEffect handles redirect
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithRedirect({ provider: 'Google' });
      // Success: OAuth redirect → /auth/callback → session useEffect handles redirect
    } catch (e: unknown) {
      setLoading(false);
      const err = e as { code?: string; message?: string };
      Alert.alert('Google Sign-In failed', err.message ?? 'Unknown error');
    }
  };

  const resetToPanel = (target: Panel) => {
    setError(null);
    setPanel(target);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {panel === 'root' && (
            <RootPanel
              colors={colors}
              onGoogle={handleGoogle}
              onEmail={() => resetToPanel('email')}
            />
          )}
          {panel === 'email' && (
            <EmailForm
              colors={colors}
              isSignUp={isSignUp}
              email={email}
              password={password}
              error={error}
              loading={loading}
              isEmailValid={isEmailValid}
              onChangeEmail={setEmail}
              onChangePassword={setPassword}
              onToggleSignUp={() => setIsSignUp(!isSignUp)}
              onAuthAction={handleAuthAction}
              onBack={() => resetToPanel('root')}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay — shown during Google/email sign-in */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.bg + 'DD' }]}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[styles.loadingText, { color: colors.text2 }]}>Signing you in…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
});
