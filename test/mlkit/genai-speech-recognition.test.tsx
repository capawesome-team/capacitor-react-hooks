import { GenAiSpeechRecognition } from '@capacitor-mlkit/genai-speech-recognition';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useGenaiSpeechRecognition,
  useGenaiSpeechRecognitionDownloadProgress,
  useGenaiSpeechRecognitionPartialResult,
  useGenaiSpeechRecognitionPermissions,
  useGenaiSpeechRecognitionSession,
} from '../../src/mlkit/genai-speech-recognition';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-speech-recognition', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'AVAILABLE' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({ microphone: 'prompt' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.requestPermissions = vi.fn(async () => ({ microphone: 'granted' }));
  fake.plugin.startRecognition = vi.fn(async () => undefined);
  fake.plugin.stopRecognition = vi.fn(async () => undefined);
  return { GenAiSpeechRecognition: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiSpeechRecognition as unknown as { __fake: FakePlugin }).__fake;
const startRecognition = vi.mocked(GenAiSpeechRecognition.startRecognition);
const stopRecognition = vi.mocked(GenAiSpeechRecognition.stopRecognition);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-speech-recognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiSpeechRecognition exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiSpeechRecognition(), {
      wrapper: StrictModeWrapper,
    });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'AVAILABLE',
    });
    await expect(result.current.downloadFeature()).resolves.toBeUndefined();
    expect(GenAiSpeechRecognition.downloadFeature).toHaveBeenCalledOnce();
  });

  it('useGenaiSpeechRecognitionPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useGenaiSpeechRecognitionPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ microphone: 'prompt' }));

    await act(() => result.current.request());
    expect(result.current.status).toEqual({ microphone: 'granted' });
  });

  it('useGenaiSpeechRecognitionSession starts listening and collects the final result', async () => {
    const options = { locale: 'en-US' };
    const { result } = renderHook(() => useGenaiSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isListening).toBe(false);
    expect(fake.listenerCount('finalResult')).toBe(0);

    await act(() => result.current.start(options));
    await flushMicrotasks();
    expect(startRecognition).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isListening).toBe(true);
    expect(fake.listenerCount('finalResult')).toBe(1);

    act(() => fake.emit('finalResult', { text: 'Hello World' }));
    expect(result.current.result).toBe('Hello World');
  });

  it('useGenaiSpeechRecognitionSession stops the recognition and detaches the listener on stop', async () => {
    const { result } = renderHook(() => useGenaiSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    await act(() => result.current.stop());
    await flushMicrotasks();
    expect(stopRecognition).toHaveBeenCalledOnce();
    expect(result.current.isListening).toBe(false);
    expect(fake.listenerCount('finalResult')).toBe(0);
  });

  it('useGenaiSpeechRecognitionSession stops the recognition on unmount', async () => {
    const { result, unmount } = renderHook(() => useGenaiSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopRecognition).toHaveBeenCalledOnce();
    expect(fake.listenerCount('finalResult')).toBe(0);
  });

  it('useGenaiSpeechRecognitionSession does not stop a recognition that was never started', async () => {
    const { unmount } = renderHook(() => useGenaiSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopRecognition).not.toHaveBeenCalled();
  });

  it('useGenaiSpeechRecognitionPartialResult delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiSpeechRecognitionPartialResult(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('partialResult', { text: 'Hello' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ text: 'Hello' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('partialResult')).toBe(0);
  });

  it('useGenaiSpeechRecognitionDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiSpeechRecognitionDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 1024 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 1024 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });
});
