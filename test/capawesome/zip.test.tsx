import { Zip } from '@capawesome-team/capacitor-zip';
import { act, renderHook } from '@testing-library/react';

import { useZip } from '../../src/capawesome/zip';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-zip', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.unzip = vi.fn(async () => undefined);
  fake.plugin.zip = vi.fn(async () => undefined);
  return { Zip: fake.plugin };
});

describe('capawesome/zip', () => {
  it('useZip exposes the plugin methods', async () => {
    const { result } = renderHook(() => useZip(), { wrapper: StrictModeWrapper });
    await act(() => result.current.unzip({ source: 'file:///a.zip', destination: 'file:///out' }));
    expect(Zip.unzip).toHaveBeenCalledWith({
      source: 'file:///a.zip',
      destination: 'file:///out',
    });
    await expect(
      result.current.zip({ source: 'file:///out', destination: 'file:///b.zip' }),
    ).resolves.toBeUndefined();
  });
});
