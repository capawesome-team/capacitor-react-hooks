import { Llm } from '@capawesome-team/capacitor-llm';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useLlm,
  useLlmAvailability,
  useLlmDownloadProgress,
  useLlmTextStreamSession,
} from '../../src/capawesome/llm';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

interface StreamTextController {
  resolve: (text: string) => void;
  reject: (error: unknown) => void;
}

vi.mock('@capawesome-team/capacitor-llm', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  const streams: StreamTextController[] = [];
  fake.plugin.cancelGeneration = vi.fn(async () => undefined);
  fake.plugin.createChat = vi.fn(async () => ({ id: 'chat-1' }));
  fake.plugin.getAvailability = vi.fn(async () => ({ status: 'available' }));
  fake.plugin.streamText = vi.fn(
    () =>
      new Promise<{ text: string }>((resolve, reject) => {
        streams.push({ resolve: text => resolve({ text }), reject });
      }),
  );
  return { Llm: Object.assign(fake.plugin, { __fake: fake, __streams: streams }) };
});

const fake = (Llm as unknown as { __fake: FakePlugin }).__fake;
const streams = (Llm as unknown as { __streams: StreamTextController[] }).__streams;
const cancelGeneration = vi.mocked(Llm.cancelGeneration);

const flushMicrotasks = () => act(() => Promise.resolve());
const options = { chatId: 'chat-1', prompt: 'Why is the sky blue?' };

const takeStream = (): StreamTextController => {
  const stream = streams.shift();
  if (!stream) {
    throw new Error('No text generation is in flight.');
  }
  return stream;
};

describe('capawesome/llm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streams.length = 0;
  });

  it('useLlm exposes the plugin methods', async () => {
    const { result } = renderHook(() => useLlm(), { wrapper: StrictModeWrapper });
    await expect(result.current.createChat()).resolves.toEqual({ id: 'chat-1' });
    expect(Llm.createChat).toHaveBeenCalled();
    await expect(result.current.getAvailability()).resolves.toEqual({ status: 'available' });
  });

  it('useLlmAvailability starts with the current status and follows the events', async () => {
    const { result } = renderHook(() => useLlmAvailability(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe('available'));

    act(() => fake.emit('availabilityChange', { status: 'downloading' }));
    expect(result.current).toBe('downloading');
  });

  it('useLlmTextStreamSession accumulates the chunks of the running generation', async () => {
    const { result } = renderHook(() => useLlmTextStreamSession(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    expect(result.current.isGenerating).toBe(false);
    expect(fake.listenerCount('textChunk')).toBe(1);

    let generation: Promise<void> | undefined;
    act(() => {
      generation = result.current.start(options);
    });
    await flushMicrotasks();
    expect(Llm.streamText).toHaveBeenCalledExactlyOnceWith(options);
    expect(result.current.isGenerating).toBe(true);

    act(() => fake.emit('textChunk', { chatId: 'chat-1', text: 'The sky is blue' }));
    act(() =>
      fake.emit('textChunk', { chatId: 'chat-1', text: ' because of Rayleigh scattering.' }),
    );
    expect(result.current.text).toBe('The sky is blue because of Rayleigh scattering.');

    act(() => takeStream().resolve('The sky is blue because of Rayleigh scattering.'));
    await act(() => generation);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.text).toBe('The sky is blue because of Rayleigh scattering.');
  });

  it('useLlmTextStreamSession ignores the chunks of other chats', async () => {
    const { result } = renderHook(() => useLlmTextStreamSession(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    act(() => {
      void result.current.start(options).catch(() => undefined);
    });
    await flushMicrotasks();

    act(() => fake.emit('textChunk', { chatId: 'chat-2', text: 'Not my chat.' }));
    expect(result.current.text).toBe('');
  });

  it('useLlmTextStreamSession cancels the running generation', async () => {
    const { result } = renderHook(() => useLlmTextStreamSession(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    let generation: Promise<void> | undefined;
    act(() => {
      generation = result.current.start(options);
    });
    await flushMicrotasks();
    const stream = takeStream();

    await act(() => result.current.cancel());
    expect(cancelGeneration).toHaveBeenCalledExactlyOnceWith({ chatId: 'chat-1' });
    expect(result.current.isGenerating).toBe(false);

    act(() => stream.reject(new Error('GENERATION_CANCELED')));
    await expect(act(() => generation)).rejects.toThrow('GENERATION_CANCELED');
  });

  it('useLlmTextStreamSession cancels the running generation on unmount', async () => {
    const { result, unmount } = renderHook(() => useLlmTextStreamSession(), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    let generation: Promise<void> | undefined;
    act(() => {
      generation = result.current.start(options);
    });
    await flushMicrotasks();
    const stream = takeStream();

    unmount();
    await flushMicrotasks();
    expect(cancelGeneration).toHaveBeenCalledExactlyOnceWith({ chatId: 'chat-1' });
    expect(fake.listenerCount('textChunk')).toBe(0);

    stream.resolve('');
    await generation;
  });

  it('useLlmTextStreamSession does not cancel a generation that was never started', async () => {
    const { unmount } = renderHook(() => useLlmTextStreamSession(), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();
    expect(cancelGeneration).not.toHaveBeenCalled();
  });

  it('useLlmDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useLlmDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { progress: 0.5 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ progress: 0.5 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });
});
