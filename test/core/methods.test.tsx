import { renderHook, waitFor } from '@testing-library/react';

import { createMethodsHook } from '../../src/core';
import { StrictModeWrapper } from '../strict-mode';

describe('createMethodsHook', () => {
  it('returns bound methods with stable identity across renders', async () => {
    const plugin = {
      getValue: vi.fn(async () => 'value'),
      unrelated: vi.fn(),
    };
    const useMethods = createMethodsHook('FakePlugin', plugin, ['getValue']);
    const { result, rerender } = renderHook(() => useMethods(), { wrapper: StrictModeWrapper });
    const initialGetValue = result.current.getValue;
    await expect(initialGetValue()).resolves.toBe('value');
    rerender();
    expect(result.current.getValue).toBe(initialGetValue);
    expect('unrelated' in result.current).toBe(false);
  });

  it('reports availability from the Capacitor plugin registry', async () => {
    const useMethods = createMethodsHook('UnregisteredPlugin', {}, []);
    const { result } = renderHook(() => useMethods(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.isAvailable).toBe(false));
  });
});
