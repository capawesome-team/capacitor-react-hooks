import { Haptics } from '@capacitor/haptics';
import { renderHook } from '@testing-library/react';

import { useHaptics } from '../../src/capacitor/haptics';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(async () => undefined),
    notification: vi.fn(async () => undefined),
    vibrate: vi.fn(async () => undefined),
    selectionStart: vi.fn(async () => undefined),
    selectionChanged: vi.fn(async () => undefined),
    selectionEnd: vi.fn(async () => undefined),
  },
}));

describe('capacitor/haptics', () => {
  it('useHaptics exposes the plugin methods', async () => {
    const { result } = renderHook(() => useHaptics(), { wrapper: StrictModeWrapper });
    await result.current.impact();
    await result.current.notification();
    await result.current.vibrate({ duration: 100 });
    await result.current.selectionStart();
    await result.current.selectionChanged();
    await result.current.selectionEnd();
    expect(Haptics.impact).toHaveBeenCalled();
    expect(Haptics.vibrate).toHaveBeenCalledWith({ duration: 100 });
    expect(Haptics.selectionEnd).toHaveBeenCalled();
  });

  it('useHaptics keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useHaptics(), { wrapper: StrictModeWrapper });
    const { impact } = result.current;
    rerender();
    expect(result.current.impact).toBe(impact);
  });
});
