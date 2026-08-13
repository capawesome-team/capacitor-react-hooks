import { PhoneDialer } from '@capawesome/capacitor-phone-dialer';
import { act, renderHook } from '@testing-library/react';

import { usePhoneDialer } from '../../src/capawesome/phone-dialer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-phone-dialer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.canDial = vi.fn(async () => ({ canDial: true }));
  fake.plugin.dial = vi.fn(async () => undefined);
  return { PhoneDialer: fake.plugin };
});

describe('capawesome/phone-dialer', () => {
  it('usePhoneDialer exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePhoneDialer(), { wrapper: StrictModeWrapper });
    await expect(result.current.canDial()).resolves.toEqual({ canDial: true });
    await act(() => result.current.dial({ number: '+41791234567' }));
    expect(PhoneDialer.dial).toHaveBeenCalledWith({ number: '+41791234567' });
  });
});
