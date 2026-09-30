export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || '',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || '',
  COGNITO_USER_POOL_ID: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
  COGNITO_OAUTH_DOMAIN: process.env.EXPO_PUBLIC_COGNITO_OAUTH_DOMAIN || '',
  GOOGLE_MAPS_SDK_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_SDK_KEY || '',
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  HOTEL_COORDS: { lat: 11.971, lng: 121.9215 },
  TRIP_BUDGET_KEY: 'tripBudget_v1',
} as const;

export const verifyConfig = (): boolean => {
  const required = [
    ['API_URL', CONFIG.API_URL],
    ['COGNITO_USER_POOL_ID', CONFIG.COGNITO_USER_POOL_ID],
    ['COGNITO_CLIENT_ID', CONFIG.COGNITO_CLIENT_ID],
  ] as const;

  const missing = required.filter(([, v]) => !v).map(([k]) => k);

  const optional = [
    ['WS_URL', CONFIG.WS_URL],
    ['COGNITO_OAUTH_DOMAIN', CONFIG.COGNITO_OAUTH_DOMAIN],
    ['GOOGLE_MAPS_SDK_KEY', CONFIG.GOOGLE_MAPS_SDK_KEY],
    ['GOOGLE_WEB_CLIENT_ID', CONFIG.GOOGLE_WEB_CLIENT_ID],
    ['SENTRY_DSN', CONFIG.SENTRY_DSN],
  ] as const;
  for (const [k, v] of optional) {
    if (!v) console.warn(`[CONFIG] Optional: ${k} not set`);
  }

  if (missing.length) {
    console.error('[CONFIG] Missing env vars:', missing.join(', '));
    console.error('[CONFIG] Make sure they start with EXPO_PUBLIC_ in .env');
  }
  return missing.length === 0;
};
