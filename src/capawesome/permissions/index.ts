import { Permissions } from '@capawesome/capacitor-permissions';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `check` and `request` take the permissions to inspect, so this plugin is not
 * backed by the standard `checkPermissions` / `requestPermissions` pair and has
 * no permission status hook. On Web, only `NOTIFICATIONS` can be requested.
 */
export const usePermissions = createMethodsHook('Permissions', Permissions, ['check', 'request']);
