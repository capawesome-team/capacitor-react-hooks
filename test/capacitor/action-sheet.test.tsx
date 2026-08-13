import { ActionSheet } from '@capacitor/action-sheet';
import { renderHook } from '@testing-library/react';

import { useActionSheet } from '../../src/capacitor/action-sheet';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/action-sheet', () => ({
  ActionSheet: { showActions: vi.fn(async () => ({ index: 1, canceled: false })) },
}));

describe('capacitor/action-sheet', () => {
  it('useActionSheet exposes showActions with stable identity across renders', async () => {
    const { result, rerender } = renderHook(() => useActionSheet(), { wrapper: StrictModeWrapper });
    const { showActions } = result.current;
    await expect(showActions({ options: [{ title: 'Delete' }] })).resolves.toEqual({
      index: 1,
      canceled: false,
    });
    expect(ActionSheet.showActions).toHaveBeenCalledWith({ options: [{ title: 'Delete' }] });
    rerender();
    expect(result.current.showActions).toBe(showActions);
  });
});
