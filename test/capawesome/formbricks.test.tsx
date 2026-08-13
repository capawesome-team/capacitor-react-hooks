import { Formbricks } from '@capawesome/capacitor-formbricks';
import { renderHook } from '@testing-library/react';

import { useFormbricks } from '../../src/capawesome/formbricks';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-formbricks', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.setup = vi.fn(async () => undefined);
  fake.plugin.setUserId = vi.fn(async () => undefined);
  fake.plugin.track = vi.fn(async () => undefined);
  fake.plugin.logout = vi.fn(async () => undefined);
  return { Formbricks: fake.plugin };
});

describe('capawesome/formbricks', () => {
  it('useFormbricks exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFormbricks(), { wrapper: StrictModeWrapper });
    await result.current.setup({ appUrl: 'https://app.formbricks.com', environmentId: 'env-1' });
    expect(Formbricks.setup).toHaveBeenCalledWith({
      appUrl: 'https://app.formbricks.com',
      environmentId: 'env-1',
    });
    await result.current.track({ action: 'clicked' });
    expect(Formbricks.track).toHaveBeenCalledWith({ action: 'clicked' });
  });
});
