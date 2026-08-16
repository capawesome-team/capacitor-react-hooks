import { Purchases } from '@capawesome-team/capacitor-purchases';
import { act, renderHook } from '@testing-library/react';

import { usePurchases } from '../../src/capawesome/purchases';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-purchases', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.finishTransaction = vi.fn(async () => undefined);
  fake.plugin.getAllTransactions = vi.fn(async () => ({ transactions: [] }));
  fake.plugin.getCurrentTransactions = vi.fn(async () => ({ transactions: [] }));
  fake.plugin.getProductById = vi.fn(async () => ({ product: { id: 'pro' } }));
  fake.plugin.getProductsByIds = vi.fn(async () => ({ products: [] }));
  fake.plugin.getUnfinishedTransactions = vi.fn(async () => ({ transactions: [] }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.isIntroOfferAvailableForProduct = vi.fn(async () => ({
    isIntroOfferAvailable: false,
  }));
  fake.plugin.purchaseProduct = vi.fn(async () => ({ transaction: { id: 'transaction-1' } }));
  fake.plugin.syncTransactions = vi.fn(async () => undefined);
  return { Purchases: fake.plugin };
});

describe('capawesome/purchases', () => {
  it('usePurchases exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePurchases(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
    await expect(result.current.getProductById({ productId: 'pro' })).resolves.toEqual({
      product: { id: 'pro' },
    });
    await act(() => result.current.finishTransaction({ transactionId: 'transaction-1' }));
    expect(Purchases.finishTransaction).toHaveBeenCalledWith({ transactionId: 'transaction-1' });
    for (const method of [
      'getAllTransactions',
      'getCurrentTransactions',
      'getProductsByIds',
      'getUnfinishedTransactions',
      'isIntroOfferAvailableForProduct',
      'purchaseProduct',
      'syncTransactions',
    ] as const) {
      expect(typeof result.current[method]).toBe('function');
    }
  });
});
