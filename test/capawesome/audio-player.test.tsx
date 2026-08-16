import { AudioPlayer } from '@capawesome-team/capacitor-audio-player';
import { act, renderHook } from '@testing-library/react';

import { useAudioPlayer, useAudioPlayerStop } from '../../src/capawesome/audio-player';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-audio-player', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCurrentPosition = vi.fn(async () => ({ position: 5000 }));
  fake.plugin.getDuration = vi.fn(async () => ({ duration: 60000 }));
  fake.plugin.isPlaying = vi.fn(async () => ({ isPlaying: true }));
  fake.plugin.pause = vi.fn(async () => undefined);
  fake.plugin.play = vi.fn(async () => undefined);
  fake.plugin.resume = vi.fn(async () => undefined);
  fake.plugin.seekTo = vi.fn(async () => undefined);
  fake.plugin.setRate = vi.fn(async () => undefined);
  fake.plugin.setVolume = vi.fn(async () => undefined);
  fake.plugin.stop = vi.fn(async () => undefined);
  return { AudioPlayer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (AudioPlayer as unknown as { __fake: FakePlugin }).__fake;
const play = vi.mocked(AudioPlayer.play);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/audio-player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAudioPlayerStop delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAudioPlayerStop(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('stop'));
    expect(callback).toHaveBeenCalledOnce();

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('stop')).toBe(0);
  });

  it('useAudioPlayer exposes bound methods', async () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper: StrictModeWrapper });
    await expect(result.current.getCurrentPosition()).resolves.toEqual({ position: 5000 });
    await expect(result.current.getDuration()).resolves.toEqual({ duration: 60000 });

    await result.current.play({ src: 'public/sound.mp3' });
    expect(play).toHaveBeenCalledExactlyOnceWith({ src: 'public/sound.mp3' });
  });
});
