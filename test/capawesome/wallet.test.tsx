import { Wallet } from '@capawesome/capacitor-wallet';
import { renderHook } from '@testing-library/react';

import { useWallet } from '../../src/capawesome/wallet';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-wallet', () => ({
  Wallet: {
    addPasses: vi.fn(async () => undefined),
    canAddPasses: vi.fn(async () => ({ canAdd: true })),
    saveToGoogleWallet: vi.fn(async () => undefined),
  },
}));

describe('capawesome/wallet', () => {
  it('useWallet exposes the plugin methods', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper: StrictModeWrapper });
    await expect(result.current.canAddPasses()).resolves.toEqual({ canAdd: true });
    await expect(result.current.addPasses({ passes: ['cGFzcw=='] })).resolves.toBeUndefined();
    expect(Wallet.addPasses).toHaveBeenCalledWith({ passes: ['cGFzcw=='] });
    await expect(result.current.saveToGoogleWallet({ jwt: 'token' })).resolves.toBeUndefined();
  });
});
