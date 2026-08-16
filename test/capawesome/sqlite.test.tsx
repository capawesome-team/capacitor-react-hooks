import { Sqlite } from '@capawesome-team/capacitor-sqlite';
import { renderHook } from '@testing-library/react';

import { useSqlite } from '../../src/capawesome/sqlite';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-sqlite', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.beginTransaction = vi.fn(async () => undefined);
  fake.plugin.changeEncryptionKey = vi.fn(async () => undefined);
  fake.plugin.close = vi.fn(async () => undefined);
  fake.plugin.closeAll = vi.fn(async () => undefined);
  fake.plugin.commitTransaction = vi.fn(async () => undefined);
  fake.plugin.execute = vi.fn(async () => ({ changes: 1, rowId: 42 }));
  fake.plugin.getVersion = vi.fn(async () => ({ version: '3.50.0' }));
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.open = vi.fn(async () => ({ databaseId: 'database-1' }));
  fake.plugin.query = vi.fn(async () => ({ columns: ['name'], rows: [['Alice']] }));
  fake.plugin.rollbackTransaction = vi.fn(async () => undefined);
  fake.plugin.vacuum = vi.fn(async () => undefined);
  return { Sqlite: fake.plugin };
});

describe('capawesome/sqlite', () => {
  it('useSqlite exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSqlite(), { wrapper: StrictModeWrapper });
    await expect(result.current.open({ path: 'mydb.sqlite3' })).resolves.toEqual({
      databaseId: 'database-1',
    });
    await expect(
      result.current.query({ databaseId: 'database-1', statement: 'SELECT name FROM users' }),
    ).resolves.toEqual({ columns: ['name'], rows: [['Alice']] });
    await expect(result.current.getVersion()).resolves.toEqual({ version: '3.50.0' });
    await result.current.close({ databaseId: 'database-1' });
    expect(Sqlite.close).toHaveBeenCalledWith({ databaseId: 'database-1' });
  });
});
