import { act, renderHook, waitFor } from '@testing-library/react';

import { createPermissionsHook } from '../../src/core';
import { StrictModeWrapper } from '../strict-mode';

interface Status {
  camera: string;
}

describe('createPermissionsHook', () => {
  it('checks on mount and updates status on request', async () => {
    const plugin = {
      checkPermissions: vi.fn(async (): Promise<Status> => ({ camera: 'prompt' })),
      requestPermissions: vi.fn(async (): Promise<Status> => ({ camera: 'granted' })),
    };
    const usePermissions = createPermissionsHook(plugin);
    const { result } = renderHook(() => usePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.status).toEqual({ camera: 'prompt' }));
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.status).toEqual({ camera: 'granted' });
    expect(result.current.error).toBeUndefined();
  });

  it('captures errors without throwing', async () => {
    const plugin = {
      checkPermissions: vi.fn(async (): Promise<Status> => {
        throw new Error('not implemented on web');
      }),
      requestPermissions: vi.fn(async (): Promise<Status> => ({ camera: 'granted' })),
    };
    const usePermissions = createPermissionsHook(plugin);
    const { result } = renderHook(() => usePermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current.error).toEqual(new Error('not implemented on web')));
    expect(result.current.status).toBeUndefined();
  });
});
