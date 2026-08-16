import { FirebasePerformance } from '@capacitor-firebase/performance';
import { renderHook } from '@testing-library/react';

import { useFirebasePerformance } from '../../src/firebase/performance';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/performance', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getMetric = vi.fn(async () => ({ value: 3 }));
  fake.plugin.startTrace = vi.fn(async () => undefined);
  fake.plugin.stopTrace = vi.fn(async () => undefined);
  return { FirebasePerformance: fake.plugin };
});

describe('firebase/performance', () => {
  it('useFirebasePerformance exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebasePerformance(), { wrapper: StrictModeWrapper });

    await expect(result.current.startTrace({ traceName: 'checkout' })).resolves.toBeUndefined();
    expect(FirebasePerformance.startTrace).toHaveBeenCalledWith({ traceName: 'checkout' });
    await expect(
      result.current.getMetric({ traceName: 'checkout', metricName: 'items' }),
    ).resolves.toEqual({ value: 3 });
    await expect(result.current.stopTrace({ traceName: 'checkout' })).resolves.toBeUndefined();
  });
});
