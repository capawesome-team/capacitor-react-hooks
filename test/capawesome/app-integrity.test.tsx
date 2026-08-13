import { renderHook } from '@testing-library/react';

import { useAppIntegrity } from '../../src/capawesome/app-integrity';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-app-integrity', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.attestKey = vi.fn(async () => ({ attestationObject: 'attestation' }));
  fake.plugin.generateAssertion = vi.fn(async () => ({ assertion: 'assertion' }));
  fake.plugin.generateKey = vi.fn(async () => ({ keyId: 'key-id' }));
  fake.plugin.prepareIntegrityToken = vi.fn(async () => undefined);
  fake.plugin.requestIntegrityToken = vi.fn(async () => ({ token: 'token' }));
  return { AppIntegrity: fake.plugin };
});

describe('capawesome/app-integrity', () => {
  it('useAppIntegrity exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAppIntegrity(), { wrapper: StrictModeWrapper });
    await expect(result.current.generateKey()).resolves.toEqual({ keyId: 'key-id' });
    await expect(
      result.current.attestKey({ challenge: 'challenge', keyId: 'key-id' }),
    ).resolves.toEqual({ attestationObject: 'attestation' });
    await expect(
      result.current.generateAssertion({ clientData: 'client-data', keyId: 'key-id' }),
    ).resolves.toEqual({ assertion: 'assertion' });
    await expect(
      result.current.prepareIntegrityToken({ cloudProjectNumber: 123456789 }),
    ).resolves.toBeUndefined();
    await expect(result.current.requestIntegrityToken({ nonce: 'nonce' })).resolves.toEqual({
      token: 'token',
    });
  });
});
