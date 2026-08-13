import { renderHook, waitFor } from '@testing-library/react';

import { useSim, useSimPermissions } from '../../src/capawesome/sim';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-sim', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkPermissions = vi.fn(async () => ({ readSimCards: 'granted' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ readSimCards: 'granted' }));
  fake.plugin.getSimCards = vi.fn(async () => ({
    simCards: [
      {
        carrierName: 'T-Mobile',
        displayName: 'Personal',
        isEmbedded: false,
        isoCountryCode: 'us',
        mobileCountryCode: '310',
        mobileNetworkCode: '260',
        phoneNumber: null,
        slotIndex: 0,
      },
    ],
  }));
  return { Sim: fake.plugin };
});

describe('capawesome/sim', () => {
  it('useSimPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useSimPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ readSimCards: 'granted' }));
  });

  it('useSim exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSim(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkPermissions()).resolves.toEqual({ readSimCards: 'granted' });
    await expect(result.current.requestPermissions()).resolves.toEqual({ readSimCards: 'granted' });
    const { simCards } = await result.current.getSimCards();
    expect(simCards).toMatchObject([{ carrierName: 'T-Mobile', slotIndex: 0 }]);
  });
});
