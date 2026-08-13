import { Badge } from '@capawesome/capacitor-badge';

import { createMethodsHook, createPermissionsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useBadge = createMethodsHook('Badge', Badge, [
  'get',
  'set',
  'increase',
  'decrease',
  'clear',
  'isSupported',
  'checkPermissions',
  'requestPermissions',
]);

/** Badge display permission status with imperative `check` and `request`. */
export const useBadgePermissions = createPermissionsHook(Badge);
