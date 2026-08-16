import { SubjectSegmentation } from '@capacitor-mlkit/subject-segmentation';
import { act, renderHook } from '@testing-library/react';

import {
  useGoogleSubjectSegmentationModuleInstallProgress,
  useSubjectSegmentation,
} from '../../src/mlkit/subject-segmentation';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/subject-segmentation', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.processImage = vi.fn(async () => ({
    path: 'segmented.png',
    width: 1080,
    height: 1920,
  }));
  fake.plugin.isGoogleSubjectSegmentationModuleAvailable = vi.fn(async () => ({ available: true }));
  fake.plugin.installGoogleSubjectSegmentationModule = vi.fn(async () => undefined);
  return { SubjectSegmentation: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (SubjectSegmentation as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('mlkit/subject-segmentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSubjectSegmentation exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSubjectSegmentation(), { wrapper: StrictModeWrapper });
    await expect(result.current.processImage({ path: 'image.jpg' })).resolves.toEqual({
      path: 'segmented.png',
      width: 1080,
      height: 1920,
    });
    expect(SubjectSegmentation.processImage).toHaveBeenCalledWith({ path: 'image.jpg' });
    await expect(result.current.isGoogleSubjectSegmentationModuleAvailable()).resolves.toEqual({
      available: true,
    });
    await expect(result.current.installGoogleSubjectSegmentationModule()).resolves.toBeUndefined();
  });

  it('useGoogleSubjectSegmentationModuleInstallProgress delivers progress events', async () => {
    const callback = vi.fn();
    renderHook(() => useGoogleSubjectSegmentationModuleInstallProgress(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() =>
      fake.emit('googleSubjectSegmentationModuleInstallProgress', { state: 2, progress: 42 }),
    );
    expect(callback).toHaveBeenCalledExactlyOnceWith({ state: 2, progress: 42 });
  });

  it('useGoogleSubjectSegmentationModuleInstallProgress detaches the listener on unmount', async () => {
    const { unmount } = renderHook(
      () => useGoogleSubjectSegmentationModuleInstallProgress(vi.fn()),
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('googleSubjectSegmentationModuleInstallProgress')).toBe(1);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('googleSubjectSegmentationModuleInstallProgress')).toBe(0);
  });
});
