import { Haptics } from '@capawesome/capacitor-haptics';
import { renderHook, waitFor } from '@testing-library/react';

import { useHaptics } from '../../src/capawesome/haptics';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-haptics', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.impact = vi.fn(async () => undefined);
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.notification = vi.fn(async () => undefined);
  fake.plugin.performAndroidHaptic = vi.fn(async () => undefined);
  fake.plugin.playPattern = vi.fn(async () => undefined);
  fake.plugin.selectionStart = vi.fn(async () => undefined);
  fake.plugin.selectionChanged = vi.fn(async () => undefined);
  fake.plugin.selectionEnd = vi.fn(async () => undefined);
  fake.plugin.vibrate = vi.fn(async () => undefined);
  return { Haptics: fake.plugin };
});

describe('capawesome/haptics', () => {
  it('useHaptics exposes the plugin methods', async () => {
    const { result } = renderHook(() => useHaptics(), { wrapper: StrictModeWrapper });
    await expect(result.current.impact()).resolves.toBeUndefined();
    await expect(result.current.notification()).resolves.toBeUndefined();
    await expect(
      result.current.playPattern({ events: [{ intensity: 1, time: 0 }] }),
    ).resolves.toBeUndefined();
    await expect(result.current.selectionStart()).resolves.toBeUndefined();
    await expect(result.current.selectionChanged()).resolves.toBeUndefined();
    await expect(result.current.selectionEnd()).resolves.toBeUndefined();
    await expect(result.current.vibrate({ duration: 100 })).resolves.toBeUndefined();
    expect(Haptics.vibrate).toHaveBeenCalledWith({ duration: 100 });
  });

  it('useHaptics keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useHaptics(), { wrapper: StrictModeWrapper });
    const { impact } = result.current;
    rerender();
    expect(result.current.impact).toBe(impact);
  });

  it('exposes the plugin isAvailable method', async () => {
    const { result } = renderHook(() => useHaptics(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true });
  });
});
