import type {
  AdClickedEvent,
  AdDismissedEvent,
  AdFailedToLoadEvent,
  AdFailedToShowEvent,
  AdImpressionRecordedEvent,
  AdLoadedEvent,
  AdRevenuePaidEvent,
  AdShowedEvent,
  BannerSizeChangedEvent,
  RewardEarnedEvent,
} from '@capawesome-team/capacitor-admob';
import { Admob } from '@capawesome-team/capacitor-admob';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Plugin methods plus `isPluginAvailable`.
 *
 * Gather the consent with `requestConsent` and initialize the Google Mobile Ads
 * SDK with `initialize` once on every app launch before loading any ads.
 *
 * Only available on Android and iOS.
 */
export const useAdmob = createMethodsHook('Admob', Admob, [
  'disableAppOpenAutoShow',
  'enableAppOpenAutoShow',
  'hideBanner',
  'initialize',
  'loadAppOpenAd',
  'loadInterstitialAd',
  'loadRewardedAd',
  'loadRewardedInterstitialAd',
  'removeBanner',
  'requestConsent',
  'resetConsent',
  'resumeBanner',
  'setApplicationMuted',
  'setApplicationVolume',
  'setBannerFrame',
  'showAppOpenAd',
  'showBanner',
  'showInterstitialAd',
  'showPrivacyOptionsForm',
  'showRewardedAd',
  'showRewardedInterstitialAd',
]);

/**
 * Invokes `callback` whenever an ad is clicked.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdClicked(
  callback: (event: AdClickedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adClicked', callback, options);
}

/**
 * Invokes `callback` whenever a full-screen ad is dismissed.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdDismissed(
  callback: (event: AdDismissedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adDismissed', callback, options);
}

/**
 * Invokes `callback` whenever an ad fails to load.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdFailedToLoad(
  callback: (event: AdFailedToLoadEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adFailedToLoad', callback, options);
}

/**
 * Invokes `callback` whenever an ad fails to show.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdFailedToShow(
  callback: (event: AdFailedToShowEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adFailedToShow', callback, options);
}

/**
 * Invokes `callback` whenever an ad records an impression.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdImpressionRecorded(
  callback: (event: AdImpressionRecordedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adImpressionRecorded', callback, options);
}

/**
 * Invokes `callback` whenever an ad is loaded.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdLoaded(
  callback: (event: AdLoadedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adLoaded', callback, options);
}

/**
 * Invokes `callback` whenever an ad earns revenue. Use this event to track the
 * ad revenue of your app, for example for lifetime value (LTV) pipelines.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdRevenuePaid(
  callback: (event: AdRevenuePaidEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adRevenuePaid', callback, options);
}

/**
 * Invokes `callback` whenever an ad is shown.
 *
 * Only available on Android and iOS.
 */
export function useAdmobAdShowed(
  callback: (event: AdShowedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'adShowed', callback, options);
}

/**
 * Invokes `callback` whenever the size of a banner ad changes, for example
 * after a collapsible banner has been expanded or collapsed.
 *
 * Only available on Android and iOS.
 */
export function useAdmobBannerSizeChanged(
  callback: (event: BannerSizeChangedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'bannerSizeChanged', callback, options);
}

/**
 * Invokes `callback` whenever the user earns a reward from a rewarded ad or a
 * rewarded interstitial ad.
 *
 * Only available on Android and iOS.
 */
export function useAdmobRewardEarned(
  callback: (event: RewardEarnedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(Admob, 'rewardEarned', callback, options);
}
