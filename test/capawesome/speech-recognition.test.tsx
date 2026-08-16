import { SpeechRecognition } from '@capawesome-team/capacitor-speech-recognition';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useSpeechRecognition,
  useSpeechRecognitionPartialResult,
  useSpeechRecognitionPermissions,
  useSpeechRecognitionSession,
} from '../../src/capawesome/speech-recognition';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-speech-recognition', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getLanguages = vi.fn(async () => ({ languages: ['en-US'] }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.startListening = vi.fn(async () => undefined);
  fake.plugin.stopListening = vi.fn(async () => undefined);
  fake.plugin.checkPermissions = vi.fn(async () => ({ speechRecognition: 'prompt' }));
  fake.plugin.requestPermissions = vi.fn(async () => ({ speechRecognition: 'granted' }));
  return { SpeechRecognition: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (SpeechRecognition as unknown as { __fake: FakePlugin }).__fake;
const startListening = vi.mocked(SpeechRecognition.startListening);
const stopListening = vi.mocked(SpeechRecognition.stopListening);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/speech-recognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSpeechRecognitionSession starts listening and collects the latest result', async () => {
    const { result } = renderHook(() => useSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    expect(result.current.isListening).toBe(false);
    expect(fake.listenerCount('result')).toBe(0);

    await act(() => result.current.start({ enableFormatting: true, language: 'en-US' }));
    await flushMicrotasks();
    expect(startListening).toHaveBeenCalledExactlyOnceWith({
      enableFormatting: true,
      language: 'en-US',
    });
    expect(result.current.isListening).toBe(true);
    expect(fake.listenerCount('result')).toBe(1);

    act(() => fake.emit('result', { result: 'hello' }));
    act(() => fake.emit('result', { result: 'hello world' }));
    expect(result.current.result).toBe('hello world');
  });

  it('useSpeechRecognitionSession stops listening and detaches the listeners on stop', async () => {
    const { result } = renderHook(() => useSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    await act(() => result.current.stop({ deactivateAudioSession: false }));
    await flushMicrotasks();
    expect(stopListening).toHaveBeenCalledExactlyOnceWith({ deactivateAudioSession: false });
    expect(result.current.isListening).toBe(false);
    expect(fake.listenerCount('result')).toBe(0);
  });

  it('useSpeechRecognitionSession ends the session when the recognizer stops on its own', async () => {
    const { result } = renderHook(() => useSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    act(() => fake.emit('end'));
    await flushMicrotasks();
    expect(result.current.isListening).toBe(false);
    expect(fake.listenerCount('end')).toBe(0);
  });

  it('useSpeechRecognitionSession stops listening on unmount', async () => {
    const { result, unmount } = renderHook(() => useSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await act(() => result.current.start());
    await flushMicrotasks();

    unmount();
    await flushMicrotasks();
    expect(stopListening).toHaveBeenCalledOnce();
    expect(fake.listenerCount('result')).toBe(0);
  });

  it('useSpeechRecognitionSession does not stop a session that was never started', async () => {
    const { unmount } = renderHook(() => useSpeechRecognitionSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(stopListening).not.toHaveBeenCalled();
  });

  it('useSpeechRecognitionPartialResult delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSpeechRecognitionPartialResult(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('partialResult', { result: 'hel' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ result: 'hel' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('partialResult')).toBe(0);
  });

  it('useSpeechRecognitionPermissions checks on mount and follows a request', async () => {
    const { result } = renderHook(() => useSpeechRecognitionPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current.status).toEqual({ speechRecognition: 'prompt' }));

    await act(() => result.current.request({ permissions: ['speechRecognition'] }));
    expect(result.current.status).toEqual({ speechRecognition: 'granted' });
  });

  it('useSpeechRecognition exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSpeechRecognition(), { wrapper: StrictModeWrapper });
    await expect(result.current.getLanguages()).resolves.toEqual({ languages: ['en-US'] });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
  });
});
