import type { UnreadConversationCountChangeEvent } from '@capawesome/capacitor-intercom';
import { Intercom } from '@capawesome/capacitor-intercom';

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
 * `initialize` must be called before any other method.
 *
 * `handlePushNotification`, `isIntercomPushNotification` and `setBottomPadding`
 * are only available on Android and iOS.
 */
export const useIntercom = createMethodsHook('Intercom', Intercom, [
  'getUnreadConversationCount',
  'handlePushNotification',
  'hide',
  'initialize',
  'isIntercomPushNotification',
  'logEvent',
  'loginUnidentifiedUser',
  'loginUser',
  'logout',
  'present',
  'presentContent',
  'presentMessageComposer',
  'sendPushTokenToIntercom',
  'setBottomPadding',
  'setInAppMessagesVisible',
  'setLauncherVisible',
  'setUserHash',
  'setUserJwt',
  'updateUser',
]);

/**
 * The number of unread conversations of the current user, kept in sync via a
 * single shared plugin listener. `undefined` until the initial count resolves.
 */
export const useIntercomUnreadConversationCount = createPluginStateHook<number>({
  load: () => Intercom.getUnreadConversationCount().then(({ count }) => count),
  subscribe: emit =>
    pluginEventSubscription<UnreadConversationCountChangeEvent>(
      Intercom,
      'unreadConversationCountChange',
    )(event => emit(event.count)),
});

/** Invokes `callback` when the Intercom Messenger is hidden. Only available on iOS and Web. */
export function useIntercomMessengerHidden(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Intercom, 'messengerHidden', callback, options);
}

/** Invokes `callback` when the Intercom Messenger is shown. Only available on iOS and Web. */
export function useIntercomMessengerShown(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Intercom, 'messengerShown', callback, options);
}

/** Invokes `callback` whenever the number of unread conversations changes. */
export function useIntercomUnreadConversationCountChange(
  callback: (event: UnreadConversationCountChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Intercom, 'unreadConversationCountChange', callback, options);
}
