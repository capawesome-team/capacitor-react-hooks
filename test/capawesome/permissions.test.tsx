import type * as PermissionsModule from '@capawesome/capacitor-permissions';
import { Permission } from '@capawesome/capacitor-permissions';
import { renderHook } from '@testing-library/react';

import { usePermissions } from '../../src/capawesome/permissions';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-permissions', async importOriginal => {
  const original = await importOriginal<typeof PermissionsModule>();
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  const result = { statuses: [{ permission: 'CAMERA', state: 'granted' }] };
  fake.plugin.check = vi.fn(async () => result);
  fake.plugin.request = vi.fn(async () => result);
  return { ...original, Permissions: fake.plugin };
});

describe('capawesome/permissions', () => {
  it('usePermissions exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: StrictModeWrapper });
    const options = { permissions: [Permission.Camera] };
    await expect(result.current.check(options)).resolves.toEqual({
      statuses: [{ permission: 'CAMERA', state: 'granted' }],
    });
    await expect(result.current.request(options)).resolves.toEqual({
      statuses: [{ permission: 'CAMERA', state: 'granted' }],
    });
  });
});
