import { renderHook } from '@testing-library/react';

import { useAppLanguage } from '../../src/capawesome/app-language';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-language', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getLanguage = vi.fn(async () => ({ languageTag: 'de-DE' }));
  fake.plugin.setLanguage = vi.fn(async () => undefined);
  fake.plugin.resetLanguage = vi.fn(async () => undefined);
  fake.plugin.openSettings = vi.fn(async () => undefined);
  return { AppLanguage: fake.plugin };
});

describe('capawesome/app-language', () => {
  it('useAppLanguage exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppLanguage(), { wrapper: StrictModeWrapper });
    await expect(result.current.getLanguage()).resolves.toEqual({ languageTag: 'de-DE' });
    await expect(result.current.setLanguage({ languageTag: 'de-DE' })).resolves.toBeUndefined();
    await expect(result.current.resetLanguage()).resolves.toBeUndefined();
  });
});
