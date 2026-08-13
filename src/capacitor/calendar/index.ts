import { Calendar } from '@capacitor/calendar';

import { createMethodsHook, createPermissionsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useCalendar = createMethodsHook('Calendar', Calendar, [
  'createEvent',
  'createEventInteractively',
  'modifyEvent',
  'findEvents',
  'deleteEvent',
  'listCalendars',
  'createCalendar',
  'deleteCalendar',
  'openCalendar',
  'checkPermissions',
  'requestPermissions',
]);

/** Calendar permission status with imperative `check` and `request`. */
export const useCalendarPermissions = createPermissionsHook(Calendar);
