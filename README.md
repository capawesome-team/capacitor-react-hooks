# @capawesome/capacitor-react-hooks

React hooks for [Capacitor](https://capacitorjs.com/) plugins: reactive state, lifecycle-managed listeners, and permission handling for the plugin APIs you already use.

## Features

- 🪝 **One subpath per plugin** – import only what you use, fully tree-shakeable
- 🔌 **Plugins stay optional** – every Capacitor plugin is an optional peer dependency
- 🔁 **Shared native listeners** – one plugin listener per event, no matter how many components subscribe
- 🧹 **Correct cleanup** – StrictMode-safe subscribe/unsubscribe, including the asynchronous `addListener` handle
- 🖥️ **SSR-safe** – importing any module is side-effect-free; no browser APIs at module scope
- 🚀 **Launch events** – capture events that fire before React mounts (e.g. notification taps) and replay them to your hooks
- 🔑 **Permissions as hooks** – `{ status, check, request }` for every plugin with a permission API
- 🛡️ **TypeScript** – typed against each plugin's own definitions

## Installation

```bash
npm install @capawesome/capacitor-react-hooks
```

Install the Capacitor plugins you want to use hooks for, e.g.:

```bash
npm install @capacitor/network
```

Requires React 18 or 19 and Capacitor 8.

## Usage

Import hooks from the subpath of the plugin they belong to:

```tsx
import { useNetworkStatus } from '@capawesome/capacitor-react-hooks/capacitor/network';

const ConnectionBadge = () => {
  const status = useNetworkStatus();
  if (!status) {
    return null;
  }
  return <span>{status.connected ? 'Online' : 'Offline'}</span>;
};
```

Permissions and imperative methods:

```tsx
import {
  useGeolocationPermissions,
  useWatchPosition,
} from '@capawesome/capacitor-react-hooks/capacitor/geolocation';

const Tracker = () => {
  const { status, request } = useGeolocationPermissions();
  const { position, error } = useWatchPosition({ enableHighAccuracy: true });
  // ...
};
```

### Launch events

Some events can fire before React has mounted, e.g. the user tapping the push
notification that launched the app. Capture them before `createRoot` and they
are replayed to the first subscribed hook:

```tsx
import { captureLaunchEvents } from '@capawesome/capacitor-react-hooks';
import { PushNotifications } from '@capacitor/push-notifications';

captureLaunchEvents([{ plugin: PushNotifications, event: 'pushNotificationActionPerformed' }]);

createRoot(document.getElementById('root')!).render(<App />);
```

## Covered plugins

<!-- coverage-table-start -->
| Subpath | Plugin |
| --- | --- |
| `capacitor/action-sheet` | `@capacitor/action-sheet` |
| `capacitor/app-launcher` | `@capacitor/app-launcher` |
| `capacitor/app` | `@capacitor/app` |
| `capacitor/background-runner` | `@capacitor/background-runner` |
| `capacitor/barcode-scanner` | `@capacitor/barcode-scanner` |
| `capacitor/browser` | `@capacitor/browser` |
| `capacitor/calendar` | `@capacitor/calendar` |
| `capacitor/camera` | `@capacitor/camera` |
| `capacitor/clipboard` | `@capacitor/clipboard` |
| `capacitor/contacts` | `@capacitor/contacts` |
| `capacitor/device` | `@capacitor/device` |
| `capacitor/dialog` | `@capacitor/dialog` |
| `capacitor/file-transfer` | `@capacitor/file-transfer` |
| `capacitor/file-viewer` | `@capacitor/file-viewer` |
| `capacitor/filesystem` | `@capacitor/filesystem` |
| `capacitor/geolocation` | `@capacitor/geolocation` |
| `capacitor/google-maps` | `@capacitor/google-maps` |
| `capacitor/haptics` | `@capacitor/haptics` |
| `capacitor/inappbrowser` | `@capacitor/inappbrowser` |
| `capacitor/keyboard` | `@capacitor/keyboard` |
| `capacitor/local-notifications` | `@capacitor/local-notifications` |
| `capacitor/motion` | `@capacitor/motion` |
| `capacitor/network` | `@capacitor/network` |
| `capacitor/preferences` | `@capacitor/preferences` |
| `capacitor/privacy-screen` | `@capacitor/privacy-screen` |
| `capacitor/push-notifications` | `@capacitor/push-notifications` |
| `capacitor/screen-orientation` | `@capacitor/screen-orientation` |
| `capacitor/screen-reader` | `@capacitor/screen-reader` |
| `capacitor/share` | `@capacitor/share` |
| `capacitor/splash-screen` | `@capacitor/splash-screen` |
| `capacitor/status-bar` | `@capacitor/status-bar` |
| `capacitor/system-bars` | `@capacitor/core` (System Bars API) |
| `capacitor/text-zoom` | `@capacitor/text-zoom` |
| `capacitor/toast` | `@capacitor/toast` |
| `capawesome/accelerometer` | `@capawesome-team/capacitor-accelerometer` |
| `capawesome/accessibility-preferences` | `@capawesome/capacitor-accessibility-preferences` |
| `capawesome/action-sheet` | `@capawesome/capacitor-action-sheet` |
| `capawesome/admob` | `@capawesome-team/capacitor-admob` |
| `capawesome/age-signals` | `@capawesome/capacitor-age-signals` |
| `capawesome/alarm` | `@capawesome/capacitor-alarm` |
| `capawesome/android-battery-optimization` | `@capawesome-team/capacitor-android-battery-optimization` |
| `capawesome/android-edge-to-edge-support` | `@capawesome/capacitor-android-edge-to-edge-support` |
| `capawesome/android-foreground-service` | `@capawesome-team/capacitor-android-foreground-service` |
| `capawesome/android-intent-launcher` | `@capawesome/capacitor-android-intent-launcher` |
| `capawesome/android-sms-retriever` | `@capawesome/capacitor-android-sms-retriever` |
| `capawesome/app-icon` | `@capawesome/capacitor-app-icon` |
| `capawesome/app-integrity` | `@capawesome/capacitor-app-integrity` |
| `capawesome/app-language` | `@capawesome/capacitor-app-language` |
| `capawesome/app-launcher` | `@capawesome/capacitor-app-launcher` |
| `capawesome/app-review` | `@capawesome/capacitor-app-review` |
| `capawesome/app-shortcuts` | `@capawesome/capacitor-app-shortcuts` |
| `capawesome/app-tracking-transparency` | `@capawesome/capacitor-app-tracking-transparency` |
| `capawesome/app-update` | `@capawesome/capacitor-app-update` |
| `capawesome/apple-sign-in` | `@capawesome/capacitor-apple-sign-in` |
| `capawesome/asset-manager` | `@capawesome/capacitor-asset-manager` |
| `capawesome/audio-player` | `@capawesome-team/capacitor-audio-player` |
| `capawesome/audio-recorder` | `@capawesome-team/capacitor-audio-recorder` |
| `capawesome/audio-session` | `@capawesome/capacitor-audio-session` |
| `capawesome/background-geolocation` | `@capawesome-team/capacitor-background-geolocation` |
| `capawesome/background-task` | `@capawesome/capacitor-background-task` |
| `capawesome/badge` | `@capawesome/capacitor-badge` |
| `capawesome/barcode-scanner` | `@capawesome-team/capacitor-barcode-scanner` |
| `capawesome/barometer` | `@capawesome-team/capacitor-barometer` |
| `capawesome/battery` | `@capawesome/capacitor-battery` |
| `capawesome/biometrics` | `@capawesome-team/capacitor-biometrics` |
| `capawesome/bluetooth-low-energy` | `@capawesome-team/capacitor-bluetooth-low-energy` |
| `capawesome/calendar` | `@capawesome-team/capacitor-calendar` |
| `capawesome/clipboard` | `@capawesome/capacitor-clipboard` |
| `capawesome/cloudinary` | `@capawesome/capacitor-cloudinary` |
| `capawesome/compass` | `@capawesome/capacitor-compass` |
| `capawesome/contacts` | `@capawesome-team/capacitor-contacts` |
| `capawesome/crisp` | `@capawesome/capacitor-crisp` |
| `capawesome/datetime-picker` | `@capawesome-team/capacitor-datetime-picker` |
| `capawesome/device-info` | `@capawesome/capacitor-device-info` |
| `capawesome/dialog` | `@capawesome/capacitor-dialog` |
| `capawesome/document-scanner` | `@capawesome-team/capacitor-document-scanner` |
| `capawesome/exif` | `@capawesome/capacitor-exif` |
| `capawesome/facebook-sign-in` | `@capawesome/capacitor-facebook-sign-in` |
| `capawesome/file-compressor` | `@capawesome-team/capacitor-file-compressor` |
| `capawesome/file-manager` | `@capawesome-team/capacitor-file-manager` |
| `capawesome/file-opener` | `@capawesome-team/capacitor-file-opener` |
| `capawesome/file-picker` | `@capawesome/capacitor-file-picker` |
| `capawesome/file-transfer` | `@capawesome-team/capacitor-file-transfer` |
| `capawesome/formbricks` | `@capawesome/capacitor-formbricks` |
| `capawesome/geocoder` | `@capawesome-team/capacitor-geocoder` |
| `capawesome/geofences` | `@capawesome-team/capacitor-geofences` |
| `capawesome/google-sign-in` | `@capawesome/capacitor-google-sign-in` |
| `capawesome/grafana-faro` | `@capawesome/capacitor-grafana-faro` |
| `capawesome/gyroscope` | `@capawesome/capacitor-gyroscope` |
| `capawesome/haptics` | `@capawesome/capacitor-haptics` |
| `capawesome/health` | `@capawesome-team/capacitor-health` |
| `capawesome/home-indicator` | `@capawesome/capacitor-home-indicator` |
| `capawesome/in-app-browser` | `@capawesome/capacitor-in-app-browser` |
| `capawesome/install-referrer` | `@capawesome/capacitor-install-referrer` |
| `capawesome/intercom` | `@capawesome/capacitor-intercom` |
| `capawesome/intune` | `@capawesome/capacitor-intune` |
| `capawesome/keep-awake` | `@capawesome/capacitor-keep-awake` |
| `capawesome/libsql` | `@capawesome/capacitor-libsql` |
| `capawesome/light-sensor` | `@capawesome/capacitor-light-sensor` |
| `capawesome/live-update` | `@capawesome/capacitor-live-update` |
| `capawesome/llm` | `@capawesome-team/capacitor-llm` |
| `capawesome/localization` | `@capawesome/capacitor-localization` |
| `capawesome/mail-composer` | `@capawesome/capacitor-mail-composer` |
| `capawesome/managed-configurations` | `@capawesome/capacitor-managed-configurations` |
| `capawesome/maplibre` | `@capawesome/capacitor-maplibre` |
| `capawesome/maps-launcher` | `@capawesome/capacitor-maps-launcher` |
| `capawesome/media-session` | `@capawesome-team/capacitor-media-session` |
| `capawesome/navigation-bar` | `@capawesome/capacitor-navigation-bar` |
| `capawesome/network` | `@capawesome/capacitor-network` |
| `capawesome/nfc` | `@capawesome-team/capacitor-nfc` |
| `capawesome/nodejs` | `@capawesome/capacitor-nodejs` |
| `capawesome/oauth` | `@capawesome-team/capacitor-oauth` |
| `capawesome/passkeys` | `@capawesome/capacitor-passkeys` |
| `capawesome/password-autofill` | `@capawesome/capacitor-password-autofill` |
| `capawesome/pdf-generator` | `@capawesome/capacitor-pdf-generator` |
| `capawesome/pdf-viewer` | `@capawesome/capacitor-pdf-viewer` |
| `capawesome/pedometer` | `@capawesome-team/capacitor-pedometer` |
| `capawesome/permissions` | `@capawesome/capacitor-permissions` |
| `capawesome/phone-dialer` | `@capawesome/capacitor-phone-dialer` |
| `capawesome/photo-editor` | `@capawesome/capacitor-photo-editor` |
| `capawesome/photo-manipulator` | `@capawesome/capacitor-photo-manipulator` |
| `capawesome/pixlive` | `@capawesome/capacitor-pixlive` |
| `capawesome/posthog` | `@capawesome/capacitor-posthog` |
| `capawesome/printer` | `@capawesome-team/capacitor-printer` |
| `capawesome/privacy-screen` | `@capawesome/capacitor-privacy-screen` |
| `capawesome/proximity-sensor` | `@capawesome/capacitor-proximity-sensor` |
| `capawesome/purchases` | `@capawesome-team/capacitor-purchases` |
| `capawesome/realtimekit` | `@capawesome/capacitor-realtimekit` |
| `capawesome/root-detection` | `@capawesome/capacitor-root-detection` |
| `capawesome/screen-brightness` | `@capawesome/capacitor-screen-brightness` |
| `capawesome/screen-orientation` | `@capawesome/capacitor-screen-orientation` |
| `capawesome/screen-reader` | `@capawesome/capacitor-screen-reader` |
| `capawesome/screenshot` | `@capawesome/capacitor-screenshot` |
| `capawesome/secure-preferences` | `@capawesome-team/capacitor-secure-preferences` |
| `capawesome/settings-launcher` | `@capawesome/capacitor-settings-launcher` |
| `capawesome/shake` | `@capawesome/capacitor-shake` |
| `capawesome/share-target` | `@capawesome-team/capacitor-share-target` |
| `capawesome/silent-mode` | `@capawesome/capacitor-silent-mode` |
| `capawesome/sim` | `@capawesome/capacitor-sim` |
| `capawesome/sms-composer` | `@capawesome/capacitor-sms-composer` |
| `capawesome/speech-recognition` | `@capawesome-team/capacitor-speech-recognition` |
| `capawesome/speech-synthesis` | `@capawesome-team/capacitor-speech-synthesis` |
| `capawesome/sqlite` | `@capawesome-team/capacitor-sqlite` |
| `capawesome/square-mobile-payments` | `@capawesome/capacitor-square-mobile-payments` |
| `capawesome/superwall` | `@capawesome/capacitor-superwall` |
| `capawesome/system-webview` | `@capawesome/capacitor-system-webview` |
| `capawesome/text-interaction` | `@capawesome/capacitor-text-interaction` |
| `capawesome/text-zoom` | `@capawesome/capacitor-text-zoom` |
| `capawesome/thermal-state` | `@capawesome/capacitor-thermal-state` |
| `capawesome/toast` | `@capawesome/capacitor-toast` |
| `capawesome/torch` | `@capawesome/capacitor-torch` |
| `capawesome/vault` | `@capawesome-team/capacitor-vault` |
| `capawesome/volume` | `@capawesome/capacitor-volume` |
| `capawesome/wallet` | `@capawesome/capacitor-wallet` |
| `capawesome/watch` | `@capawesome-team/capacitor-watch` |
| `capawesome/wifi` | `@capawesome-team/capacitor-wifi` |
| `capawesome/youtube-player` | `@capawesome/capacitor-youtube-player` |
| `capawesome/zip` | `@capawesome-team/capacitor-zip` |
| `firebase/authentication` | `@capacitor-firebase/authentication` |
| `firebase/firestore` | `@capacitor-firebase/firestore` |
| `mlkit/barcode-scanning` | `@capacitor-mlkit/barcode-scanning` |
<!-- coverage-table-end -->

Coverage of the Capawesome, Capacitor Firebase and Capacitor ML Kit plugin
families is in progress.

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```

The [`example`](./example) app exercises every hook:

```bash
cd example
npm install
npm run dev
```

## License

See [LICENSE](https://github.com/capawesome-team/capacitor-react-hooks/blob/main/LICENSE).
