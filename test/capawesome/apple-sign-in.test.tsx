import { renderHook } from '@testing-library/react';

import { useAppleSignIn } from '../../src/capawesome/apple-sign-in';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-apple-sign-in', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.signIn = vi.fn(async () => ({ authorizationCode: 'code', idToken: 'token' }));
  return { AppleSignIn: fake.plugin };
});

describe('capawesome/apple-sign-in', () => {
  it('useAppleSignIn exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppleSignIn(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.initialize({ clientId: 'com.example.app.signin' }),
    ).resolves.toBeUndefined();
    await expect(result.current.signIn()).resolves.toEqual({
      authorizationCode: 'code',
      idToken: 'token',
    });
  });
});
