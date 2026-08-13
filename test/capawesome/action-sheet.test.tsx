import { ActionSheet } from '@capawesome/capacitor-action-sheet';
import { renderHook } from '@testing-library/react';

import { useActionSheet } from '../../src/capawesome/action-sheet';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-action-sheet', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.showActions = vi.fn(async () => ({ canceled: false, index: 1 }));
  return { ActionSheet: fake.plugin };
});

describe('capawesome/action-sheet', () => {
  it('useActionSheet exposes showActions with stable identity across renders', async () => {
    const { result, rerender } = renderHook(() => useActionSheet(), { wrapper: StrictModeWrapper });
    const { showActions } = result.current;
    await expect(showActions({ options: [{ title: 'Delete' }] })).resolves.toEqual({
      canceled: false,
      index: 1,
    });
    expect(ActionSheet.showActions).toHaveBeenCalledWith({ options: [{ title: 'Delete' }] });
    rerender();
    expect(result.current.showActions).toBe(showActions);
  });
});
