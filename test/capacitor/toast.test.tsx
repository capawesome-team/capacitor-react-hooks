import { Toast } from '@capacitor/toast';
import { renderHook } from '@testing-library/react';

import { useToast } from '../../src/capacitor/toast';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/toast', () => ({
  Toast: { show: vi.fn(async () => undefined) },
}));

describe('capacitor/toast', () => {
  it('useToast exposes show with stable identity across renders', async () => {
    const { result, rerender } = renderHook(() => useToast(), { wrapper: StrictModeWrapper });
    const { show } = result.current;
    await expect(show({ text: 'Saved' })).resolves.toBeUndefined();
    expect(Toast.show).toHaveBeenCalledWith({ text: 'Saved' });
    rerender();
    expect(result.current.show).toBe(show);
  });
});
