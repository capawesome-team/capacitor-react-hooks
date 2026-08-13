import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { act, renderHook } from '@testing-library/react';

import {
  useCollectionSnapshot,
  useDocumentSnapshot,
  useFirebaseFirestore,
} from '../../src/firebase/firestore';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/firestore', () => {
  type SnapshotCallback = (event: unknown, error: unknown) => void;
  const listeners = new Map<string, { reference: string; callback: SnapshotCallback }>();
  const references: string[] = [];
  let nextCallbackId = 0;
  const addSnapshotListener = (options: { reference: string }, callback: SnapshotCallback) => {
    const callbackId = `callback-${++nextCallbackId}`;
    listeners.set(callbackId, { reference: options.reference, callback });
    references.push(options.reference);
    return Promise.resolve(callbackId);
  };
  const plugin = {
    addDocumentSnapshotListener: vi.fn(addSnapshotListener),
    addCollectionSnapshotListener: vi.fn(addSnapshotListener),
    removeSnapshotListener: vi.fn(async ({ callbackId }: { callbackId: string }) => {
      listeners.delete(callbackId);
    }),
    getDocument: vi.fn(async () => ({
      snapshot: {
        id: 'alan',
        path: 'users/alan',
        data: { first: 'Alan' },
        metadata: { fromCache: false, hasPendingWrites: false },
      },
    })),
  };
  const fake = {
    listeners,
    references,
    emit: (event: unknown, error: unknown = null) =>
      listeners.forEach(({ callback }) => callback(event, error)),
  };
  return { FirebaseFirestore: Object.assign(plugin, { __fake: fake }) };
});

interface FakeFirestore {
  listeners: Map<string, { reference: string }>;
  references: string[];
  emit(event: unknown, error?: unknown): void;
}

const fake = (FirebaseFirestore as unknown as { __fake: FakeFirestore }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

const createSnapshot = (id: string, first: string) => ({
  id,
  path: `users/${id}`,
  data: { first },
  metadata: { fromCache: false, hasPendingWrites: false },
});

const alan = createSnapshot('alan', 'Alan');
const ada = createSnapshot('ada', 'Ada');

describe('firebase/firestore', () => {
  it('useDocumentSnapshot delivers document snapshots', async () => {
    const { result } = renderHook(() => useDocumentSnapshot<{ first: string }>('users/alan'), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit({ snapshot: alan }));
    expect(result.current.snapshot).toEqual(alan);
    expect(result.current.error).toBeUndefined();
  });

  it('useDocumentSnapshot routes in-band errors to error', async () => {
    const { result } = renderHook(() => useDocumentSnapshot('users/alan'), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit(null, 'permission-denied'));
    expect(result.current.error).toEqual(new Error('permission-denied'));
    act(() => fake.emit({ snapshot: alan }));
    expect(result.current.error).toBeUndefined();
  });

  it('useDocumentSnapshot removes the listener on unmount', async () => {
    const { unmount } = renderHook(() => useDocumentSnapshot('users/alan'), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const callbackId = [...fake.listeners.keys()][0];
    unmount();
    await flushMicrotasks();
    expect(FirebaseFirestore.removeSnapshotListener).toHaveBeenCalledWith({ callbackId });
    expect(fake.listeners.size).toBe(0);
  });

  it('useDocumentSnapshot resubscribes when the reference changes', async () => {
    const { result, rerender } = renderHook(
      ({ reference }) => useDocumentSnapshot<{ first: string }>(reference),
      { initialProps: { reference: 'users/alan' }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    rerender({ reference: 'users/ada' });
    await flushMicrotasks();
    expect([...fake.listeners.values()].map(({ reference }) => reference)).toEqual(['users/ada']);
    act(() => fake.emit({ snapshot: ada }));
    expect(result.current.snapshot).toEqual(ada);
  });

  it('useDocumentSnapshot keeps the listener when equal options are recreated', async () => {
    const { rerender } = renderHook(({ options }) => useDocumentSnapshot('users/alan', options), {
      initialProps: { options: { includeMetadataChanges: true } },
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const subscriptionCount = fake.references.length;
    rerender({ options: { includeMetadataChanges: true } });
    await flushMicrotasks();
    expect(fake.references.length).toBe(subscriptionCount);
    expect(fake.listeners.size).toBe(1);
  });

  it('useCollectionSnapshot delivers collection snapshots', async () => {
    const { result } = renderHook(() => useCollectionSnapshot<{ first: string }>('users'), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit({ snapshots: [alan, ada] }));
    expect(result.current.snapshots).toEqual([alan, ada]);
    expect(result.current.error).toBeUndefined();
  });

  it('useFirebaseFirestore exposes plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseFirestore(), { wrapper: StrictModeWrapper });
    await expect(result.current.getDocument({ reference: 'users/alan' })).resolves.toEqual({
      snapshot: alan,
    });
  });
});
