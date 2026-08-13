import { SquareMobilePayments } from '@capawesome/capacitor-square-mobile-payments';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useSquareMobilePayments,
  useSquareMobilePaymentsAvailableCardInputMethods,
  useSquareMobilePaymentsAvailableCardInputMethodsDidChange,
  useSquareMobilePaymentsPaymentDidCancel,
  useSquareMobilePaymentsPaymentDidFail,
  useSquareMobilePaymentsPaymentDidFinish,
  useSquareMobilePaymentsPermissions,
  useSquareMobilePaymentsReaderDidChange,
  useSquareMobilePaymentsReaderPairingDidBegin,
  useSquareMobilePaymentsReaderPairingDidFail,
  useSquareMobilePaymentsReaderPairingDidSucceed,
  useSquareMobilePaymentsReaderWasAdded,
  useSquareMobilePaymentsReaderWasRemoved,
} from '../../src/capawesome/square-mobile-payments';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-square-mobile-payments', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.isAuthorized = vi.fn(async () => ({ authorized: true }));
  fake.plugin.getReaders = vi.fn(async () => ({ readers: [] }));
  fake.plugin.getAvailableCardInputMethods = vi.fn(async () => ({ cardInputMethods: ['TAP'] }));
  const permissionStatus = {
    location: 'granted',
    recordAudio: 'granted',
    bluetoothConnect: 'granted',
    bluetoothScan: 'granted',
  };
  fake.plugin.checkPermissions = vi.fn(async () => permissionStatus);
  fake.plugin.requestPermissions = vi.fn(async () => permissionStatus);
  return { SquareMobilePayments: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (SquareMobilePayments as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/square-mobile-payments', () => {
  it('useSquareMobilePayments exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSquareMobilePayments(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAuthorized()).resolves.toEqual({ authorized: true });
    await expect(result.current.getReaders()).resolves.toEqual({ readers: [] });
  });

  it('useSquareMobilePaymentsPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useSquareMobilePaymentsPermissions(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() =>
      expect(result.current.status).toEqual({
        location: 'granted',
        recordAudio: 'granted',
        bluetoothConnect: 'granted',
        bluetoothScan: 'granted',
      }),
    );
  });

  it('useSquareMobilePaymentsAvailableCardInputMethods seeds from the getter and follows change events', async () => {
    const { result } = renderHook(() => useSquareMobilePaymentsAvailableCardInputMethods(), {
      wrapper: StrictModeWrapper,
    });
    await waitFor(() => expect(result.current).toEqual(['TAP']));
    act(() =>
      fake.emit('availableCardInputMethodsDidChange', { cardInputMethods: ['TAP', 'DIP'] }),
    );
    expect(result.current).toEqual(['TAP', 'DIP']);
  });

  it('useSquareMobilePaymentsPaymentDidFinish delivers payments and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSquareMobilePaymentsPaymentDidFinish(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { payment: { id: 'payment-1' } };
    act(() => fake.emit('paymentDidFinish', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('paymentDidFinish')).toBe(0);
  });

  it('registers a listener for every reader and payment event', async () => {
    const { unmount } = renderHook(
      () => {
        useSquareMobilePaymentsReaderPairingDidBegin(vi.fn());
        useSquareMobilePaymentsReaderPairingDidSucceed(vi.fn());
        useSquareMobilePaymentsReaderPairingDidFail(vi.fn());
        useSquareMobilePaymentsReaderWasAdded(vi.fn());
        useSquareMobilePaymentsReaderWasRemoved(vi.fn());
        useSquareMobilePaymentsReaderDidChange(vi.fn());
        useSquareMobilePaymentsAvailableCardInputMethodsDidChange(vi.fn());
        useSquareMobilePaymentsPaymentDidFail(vi.fn());
        useSquareMobilePaymentsPaymentDidCancel(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    for (const event of [
      'readerPairingDidBegin',
      'readerPairingDidSucceed',
      'readerPairingDidFail',
      'readerWasAdded',
      'readerWasRemoved',
      'readerDidChange',
      'availableCardInputMethodsDidChange',
      'paymentDidFail',
      'paymentDidCancel',
    ]) {
      expect(fake.listenerCount(event)).toBe(1);
    }
    unmount();
    expect(fake.listenerCount('paymentDidCancel')).toBe(0);
  });
});
