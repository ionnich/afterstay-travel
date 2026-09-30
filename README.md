# AfterStay Travel

The mobile app for [AfterStay](https://afterstay.travel) — the period between
booking a hotel and checking out, made effortless: itinerary, group
coordination, local discovery, budget, and memories for one active trip.

Built with **Expo 55 / React Native 0.83 / React 19** + TypeScript. Backend is
AWS (Rust Lambdas + RDS + Cognito + S3) — see the companion repo
[`afterstay-travel-rs`](https://github.com/ionnich/afterstay-travel-rs).

## Stack

| Concern | Choice |
|---|---|
| Framework | Expo 55, `expo-router` (typed routes, file-based) |
| UI | React Native 0.83, `StyleSheet.create` + theme tokens (no styling lib) |
| Icons / animation | `lucide-react-native`, `react-native-reanimated` 4 |
| Maps | `react-native-maps` (Google provider) |
| Server state | `@tanstack/react-query` + `AsyncStorage` cache (`lib/cache.ts`) |
| Auth | AWS Cognito via `aws-amplify` (email/password, magic link, Google OAuth) |
| Data / AI / weather | AWS API Gateway (`lib/api.ts`) — no cloud keys in the client |
| Errors | `@sentry/react-native` |
| Tests | Jest + `jest-expo` |

## Getting started

```bash
cp .env.example .env   # fill in the EXPO_PUBLIC_* values below
npm install
npm start              # expo start
npm run ios            # or: npm run android, npm run web
npm test               # jest --watchAll
```

EAS builds: `eas build -p ios --profile preview` (see `eas.json`). Project id
`a804380e-5c0d-425e-ac2b-7c07b8b81fd4`.

## Environment (`.env`)

All client env vars are `EXPO_PUBLIC_*` (baked into the bundle at build time).
`lib/config.ts` + `verifyConfig()` enforce them.

| Variable | Required | Purpose |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | REST base URL (API Gateway) |
| `EXPO_PUBLIC_COGNITO_USER_POOL_ID` | ✅ | Cognito pool |
| `EXPO_PUBLIC_COGNITO_CLIENT_ID` | ✅ | Cognito app client |
| `EXPO_PUBLIC_WS_URL` | — | WebSocket chat URL |
| `EXPO_PUBLIC_COGNITO_OAUTH_DOMAIN` | — | Cognito hosted-UI domain (Google OAuth) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | — | Google OAuth web client id |
| `EXPO_PUBLIC_GOOGLE_MAPS_SDK_KEY` | — | Native map tiles (also read by `app.config.js`) |
| `EXPO_PUBLIC_SENTRY_DSN` | — | Client DSN (public by design) |

No Anthropic / Google Places / Weather keys live here — those are server-side
(Secrets Manager in the backend repo).

## Project layout

```
app/            screens (expo-router). (tabs)/ = home, guide, discover, budget, trip
                + hidden moments/settings; modals: add-*, scan-*, trip-*, group-chat,
                invite/join-trip, fate-decides, auth/login + auth/callback, onboarding
components/     shared + feature UI, subfoldered by tab (auth, budget, discover, fate,
                guide, home, loader, moments, onboarding, shared, summary, trip, trip-overview)
constants/      theme.ts (colors/spacing/radius/typography/elevation/density), ThemeContext.tsx
hooks/          budget/, fate/
lib/            api.ts (REST client), auth.ts (Cognito), config.ts, types.ts (domain model),
                cache.ts, queryClient.ts, utils.ts, distance.ts, imageUrl.ts,
                compressImage.ts, calendarInvite.ts, placeDetails.ts
```

## Conventions

- **Theme tokens only** — import `colors`, `spacing`, `radius`, `typography`,
  `elevation`, `density` from `@/constants/theme`. Theme-dependent styles use the
  `getStyles(colors)` factory + `useTheme()` from `@/constants/ThemeContext`.
- **`lib/types.ts` is the domain model.** Data functions take/return those types.
- **No data access in screens.** Screens call `lib/api.ts`; the API signature is
  the contract (mirrors the backend `api` Lambda 1:1).
- **PHT (UTC+8) is canonical.** Date-only strings go through `safeParse` /
  `formatDatePHT` / `formatTimePHT` in `lib/utils.ts`, never raw `new Date(iso)`.
- **Cache reads** via `cacheGet`/`cacheSet`/`swr` in `lib/cache.ts` so the app
  opens instantly from last-known state.

## Auth flow

`lib/auth.ts` configures Amplify against Cognito. `useAuth()` exposes
`user`/`session`/`loading` + `signIn` (email/password), `signInWithMagicLink`,
and `signInAsDemo` (client-only dev session). Google OAuth completes through
`afterstay://auth/callback` (see `app/auth/callback.tsx`); invites deep-link to
`app/invite.tsx` / `app/join-trip.tsx` via `expo-linking`.

## Testing

```bash
npm test            # jest --watchAll (jest-expo preset)
npx tsc --noEmit    # type-check
npx ts-prune        # unused exports
```
