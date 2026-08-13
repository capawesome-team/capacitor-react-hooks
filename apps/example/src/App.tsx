import { useNetworkStatus } from '@capawesome/capacitor-react-hooks/capacitor/network';

export const App = () => {
  const status = useNetworkStatus();
  return (
    <main>
      <h1>Capacitor React Hooks</h1>
      <section>
        <h2>Network</h2>
        <pre>{status ? JSON.stringify(status, null, 2) : 'Loading…'}</pre>
      </section>
    </main>
  );
};
