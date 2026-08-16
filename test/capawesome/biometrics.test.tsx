import { Biometrics } from '@capawesome-team/capacitor-biometrics';
import { renderHook } from '@testing-library/react';

import { useBiometrics } from '../../src/capawesome/biometrics';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-biometrics', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.authenticate = vi.fn(async () => undefined);
  fake.plugin.cancelAuthentication = vi.fn(async () => undefined);
  fake.plugin.enroll = vi.fn(async () => undefined);
  fake.plugin.getAuthenticationType = vi.fn(async () => ({ authenticationType: 'BIOMETRIC' }));
  fake.plugin.getBiometricStrengthLevel = vi.fn(async () => ({ strengthLevel: 'STRONG' }));
  fake.plugin.getBiometricType = vi.fn(async () => ({ biometricType: 'FINGERPRINT' }));
  fake.plugin.getBiometricTypes = vi.fn(async () => ({ types: ['FINGERPRINT'] }));
  fake.plugin.hasDeviceCredential = vi.fn(async () => ({ hasDeviceCredential: true }));
  fake.plugin.isAllowed = vi.fn(async () => ({ isAllowed: true }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.isEnrolled = vi.fn(async () => ({ isEnrolled: true }));
  fake.plugin.isLockedOut = vi.fn(async () => ({ isLockedOut: false }));
  return { Biometrics: fake.plugin };
});

describe('capawesome/biometrics', () => {
  it('useBiometrics exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBiometrics(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
    await expect(result.current.isEnrolled()).resolves.toEqual({ isEnrolled: true });
    await expect(result.current.isLockedOut()).resolves.toEqual({ isLockedOut: false });
    await result.current.authenticate({ title: 'Authentication required' });
    expect(Biometrics.authenticate).toHaveBeenCalledWith({ title: 'Authentication required' });
  });
});
