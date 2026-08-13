import { TextInteraction } from '@capawesome/capacitor-text-interaction';
import { renderHook } from '@testing-library/react';

import { useTextInteraction } from '../../src/capawesome/text-interaction';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-text-interaction', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.disable = vi.fn(async () => undefined);
  fake.plugin.enable = vi.fn(async () => undefined);
  fake.plugin.isEnabled = vi.fn(async () => ({ enabled: true }));
  return { TextInteraction: fake.plugin };
});

describe('capawesome/text-interaction', () => {
  it('useTextInteraction exposes the plugin methods', async () => {
    const { result } = renderHook(() => useTextInteraction(), { wrapper: StrictModeWrapper });
    await expect(result.current.disable()).resolves.toBeUndefined();
    expect(TextInteraction.disable).toHaveBeenCalled();
    await expect(result.current.enable()).resolves.toBeUndefined();
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: true });
  });

  it('useTextInteraction keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTextInteraction(), {
      wrapper: StrictModeWrapper,
    });
    const { enable } = result.current;
    rerender();
    expect(result.current.enable).toBe(enable);
  });
});
