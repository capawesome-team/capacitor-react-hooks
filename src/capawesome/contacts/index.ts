import { Contacts } from '@capawesome-team/capacitor-contacts';

import { createMethodsHook, createPermissionsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Platform support differs per method: the group methods (`createGroup`,
 * `deleteGroupById`, `getGroupById`, `getGroups`) are only available on iOS,
 * `getAccounts` is only available on Android, and the remaining methods are
 * only available on Android and iOS.
 */
export const useContacts = createMethodsHook('Contacts', Contacts, [
  'countContacts',
  'createContact',
  'createGroup',
  'deleteContactById',
  'deleteGroupById',
  'displayContactById',
  'displayCreateContact',
  'displayUpdateContactById',
  'getAccounts',
  'getContactById',
  'getContacts',
  'getGroupById',
  'getGroups',
  'isAvailable',
  'openSettings',
  'pickContacts',
  'updateContactById',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Contacts permission status with imperative `check` and `request`.
 * Only available on Android and iOS.
 */
export const useContactsPermissions = createPermissionsHook(Contacts);
