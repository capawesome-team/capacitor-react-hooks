import { MapsLauncher } from '@capawesome/capacitor-maps-launcher';
import { act, renderHook } from '@testing-library/react';

import { useMapsLauncher } from '../../src/capawesome/maps-launcher';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-maps-launcher', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAvailableApps = vi.fn(async () => ({ apps: ['APPLE_MAPS'] }));
  fake.plugin.getDefaultApp = vi.fn(async () => ({ app: null }));
  fake.plugin.navigate = vi.fn(async () => undefined);
  return { MapsLauncher: fake.plugin };
});

describe('capawesome/maps-launcher', () => {
  it('useMapsLauncher exposes the plugin methods', async () => {
    const { result } = renderHook(() => useMapsLauncher(), { wrapper: StrictModeWrapper });
    await expect(result.current.getAvailableApps()).resolves.toEqual({ apps: ['APPLE_MAPS'] });
    await expect(result.current.getDefaultApp()).resolves.toEqual({ app: null });
    const options = { destination: { latitude: 37.3349, longitude: -122.009 } };
    await act(() => result.current.navigate(options));
    expect(MapsLauncher.navigate).toHaveBeenCalledWith(options);
  });
});
