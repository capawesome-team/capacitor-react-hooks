import { Intune } from '@capawesome/capacitor-intune';
import { act, renderHook } from '@testing-library/react';

import {
  useIntune,
  useIntuneAppConfigChange,
  useIntuneEnrollmentChange,
  useIntunePolicyChange,
  useIntuneWipeRequested,
} from '../../src/capawesome/intune';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-intune', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getEnrolledAccount = vi.fn(async () => ({ account: null }));
  fake.plugin.getSdkVersion = vi.fn(async () => ({
    intuneSdkVersion: '12.0.2',
    msalVersion: '5.1.0',
  }));
  fake.plugin.showDiagnosticConsole = vi.fn(async () => undefined);
  return { Intune: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Intune as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/intune', () => {
  it('useIntune exposes the plugin methods', async () => {
    const { result } = renderHook(() => useIntune(), { wrapper: StrictModeWrapper });
    await expect(result.current.getEnrolledAccount()).resolves.toEqual({ account: null });
    await result.current.showDiagnosticConsole();
    expect(Intune.showDiagnosticConsole).toHaveBeenCalled();
  });

  it('useIntuneEnrollmentChange delivers events and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useIntuneEnrollmentChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { accountId: 'oid', status: 'enrolled' };
    act(() => fake.emit('enrollmentChange', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('enrollmentChange')).toBe(0);
  });

  it('registers a listener for every management event', async () => {
    const { unmount } = renderHook(
      () => {
        useIntuneAppConfigChange(vi.fn());
        useIntunePolicyChange(vi.fn());
        useIntuneWipeRequested(vi.fn());
      },
      { wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('appConfigChange')).toBe(1);
    expect(fake.listenerCount('policyChange')).toBe(1);
    expect(fake.listenerCount('wipeRequested')).toBe(1);
    unmount();
    expect(fake.listenerCount('wipeRequested')).toBe(0);
  });
});
