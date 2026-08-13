import { AndroidIntentLauncher } from '@capawesome/capacitor-android-intent-launcher';
import { renderHook } from '@testing-library/react';

import { useAndroidIntentLauncher } from '../../src/capawesome/android-intent-launcher';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-android-intent-launcher', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.canResolveActivity = vi.fn(async () => ({ canResolve: true }));
  fake.plugin.startActivity = vi.fn(async () => ({ dataUri: null, resultCode: -1 }));
  return { AndroidIntentLauncher: fake.plugin };
});

describe('capawesome/android-intent-launcher', () => {
  it('useAndroidIntentLauncher exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAndroidIntentLauncher(), {
      wrapper: StrictModeWrapper,
    });
    const intent = { action: 'android.intent.action.VIEW', dataUri: 'https://capawesome.io' };
    await expect(result.current.canResolveActivity(intent)).resolves.toEqual({ canResolve: true });
    await expect(result.current.startActivity(intent)).resolves.toEqual({
      dataUri: null,
      resultCode: -1,
    });
    expect(AndroidIntentLauncher.startActivity).toHaveBeenCalledWith(intent);
  });
});
