import { TextZoom } from '@capacitor/text-zoom';
import { renderHook } from '@testing-library/react';

import { useTextZoom } from '../../src/capacitor/text-zoom';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/text-zoom', () => ({
  TextZoom: {
    get: vi.fn(async () => ({ value: 1 })),
    getPreferred: vi.fn(async () => ({ value: 1.2 })),
    set: vi.fn(async () => undefined),
  },
}));

describe('capacitor/text-zoom', () => {
  it('useTextZoom exposes the plugin methods', async () => {
    const { result } = renderHook(() => useTextZoom(), { wrapper: StrictModeWrapper });
    await expect(result.current.get()).resolves.toEqual({ value: 1 });
    await expect(result.current.getPreferred()).resolves.toEqual({ value: 1.2 });
    await expect(result.current.set({ value: 1.5 })).resolves.toBeUndefined();
    expect(TextZoom.set).toHaveBeenCalledWith({ value: 1.5 });
  });

  it('useTextZoom keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTextZoom(), { wrapper: StrictModeWrapper });
    const { get } = result.current;
    rerender();
    expect(result.current.get).toBe(get);
  });
});
