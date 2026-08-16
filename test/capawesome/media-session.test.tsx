import { MediaSession } from '@capawesome-team/capacitor-media-session';
import { act, renderHook } from '@testing-library/react';

import { useMediaSession, useMediaSessionAction } from '../../src/capawesome/media-session';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-media-session', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.registerActionHandler = vi.fn(async () => undefined);
  fake.plugin.setCameraActive = vi.fn(async () => undefined);
  fake.plugin.setMetadata = vi.fn(async () => undefined);
  fake.plugin.setMicrophoneActive = vi.fn(async () => undefined);
  fake.plugin.setPlaybackState = vi.fn(async () => undefined);
  fake.plugin.setPositionState = vi.fn(async () => undefined);
  fake.plugin.setSeekOffset = vi.fn(async () => undefined);
  fake.plugin.unregisterActionHandler = vi.fn(async () => undefined);
  return { MediaSession: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (MediaSession as unknown as { __fake: FakePlugin }).__fake;
const setPositionState = vi.mocked(MediaSession.setPositionState);

const flushMicrotasks = () => act(() => Promise.resolve());
const action = { action: 'PLAY' };

describe('capawesome/media-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useMediaSessionAction delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useMediaSessionAction(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('action', action));
    expect(callback).toHaveBeenCalledExactlyOnceWith(action);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('action')).toBe(0);
  });

  it('useMediaSession exposes bound methods', async () => {
    const { result } = renderHook(() => useMediaSession(), { wrapper: StrictModeWrapper });
    await result.current.setPositionState({ duration: 120, position: 30 });
    expect(setPositionState).toHaveBeenCalledExactlyOnceWith({ duration: 120, position: 30 });
  });
});
