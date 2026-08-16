import { LanguageIdentification } from '@capacitor-mlkit/language-identification';
import { renderHook } from '@testing-library/react';

import { useLanguageIdentification } from '../../src/mlkit/language-identification';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/language-identification', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.identifyLanguage = vi.fn(async () => ({ language: 'en' }));
  fake.plugin.identifyPossibleLanguages = vi.fn(async () => ({
    identifiedLanguages: [{ language: 'en', confidence: 0.99 }],
  }));
  return { LanguageIdentification: fake.plugin };
});

describe('mlkit/language-identification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useLanguageIdentification exposes the plugin methods', async () => {
    const options = { text: 'Hello world' };
    const { result } = renderHook(() => useLanguageIdentification(), {
      wrapper: StrictModeWrapper,
    });

    await expect(result.current.identifyLanguage(options)).resolves.toEqual({ language: 'en' });
    expect(LanguageIdentification.identifyLanguage).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.identifyPossibleLanguages(options)).resolves.toEqual({
      identifiedLanguages: [{ language: 'en', confidence: 0.99 }],
    });
  });

  it('useLanguageIdentification keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useLanguageIdentification(), {
      wrapper: StrictModeWrapper,
    });
    const { identifyLanguage } = result.current;
    rerender();
    expect(result.current.identifyLanguage).toBe(identifyLanguage);
  });
});
