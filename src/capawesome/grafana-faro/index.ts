import { GrafanaFaro } from '@capawesome/capacitor-grafana-faro';

import { createMethodsHook } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` must be called before any other method.
 */
export const useGrafanaFaro = createMethodsHook('GrafanaFaro', GrafanaFaro, [
  'getSession',
  'getView',
  'initialize',
  'pause',
  'pushError',
  'pushEvent',
  'pushLog',
  'pushMeasurement',
  'resetSession',
  'resetUser',
  'setSession',
  'setUser',
  'setView',
  'unpause',
]);
