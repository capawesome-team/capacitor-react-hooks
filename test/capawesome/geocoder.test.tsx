import { Geocoder } from '@capawesome-team/capacitor-geocoder';
import { renderHook } from '@testing-library/react';

import { useGeocoder } from '../../src/capawesome/geocoder';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-geocoder', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.geocode = vi.fn(async () => ({ addresses: [{ latitude: 1, longitude: 2 }] }));
  fake.plugin.geodecode = vi.fn(async () => ({ addresses: [{ countryName: 'Germany' }] }));
  return { Geocoder: fake.plugin };
});

describe('capawesome/geocoder', () => {
  it('useGeocoder exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGeocoder(), { wrapper: StrictModeWrapper });
    await expect(result.current.geocode({ address: 'Berlin' })).resolves.toEqual({
      addresses: [{ latitude: 1, longitude: 2 }],
    });
    expect(Geocoder.geocode).toHaveBeenCalledWith({ address: 'Berlin' });
    await expect(result.current.geodecode({ latitude: 1, longitude: 2 })).resolves.toEqual({
      addresses: [{ countryName: 'Germany' }],
    });
  });
});
