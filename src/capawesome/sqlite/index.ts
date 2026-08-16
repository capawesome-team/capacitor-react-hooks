import { Sqlite } from '@capawesome-team/capacitor-sqlite';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `open()` must be called before any other database method: every other method
 * needs the returned `databaseId`.
 *
 * `changeEncryptionKey` is only available on Android and iOS.
 */
export const useSqlite = createMethodsHook('Sqlite', Sqlite, [
  'beginTransaction',
  'changeEncryptionKey',
  'close',
  'closeAll',
  'commitTransaction',
  'execute',
  'getVersion',
  'initialize',
  'open',
  'query',
  'rollbackTransaction',
  'vacuum',
]);
