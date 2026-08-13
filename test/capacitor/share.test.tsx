import { Share } from '@capacitor/share';
import { renderHook } from '@testing-library/react';

import { useShare } from '../../src/capacitor/share';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/share', () => ({
  Share: {
    canShare: vi.fn(async () => ({ value: true })),
    share: vi.fn(async () => ({ activityType: 'com.apple.UIKit.activity.Mail' })),
  },
}));

describe('capacitor/share', () => {
  it('useShare exposes the plugin methods', async () => {
    const { result } = renderHook(() => useShare(), { wrapper: StrictModeWrapper });
    await expect(result.current.canShare()).resolves.toEqual({ value: true });
    await expect(result.current.share({ title: 'Capacitor' })).resolves.toEqual({
      activityType: 'com.apple.UIKit.activity.Mail',
    });
    expect(Share.share).toHaveBeenCalledWith({ title: 'Capacitor' });
  });

  it('useShare keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useShare(), { wrapper: StrictModeWrapper });
    const { share } = result.current;
    rerender();
    expect(result.current.share).toBe(share);
  });
});
