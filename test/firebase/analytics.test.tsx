import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { renderHook } from '@testing-library/react';

import { useFirebaseAnalytics } from '../../src/firebase/analytics';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/analytics', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAppInstanceId = vi.fn(async () => ({ appInstanceId: 'instance-1' }));
  fake.plugin.logEvent = vi.fn(async () => undefined);
  fake.plugin.setCurrentScreen = vi.fn(async () => undefined);
  return { FirebaseAnalytics: fake.plugin };
});

describe('firebase/analytics', () => {
  it('useFirebaseAnalytics exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseAnalytics(), { wrapper: StrictModeWrapper });

    await expect(result.current.getAppInstanceId()).resolves.toEqual({
      appInstanceId: 'instance-1',
    });
    await expect(result.current.logEvent({ name: 'sign_up' })).resolves.toBeUndefined();
    expect(FirebaseAnalytics.logEvent).toHaveBeenCalledWith({ name: 'sign_up' });
    await expect(
      result.current.setCurrentScreen({ screenName: 'HomeScreen' }),
    ).resolves.toBeUndefined();
  });
});
