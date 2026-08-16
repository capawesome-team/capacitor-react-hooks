import { AudioRecorder } from '@capawesome-team/capacitor-audio-recorder';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useAudioRecorder,
  useAudioRecorderPermissions,
  useRecordingError,
  useRecordingPaused,
  useRecordingResumed,
  useRecordingStopped,
} from '../../src/capawesome/audio-recorder';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-audio-recorder', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.cancelRecording = vi.fn(async () => undefined);
  fake.plugin.getRecordingStatus = vi.fn(async () => ({ status: 'INACTIVE' }));
  fake.plugin.pauseRecording = vi.fn(async () => undefined);
  fake.plugin.resumeRecording = vi.fn(async () => undefined);
  fake.plugin.startRecording = vi.fn(async () => undefined);
  fake.plugin.stopRecording = vi.fn(async () => ({ duration: 4200, uri: 'file:///recording.aac' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ recordAudio: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ recordAudio: 'granted' }));
  return { AudioRecorder: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (AudioRecorder as unknown as { __fake: FakePlugin }).__fake;
const startRecording = vi.mocked(AudioRecorder.startRecording);

const flushMicrotasks = () => act(() => Promise.resolve());
const recordingStopped = { duration: 4200, uri: 'file:///recording.aac' };

describe('capawesome/audio-recorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useRecordingStopped delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useRecordingStopped(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('recordingStopped', recordingStopped));
    expect(callback).toHaveBeenCalledExactlyOnceWith(recordingStopped);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('recordingStopped')).toBe(0);
  });

  it('useRecordingError delivers events', async () => {
    const callback = vi.fn();
    renderHook(() => useRecordingError(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => fake.emit('recordingError', { message: 'Recording failed.' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ message: 'Recording failed.' });
  });

  it('useRecordingPaused and useRecordingResumed deliver events', async () => {
    const onPaused = vi.fn();
    const onResumed = vi.fn();
    renderHook(
      () => {
        useRecordingPaused(onPaused);
        useRecordingResumed(onResumed);
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    act(() => fake.emit('recordingPaused'));
    act(() => fake.emit('recordingResumed'));
    expect(onPaused).toHaveBeenCalledOnce();
    expect(onResumed).toHaveBeenCalledOnce();
  });

  it('useAudioRecorderPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useAudioRecorderPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ recordAudio: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ recordAudio: 'granted' });
  });

  it('useAudioRecorder exposes bound methods', async () => {
    const { result } = renderHook(() => useAudioRecorder(), { wrapper: StrictModeWrapper });
    await expect(result.current.getRecordingStatus()).resolves.toEqual({ status: 'INACTIVE' });

    await result.current.startRecording({ sampleRate: 16000 });
    expect(startRecording).toHaveBeenCalledExactlyOnceWith({ sampleRate: 16000 });
  });
});
