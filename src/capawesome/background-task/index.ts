import { BackgroundTask } from '@capawesome/capacitor-background-task';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`. Only available on Android and iOS.
 *
 * On iOS, the task registered with `beforeExit` must call `finish` within 30
 * seconds.
 */
export const useBackgroundTask = createMethodsHook('BackgroundTask', BackgroundTask, [
  'beforeExit',
  'finish',
]);
