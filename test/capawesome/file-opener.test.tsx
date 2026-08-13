import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { renderHook } from '@testing-library/react';

import { useFileOpener } from '../../src/capawesome/file-opener';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-file-opener', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.openFile = vi.fn(async () => undefined);
  return { FileOpener: fake.plugin };
});

describe('capawesome/file-opener', () => {
  it('useFileOpener exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFileOpener(), { wrapper: StrictModeWrapper });
    await expect(result.current.openFile({ path: '/tmp/report.pdf' })).resolves.toBeUndefined();
    expect(FileOpener.openFile).toHaveBeenCalledWith({ path: '/tmp/report.pdf' });
  });
});
