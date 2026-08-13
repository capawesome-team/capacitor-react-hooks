import type {
  AuthStateChange,
  GetIdTokenResult,
  PhoneCodeSentEvent,
  PhoneVerificationCompletedEvent,
  PhoneVerificationFailedEvent,
} from '@capacitor-firebase/authentication';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import {
  createMethodsHook,
  createPluginStateHook,
  pluginEventSubscription,
  usePluginListener,
} from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useFirebaseAuthentication = createMethodsHook(
  'FirebaseAuthentication',
  FirebaseAuthentication,
  [
    'applyActionCode',
    'confirmPasswordReset',
    'confirmVerificationCode',
    'createUserWithEmailAndPassword',
    'deleteUser',
    'getCurrentUser',
    'getIdToken',
    'getIdTokenResult',
    'isSignInWithEmailLink',
    'reload',
    'sendEmailVerification',
    'sendPasswordResetEmail',
    'sendSignInLinkToEmail',
    'signInAnonymously',
    'signInWithApple',
    'signInWithCustomToken',
    'signInWithEmailAndPassword',
    'signInWithEmailLink',
    'signInWithFacebook',
    'signInWithGameCenter',
    'signInWithGithub',
    'signInWithGoogle',
    'signInWithMicrosoft',
    'signInWithOpenIdConnect',
    'signInWithPhoneNumber',
    'signInWithPlayGames',
    'signInWithTwitter',
    'signInWithYahoo',
    'signOut',
    'updateEmail',
    'updatePassword',
    'updateProfile',
    'verifyBeforeUpdateEmail',
  ],
);

/**
 * The current authentication state, kept in sync via a single shared plugin
 * listener. Distinguishes three states:
 *
 * - `undefined`: the state is not known yet, the current user is still loading.
 * - `{ user: null }`: no user is signed in.
 * - `{ user }`: this user is signed in.
 *
 * **Attention:** The underlying `authStateChange` listener is not triggered
 * when `skipNativeAuth` is used. Use the Firebase JavaScript SDK instead.
 */
export const useAuthState = createPluginStateHook<AuthStateChange>({
  load: () => FirebaseAuthentication.getCurrentUser(),
  subscribe: pluginEventSubscription(FirebaseAuthentication, 'authStateChange'),
});

/** Invokes `callback` whenever the user's sign-in state changes. */
export function useAuthStateChange(
  callback: (change: AuthStateChange) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAuthentication, 'authStateChange', callback, options);
}

/** Invokes `callback` whenever the ID token of the signed-in user changes. */
export function useIdTokenChange(
  callback: (change: GetIdTokenResult) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAuthentication, 'idTokenChange', callback, options);
}

/**
 * Invokes `callback` whenever a phone verification is completed without the
 * user having to enter a verification code. Only available on Android.
 */
export function usePhoneVerificationCompleted(
  callback: (event: PhoneVerificationCompletedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAuthentication, 'phoneVerificationCompleted', callback, options);
}

/** Invokes `callback` whenever a phone verification fails. */
export function usePhoneVerificationFailed(
  callback: (event: PhoneVerificationFailedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAuthentication, 'phoneVerificationFailed', callback, options);
}

/** Invokes `callback` whenever a verification code was sent to the user. */
export function usePhoneCodeSent(
  callback: (event: PhoneCodeSentEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(FirebaseAuthentication, 'phoneCodeSent', callback, options);
}
