import { MailComposer } from '@capawesome/capacitor-mail-composer';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `composeMail` only opens the native composer: the user decides whether the
 * email is sent. Attachments are not supported on the web.
 */
export const useMailComposer = createMethodsHook('MailComposer', MailComposer, [
  'canComposeMail',
  'composeMail',
]);
