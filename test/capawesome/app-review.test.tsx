import { renderHook } from '@testing-library/react';

import { useAppReview } from '../../src/capawesome/app-review';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-review', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.requestReview = vi.fn(async () => undefined);
  fake.plugin.openAppStore = vi.fn(async () => undefined);
  return { AppReview: fake.plugin };
});

describe('capawesome/app-review', () => {
  it('useAppReview exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppReview(), { wrapper: StrictModeWrapper });
    await expect(result.current.requestReview()).resolves.toBeUndefined();
    await expect(result.current.openAppStore({ appId: '123456789' })).resolves.toBeUndefined();
  });
});
