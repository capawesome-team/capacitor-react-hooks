import { AudioSession } from '@capawesome/capacitor-audio-session';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useAudioSession,
  useAudioSessionCurrentOutputs,
  useAudioSessionInterruption,
  useAudioSessionRouteChange,
} from '../../src/capawesome/audio-session';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

const speaker = { portName: 'Speaker', portType: 'Speaker' };
const headphones = { portName: 'Headphones', portType: 'Headphones' };

vi.mock('@capawesome/capacitor-audio-session', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.configure = vi.fn(async () => undefined);
  fake.plugin.setActive = vi.fn(async () => undefined);
  fake.plugin.getCurrentOutputs = vi.fn(async () => ({
    outputs: [{ portName: 'Speaker', portType: 'Speaker' }],
  }));
  return { AudioSession: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (AudioSession as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/audio-session', () => {
  it('useAudioSession exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAudioSession(), { wrapper: StrictModeWrapper });
    await expect(result.current.configure({ category: 'playback' })).resolves.toBeUndefined();
    expect(AudioSession.configure).toHaveBeenCalledWith({ category: 'playback' });
    await expect(result.current.setActive({ active: true })).resolves.toBeUndefined();
  });

  it('useAudioSessionCurrentOutputs seeds from getCurrentOutputs and follows routeChange', async () => {
    const { result } = renderHook(() => useAudioSessionCurrentOutputs(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toEqual([speaker]));
    act(() => fake.emit('routeChange', { outputs: [headphones], reason: 'newDeviceAvailable' }));
    expect(result.current).toEqual([headphones]);
  });

  it('useAudioSessionInterruption delivers interruptions and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAudioSessionInterruption(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { type: 'began', shouldResume: false };
    act(() => fake.emit('interruption', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('interruption')).toBe(0);
  });

  it('useAudioSessionRouteChange delivers route changes and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAudioSessionRouteChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { outputs: [headphones], reason: 'oldDeviceUnavailable' };
    act(() => fake.emit('routeChange', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('routeChange')).toBe(0);
  });
});
