import { ManagedConfigurations } from '@capawesome/capacitor-managed-configurations';
import { renderHook } from '@testing-library/react';

import { useManagedConfigurations } from '../../src/capawesome/managed-configurations';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-managed-configurations', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getString = vi.fn(async () => ({ value: 'https://example.com' }));
  fake.plugin.getNumber = vi.fn(async () => ({ value: 42 }));
  fake.plugin.getBoolean = vi.fn(async () => ({ value: null }));
  return { ManagedConfigurations: fake.plugin };
});

describe('capawesome/managed-configurations', () => {
  it('useManagedConfigurations exposes the plugin methods', async () => {
    const { result } = renderHook(() => useManagedConfigurations(), { wrapper: StrictModeWrapper });
    await expect(result.current.getString({ key: 'serverUrl' })).resolves.toEqual({
      value: 'https://example.com',
    });
    await expect(result.current.getNumber({ key: 'timeout' })).resolves.toEqual({ value: 42 });
    await expect(result.current.getBoolean({ key: 'unknown' })).resolves.toEqual({ value: null });
    expect(ManagedConfigurations.getString).toHaveBeenCalledWith({ key: 'serverUrl' });
  });
});
