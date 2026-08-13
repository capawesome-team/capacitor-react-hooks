import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useAuthState,
  useAuthStateChange,
  useFirebaseAuthentication,
  useIdTokenChange,
  usePhoneCodeSent,
} from '../../src/firebase/authentication';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/authentication', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCurrentUser = vi.fn(async () => ({ user: null }));
  fake.plugin.signOut = vi.fn(async () => undefined);
  return { FirebaseAuthentication: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (FirebaseAuthentication as unknown as { __fake: FakePlugin }).__fake;

const user = { uid: 'uid-1', email: 'alan@turing.dev' };

describe('firebase/authentication', () => {
  it('useAuthState seeds from getCurrentUser and follows sign-in state changes', async () => {
    const { result } = renderHook(() => useAuthState(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toEqual({ user: null }));
    act(() => fake.emit('authStateChange', { user }));
    expect(result.current).toEqual({ user });
  });

  it('useAuthStateChange delivers sign-in state changes', async () => {
    const callback = vi.fn();
    renderHook(() => useAuthStateChange(callback), { wrapper: StrictModeWrapper });
    await act(() => Promise.resolve());
    act(() => fake.emit('authStateChange', { user }));
    expect(callback).toHaveBeenCalledWith({ user });
  });

  it('useIdTokenChange delivers ID token changes', async () => {
    const callback = vi.fn();
    renderHook(() => useIdTokenChange(callback), { wrapper: StrictModeWrapper });
    await act(() => Promise.resolve());
    act(() => fake.emit('idTokenChange', { token: 'token-1' }));
    expect(callback).toHaveBeenCalledWith({ token: 'token-1' });
  });

  it('usePhoneCodeSent delivers the verification id', async () => {
    const callback = vi.fn();
    renderHook(() => usePhoneCodeSent(callback), { wrapper: StrictModeWrapper });
    await act(() => Promise.resolve());
    act(() => fake.emit('phoneCodeSent', { verificationId: 'verification-1' }));
    expect(callback).toHaveBeenCalledWith({ verificationId: 'verification-1' });
  });

  it('usePhoneCodeSent detaches the listener when disabled', async () => {
    const callback = vi.fn();
    renderHook(() => usePhoneCodeSent(callback, { enabled: false }), {
      wrapper: StrictModeWrapper,
    });
    await act(() => Promise.resolve());
    expect(fake.listenerCount('phoneCodeSent')).toBe(0);
  });

  it('useFirebaseAuthentication exposes plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseAuthentication(), {
      wrapper: StrictModeWrapper,
    });
    await expect(result.current.getCurrentUser()).resolves.toEqual({ user: null });
    await expect(result.current.signOut()).resolves.toBeUndefined();
  });
});
