import { renderHook } from '@testing-library/react';

import { useAppLauncher } from '../../src/capawesome/app-launcher';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-launcher', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.canOpenUrl = vi.fn(async () => ({ value: true }));
  fake.plugin.openUrl = vi.fn(async () => ({ completed: true }));
  return { AppLauncher: fake.plugin };
});

describe('capawesome/app-launcher', () => {
  it('useAppLauncher exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppLauncher(), { wrapper: StrictModeWrapper });
    await expect(result.current.canOpenUrl({ url: 'mailto:' })).resolves.toEqual({ value: true });
    await expect(result.current.openUrl({ url: 'mailto:' })).resolves.toEqual({ completed: true });
  });
});
