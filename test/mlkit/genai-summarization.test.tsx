import { GenAiSummarization } from '@capacitor-mlkit/genai-summarization';
import { act, renderHook } from '@testing-library/react';

import {
  useGenaiSummarization,
  useGenaiSummarizationDownloadProgress,
  useGenaiSummarizationInferenceProgress,
} from '../../src/mlkit/genai-summarization';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-summarization', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'DOWNLOADABLE' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.summarize = vi.fn(async () => ({ summary: '* Capacitor is a native runtime.' }));
  return { GenAiSummarization: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiSummarization as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-summarization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiSummarization exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiSummarization(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'DOWNLOADABLE',
    });

    const options = { text: 'Capacitor is an open source native runtime.' };
    await expect(result.current.summarize(options)).resolves.toEqual({
      summary: '* Capacitor is a native runtime.',
    });
    expect(GenAiSummarization.summarize).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useGenaiSummarizationDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiSummarizationDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 2048 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 2048 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });

  it('useGenaiSummarizationInferenceProgress delivers partial results', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiSummarizationInferenceProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('inferenceProgress', { text: '* Capacitor' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ text: '* Capacitor' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('inferenceProgress')).toBe(0);
  });
});
