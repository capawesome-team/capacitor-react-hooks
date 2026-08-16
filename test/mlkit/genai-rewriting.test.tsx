import { GenAiRewriting } from '@capacitor-mlkit/genai-rewriting';
import { act, renderHook } from '@testing-library/react';

import {
  useGenaiRewriting,
  useGenaiRewritingDownloadProgress,
  useGenaiRewritingInferenceProgress,
} from '../../src/mlkit/genai-rewriting';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-rewriting', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'AVAILABLE' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.rewrite = vi.fn(async () => ({ results: ['Capacitor is a native runtime.'] }));
  return { GenAiRewriting: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiRewriting as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-rewriting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiRewriting exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiRewriting(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'AVAILABLE',
    });

    const options = { text: 'Capacitor is an open source native runtime.' };
    await expect(result.current.rewrite(options)).resolves.toEqual({
      results: ['Capacitor is a native runtime.'],
    });
    expect(GenAiRewriting.rewrite).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useGenaiRewritingDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiRewritingDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 512 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 512 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });

  it('useGenaiRewritingInferenceProgress delivers partial results', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiRewritingInferenceProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('inferenceProgress', { text: 'Capacitor is' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ text: 'Capacitor is' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('inferenceProgress')).toBe(0);
  });
});
