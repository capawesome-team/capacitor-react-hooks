import { AccessibilityPreferences } from '@capawesome/capacitor-accessibility-preferences';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * The plugin emits no event when the user changes an accessibility setting:
 * call `getPreferences()` again whenever the preferences may have changed, for
 * example when the app resumes.
 */
export const useAccessibilityPreferences = createMethodsHook(
  'AccessibilityPreferences',
  AccessibilityPreferences,
  ['getPreferences'],
);
