import { renderHook } from '@testing-library/react';

import { useInstallReferrer } from '../../src/capawesome/install-referrer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-install-referrer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAttributionToken = vi.fn(async () => ({ token: 'attribution-token' }));
  fake.plugin.getInstallReferrer = vi.fn(async () => ({
    googlePlayInstantParam: false,
    installBeginTimestampMillis: 1623161753000,
    referrerClickTimestampMillis: 1623161752000,
    referrerUrl: 'utm_source=google-play&utm_medium=organic',
  }));
  return { InstallReferrer: fake.plugin };
});

describe('capawesome/install-referrer', () => {
  it('useInstallReferrer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useInstallReferrer(), { wrapper: StrictModeWrapper });
    await expect(result.current.getAttributionToken()).resolves.toEqual({
      token: 'attribution-token',
    });
    await expect(result.current.getInstallReferrer()).resolves.toMatchObject({
      referrerUrl: 'utm_source=google-play&utm_medium=organic',
    });
  });
});
