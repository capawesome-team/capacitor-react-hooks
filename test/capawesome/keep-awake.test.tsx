import { KeepAwake } from '@capawesome/capacitor-keep-awake';
import { renderHook, waitFor } from '@testing-library/react';

import { useKeepAwake } from '../../src/capawesome/keep-awake';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-keep-awake', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.allowSleep = vi.fn(async () => undefined);
  fake.plugin.isAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.isKeptAwake = vi.fn(async () => ({ keptAwake: true }));
  fake.plugin.keepAwake = vi.fn(async () => undefined);
  return { KeepAwake: fake.plugin };
});

describe('capawesome/keep-awake', () => {
  it('useKeepAwake exposes the plugin methods', async () => {
    const { result } = renderHook(() => useKeepAwake(), { wrapper: StrictModeWrapper });
    await expect(result.current.keepAwake()).resolves.toBeUndefined();
    expect(KeepAwake.keepAwake).toHaveBeenCalled();
    await expect(result.current.isKeptAwake()).resolves.toEqual({ keptAwake: true });
    await expect(result.current.allowSleep()).resolves.toBeUndefined();
  });

  it('useKeepAwake keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useKeepAwake(), { wrapper: StrictModeWrapper });
    const { keepAwake } = result.current;
    rerender();
    expect(result.current.keepAwake).toBe(keepAwake);
  });

  it('exposes the plugin isAvailable method', async () => {
    const { result } = renderHook(() => useKeepAwake(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ available: true });
  });
});
