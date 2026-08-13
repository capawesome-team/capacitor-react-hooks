import { TextZoom } from '@capawesome/capacitor-text-zoom';
import { renderHook } from '@testing-library/react';

import { useTextZoom } from '../../src/capawesome/text-zoom';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-text-zoom', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getPreferredZoom = vi.fn(async () => ({ zoom: 1.2 }));
  fake.plugin.getZoom = vi.fn(async () => ({ zoom: 1 }));
  fake.plugin.setZoom = vi.fn(async () => undefined);
  return { TextZoom: fake.plugin };
});

describe('capawesome/text-zoom', () => {
  it('useTextZoom exposes the plugin methods', async () => {
    const { result } = renderHook(() => useTextZoom(), { wrapper: StrictModeWrapper });
    await expect(result.current.getZoom()).resolves.toEqual({ zoom: 1 });
    await expect(result.current.getPreferredZoom()).resolves.toEqual({ zoom: 1.2 });
    await expect(result.current.setZoom({ zoom: 1.5 })).resolves.toBeUndefined();
    expect(TextZoom.setZoom).toHaveBeenCalledWith({ zoom: 1.5 });
  });

  it('useTextZoom keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTextZoom(), { wrapper: StrictModeWrapper });
    const { getZoom } = result.current;
    rerender();
    expect(result.current.getZoom).toBe(getZoom);
  });
});
