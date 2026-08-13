import { Libsql } from '@capawesome/capacitor-libsql';
import { renderHook } from '@testing-library/react';

import { useLibsql } from '../../src/capawesome/libsql';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-libsql', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.beginTransaction = vi.fn(async () => ({ transactionId: 'transaction-1' }));
  fake.plugin.commitTransaction = vi.fn(async () => undefined);
  fake.plugin.connect = vi.fn(async () => ({ connectionId: 'connection-1' }));
  fake.plugin.execute = vi.fn(async () => undefined);
  fake.plugin.executeBatch = vi.fn(async () => undefined);
  fake.plugin.query = vi.fn(async () => ({ rows: [['Alice', 30]] }));
  fake.plugin.rollbackTransaction = vi.fn(async () => undefined);
  fake.plugin.sync = vi.fn(async () => undefined);
  return { Libsql: fake.plugin };
});

describe('capawesome/libsql', () => {
  it('useLibsql exposes the plugin methods', async () => {
    const { result } = renderHook(() => useLibsql(), { wrapper: StrictModeWrapper });
    await expect(result.current.connect({ path: '/data/data.db' })).resolves.toEqual({
      connectionId: 'connection-1',
    });
    await expect(
      result.current.beginTransaction({ connectionId: 'connection-1' }),
    ).resolves.toEqual({ transactionId: 'transaction-1' });
    await expect(
      result.current.query({ connectionId: 'connection-1', statement: 'SELECT * FROM users' }),
    ).resolves.toEqual({ rows: [['Alice', 30]] });
    await expect(result.current.sync({ connectionId: 'connection-1' })).resolves.toBeUndefined();
    expect(Libsql.connect).toHaveBeenCalledWith({ path: '/data/data.db' });
  });
});
