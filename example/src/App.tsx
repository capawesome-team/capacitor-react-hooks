import { useState } from 'react';
import { useNetworkStatus } from '@capawesome/capacitor-react-hooks/capacitor/network';
import { useKeyboardState } from '@capawesome/capacitor-react-hooks/capacitor/keyboard';
import { usePreference } from '@capawesome/capacitor-react-hooks/capacitor/preferences';
import {
  useGeolocationPermissions,
  useWatchPosition,
} from '@capawesome/capacitor-react-hooks/capacitor/geolocation';
import {
  usePushNotificationsPermissions,
  usePushToken,
} from '@capawesome/capacitor-react-hooks/capacitor/push-notifications';
import { useAuthState } from '@capawesome/capacitor-react-hooks/firebase/authentication';
import { useDocumentSnapshot } from '@capawesome/capacitor-react-hooks/firebase/firestore';
import { useBarcodeScannerSession } from '@capawesome/capacitor-react-hooks/mlkit/barcode-scanning';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

const Json = ({ value }: { value: unknown }) => (
  <pre>{value === undefined ? 'undefined' : JSON.stringify(value, null, 2)}</pre>
);

const NetworkSection = () => <Json value={useNetworkStatus()} />;

const KeyboardSection = () => (
  <>
    <input placeholder="Focus me on a device" />
    <Json value={useKeyboardState()} />
  </>
);

const PreferencesSection = () => {
  const { value, set, remove } = usePreference('example');
  const [draft, setDraft] = useState('');
  return (
    <>
      <p>
        Stored value: <code>{value === undefined ? 'loading…' : String(value)}</code>
      </p>
      <input value={draft} onChange={event => setDraft(event.target.value)} />
      <button onClick={() => void set(draft)}>Set</button>
      <button onClick={() => void remove()}>Remove</button>
    </>
  );
};

const PositionWatcher = () => <Json value={useWatchPosition({ enableHighAccuracy: true })} />;

const GeolocationSection = () => {
  const { status, request } = useGeolocationPermissions();
  const [watching, setWatching] = useState(false);
  return (
    <>
      <p>
        Permission: <code>{status?.location ?? 'unknown'}</code>{' '}
        <button onClick={() => void request()}>Request</button>
      </p>
      <button onClick={() => setWatching(current => !current)}>
        {watching ? 'Stop watching' : 'Start watching'}
      </button>
      {watching && <PositionWatcher />}
    </>
  );
};

const PushSection = () => {
  const { status, request } = usePushNotificationsPermissions();
  const { token, error, register } = usePushToken();
  return (
    <>
      <p>
        Permission: <code>{status?.receive ?? 'unknown'}</code>{' '}
        <button onClick={() => void request()}>Request</button>{' '}
        <button onClick={() => void register().catch(console.error)}>Register</button>
      </p>
      <Json value={{ token, error: error?.message }} />
    </>
  );
};

const AuthSection = () => {
  const authState = useAuthState();
  return <Json value={authState === undefined ? 'unknown (loading or not configured)' : authState} />;
};

const FirestoreDocument = () => <Json value={useDocumentSnapshot('examples/example')} />;

const FirestoreSection = () => {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <>
      <p>Requires a configured Firebase project.</p>
      <button onClick={() => setSubscribed(current => !current)}>
        {subscribed ? 'Unsubscribe' : 'Subscribe to examples/example'}
      </button>
      {subscribed && <FirestoreDocument />}
    </>
  );
};

const BarcodeSection = () => {
  const { start, stop, isScanning, barcodes } = useBarcodeScannerSession();
  const [error, setError] = useState<string>();
  return (
    <>
      <p>Only available on Android and iOS.</p>
      <button
        onClick={() =>
          isScanning
            ? void stop()
            : void start().catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : String(caught)),
              )
        }
      >
        {isScanning ? 'Stop scan' : 'Start scan'}
      </button>
      <Json value={{ isScanning, barcodes, error }} />
    </>
  );
};

export const App = () => (
  <main>
    <h1>Capacitor React Hooks</h1>
    <Section title="capacitor/network">
      <NetworkSection />
    </Section>
    <Section title="capacitor/keyboard">
      <KeyboardSection />
    </Section>
    <Section title="capacitor/preferences">
      <PreferencesSection />
    </Section>
    <Section title="capacitor/geolocation">
      <GeolocationSection />
    </Section>
    <Section title="capacitor/push-notifications">
      <PushSection />
    </Section>
    <Section title="firebase/authentication">
      <AuthSection />
    </Section>
    <Section title="firebase/firestore">
      <FirestoreSection />
    </Section>
    <Section title="mlkit/barcode-scanning">
      <BarcodeSection />
    </Section>
  </main>
);
