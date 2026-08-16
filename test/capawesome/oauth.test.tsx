import { Oauth } from '@capawesome-team/capacitor-oauth';
import { renderHook } from '@testing-library/react';

import { useOauth } from '../../src/capawesome/oauth';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-oauth', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.decodeIdToken = vi.fn(async () => ({
    header: { alg: 'RS256' },
    payload: { sub: '1234567890' },
  }));
  fake.plugin.getAccessTokenExpirationDate = vi.fn(async () => ({
    date: '2025-12-31T23:59:59.000Z',
  }));
  fake.plugin.handleRedirectCallback = vi.fn(async () => ({ accessToken: 'access-token' }));
  fake.plugin.isAccessTokenAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.isAccessTokenExpired = vi.fn(async () => ({ isExpired: false }));
  fake.plugin.isRefreshTokenAvailable = vi.fn(async () => ({ isAvailable: false }));
  fake.plugin.login = vi.fn(async () => ({ accessToken: 'access-token' }));
  fake.plugin.logout = vi.fn(async () => undefined);
  fake.plugin.refreshToken = vi.fn(async () => ({ accessToken: 'refreshed-access-token' }));
  return { Oauth: fake.plugin };
});

describe('capawesome/oauth', () => {
  it('useOauth exposes the plugin methods', async () => {
    const { result } = renderHook(() => useOauth(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.login({
        clientId: 'client-id',
        redirectUrl: 'com.example.app://oauth/callback',
      }),
    ).resolves.toEqual({ accessToken: 'access-token' });
    expect(Oauth.login).toHaveBeenCalledWith({
      clientId: 'client-id',
      redirectUrl: 'com.example.app://oauth/callback',
    });
    await expect(
      result.current.isAccessTokenAvailable({ accessToken: 'access-token' }),
    ).resolves.toEqual({ isAvailable: true });
    await expect(result.current.decodeIdToken({ token: 'id-token' })).resolves.toEqual({
      header: { alg: 'RS256' },
      payload: { sub: '1234567890' },
    });
  });
});
