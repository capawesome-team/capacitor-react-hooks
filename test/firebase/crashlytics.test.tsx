import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { renderHook } from '@testing-library/react';

import { useFirebaseCrashlytics } from '../../src/firebase/crashlytics';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/crashlytics', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.didCrashOnPreviousExecution = vi.fn(async () => ({ crashed: true }));
  fake.plugin.log = vi.fn(async () => undefined);
  fake.plugin.recordException = vi.fn(async () => undefined);
  return { FirebaseCrashlytics: fake.plugin };
});

describe('firebase/crashlytics', () => {
  it('useFirebaseCrashlytics exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseCrashlytics(), { wrapper: StrictModeWrapper });

    await expect(result.current.didCrashOnPreviousExecution()).resolves.toEqual({ crashed: true });
    await expect(result.current.log({ message: 'Checkout started' })).resolves.toBeUndefined();
    expect(FirebaseCrashlytics.log).toHaveBeenCalledWith({ message: 'Checkout started' });
    await expect(
      result.current.recordException({ message: 'Checkout failed' }),
    ).resolves.toBeUndefined();
  });
});
