import { YoutubePlayer } from '@capawesome/capacitor-youtube-player';
import { act, renderHook } from '@testing-library/react';

import {
  useYoutubePlayer,
  useYoutubePlayerCurrentTimeChange,
  useYoutubePlayerError,
  useYoutubePlayerFullscreenChange,
  useYoutubePlayerPlaybackRateChange,
  useYoutubePlayerReady,
  useYoutubePlayerStateChange,
} from '../../src/capawesome/youtube-player';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-youtube-player', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.createPlayer = vi.fn(async () => ({ id: 'my-player' }));
  fake.plugin.play = vi.fn(async () => undefined);
  fake.plugin.getDuration = vi.fn(async () => ({ duration: 42 }));
  return { YoutubePlayer: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (YoutubePlayer as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/youtube-player', () => {
  it('useYoutubePlayer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useYoutubePlayer(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.createPlayer({
        frame: { x: 0, y: 0, width: 320, height: 180 },
        videoId: 'dQw4w9WgXcQ',
      }),
    ).resolves.toEqual({ id: 'my-player' });
    await expect(result.current.play({ id: 'my-player' })).resolves.toBeUndefined();
    expect(YoutubePlayer.play).toHaveBeenCalledWith({ id: 'my-player' });
    await expect(result.current.getDuration({ id: 'my-player' })).resolves.toEqual({
      duration: 42,
    });
  });

  it('useYoutubePlayerStateChange delivers state changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useYoutubePlayerStateChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { id: 'my-player', state: 'playing' };
    act(() => fake.emit('playerStateChange', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('playerStateChange')).toBe(0);
  });

  it('delivers the remaining player events', async () => {
    const onCurrentTimeChange = vi.fn();
    const onFullscreenChange = vi.fn();
    const onPlaybackRateChange = vi.fn();
    const onError = vi.fn();
    const onReady = vi.fn();
    const { unmount } = renderHook(
      () => {
        useYoutubePlayerCurrentTimeChange(onCurrentTimeChange);
        useYoutubePlayerFullscreenChange(onFullscreenChange);
        useYoutubePlayerPlaybackRateChange(onPlaybackRateChange);
        useYoutubePlayerError(onError);
        useYoutubePlayerReady(onReady);
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    act(() => {
      fake.emit('currentTimeChange', { id: 'my-player', currentTime: 1 });
      fake.emit('fullscreenChange', { id: 'my-player', fullscreen: true });
      fake.emit('playbackRateChange', { id: 'my-player', rate: 1.5 });
      fake.emit('playerError', { id: 'my-player', code: 'video-not-found' });
      fake.emit('playerReady', { id: 'my-player' });
    });
    expect(onCurrentTimeChange).toHaveBeenCalledExactlyOnceWith({
      id: 'my-player',
      currentTime: 1,
    });
    expect(onFullscreenChange).toHaveBeenCalledExactlyOnceWith({
      id: 'my-player',
      fullscreen: true,
    });
    expect(onPlaybackRateChange).toHaveBeenCalledExactlyOnceWith({ id: 'my-player', rate: 1.5 });
    expect(onError).toHaveBeenCalledExactlyOnceWith({ id: 'my-player', code: 'video-not-found' });
    expect(onReady).toHaveBeenCalledExactlyOnceWith({ id: 'my-player' });
    unmount();
    expect(fake.listenerCount('currentTimeChange')).toBe(0);
    expect(fake.listenerCount('fullscreenChange')).toBe(0);
    expect(fake.listenerCount('playbackRateChange')).toBe(0);
    expect(fake.listenerCount('playerError')).toBe(0);
    expect(fake.listenerCount('playerReady')).toBe(0);
  });
});
