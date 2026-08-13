import type {
  CustomPaywallActionEvent,
  PaywallDismissedEvent,
  PaywallPresentedEvent,
  PaywallWillDismissEvent,
  SubscriptionStatus,
  SubscriptionStatusDidChangeEvent,
  SuperwallEventInfo,
} from '@capawesome/capacitor-superwall';
import { Superwall } from '@capawesome/capacitor-superwall';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `configure` must be called before any other method.
 * All methods are only available on Android and iOS.
 */
export const useSuperwall = createMethodsHook('Superwall', Superwall, [
  'configure',
  'dismiss',
  'getIsLoggedIn',
  'getPresentationResult',
  'getSubscriptionStatus',
  'getUserId',
  'handleDeepLink',
  'identify',
  'register',
  'reset',
  'setUserAttributes',
]);

/**
 * The current subscription status, kept in sync via a single shared plugin
 * listener. `undefined` until the initial status resolves.
 *
 * Only available on Android and iOS.
 */
export const useSuperwallSubscriptionStatus = createPluginStateHook<SubscriptionStatus>({
  load: () => Superwall.getSubscriptionStatus().then(({ status }) => status),
  subscribe: emit =>
    pluginEventSubscription<SubscriptionStatusDidChangeEvent>(
      Superwall,
      'subscriptionStatusDidChange',
    )(event => emit(event.status)),
});

/** Invokes `callback` for every Superwall analytics event. Only available on Android and iOS. */
export function useSuperwallEvent(
  callback: (event: SuperwallEventInfo) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'superwallEvent', callback, options);
}

/**
 * Invokes `callback` whenever the subscription status changes.
 * Only available on Android and iOS.
 */
export function useSuperwallSubscriptionStatusDidChange(
  callback: (event: SubscriptionStatusDidChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'subscriptionStatusDidChange', callback, options);
}

/** Invokes `callback` when a paywall is presented. Only available on Android and iOS. */
export function useSuperwallPaywallPresented(
  callback: (event: PaywallPresentedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'paywallPresented', callback, options);
}

/** Invokes `callback` when a paywall is about to dismiss. Only available on Android and iOS. */
export function useSuperwallPaywallWillDismiss(
  callback: (event: PaywallWillDismissEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'paywallWillDismiss', callback, options);
}

/** Invokes `callback` when a paywall is dismissed. Only available on Android and iOS. */
export function useSuperwallPaywallDismissed(
  callback: (event: PaywallDismissedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'paywallDismissed', callback, options);
}

/** Invokes `callback` when a custom paywall action is triggered. Only available on Android and iOS. */
export function useSuperwallCustomPaywallAction(
  callback: (event: CustomPaywallActionEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Superwall, 'customPaywallAction', callback, options);
}
