import type { ListenerPlugin } from './listener';
import { warnInDev } from './util';

export interface LaunchEventSource {
  plugin: ListenerPlugin;
  event: string;
}

interface CaptureEntry {
  buffered: unknown[];
  subscribers: Set<(payload: unknown) => void>;
}

// Kept on globalThis so ESM and CJS builds of this package share one registry.
const REGISTRY_KEY = Symbol.for('@capawesome/capacitor-react-hooks/launch-events');
const registry: Map<ListenerPlugin, Map<string, CaptureEntry>> = ((globalThis as any)[
  REGISTRY_KEY
] ??= new Map());

/**
 * Starts listening for events that can fire before React has mounted, such as
 * notification taps that launch the app. Call this before `createRoot`.
 * Buffered events are delivered exactly once to the first mounted hook
 * subscribed to the same plugin event.
 */
export function captureLaunchEvents(sources: LaunchEventSource[]): void {
  for (const { plugin, event } of sources) {
    let events = registry.get(plugin);
    if (!events) {
      events = new Map();
      registry.set(plugin, events);
    }
    if (events.has(event)) {
      continue;
    }
    const entry: CaptureEntry = { buffered: [], subscribers: new Set() };
    events.set(event, entry);
    (
      plugin.addListener as (
        eventName: string,
        listenerFunc: (payload: unknown) => void,
      ) => Promise<{ remove: () => Promise<void> }>
    )(event, payload => {
        if (entry.subscribers.size > 0) {
          entry.subscribers.forEach(subscriber => subscriber(payload));
        } else {
          entry.buffered.push(payload);
        }
      })
      .catch(error => warnInDev(`Failed to capture launch event "${event}".`, error));
  }
}

export function getCaptureEntry(plugin: ListenerPlugin, event: string): CaptureEntry | undefined {
  return registry.get(plugin)?.get(event);
}

export function subscribeToCapture(
  entry: CaptureEntry,
  subscriber: (payload: unknown) => void,
): () => void {
  entry.subscribers.add(subscriber);
  for (const payload of entry.buffered.splice(0)) {
    subscriber(payload);
  }
  return () => {
    entry.subscribers.delete(subscriber);
  };
}
