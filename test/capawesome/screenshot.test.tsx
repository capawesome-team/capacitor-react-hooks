import { renderHook } from '@testing-library/react';

import { useScreenshot } from '../../src/capawesome/screenshot';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-screenshot', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.take = vi.fn(async () => ({ uri: 'file:///screenshot.jpg' }));
  return { Screenshot: fake.plugin };
});

describe('capawesome/screenshot', () => {
  it('useScreenshot exposes the plugin methods', async () => {
    const { result } = renderHook(() => useScreenshot(), { wrapper: StrictModeWrapper });
    await expect(result.current.take()).resolves.toEqual({ uri: 'file:///screenshot.jpg' });
  });
});
