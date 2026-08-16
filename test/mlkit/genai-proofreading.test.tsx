import { GenAiProofreading } from '@capacitor-mlkit/genai-proofreading';
import { act, renderHook } from '@testing-library/react';

import {
  useGenaiProofreading,
  useGenaiProofreadingDownloadProgress,
  useGenaiProofreadingInferenceProgress,
} from '../../src/mlkit/genai-proofreading';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-proofreading', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'AVAILABLE' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.proofread = vi.fn(async () => ({
    results: ['Capacitor is an open source native runtime.'],
  }));
  return { GenAiProofreading: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiProofreading as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-proofreading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiProofreading exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiProofreading(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'AVAILABLE',
    });

    const options = { text: 'Capacitor is an open source natvie runtime.' };
    await expect(result.current.proofread(options)).resolves.toEqual({
      results: ['Capacitor is an open source native runtime.'],
    });
    expect(GenAiProofreading.proofread).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useGenaiProofreadingDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiProofreadingDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 4096 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 4096 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });

  it('useGenaiProofreadingInferenceProgress delivers partial results', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiProofreadingInferenceProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('inferenceProgress', { text: 'Capacitor is an' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ text: 'Capacitor is an' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('inferenceProgress')).toBe(0);
  });
});
