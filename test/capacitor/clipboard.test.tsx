import { Clipboard } from '@capacitor/clipboard';
import { renderHook } from '@testing-library/react';

import { useClipboard } from '../../src/capacitor/clipboard';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/clipboard', () => ({
  Clipboard: {
    write: vi.fn(async () => undefined),
    read: vi.fn(async () => ({ value: 'hello', type: 'text/plain' })),
  },
}));

describe('capacitor/clipboard', () => {
  it('useClipboard exposes the plugin methods', async () => {
    const { result } = renderHook(() => useClipboard(), { wrapper: StrictModeWrapper });
    await expect(result.current.write({ string: 'hello' })).resolves.toBeUndefined();
    expect(Clipboard.write).toHaveBeenCalledWith({ string: 'hello' });
    await expect(result.current.read()).resolves.toEqual({ value: 'hello', type: 'text/plain' });
  });

  it('useClipboard keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useClipboard(), { wrapper: StrictModeWrapper });
    const { read } = result.current;
    rerender();
    expect(result.current.read).toBe(read);
  });
});
