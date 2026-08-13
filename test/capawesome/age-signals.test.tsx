import type * as AgeSignalsModule from '@capawesome/capacitor-age-signals';
import { AgeRangeStatus, ErrorCode } from '@capawesome/capacitor-age-signals';
import { renderHook } from '@testing-library/react';

import { useAgeSignals } from '../../src/capawesome/age-signals';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-age-signals', async importOriginal => {
  const original = await importOriginal<typeof AgeSignalsModule>();
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getAgeRange = vi.fn(async () => ({ installId: 'install-id' }));
  fake.plugin.getRegulatoryRequirements = vi.fn(async () => ({
    ageAssuranceRequired: true,
    regulatoryFeatures: [],
  }));
  fake.plugin.requestAgeRange = vi.fn(async () => ({ status: 'SHARED' }));
  fake.plugin.setNextAgeSignalsAccessResult = vi.fn(async () => undefined);
  fake.plugin.setNextAgeSignalsException = vi.fn(async () => undefined);
  fake.plugin.setNextAgeSignalsResult = vi.fn(async () => undefined);
  fake.plugin.setNextRequestAgeSignalsAccessException = vi.fn(async () => undefined);
  fake.plugin.setUseFakeManager = vi.fn(async () => undefined);
  fake.plugin.showSignificantUpdateAcknowledgment = vi.fn(async () => undefined);
  return { ...original, AgeSignals: fake.plugin };
});

describe('capawesome/age-signals', () => {
  it('useAgeSignals exposes the age range methods', async () => {
    const { result } = renderHook(() => useAgeSignals(), { wrapper: StrictModeWrapper });
    await expect(result.current.getAgeRange()).resolves.toEqual({ installId: 'install-id' });
    await expect(result.current.getRegulatoryRequirements()).resolves.toMatchObject({
      ageAssuranceRequired: true,
    });
    await expect(result.current.requestAgeRange({ ageGates: [18] })).resolves.toEqual({
      status: 'SHARED',
    });
    await expect(
      result.current.showSignificantUpdateAcknowledgment({ updateDescription: 'New chat feature' }),
    ).resolves.toBeUndefined();
  });

  it('useAgeSignals exposes the fake manager methods', async () => {
    const { result } = renderHook(() => useAgeSignals(), { wrapper: StrictModeWrapper });
    await expect(result.current.setUseFakeManager({ useFake: true })).resolves.toBeUndefined();
    await expect(
      result.current.setNextAgeSignalsAccessResult({ status: AgeRangeStatus.Shared }),
    ).resolves.toBeUndefined();
    await expect(
      result.current.setNextAgeSignalsResult({ ageLower: 18, ageUpper: 24 }),
    ).resolves.toBeUndefined();
    await expect(
      result.current.setNextAgeSignalsException({ errorCode: ErrorCode.NotSupported }),
    ).resolves.toBeUndefined();
    await expect(
      result.current.setNextRequestAgeSignalsAccessException({
        errorCode: ErrorCode.NotSupported,
      }),
    ).resolves.toBeUndefined();
  });
});
