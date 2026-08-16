import type { ActionEvent } from '@capawesome-team/capacitor-media-session';
import { MediaSession } from '@capawesome-team/capacitor-media-session';

import { createMethodsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useMediaSession = createMethodsHook('MediaSession', MediaSession, [
  'registerActionHandler',
  'setCameraActive',
  'setMetadata',
  'setMicrophoneActive',
  'setPlaybackState',
  'setPositionState',
  'setSeekOffset',
  'unregisterActionHandler',
]);

/**
 * Invokes `callback` whenever a media session action is triggered. Only actions
 * registered with `registerActionHandler` are delivered.
 */
export function useMediaSessionAction(
  callback: (event: ActionEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(MediaSession, 'action', callback, options);
}
