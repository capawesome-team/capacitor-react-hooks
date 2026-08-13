import { renderHook } from '@testing-library/react';

import { useFacebookSignIn } from '../../src/capawesome/facebook-sign-in';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-facebook-sign-in', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCurrentAccessToken = vi.fn(async () => ({ accessToken: null }));
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.signIn = vi.fn(async () => ({
    accessToken: null,
    authenticationToken: 'token',
    profile: { email: null, id: '1', imageUrl: null, name: 'Jane Doe' },
  }));
  fake.plugin.signOut = vi.fn(async () => undefined);
  return { FacebookSignIn: fake.plugin };
});

describe('capawesome/facebook-sign-in', () => {
  it('useFacebookSignIn exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFacebookSignIn(), { wrapper: StrictModeWrapper });
    await expect(result.current.initialize({ appId: '1234567890123456' })).resolves.toBeUndefined();
    await expect(result.current.signIn()).resolves.toMatchObject({
      authenticationToken: 'token',
    });
    await expect(result.current.getCurrentAccessToken()).resolves.toEqual({ accessToken: null });
    await expect(result.current.signOut()).resolves.toBeUndefined();
  });
});
