import type { ShareReceivedEvent } from '@capawesome-team/capacitor-share-target';
import { ShareTarget } from '@capawesome-team/capacitor-share-target';

import { usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/**
 * Invokes `callback` when content such as text, links or files is shared with
 * the app from another app.
 *
 * A share can launch the app, in which case the event fires before React has
 * mounted. Combine this hook with `captureLaunchEvents` to receive those
 * events as well.
 */
export function useShareReceived(
  callback: (event: ShareReceivedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(ShareTarget, 'shareReceived', callback, options);
}
