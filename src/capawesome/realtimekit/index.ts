import { RealtimeKit } from '@capawesome/capacitor-realtimekit';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called before `startMeeting`, which is only available on
 * Android and iOS.
 */
export const useRealtimeKit = createMethodsHook('RealtimeKit', RealtimeKit, [
  'initialize',
  'startMeeting',
]);
