import { DigitalInkRecognition } from '@capacitor-mlkit/digital-ink-recognition';
import { renderHook } from '@testing-library/react';

import { useDigitalInkRecognition } from '../../src/mlkit/digital-ink-recognition';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/digital-ink-recognition', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.deleteDownloadedModel = vi.fn(async () => undefined);
  fake.plugin.downloadModel = vi.fn(async () => undefined);
  fake.plugin.getDownloadedModels = vi.fn(async () => ({ languageTags: ['en-US'] }));
  fake.plugin.recognize = vi.fn(async () => ({ candidates: [{ text: 'Hello', score: 0.5 }] }));
  return { DigitalInkRecognition: fake.plugin };
});

describe('mlkit/digital-ink-recognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDigitalInkRecognition exposes the plugin methods', async () => {
    const options = {
      languageTag: 'en-US',
      strokes: [{ points: [{ x: 100, y: 50 }] }],
    };
    const { result } = renderHook(() => useDigitalInkRecognition(), {
      wrapper: StrictModeWrapper,
    });

    await expect(result.current.recognize(options)).resolves.toEqual({
      candidates: [{ text: 'Hello', score: 0.5 }],
    });
    expect(DigitalInkRecognition.recognize).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.getDownloadedModels()).resolves.toEqual({
      languageTags: ['en-US'],
    });
  });

  it('useDigitalInkRecognition exposes the model management methods', async () => {
    const options = { languageTag: 'en-US' };
    const { result } = renderHook(() => useDigitalInkRecognition(), {
      wrapper: StrictModeWrapper,
    });

    await expect(result.current.downloadModel(options)).resolves.toBeUndefined();
    expect(DigitalInkRecognition.downloadModel).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.deleteDownloadedModel(options)).resolves.toBeUndefined();
    expect(DigitalInkRecognition.deleteDownloadedModel).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useDigitalInkRecognition keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useDigitalInkRecognition(), {
      wrapper: StrictModeWrapper,
    });
    const { recognize } = result.current;
    rerender();
    expect(result.current.recognize).toBe(recognize);
  });
});
