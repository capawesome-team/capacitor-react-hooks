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

| Subpath | Plugin |
| --- | --- |
| `capacitor/geolocation` | `@capacitor/geolocation` |
| `capacitor/keyboard` | `@capacitor/keyboard` |
| `capacitor/network` | `@capacitor/network` |
| `capacitor/preferences` | `@capacitor/preferences` |
| `capacitor/push-notifications` | `@capacitor/push-notifications` |
| `firebase/authentication` | `@capacitor-firebase/authentication` |
| `firebase/firestore` | `@capacitor-firebase/firestore` |
| `mlkit/barcode-scanning` | `@capacitor-mlkit/barcode-scanning` |

Coverage of all official, Capawesome, Capacitor Firebase and Capacitor ML Kit
plugins is in progress.

## License

See [LICENSE](https://github.com/capawesome-team/capacitor-react-hooks/blob/main/LICENSE).
