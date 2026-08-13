import { Dialog } from '@capawesome/capacitor-dialog';
import { renderHook } from '@testing-library/react';

import { useDialog } from '../../src/capawesome/dialog';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-dialog', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.alert = vi.fn(async () => undefined);
  fake.plugin.confirm = vi.fn(async () => ({ value: true }));
  fake.plugin.prompt = vi.fn(async () => ({ canceled: false, value: 'Ada' }));
  return { Dialog: fake.plugin };
});

describe('capawesome/dialog', () => {
  it('useDialog exposes the plugin methods', async () => {
    const { result } = renderHook(() => useDialog(), { wrapper: StrictModeWrapper });
    await expect(result.current.alert({ message: 'Saved' })).resolves.toBeUndefined();
    expect(Dialog.alert).toHaveBeenCalledWith({ message: 'Saved' });
    await expect(result.current.confirm({ message: 'Delete?' })).resolves.toEqual({ value: true });
    await expect(result.current.prompt({ message: 'Name?' })).resolves.toEqual({
      canceled: false,
      value: 'Ada',
    });
  });

  it('useDialog keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useDialog(), { wrapper: StrictModeWrapper });
    const { confirm } = result.current;
    rerender();
    expect(result.current.confirm).toBe(confirm);
  });
});
