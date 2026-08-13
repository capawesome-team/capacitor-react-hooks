import { vi } from 'vitest';

export interface FakePlugin {
  plugin: {
    addListener: ReturnType<typeof vi.fn>;
    [method: string]: unknown;
  };
  emit(event: string, payload?: unknown): void;
  listenerCount(event: string): number;
  /** Resolves pending `addListener` handles (only with `deferHandles: true`). */
  flushHandles(): void;
}

export function createFakePlugin(options: { deferHandles?: boolean } = {}): FakePlugin {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  const pendingHandles: (() => void)[] = [];
  const addListener = vi.fn((event: string, callback: (payload: unknown) => void) => {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    set.add(callback);
    const handle = {
      remove: vi.fn(() => {
        set.delete(callback);
        return Promise.resolve();
      }),
    };
    if (options.deferHandles) {
      return new Promise(resolve => pendingHandles.push(() => resolve(handle)));
    }
    return Promise.resolve(handle);
  });
  return {
    plugin: { addListener },
    emit: (event, payload) => {
      listeners.get(event)?.forEach(callback => callback(payload));
    },
    listenerCount: event => listeners.get(event)?.size ?? 0,
    flushHandles: () => {
      pendingHandles.splice(0).forEach(resolve => resolve());
    },
  };
}
