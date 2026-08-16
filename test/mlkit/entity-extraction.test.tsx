import type * as MlKitEntityExtraction from '@capacitor-mlkit/entity-extraction';
import { EntityExtraction, Language } from '@capacitor-mlkit/entity-extraction';
import { renderHook } from '@testing-library/react';

import { useEntityExtraction } from '../../src/mlkit/entity-extraction';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/entity-extraction', async () => {
  const actual = await vi.importActual<typeof MlKitEntityExtraction>(
    '@capacitor-mlkit/entity-extraction',
  );
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.deleteDownloadedModel = vi.fn(async () => undefined);
  fake.plugin.downloadModel = vi.fn(async () => undefined);
  fake.plugin.extractEntities = vi.fn(async () => ({
    annotations: [{ text: 'tomorrow', start: 6, end: 14, entities: [{ type: 'DATE_TIME' }] }],
  }));
  fake.plugin.getDownloadedModels = vi.fn(async () => ({ languages: ['ENGLISH'] }));
  return { ...actual, EntityExtraction: fake.plugin };
});

describe('mlkit/entity-extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useEntityExtraction exposes the plugin methods', async () => {
    const options = { text: 'Meet me tomorrow', language: Language.English };
    const { result } = renderHook(() => useEntityExtraction(), { wrapper: StrictModeWrapper });

    await expect(result.current.extractEntities(options)).resolves.toEqual({
      annotations: [{ text: 'tomorrow', start: 6, end: 14, entities: [{ type: 'DATE_TIME' }] }],
    });
    expect(EntityExtraction.extractEntities).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.getDownloadedModels()).resolves.toEqual({
      languages: ['ENGLISH'],
    });
  });

  it('useEntityExtraction exposes the model management methods', async () => {
    const options = { language: Language.English };
    const { result } = renderHook(() => useEntityExtraction(), { wrapper: StrictModeWrapper });

    await expect(result.current.downloadModel(options)).resolves.toBeUndefined();
    expect(EntityExtraction.downloadModel).toHaveBeenCalledExactlyOnceWith(options);
    await expect(result.current.deleteDownloadedModel(options)).resolves.toBeUndefined();
    expect(EntityExtraction.deleteDownloadedModel).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useEntityExtraction keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useEntityExtraction(), {
      wrapper: StrictModeWrapper,
    });
    const { extractEntities } = result.current;
    rerender();
    expect(result.current.extractEntities).toBe(extractEntities);
  });
});
