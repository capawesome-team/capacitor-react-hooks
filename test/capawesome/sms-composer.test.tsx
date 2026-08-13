import { SmsComposer } from '@capawesome/capacitor-sms-composer';
import { renderHook } from '@testing-library/react';

import { useSmsComposer } from '../../src/capawesome/sms-composer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-sms-composer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.canComposeSms = vi.fn(async () => ({ canCompose: true }));
  fake.plugin.composeSms = vi.fn(async () => ({ status: 'canceled' }));
  return { SmsComposer: fake.plugin };
});

describe('capawesome/sms-composer', () => {
  it('useSmsComposer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSmsComposer(), { wrapper: StrictModeWrapper });
    await expect(result.current.canComposeSms()).resolves.toEqual({ canCompose: true });
    await expect(result.current.composeSms({ recipients: ['+41791234567'] })).resolves.toEqual({
      status: 'canceled',
    });
    expect(SmsComposer.composeSms).toHaveBeenCalledWith({ recipients: ['+41791234567'] });
  });
});
