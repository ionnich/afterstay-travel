import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { router as expoRouter } from 'expo-router';
import { Amplify } from 'aws-amplify';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
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
  signOut: () => Promise<void>;
}

export async function getAccessToken(): Promise<string | null> {
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

  const refreshUser = useCallback(async () => {
    try {
      const u = await buildUser();
      setUser(u);
      setCacheUserId(u?.id);
      if (u) {
        const token = await getAccessToken();
        setSession({ accessToken: token ?? '' });
      } else {
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
      setCacheUserId(undefined);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshUser().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  // Re-check auth whenever Amplify completes a sign-in/sign-out — this is what
  // makes the Google OAuth redirect actually land: signInWithRedirect exchanges
  // the code and emits a `signedIn` Hub event after this provider has already
  // mounted, so without this the session would stay null.
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'signedOut') {
        void refreshUser();
      }
    });
    return () => listener();
  }, [refreshUser]);

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
      await refreshUser();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await amplifySignOut();
    } catch {
      // Already signed out
    }
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
        signOut,
      },
    },
    children,
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
