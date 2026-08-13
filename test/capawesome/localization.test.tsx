import { renderHook } from '@testing-library/react';

import { useLocalization } from '../../src/capawesome/localization';
import { StrictModeWrapper } from '../strict-mode';

const settings = { firstDayOfWeek: 1, timeZone: 'Europe/Berlin', uses24HourClock: true };

vi.mock('@capawesome/capacitor-localization', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getLocales = vi.fn(async () => ({ locales: [{ languageTag: 'de-DE' }] }));
  fake.plugin.getSettings = vi.fn(async () => ({
    firstDayOfWeek: 1,
    timeZone: 'Europe/Berlin',
    uses24HourClock: true,
  }));
  return { Localization: fake.plugin };
});

describe('capawesome/localization', () => {
  it('useLocalization exposes the plugin methods', async () => {
    const { result } = renderHook(() => useLocalization(), { wrapper: StrictModeWrapper });
    await expect(result.current.getLocales()).resolves.toEqual({
      locales: [{ languageTag: 'de-DE' }],
    });
    await expect(result.current.getSettings()).resolves.toEqual(settings);
  });
});
