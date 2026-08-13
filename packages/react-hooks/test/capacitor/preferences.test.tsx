import { Preferences } from '@capacitor/preferences';
import { act, renderHook, waitFor } from '@testing-library/react';

import { usePreference, usePreferences } from '../../src/capacitor/preferences';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/preferences', () => {
  const values = new Map<string, string>();
  const plugin = {
    configure: vi.fn(async () => undefined),
    get: vi.fn(async ({ key }: { key: string }) => ({ value: values.get(key) ?? null })),
    set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
      values.set(key, value);
    }),
    remove: vi.fn(async ({ key }: { key: string }) => {
      values.delete(key);
    }),
    clear: vi.fn(async () => values.clear()),
    keys: vi.fn(async () => ({ keys: [...values.keys()] })),
    migrate: vi.fn(async () => ({ migrated: [], existing: [] })),
    removeOld: vi.fn(async () => undefined),
  };
  return { Preferences: Object.assign(plugin, { __values: values }) };
});

const storedValues = (Preferences as unknown as { __values: Map<string, string> }).__values;

describe('capacitor/preferences', () => {
  it('usePreference loads the stored value', async () => {
    storedValues.set('greeting', 'hello');
    const { result } = renderHook(() => usePreference('greeting'), { wrapper: StrictModeWrapper });
    expect(result.current.value).toBeUndefined();
    await waitFor(() => expect(result.current.value).toBe('hello'));
  });

  it('usePreference reports null for a key that is not set', async () => {
    const { result } = renderHook(() => usePreference('unknown'), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.value).toBeNull());
  });

  it('usePreference syncs every hook mounted on the same key', async () => {
    const first = renderHook(() => usePreference('theme'), { wrapper: StrictModeWrapper });
    const second = renderHook(() => usePreference('theme'), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(first.result.current.value).toBeNull());
    expect(second.result.current.value).toBeNull();

    await act(() => first.result.current.set('dark'));
    expect(storedValues.get('theme')).toBe('dark');
    expect(first.result.current.value).toBe('dark');
    expect(second.result.current.value).toBe('dark');

    await act(() => second.result.current.remove());
    expect(storedValues.has('theme')).toBe(false);
    expect(first.result.current.value).toBeNull();
    expect(second.result.current.value).toBeNull();
  });

  it('usePreference keeps a value written by another key untouched', async () => {
    storedValues.set('language', 'en');
    const { result } = renderHook(() => usePreference('language'), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.value).toBe('en'));
    await act(() => result.current.set('de'));
    expect(result.current.value).toBe('de');
    expect(storedValues.get('greeting')).toBe('hello');
  });

  it('usePreferences exposes the plugin methods', async () => {
    storedValues.set('token', 'abc');
    const { result } = renderHook(() => usePreferences(), { wrapper: StrictModeWrapper });
    await expect(result.current.get({ key: 'token' })).resolves.toEqual({ value: 'abc' });
  });
});
