# BottleMark

BottleMark is an **offline, manual, bottle-based water tracker** for Android. Many people drink from bottles rather than glasses, so BottleMark lets you choose or create a bottle with a specific volume and log how much of it you drank with a single tap: **1/4, 1/2, 3/4, or a full bottle**. Everything is stored locally on the device.

BottleMark is a practical daily-routine utility. It is **not** a medical, diagnostic, treatment, sports-performance, or children's app, and it is not a game.

---

## Manual tracking disclaimer

**BottleMark is a manual bottle-based water tracker. It does not detect drinking automatically and does not connect to Health Connect, Google Fit, sensors, or wearable devices.**

Every water entry is added by you, by hand. The app never infers, estimates, or automatically records water intake. This note appears in onboarding, in Settings, and here in the README.

BottleMark makes **no medical claims**. It does not diagnose dehydration, does not provide medical advice, and uses no aggressive or scary health language.

---

## Features

- Choose a bottle volume and set it as your active bottle.
- Create, edit, favorite, and delete custom bottles; reset to the four default presets.
- Log a full bottle with one tap ("Drank full bottle").
- Log partial amounts: 1/4, 1/2, 3/4, or Full, each calculated from the active bottle's volume.
- Set a daily water goal (default 2,000 ml).
- View daily progress as a bottle fill meter, with total, goal, and remaining amount.
- Browse history by day, open any past day, and edit or delete its entries.
- View simple, bottle-focused statistics (7/30-day totals, averages, best day, goal days, most-used bottle and fraction, amount by bottle, and a weekly mini chart).
- Gentle **in-app** reminder cards based on today's progress and the time of day.
- Reset a single day, delete all entries, or reset all local data.

---

## Offline-first

BottleMark works **fully in airplane mode**. There is no backend, no cloud sync, no account, and no network usage of any kind. All data lives in on-device storage (AsyncStorage) and survives app restarts.

### No internet / no permissions

The app **does not request any runtime permissions** and the Android manifest **does not include the INTERNET permission** (it is explicitly blocked). BottleMark never asks for location, camera, microphone, contacts, storage/gallery, files, notifications, calendar, alarms, activity recognition, or body sensors.

### No sensors

BottleMark uses **no device sensors**. It cannot and does not measure movement, hydration, or anything else. Water is logged manually.

### No Google Fit

BottleMark does **not** integrate with Google Fit and includes no Google Fit SDK.

### No Health Connect

BottleMark does **not** integrate with Android Health Connect and includes no Health Connect SDK.

### No wearable integration

BottleMark does **not** connect to smartwatches or any wearable device.

### No automatic water detection

BottleMark **cannot detect drinking**. There is no automatic tracking, no background tracking, and no sensor-based estimation. You add every entry yourself.

---

## In-app reminders (no notification permission)

Reminders in BottleMark are **in-app reminder cards only**. When you open the app, it checks today's progress and the current time and may show a calm reminder card on the Home screen. For example:

- If nothing is logged after 11:00: "No bottle entries today. Add one if you drank water."
- If progress is below 50% after 16:00: "You can add any bottle amounts you remember."
- In the evening if the goal is not reached: "Add any bottle drinks you missed today."

**BottleMark uses in-app reminder cards only. It does not send system notifications.** It does **not** use push notifications, `expo-notifications`, background tasks, the Android alarm manager, calendar integration, or any notification runtime permission. Reminders only work while the app is open, and you can toggle morning/afternoon/evening reminders in Reminder Settings.

---

## How the app works

### Bottle-based tracking

Instead of typing milliliters every time, you pick a bottle and tap how much of it you drank. Amounts are computed from the bottle volume and stored safely as whole milliliters. For a 500 ml bottle: 1/4 = 125 ml, 1/2 = 250 ml, 3/4 = 375 ml, Full = 500 ml. For a 750 ml bottle, 1/4 rounds to 188 ml and 3/4 rounds to 563 ml.

### Partial bottle logging

The core interaction is the row of partial controls — 1/4, 1/2, 3/4, Full — each showing its calculated amount for the active bottle. Values are rounded to whole milliliters.

### Bottle settings

Manage all your bottles from the Bottle Settings screen: select the active bottle, mark favorites, create custom bottles, edit names and volumes, delete custom bottles (with confirmation), and reset to the default presets. Default bottles are Small (330 ml), Regular (500 ml), Large (750 ml), and Sport (1000 ml). Bottle names must not be empty, and volume must be greater than 0 ml and no more than 5,000 ml.

### Active bottle

One bottle is "active" at a time and drives the Home screen and the partial calculations. If the active bottle is deleted, BottleMark safely falls back to the first available bottle; if no bottles remain, it recreates the defaults. Each logged entry stores a **snapshot** of the bottle's name and volume, so old history stays correct even if you later edit or delete that bottle.

### Daily goal

Set a daily goal (default 2,000 ml). Progress is `dailyTotal / dailyGoal`, capped at 100% visually while still showing the real total. If the goal is missing or zero, BottleMark uses 2,000 ml. The goal must be greater than 0 and no more than 10,000 ml.

### History

History lists your days in reverse chronological order with each day's total, goal-reached state, entry count, and most-used bottle. Open any day to edit or delete its entries or reset the whole day. History is fully local.

### Statistics

Statistics is a calm "bottle usage report": today's total, last 7 and 30-day totals, 7-day average, best day, goal days in the last 7 and 30 days, total bottles logged, most-used bottle, most-used fraction, amount by bottle, and a simple weekly mini chart made from plain views (no heavy chart library). No sports-performance or medical language is used.

### Local storage

All data is stored in AsyncStorage under a single key and is merged with safe defaults on load. Corrupted JSON, empty storage, missing fields, empty arrays, a missing active bottle, entries referencing a deleted bottle, and invalid dates/times/numbers are all handled defensively so the app never crashes.

---

## Design

### Visual style

The "BottleMark Bottle Fill Board" style is practical, clean, calm, and bottle-focused — never medical, sporty, childish, or neon. Palette: warm white background, pale aqua panels, deep blue-gray text, muted teal progress, sky-blue bottle fill, soft slate controls, and light sand labels. Decorative elements are simple views (bottle outline, fill segments, fraction marks, chips) with no heavy assets, photos, 3D, or complex animations.

### Bottle Fill Board layout (uniqueness)

The Home screen is a focused bottle fill board, deliberately different from generic templates. It is **not** a circular tracker, drop grid, glass shelf, timeline, journal, or spreadsheet log, and it has **no mascot-centered header** and **no large vertical stack of identical buttons**. Instead: a compact header (title + settings), the active bottle as the main object with a vertical bottle meter, partial controls (1/4, 1/2, 3/4, Full) as the core UX, a distinct full-bottle button, today's entries as bottle marks, and small distinct shortcut cards for History (past bottle marks), Statistics (bottle report), and Bottles.

### App icon concept

A rounded-square icon on a pale-aqua background with a simple teal bottle silhouette and a sky-blue fill mark at the half level. No medical symbols; readable at small sizes. See `assets/icon.png` and `assets/adaptive-icon.png` (generated by `assets/make_assets.py`).

### Splash screen concept

A centered bottle silhouette with a half-level water fill and the app name "BottleMark" on a warm-white background. No complex illustration and no heavy image assets. See `assets/splash.png`.

---

## Screens

Welcome/Onboarding, Home (Bottle Fill Board), Add/Edit Bottle, Bottle Settings, Add/Edit Water Entry, Day Detail, History, Statistics, Reminder Settings, Goal Settings, and Settings. Navigation uses React Navigation (native stack); every navigation dependency is a direct dependency and the navigation theme extends `DefaultTheme` (so `theme.fonts` is always defined). The app works with empty/default storage on first launch.

---

## Tech stack

- React Native with Expo (Expo SDK 53, React Native 0.79, Hermes engine).
- `@react-navigation/native` + `@react-navigation/native-stack`.
- `@react-native-async-storage/async-storage` for all local data.
- Bottle visuals are built from plain `View`s (no SVG native module required), keeping the app small and stable.

No Firebase, ads, analytics, payments, external APIs, cloud sync, sensors, Google Fit, Health Connect, wearable, notification, or background-task libraries are used.

---

## Getting started (development)

> This repository already contains the full application source. The steps below scaffold an equivalent project and install the exact dependency set, which is the recommended, reproducible way to work with Expo.

### 1. Scaffold with the Expo template

```bash
npx create-expo-app bottlemark
cd bottlemark
```

Then copy the `App.js`, `index.js`, `app.json`, `babel.config.js`, `src/`, `plugins/`, `assets/`, `proguard-rules.pro`, and `.github/` files from this repository into the project.

### 2. Install dependencies through `npx expo install`

Always install through `expo install` so versions match the Expo SDK. Every imported package is a direct dependency (nothing relies on transitive dependencies):

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-status-bar expo-splash-screen expo-build-properties
npx expo install expo-asset expo-constants expo-font expo-modules-core
```

Then align and verify:

```bash
npx expo install --fix
npx expo-doctor
npx expo install --check
```

Commit the resulting `package-lock.json` from a full `npm install`.

### 3. Run locally

```bash
npx expo start
```

Open on an Android device/emulator from the Expo CLI. For a native local run:

```bash
npx expo run:android
```

---

## Building Android release artifacts

BottleMark builds a signed release **APK** and **AAB** via `expo prebuild` + Gradle. Android is configured for **compileSdkVersion 35 / targetSdkVersion 35 / minSdkVersion 24** through `expo-build-properties` in `app.json`, so the app meets Google Play's API 35 requirement and the generated AAB supports Android 15+ **16 KB memory page sizes**. The INTERNET permission is stripped from the manifest.

### 1. Generate a PKCS12 keystore

Use a PKCS12 keystore with the **same password for the keystore and the key**. Do **not** commit the keystore or any password to the repository.

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore bottlemark-release-key.p12 -alias bottlemark_key -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Add GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

```text
ANDROID_KEYSTORE_BASE64      # base64 of bottlemark-release-key.p12
ANDROID_KEYSTORE_PASSWORD    # keystore password
ANDROID_KEY_ALIAS            # e.g. bottlemark_key
ANDROID_KEY_PASSWORD         # same as keystore password
```

Create the base64 value with:

```bash
base64 -i bottlemark-release-key.p12 -o keystore.base64.txt   # macOS
# or:  base64 -w0 bottlemark-release-key.p12 > keystore.base64.txt   # Linux
```

### 3. GitHub Actions

The workflow at `.github/workflows/android-build.yml` runs on push to `main` (and manual dispatch). It installs Node.js and JDK 17, sets up the Android SDK, installs dependencies with `npm install`, runs `npx expo install --fix`, then `npx expo-doctor` and `npx expo install --check`, installs Android SDK Platform 35 and Build Tools 35.0.0, decodes the keystore from secrets, runs `expo prebuild`, copies the ProGuard rules, builds the signed release APK and AAB, and uploads both as workflow artifacts. It intentionally does **not** run an emulator smoke-test (to stay fast on free runners); launch verification is done locally (below).

Signing is injected at prebuild time by `plugins/withReleaseSigning.js`, which reads the keystore path and passwords from environment variables the workflow sets from your secrets.

### 4. Build locally instead (optional)

```bash
export BOTTLEMARK_UPLOAD_STORE_FILE="$PWD/bottlemark-release-key.p12"
export BOTTLEMARK_UPLOAD_STORE_PASSWORD="your-store-password"
export BOTTLEMARK_UPLOAD_KEY_ALIAS="bottlemark_key"
export BOTTLEMARK_UPLOAD_KEY_PASSWORD="your-store-password"

npx expo prebuild --platform android --no-install
cp proguard-rules.pro android/app/proguard-rules.pro
cd android
./gradlew :app:assembleRelease   # APK -> app/build/outputs/apk/release/
./gradlew :app:bundleRelease     # AAB -> app/build/outputs/bundle/release/
```

---

## Release optimization (R8 / ProGuard)

Use only the standard Android R8/ProGuard toolchain (no risky third-party obfuscators). **Verify a non-minified release first**, then enable shrinking:

1. First confirm the app launches with:

   ```gradle
   minifyEnabled false
   shrinkResources false
   ```

2. Then enable in `android/app/build.gradle` (release build type):

   ```gradle
   minifyEnabled true
   shrinkResources true
   proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
   ```

3. Re-test launch after enabling minify/shrink. The provided `proguard-rules.pro` keeps React Native, Hermes, Expo modules, and AsyncStorage. For convenience you can instead set `enableProguardInReleaseBuilds` under `expo-build-properties` in `app.json`.

---

## Google Play compatibility notes

- **API 35**: compile and target SDK 35 (not 34), satisfying Google Play's target-API requirement.
- **16 KB page sizes**: building with Expo SDK 53 / React Native 0.79 and API 35 produces an AAB compatible with Android 15+ 16 KB memory page sizes.
- No old native libraries, and no unnecessary native SDKs, are included, which avoids the two most common Play rejections (target API 34 and unsupported 16 KB page sizes).

---

## Local launch verification checklist

A green CI build is **not** proof that the app launches. Before release, install the release APK on a physical device or emulator and watch logcat:

```bash
adb install app-release.apk
adb logcat
```

Confirm there are **no** errors such as: "Cannot find native module", "Module has not been registered", "Invariant Violation", `theme.fonts.regular is undefined`, AsyncStorage JSON parse crash, missing route params crash, invalid date/time/number crash, missing active bottle crash, or undefined fraction crash.

Then test the full flow:

- First launch with empty storage; select a default bottle.
- Add 1/4, 1/2, 3/4, and full bottle.
- Create a custom bottle; edit its volume; delete it; confirm active-bottle fallback works.
- Edit and delete a bottle entry.
- Reset the selected day.
- Change the daily goal.
- Check History, Statistics, and in-app reminders.
- Reset all local data, then relaunch.
- Launch in airplane mode.
- Confirm no sensor, Google Fit, Health Connect, wearable, notification, or internet permission is requested.

---

## Privacy note

BottleMark stores bottles, bottle entries, goals, reminders, and statistics **only on this device**. No account, no ads, no analytics, no internet connection, no sensors, no Google Fit, no Health Connect, and no notification permission.

---

## License

You may use and modify this project freely for your own purposes.
