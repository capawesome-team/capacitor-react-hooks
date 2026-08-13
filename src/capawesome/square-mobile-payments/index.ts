import type {
  AvailableCardInputMethodsDidChangeEvent,
  CardInputMethod,
  PaymentDidCancelEvent,
  PaymentDidFailEvent,
  PaymentDidFinishEvent,
  ReaderDidChangeEvent,
  ReaderPairingDidFailEvent,
  ReaderWasAddedEvent,
  ReaderWasRemovedEvent,
} from '@capawesome/capacitor-square-mobile-payments';
import { SquareMobilePayments } from '@capawesome/capacitor-square-mobile-payments';

import {
  createMethodsHook,
  createPermissionsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * `initialize` and `authorize` must be called before the payment and reader
 * methods. All methods are only available on Android and iOS, except
 * `linkAppleAccount`, `relinkAppleAccount`, `isAppleAccountLinked` and
 * `isDeviceCapable`, which are only available on iOS.
 */
export const useSquareMobilePayments = createMethodsHook(
  'SquareMobilePayments',
  SquareMobilePayments,
  [
    'authorize',
    'cancelPayment',
    'checkPermissions',
    'deauthorize',
    'forgetReader',
    'getAvailableCardInputMethods',
    'getReaders',
    'getSettings',
    'hideMockReader',
    'initialize',
    'isAppleAccountLinked',
    'isAuthorized',
    'isDeviceCapable',
    'isPairingInProgress',
    'linkAppleAccount',
    'relinkAppleAccount',
    'requestPermissions',
    'retryConnection',
    'showMockReader',
    'showSettings',
    'startPairing',
    'startPayment',
    'stopPairing',
  ],
);

/**
 * Location, audio recording and Bluetooth permission status with imperative
 * `check` and `request`. Only available on Android and iOS.
 */
export const useSquareMobilePaymentsPermissions = createPermissionsHook(SquareMobilePayments);

/**
 * The currently available card input methods, kept in sync via a single shared
 * plugin listener. `undefined` until the initial read resolves, which requires
 * an authorized SDK.
 *
 * Only available on Android and iOS.
 */
export const useSquareMobilePaymentsAvailableCardInputMethods = createPluginStateHook<
  CardInputMethod[]
>({
  load: () =>
    SquareMobilePayments.getAvailableCardInputMethods().then(
      ({ cardInputMethods }) => cardInputMethods,
    ),
  subscribe: emit =>
    pluginEventSubscription<AvailableCardInputMethodsDidChangeEvent>(
      SquareMobilePayments,
      'availableCardInputMethodsDidChange',
    )(event => emit(event.cardInputMethods)),
});

/** Invokes `callback` when reader pairing begins. Only available on Android and iOS. */
export function useSquareMobilePaymentsReaderPairingDidBegin(
  callback: () => void,
  options?: ListenerOptions,
): void {
  usePluginListener<void>(SquareMobilePayments, 'readerPairingDidBegin', callback, options);
}

/** Invokes `callback` when reader pairing succeeds. Only available on Android and iOS. */
export function useSquareMobilePaymentsReaderPairingDidSucceed(
  callback: () => void,
  options?: ListenerOptions,
): void {
  usePluginListener<void>(SquareMobilePayments, 'readerPairingDidSucceed', callback, options);
}

/** Invokes `callback` when reader pairing fails. Only available on Android and iOS. */
export function useSquareMobilePaymentsReaderPairingDidFail(
  callback: (event: ReaderPairingDidFailEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'readerPairingDidFail', callback, options);
}

/** Invokes `callback` when a reader is added. Only available on Android and iOS. */
export function useSquareMobilePaymentsReaderWasAdded(
  callback: (event: ReaderWasAddedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'readerWasAdded', callback, options);
}

/** Invokes `callback` when a reader is removed. Only available on Android and iOS. */
export function useSquareMobilePaymentsReaderWasRemoved(
  callback: (event: ReaderWasRemovedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'readerWasRemoved', callback, options);
}

/**
 * Invokes `callback` when the status or properties of a reader change.
 * Only available on Android and iOS.
 */
export function useSquareMobilePaymentsReaderDidChange(
  callback: (event: ReaderDidChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'readerDidChange', callback, options);
}

/**
 * Invokes `callback` whenever the available card input methods change.
 * Only available on Android and iOS.
 */
export function useSquareMobilePaymentsAvailableCardInputMethodsDidChange(
  callback: (event: AvailableCardInputMethodsDidChangeEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'availableCardInputMethodsDidChange', callback, options);
}

/** Invokes `callback` when a payment finishes successfully. Only available on Android and iOS. */
export function useSquareMobilePaymentsPaymentDidFinish(
  callback: (event: PaymentDidFinishEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'paymentDidFinish', callback, options);
}

/** Invokes `callback` when a payment fails. Only available on Android and iOS. */
export function useSquareMobilePaymentsPaymentDidFail(
  callback: (event: PaymentDidFailEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'paymentDidFail', callback, options);
}

/** Invokes `callback` when a payment is cancelled. Only available on Android and iOS. */
export function useSquareMobilePaymentsPaymentDidCancel(
  callback: (event: PaymentDidCancelEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(SquareMobilePayments, 'paymentDidCancel', callback, options);
}
