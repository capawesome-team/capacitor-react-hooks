import { Toast } from '@capawesome/capacitor-toast';
import { renderHook } from '@testing-library/react';

import { useToast } from '../../src/capawesome/toast';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-toast', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.show = vi.fn(async () => undefined);
  return { Toast: fake.plugin };
});

describe('capawesome/toast', () => {
  it('useToast exposes show with stable identity across renders', async () => {
    const { result, rerender } = renderHook(() => useToast(), { wrapper: StrictModeWrapper });
    const { show } = result.current;
    await expect(show({ text: 'Saved' })).resolves.toBeUndefined();
    expect(Toast.show).toHaveBeenCalledWith({ text: 'Saved' });
    rerender();
    expect(result.current.show).toBe(show);
  });
});
