import { renderHook } from '@testing-library/react';

import { useAppTrackingTransparency } from '../../src/capawesome/app-tracking-transparency';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-tracking-transparency', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getStatus = vi.fn(async () => ({ status: 'notDetermined' }));
  fake.plugin.requestPermission = vi.fn(async () => ({ status: 'authorized' }));
  fake.plugin.getAdvertisingIdentifier = vi.fn(async () => ({ advertisingIdentifier: null }));
  return { AppTrackingTransparency: fake.plugin };
});

describe('capawesome/app-tracking-transparency', () => {
  it('useAppTrackingTransparency exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppTrackingTransparency(), {
      wrapper: StrictModeWrapper,
    });
    await expect(result.current.getStatus()).resolves.toEqual({ status: 'notDetermined' });
    await expect(result.current.requestPermission()).resolves.toEqual({ status: 'authorized' });
    await expect(result.current.getAdvertisingIdentifier()).resolves.toEqual({
      advertisingIdentifier: null,
    });
  });
});
