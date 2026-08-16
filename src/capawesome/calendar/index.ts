import { Calendar } from '@capawesome-team/capacitor-calendar';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useCalendar = createMethodsHook('Calendar', Calendar, [
  'checkPermissions',
  'createCalendar',
  'createEvent',
  'deleteCalendarById',
  'deleteEventById',
  'displayCreateEvent',
  'displayUpdateEventById',
  'getCalendars',
  'getDefaultCalendar',
  'getEventById',
  'getEvents',
  'openCalendar',
  'openSettings',
  'requestPermissions',
  'updateEventById',
]);

/**
 * Status of the permissions to read and write calendar data with imperative
 * `check` and `request`. Only available on Android and iOS.
 *
 * On iOS 17+, requesting only the `writeCalendar` permission requests
 * write-only access, while requesting the `readCalendar` permission requests
 * full access.
 */
export const useCalendarPermissions = createPermissionsHook(Calendar);

/**
 * Invokes `callback` whenever calendars or events are created, updated or
 * deleted, including by other apps. The event carries no payload, so reload
 * the data you display from the plugin.
 *
 * Only available on Android and iOS.
 */
export function useCalendarChange(callback: () => void, options?: ListenerOptions): void {
  usePluginListener(Calendar, 'calendarChange', callback, options);
}
