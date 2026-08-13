import { Libsql } from '@capawesome/capacitor-libsql';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `connect()` must be called before any other method: every other method needs
 * the returned `connectionId`.
 *
 * Only available on Android and iOS.
 */
export const useLibsql = createMethodsHook('Libsql', Libsql, [
  'beginTransaction',
  'commitTransaction',
  'connect',
  'execute',
  'executeBatch',
  'query',
  'rollbackTransaction',
  'sync',
]);
