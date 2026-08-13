import { renderHook } from '@testing-library/react';

import { useAppIcon } from '../../src/capawesome/app-icon';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-icon', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCurrentIcon = vi.fn(async () => ({ icon: 'Christmas' }));
  fake.plugin.resetIcon = vi.fn(async () => undefined);
  fake.plugin.setIcon = vi.fn(async () => undefined);
  return { AppIcon: fake.plugin };
});

describe('capawesome/app-icon', () => {
  it('useAppIcon exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppIcon(), { wrapper: StrictModeWrapper });
    await expect(result.current.getCurrentIcon()).resolves.toEqual({ icon: 'Christmas' });
    await expect(result.current.setIcon({ icon: 'Christmas' })).resolves.toBeUndefined();
    await expect(result.current.resetIcon()).resolves.toBeUndefined();
  });
});
