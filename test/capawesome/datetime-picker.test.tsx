import { DatetimePicker } from '@capawesome-team/capacitor-datetime-picker';
import { renderHook } from '@testing-library/react';

import { useDatetimePicker } from '../../src/capawesome/datetime-picker';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-datetime-picker', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.present = vi.fn(async () => ({ value: '2026-01-01T00:00:00.000Z' }));
  fake.plugin.cancel = vi.fn(async () => undefined);
  return { DatetimePicker: fake.plugin };
});

describe('capawesome/datetime-picker', () => {
  it('useDatetimePicker exposes the plugin methods', async () => {
    const { result } = renderHook(() => useDatetimePicker(), { wrapper: StrictModeWrapper });
    await expect(result.current.present({ mode: 'date' })).resolves.toEqual({
      value: '2026-01-01T00:00:00.000Z',
    });
    expect(DatetimePicker.present).toHaveBeenCalledWith({ mode: 'date' });
    await expect(result.current.cancel()).resolves.toBeUndefined();
  });

  it('useDatetimePicker keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useDatetimePicker(), {
      wrapper: StrictModeWrapper,
    });
    const { present } = result.current;
    rerender();
    expect(result.current.present).toBe(present);
  });
});
