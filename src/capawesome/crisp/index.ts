import type {
  MessageReceivedEvent,
  MessageSentEvent,
  SessionLoadedEvent,
} from '@capawesome/capacitor-crisp';
import { Crisp } from '@capawesome/capacitor-crisp';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `configure` must be called before any other method.
 *
 * `handlePushNotification`, `isCrispPushNotification` and
 * `setNotificationsEnabled` are only available on Android,
 * `setShouldPromptForNotificationPermission` only on iOS.
 */
export const useCrisp = createMethodsHook('Crisp', Crisp, [
  'configure',
  'handlePushNotification',
  'isCrispPushNotification',
  'openChat',
  'openHelpdeskArticle',
  'pushSessionEvent',
  'resetSession',
  'searchHelpdesk',
  'setCompany',
  'setNotificationsEnabled',
  'setSessionBool',
  'setSessionInt',
  'setSessionSegment',
  'setSessionString',
  'setShouldPromptForNotificationPermission',
  'setTokenId',
  'setUser',
]);

/** Invokes `callback` when the chat is closed. */
export function useCrispChatClosed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Crisp, 'chatClosed', callback, options);
}

/** Invokes `callback` when the chat is opened. */
export function useCrispChatOpened(callback: () => void, options?: ListenerOptions): void {
  usePluginListener<void>(Crisp, 'chatOpened', callback, options);
}

/** Invokes `callback` when a message is received from the operator. */
export function useCrispMessageReceived(
  callback: (event: MessageReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Crisp, 'messageReceived', callback, options);
}

/** Invokes `callback` when a message is sent by the user. */
export function useCrispMessageSent(
  callback: (event: MessageSentEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Crisp, 'messageSent', callback, options);
}

/** Invokes `callback` when the session is loaded. This is the recommended way to get the session ID. */
export function useCrispSessionLoaded(
  callback: (event: SessionLoadedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Crisp, 'sessionLoaded', callback, options);
}
