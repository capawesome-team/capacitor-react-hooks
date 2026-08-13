import { Posthog } from '@capawesome/capacitor-posthog';
import { renderHook } from '@testing-library/react';

import { usePosthog } from '../../src/capawesome/posthog';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-posthog', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.setup = vi.fn(async () => undefined);
  fake.plugin.capture = vi.fn(async () => undefined);
  fake.plugin.getDistinctId = vi.fn(async () => ({ distinctId: 'user-1' }));
  fake.plugin.isFeatureEnabled = vi.fn(async () => ({ enabled: true }));
  return { Posthog: fake.plugin };
});

describe('capawesome/posthog', () => {
  it('usePosthog exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePosthog(), { wrapper: StrictModeWrapper });
    await expect(result.current.getDistinctId()).resolves.toEqual({ distinctId: 'user-1' });
    await expect(result.current.isFeatureEnabled({ key: 'beta' })).resolves.toEqual({
      enabled: true,
    });
    await result.current.capture({ event: 'opened' });
    expect(Posthog.capture).toHaveBeenCalledWith({ event: 'opened' });
  });
});
