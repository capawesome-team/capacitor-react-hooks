import { GenAiImageDescription } from '@capacitor-mlkit/genai-image-description';
import { act, renderHook } from '@testing-library/react';

import {
  useGenaiImageDescription,
  useGenaiImageDescriptionDownloadProgress,
  useGenaiImageDescriptionInferenceProgress,
} from '../../src/mlkit/genai-image-description';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/genai-image-description', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.checkFeatureStatus = vi.fn(async () => ({ featureStatus: 'AVAILABLE' }));
  fake.plugin.downloadFeature = vi.fn(async () => undefined);
  fake.plugin.describeImage = vi.fn(async () => ({ description: 'A dog running on a beach.' }));
  return { GenAiImageDescription: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (GenAiImageDescription as unknown as { __fake: FakePlugin }).__fake;

const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/genai-image-description', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGenaiImageDescription exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGenaiImageDescription(), { wrapper: StrictModeWrapper });
    await expect(result.current.checkFeatureStatus()).resolves.toEqual({
      featureStatus: 'AVAILABLE',
    });

    const options = { path: 'file:///path/to/image.jpg' };
    await expect(result.current.describeImage(options)).resolves.toEqual({
      description: 'A dog running on a beach.',
    });
    expect(GenAiImageDescription.describeImage).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useGenaiImageDescriptionDownloadProgress delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiImageDescriptionDownloadProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('downloadProgress', { totalBytesDownloaded: 8192 }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ totalBytesDownloaded: 8192 });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('downloadProgress')).toBe(0);
  });

  it('useGenaiImageDescriptionInferenceProgress delivers partial results', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useGenaiImageDescriptionInferenceProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('inferenceProgress', { text: 'A dog' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ text: 'A dog' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('inferenceProgress')).toBe(0);
  });
});
