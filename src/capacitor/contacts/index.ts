import { Contacts } from '@capacitor/contacts';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * The plugin exposes no permission methods: each call requests the contacts
 * permission internally, so there is no permissions hook for this plugin.
 */
export const useContacts = createMethodsHook('Contacts', Contacts, [
  'find',
  'save',
  'remove',
  'pickContact',
]);
