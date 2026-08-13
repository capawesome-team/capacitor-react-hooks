import { AndroidSmsRetriever } from '@capawesome/capacitor-android-sms-retriever';
import { renderHook } from '@testing-library/react';

import { useAndroidSmsRetriever } from '../../src/capawesome/android-sms-retriever';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-android-sms-retriever', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.requestPhoneNumber = vi.fn(async () => ({ phoneNumber: '+12025550123' }));
  fake.plugin.retrieveSms = vi.fn(async () => ({ message: 'Your verification code is 123456.' }));
  return { AndroidSmsRetriever: fake.plugin };
});

describe('capawesome/android-sms-retriever', () => {
  it('useAndroidSmsRetriever exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAndroidSmsRetriever(), { wrapper: StrictModeWrapper });
    await expect(result.current.requestPhoneNumber()).resolves.toEqual({
      phoneNumber: '+12025550123',
    });
    await expect(
      result.current.retrieveSms({ senderPhoneNumber: '+12025550123' }),
    ).resolves.toEqual({ message: 'Your verification code is 123456.' });
    expect(AndroidSmsRetriever.retrieveSms).toHaveBeenCalledWith({
      senderPhoneNumber: '+12025550123',
    });
  });
});
