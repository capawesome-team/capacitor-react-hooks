import { renderHook } from '@testing-library/react';

import { usePasskeys } from '../../src/capawesome/passkeys';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-passkeys', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.createPasskey = vi.fn(async () => ({ id: 'credential-id', type: 'public-key' }));
  fake.plugin.getPasskey = vi.fn(async () => ({ id: 'credential-id', type: 'public-key' }));
  return { Passkeys: fake.plugin };
});

describe('capawesome/passkeys', () => {
  it('usePasskeys exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePasskeys(), { wrapper: StrictModeWrapper });
    await expect(
      result.current.createPasskey({
        challenge: 'dGhpc2lzYWNoYWxsZW5nZQ',
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        rp: { id: 'example.com', name: 'Example Inc.' },
        user: {
          displayName: 'Jane Doe',
          id: 'anVzdGFyYW5kb21pZA',
          name: 'jane.doe@example.com',
        },
      }),
    ).resolves.toMatchObject({ id: 'credential-id' });
    await expect(
      result.current.getPasskey({ challenge: 'dGhpc2lzYWNoYWxsZW5nZQ', rpId: 'example.com' }),
    ).resolves.toMatchObject({ id: 'credential-id' });
  });
});
