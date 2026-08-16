import { GenAiPrompt } from '@capacitor-mlkit/genai-prompt';
import { act, renderHook } from '@testing-library/react';

import {
  useGenaiPrompt,
  useGenaiPromptDownloadProgress,
  useGenaiPromptInferenceProgress,
} from '../../src/mlkit/genai-prompt';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-prompt', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'AVAILABLE' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.generateContent = vi.fn(async () => ({ text: 'The sea is a vast expanse of blue.' }));
  return { GenAiPrompt: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiPrompt as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiPrompt exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiPrompt(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'AVAILABLE',
    });

    const options = { prompt: 'Write a short poem about the sea.' };
    await expect(result.current.generateContent(options)).resolves.toEqual({
      text: 'The sea is a vast expanse of blue.',
    });
    expect(GenAiPrompt.generateContent).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useGenaiPromptDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiPromptDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 1024 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 1024 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });

  it('useGenaiPromptInferenceProgress delivers every partial result', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiPromptInferenceProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('inferenceProgress', { text: 'The sea' }));
    act(() => fake.emit('inferenceProgress', { text: 'The sea is a vast expanse of blue.' }));
    expect(callback).toHaveBeenCalledTimes(2);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('inferenceProgress')).toBe(0);
  });
});
