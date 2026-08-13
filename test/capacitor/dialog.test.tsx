import { Dialog } from '@capacitor/dialog';
import { renderHook } from '@testing-library/react';

import { useDialog } from '../../src/capacitor/dialog';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/dialog', () => ({
  Dialog: {
    alert: vi.fn(async () => undefined),
    prompt: vi.fn(async () => ({ value: 'Ada', cancelled: false })),
    confirm: vi.fn(async () => ({ value: true })),
  },
}));

describe('capacitor/dialog', () => {
  it('useDialog exposes the plugin methods', async () => {
    const { result } = renderHook(() => useDialog(), { wrapper: StrictModeWrapper });
    await expect(result.current.alert({ message: 'Saved' })).resolves.toBeUndefined();
    expect(Dialog.alert).toHaveBeenCalledWith({ message: 'Saved' });
    await expect(result.current.prompt({ message: 'Name?' })).resolves.toEqual({
      value: 'Ada',
      cancelled: false,
    });
    await expect(result.current.confirm({ message: 'Delete?' })).resolves.toEqual({ value: true });
  });

  it('useDialog keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useDialog(), { wrapper: StrictModeWrapper });
    const { confirm } = result.current;
    rerender();
    expect(result.current.confirm).toBe(confirm);
  });
});
