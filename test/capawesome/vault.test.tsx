import { Vault } from '@capawesome-team/capacitor-vault';
import { act, renderHook } from '@testing-library/react';

import { useVault, useVaultLock, useVaultUnlock } from '../../src/capawesome/vault';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-vault', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.clear = vi.fn(async () => undefined);
  fake.plugin.destroy = vi.fn(async () => undefined);
  fake.plugin.exists = vi.fn(async () => ({ exists: true }));
  fake.plugin.exportData = vi.fn(async () => ({ data: { token: 'secret' } }));
  fake.plugin.getKeys = vi.fn(async () => ({ keys: ['token'] }));
  fake.plugin.getValue = vi.fn(async () => ({ value: 'secret' }));
  fake.plugin.importData = vi.fn(async () => undefined);
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.isEmpty = vi.fn(async () => ({ isEmpty: false }));
  fake.plugin.isLocked = vi.fn(async () => ({ isLocked: true }));
  fake.plugin.lock = vi.fn(async () => undefined);
  fake.plugin.removeValue = vi.fn(async () => undefined);
  fake.plugin.setValue = vi.fn(async () => undefined);
  fake.plugin.unlock = vi.fn(async () => undefined);
  return { Vault: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Vault as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/vault', () => {
  it('useVaultLock delivers lock events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useVaultLock(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('lock', { trigger: 'MANUAL', vaultId: 'default' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ trigger: 'MANUAL', vaultId: 'default' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('lock')).toBe(0);
  });

  it('useVaultUnlock delivers unlock events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useVaultUnlock(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('unlock', { vaultId: 'default' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ vaultId: 'default' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('unlock')).toBe(0);
  });

  it('useVault exposes the plugin methods', async () => {
    const { result } = renderHook(() => useVault(), { wrapper: StrictModeWrapper });
    await expect(result.current.isLocked()).resolves.toEqual({ isLocked: true });
    await expect(result.current.getValue({ key: 'token' })).resolves.toEqual({ value: 'secret' });
    await result.current.setValue({ key: 'token', value: 'secret' });
    expect(Vault.setValue).toHaveBeenCalledWith({ key: 'token', value: 'secret' });
  });
});
