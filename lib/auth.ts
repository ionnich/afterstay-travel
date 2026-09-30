import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { router as expoRouter } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { signIn as amplifySignIn, signOut as amplifySignOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCacheUserId } from './cache';
import { CONFIG } from './config';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: CONFIG.COGNITO_USER_POOL_ID,
      userPoolClientId: CONFIG.COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: CONFIG.COGNITO_OAUTH_DOMAIN,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['afterstay://auth/callback'],
          redirectSignOut: ['afterstay://auth/login'],
          responseType: 'code',
        },
      },
    },
  },
});

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface Session {
  accessToken: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
}

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@afterstay.travel',
  name: 'Demo Traveler',
};

const DEMO_SESSION: Session = { accessToken: 'demo-token' };

// Module-scoped flag so getAccessToken can report the demo token outside React state.
let demoActive = false;

export async function getAccessToken(): Promise<string | null> {
  if (demoActive) return DEMO_SESSION.accessToken;
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

async function buildUser(): Promise<User | null> {
  const { userId, username, signInDetails } = await getCurrentUser();
  const email = signInDetails?.loginId || username;
  let name: string | undefined;
  try {
    const { tokens } = await fetchAuthSession();
    const claims = (tokens?.idToken?.payload ?? {}) as Record<string, unknown>;
    name = (claims.name as string) || (claims['custom:name'] as string) || undefined;
  } catch {
    // name is optional
  }
  return { id: userId, email, name };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  signInAsDemo: () => {},
  signOut: async () => {},
});

async function clearTripStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const tripKeys = keys.filter(
      (k) =>
        k.startsWith('trip:') ||
        k.startsWith('flights:') ||
        k.startsWith('moments:') ||
        k.startsWith('discover:'),
    );
    if (tripKeys.length > 0) await AsyncStorage.multiRemove(tripKeys);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then(async () => {
        const u = await buildUser();
        if (cancelled) return;
        setUser(u);
        setCacheUserId(u?.id);
        if (u) {
          const token = await getAccessToken();
          setSession({ accessToken: token ?? '' });
        }
      })
      .catch(() => {
        // Not signed in — stay on login screen
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle deep link callbacks (invite)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      // Invite deep link: afterstay://join-trip?code=X
      const joinParamMatch = url.match(/[?&]code=([^&#]+)/);
      if (url.includes('join-trip') && joinParamMatch) {
        expoRouter.push({ pathname: '/join-trip', params: { code: joinParamMatch[1] } });
        return;
      }

      // Universal link: https://afterstay.travel/join/CODE
      const joinPathMatch = url.match(/\/join\/([A-Za-z0-9]+)/);
      if (joinPathMatch) {
        expoRouter.push({ pathname: '/join-trip', params: { code: joinPathMatch[1] } });
        return;
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await amplifySignIn({ username: email, password });
      const u = await buildUser();
      setUser(u);
      setCacheUserId(u?.id);
      if (u) {
        const token = await getAccessToken();
        setSession({ accessToken: token ?? '' });
      }
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Sign in failed' };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      // Initiates the pool's email OTP challenge (SRP start).
      await amplifySignIn({ username: email });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Sign in failed' };
    }
  };

  const signInAsDemo = () => {
    demoActive = true;
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    setCacheUserId(DEMO_USER.id);
  };

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch {
      // Already signed out
    }
    demoActive = false;
    setUser(null);
    setSession(null);
    setCacheUserId(undefined);
    await clearTripStorage();
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        loading,
        signIn,
        signInWithMagicLink,
        signInAsDemo,
        signOut,
      },
    },
    children,
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
