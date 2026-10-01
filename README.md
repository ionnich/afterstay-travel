# AfterStay Travel

The mobile app for [AfterStay](https://afterstay.travel) — the window between
booking a hotel and checking out, made effortless: itinerary, group
coordination, local discovery, budget, and memories, around one active trip.

Built with **Expo 55 / React Native 0.83 / React 19** + TypeScript (strict).
Backend is AWS (Rust Lambdas + RDS Postgres + Cognito + S3 + API Gateway) — see
the companion repo
[`afterstay-travel-rs`](https://github.com/ionnich/afterstay-travel-rs).

---

## 📱 Download the app

**Android — latest APK:**

<div align="center">

**[⬇ Download AfterStay.apk](https://github.com/ionnich/afterstay-travel/releases/latest/download/AfterStay.apk)**

</div>

1. Download the `.apk` from the link above (always the newest release).
2. On your Android device, tap the downloaded file and allow "install from
   unknown sources" when prompted.
3. Open **AfterStay** and sign in with **Google** or **email**.

> The APK is signed with a development key for testing only — not for the Play
> Store. See [Release process](#release-process) to build your own.

**iOS** — there is no sideloadable iOS build (Apple restricts distribution to
TestFlight/App Store). To run locally: `npm run ios` (needs Xcode). See
[Getting started](#getting-started).

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Expo 55, `expo-router` (typed routes, file-based) |
| UI | React Native 0.83, `StyleSheet.create` + theme tokens (no styling lib) |
| Icons / animation | `lucide-react-native`, `react-native-reanimated` 4 |
| Maps | `react-native-maps` (Google provider on Android, Apple Maps on iOS) |
| Server state | `@tanstack/react-query` + `AsyncStorage` cache (`lib/cache.ts`) |
| Auth | AWS Cognito via `aws-amplify` (email/password + Google OAuth hosted UI) |
| Data / AI / weather | AWS API Gateway → Rust Lambdas (`lib/api.ts`) — no cloud keys in the client |
| Storage | S3 presigned uploads (moments, trip files, avatars) |
| Tests | Jest + `jest-expo` |

## Architecture

```
Mobile app (Expo/RN)
   │  HTTPS + Cognito JWT
   ▼
AWS API Gateway
   ├── /v1/data/*         → api Lambda (trip CRUD, packing, expenses, places, …)
   ├── /v1/integrations/* → integrations Lambda (Anthropic, Google Places, weather)
   └── /v1/integrations/log → error reporting (optional)
   │
   ├── RDS Postgres (trip + member data, RLS via trip_members)
   ├── S3 (moments/ , trip-files/ , avatars/ — presigned uploads)
   └── Cognito (auth + OAuth)
```

All secrets (Anthropic, Places, weather keys, DB creds) live in the backend —
the client only ships the public `EXPO_PUBLIC_*` identifiers listed below.

---

## Getting started

```bash
cp .env.example .env   # fill in the EXPO_PUBLIC_* values (see Environment)
npm install
npm start              # expo start (Metro)
npm run ios            # expo run:ios  — needs Xcode + an iOS simulator
npm run android        # expo run:android — needs Android SDK + an emulator/device
npm test               # jest --watchAll
```

EAS builds: `eas build -p ios --profile preview` (see `eas.json`). Project id
`a804380e-5c0d-425e-ac2b-7c07b8b81fd4`.

### iOS prerequisites

Xcode **26.6** (or any 26.x) + the matching iOS simulator runtime. Newer Xcode
27 requires macOS 26.6+, so a Mac on 26.3.x must use Xcode 26.6. After install:

```bash
sudo xcode-select -s /Applications/Xcode-26.6.0.app/Contents/Developer
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch       # installs platform + simulator runtime
cd ios && pod install
```

CocoaPods requires a UTF-8 locale: `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.

### Android prerequisites

JDK 17 + Android SDK (`platform-tools`, `platforms;android-35`,
`build-tools;35.0.0`, `emulator`, an arm64 system image). The debug keystore is
committed (`android/app/debug.keystore`) so debug/release builds work out of
the box.

---

## Environment (`.env`)

All client env vars are `EXPO_PUBLIC_*` (baked into the bundle at build time).
`lib/config.ts` + `verifyConfig()` enforce them. See `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | REST base URL (API Gateway stage) |
| `EXPO_PUBLIC_COGNITO_USER_POOL_ID` | ✅ | Cognito pool id |
| `EXPO_PUBLIC_COGNITO_CLIENT_ID` | ✅ | Cognito app client id |
| `EXPO_PUBLIC_WS_URL` | — | WebSocket chat URL |
| `EXPO_PUBLIC_COGNITO_OAUTH_DOMAIN` | — | Cognito hosted-UI domain (Google OAuth) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | — | Google OAuth web client id |
| `EXPO_PUBLIC_GOOGLE_MAPS_SDK_KEY` | — | Native map tiles (also read by `app.config.js`) |
| `EXPO_PUBLIC_SENTRY_DSN` | — | Unused (Sentry removed; kept for backward-compat) |

No Anthropic / Google Places / Weather keys live here — those are server-side
(Secrets Manager in the backend repo).

---

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
plugins/        withPackagingFix.ts (build-time plugin)
```

## Conventions

- **Theme tokens only** — import `colors`, `spacing`, `radius`, `typography`,
  `elevation`, `density` from `@/constants/theme`. Theme-dependent styles use the
  `getStyles(colors)` factory + `useTheme()` from `@/constants/ThemeContext`.
- **`lib/types.ts` is the domain model.** Data functions take/return those types.
- **No data access in screens.** Screens call `lib/api.ts`; the API signature is
  the contract (mirrors the backend `api` Lambda 1:1).
- **PHT (UTC+8) is canonical.** Date-only strings go through `safeParse` /
  `formatDatePHT` / `formatTimePHT` in `lib/utils.ts`, never raw `new Date(iso)`
  (Android shifts date-only strings to UTC).
- **Cache reads** via `cacheGet`/`cacheSet`/`swr` in `lib/cache.ts` so the app
  opens instantly from last-known state.

## Auth

`lib/auth.ts` configures Amplify against Cognito. `useAuth()` exposes
`user`/`session`/`loading` plus:

- `signIn(email, password)` — Cognito SRP email/password.
- **Google OAuth** — `signInWithRedirect({ provider: 'Google' })` opens the
  Cognito hosted UI; the `afterstay://auth/callback` deep link returns to
  `app/auth/callback.tsx`, which waits for the session then redirects home.
- `signOut()` — clears the session and trip-scoped cache.

The client JWT is attached to every `lib/api.ts` request via `getAccessToken()`.

> ⚠️ **Known gap:** the "guest" and "magic link" entry points are client stubs —
> the Cognito pool currently only enables `ALLOW_USER_PASSWORD_AUTH` + Google
> OAuth, so guest mode has no data and magic-link has no backend flow. Use
> Google or email/password.

## Testing

```bash
npm test            # jest --watchAll (jest-expo preset)
npx tsc --noEmit    # type-check
npx ts-prune        # unused exports
```

---

## Release process

**Releases are automatic.** Every push to `main` runs
`.github/workflows/release.yml`, which builds an arm64 release APK and attaches
it to a new GitHub release (`v<version>-<run_number>`). The stable download
link is always:

```
https://github.com/ionnich/afterstay-travel/releases/latest/download/AfterStay.apk
```

To build the APK locally (e.g. to test on a device/emulator):

```bash
set -a; source .env; set +a      # bake EXPO_PUBLIC_* into the bundle
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

The APK is signed with the debug key (testing only). CI reads the
`EXPO_PUBLIC_*` values from GitHub Actions **secrets** on the repo.

## Troubleshooting

- **`pod install` fails with `ASCII-8BIT`/encoding error** — run with
  `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.
- **`xcodes signin` not found** — xcodes 2.x removed it; use the Xcodes.app GUI,
  or `fastlane spaceauth` + `xcodes install --use-fastlane-auth`.
- **xcodebuild: "iOS X is not installed"** — run
  `xcodebuild -downloadPlatform iOS` (installs the device platform) in addition
  to the simulator runtime.
- **Metro runs in CI mode / no hot reload** — `CI=true` is set; unset it for
  watch mode.
