import { Geocoder } from '@capawesome-team/capacitor-geocoder';

import { createMethodsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. Only available on Android and iOS. */
export const useGeocoder = createMethodsHook('Geocoder', Geocoder, ['geocode', 'geodecode']);
