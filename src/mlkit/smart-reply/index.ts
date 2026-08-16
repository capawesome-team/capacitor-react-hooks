import { SmartReply } from '@capacitor-mlkit/smart-reply';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * `suggestReplies` resolves with a `status` even when no suggestions could be
 * generated, for example for conversations that are not in English.
 */
export const useSmartReply = createMethodsHook('SmartReply', SmartReply, ['suggestReplies']);
