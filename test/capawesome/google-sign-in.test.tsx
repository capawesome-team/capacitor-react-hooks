import { renderHook } from '@testing-library/react';

import { useGoogleSignIn } from '../../src/capawesome/google-sign-in';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-google-sign-in', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.handleRedirectCallback = vi.fn(async () => ({ idToken: 'token', userId: '1' }));
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.signIn = vi.fn(async () => ({ idToken: 'token', userId: '1' }));
  fake.plugin.signOut = vi.fn(async () => undefined);
  return { GoogleSignIn: fake.plugin };
});

describe('capawesome/google-sign-in', () => {
  it('useGoogleSignIn exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGoogleSignIn(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.initialize({ clientId: '123456789-abc.apps.googleusercontent.com' }),
    ).resolves.toBeUndefined();
    await expect(result.current.signIn()).resolves.toMatchObject({ userId: '1' });
    await expect(result.current.handleRedirectCallback()).resolves.toMatchObject({
      idToken: 'token',
    });
    await expect(result.current.signOut()).resolves.toBeUndefined();
  });
});
