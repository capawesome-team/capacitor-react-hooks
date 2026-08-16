import type * as MlKitTranslation from '@capacitor-mlkit/translation';
import { Language, Translation } from '@capacitor-mlkit/translation';
import { renderHook } from '@testing-library/react';

import { useTranslation } from '../../src/mlkit/translation';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/translation', async () => {
  const actual = await vi.importActual<typeof MlKitTranslation>('@capacitor-mlkit/translation');
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.deleteDownloadedModel = vi.fn(async () => undefined);
  fake.plugin.downloadModel = vi.fn(async () => undefined);
  fake.plugin.getDownloadedModels = vi.fn(async () => ({ languages: ['de'] }));
  fake.plugin.translate = vi.fn(async () => ({ text: 'Hallo' }));
  return { ...actual, Translation: fake.plugin };
});

describe('mlkit/translation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useTranslation exposes the plugin methods', async () => {
    const options = {
      text: 'Hello',
      sourceLanguage: Language.English,
      targetLanguage: Language.German,
    };
    const { result } = renderHook(() => useTranslation(), { wrapper: StrictModeWrapper });

    await expect(result.current.translate(options)).resolves.toEqual({ text: 'Hallo' });
    expect(Translation.translate).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.getDownloadedModels()).resolves.toEqual({ languages: ['de'] });
  });

  it('useTranslation exposes the model management methods', async () => {
    const options = { language: Language.German };
    const { result } = renderHook(() => useTranslation(), { wrapper: StrictModeWrapper });

    await expect(result.current.downloadModel(options)).resolves.toBeUndefined();
    expect(Translation.downloadModel).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.deleteDownloadedModel(options)).resolves.toBeUndefined();
    expect(Translation.deleteDownloadedModel).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useTranslation keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useTranslation(), { wrapper: StrictModeWrapper });
    const { translate } = result.current;
    rerender();
    expect(result.current.translate).toBe(translate);
  });
});
