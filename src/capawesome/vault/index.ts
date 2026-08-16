import type { LockEvent, UnlockEvent } from '@capawesome-team/capacitor-vault';
import { Vault } from '@capawesome-team/capacitor-vault';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize()` must be called once per session before any other method, and
 * the vault must be unlocked before values can be read or written.
 *
 * On **Web**, values are stored unencrypted in `localStorage`. This is for
 * development purposes only and should not be used in production.
 */
export const useVault = createMethodsHook('Vault', Vault, [
  'clear',
  'destroy',
  'exists',
  'exportData',
  'getKeys',
  'getValue',
  'importData',
  'initialize',
  'isEmpty',
  'isLocked',
  'lock',
  'removeValue',
  'setValue',
  'unlock',
]);

/**
 * Invokes `callback` whenever a vault is locked, either manually or after the
 * app has been backgrounded longer than `lockAfterBackgrounded`.
 */
export function useVaultLock(
  callback: (event: LockEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Vault, 'lock', callback, options);
}

/** Invokes `callback` whenever a vault is unlocked. */
export function useVaultUnlock(
  callback: (event: UnlockEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Vault, 'unlock', callback, options);
}
