import { SecurePreferences } from '@capawesome-team/capacitor-secure-preferences';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useSecurePreference, useSecurePreferences } from '../../src/capawesome/secure-preferences';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-secure-preferences', async () => {
  const { createFakePlugin } = await import('../harness');
  const values = new Map<string, string>();
  const fake = createFakePlugin();
  fake.plugin.clear = vi.fn(async () => values.clear());
  fake.plugin.get = vi.fn(async ({ key }: { key: string }) => ({ value: values.get(key) ?? null }));
  fake.plugin.keys = vi.fn(async () => ({ keys: [...values.keys()] }));
  fake.plugin.remove = vi.fn(async ({ key }: { key: string }) => {
    values.delete(key);
  });
  fake.plugin.set = vi.fn(async ({ key, value }: { key: string; value: string }) => {
    values.set(key, value);
  });
  return { SecurePreferences: Object.assign(fake.plugin, { __values: values }) };
});

const storedValues = (SecurePreferences as unknown as { __values: Map<string, string> }).__values;

describe('capawesome/secure-preferences', () => {
  it('useSecurePreference loads the stored value', async () => {
    storedValues.set('greeting', 'hello');
    const { result } = renderHook(() => useSecurePreference('greeting'), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.value).toBeUndefined();
    await waitFor(() => expect(result.current.value).toBe('hello'));
  });

  it('useSecurePreference reports null for a key that is not set', async () => {
    const { result } = renderHook(() => useSecurePreference('unknown'), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.value).toBeNull());
  });

  it('useSecurePreference syncs every hook mounted on the same key', async () => {
    const first = renderHook(() => useSecurePreference('token'), { wrapper: StrictModeWrapper });
    const second = renderHook(() => useSecurePreference('token'), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(first.result.current.value).toBeNull());
    expect(second.result.current.value).toBeNull();

    await act(() => first.result.current.set('secret'));
    expect(storedValues.get('token')).toBe('secret');
    expect(first.result.current.value).toBe('secret');
    expect(second.result.current.value).toBe('secret');

    await act(() => second.result.current.remove());
    expect(storedValues.has('token')).toBe(false);
    expect(first.result.current.value).toBeNull();
    expect(second.result.current.value).toBeNull();
  });

  it('useSecurePreferences exposes the plugin methods', async () => {
    storedValues.set('language', 'en');
    const { result } = renderHook(() => useSecurePreferences(), { wrapper: StrictModeWrapper });
    await expect(result.current.get({ key: 'language' })).resolves.toEqual({ value: 'en' });
    await expect(result.current.keys()).resolves.toEqual({ keys: [...storedValues.keys()] });
  });
});
