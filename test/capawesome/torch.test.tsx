import { Torch } from '@capawesome/capacitor-torch';
import { renderHook } from '@testing-library/react';

import { useTorch } from '../../src/capawesome/torch';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-torch', () => ({
  Torch: {
    enable: vi.fn(async () => undefined),
    disable: vi.fn(async () => undefined),
    isAvailable: vi.fn(async () => ({ available: true })),
    isEnabled: vi.fn(async () => ({ enabled: false })),
    toggle: vi.fn(async () => undefined),
  },
}));

describe('capawesome/torch', () => {
  it('useTorch exposes the plugin methods', async () => {
    const { result } = renderHook(() => useTorch(), { wrapper: StrictModeWrapper });
    await expect(result.current.isEnabled()).resolves.toEqual({ enabled: false });
    await expect(result.current.enable()).resolves.toBeUndefined();
    expect(Torch.enable).toHaveBeenCalled();
    await expect(result.current.toggle()).resolves.toBeUndefined();
    expect(Torch.toggle).toHaveBeenCalled();
  });

  it('useTorch keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTorch(), { wrapper: StrictModeWrapper });
    const { toggle } = result.current;
    rerender();
    expect(result.current.toggle).toBe(toggle);
  });
});
