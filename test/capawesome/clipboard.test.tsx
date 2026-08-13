import { Clipboard } from '@capawesome/capacitor-clipboard';
import { act, renderHook } from '@testing-library/react';

import { useClipboard } from '../../src/capawesome/clipboard';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-clipboard', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.read = vi.fn(async () => ({ type: 'TEXT', value: 'Hello World' }));
  fake.plugin.write = vi.fn(async () => undefined);
  return { Clipboard: fake.plugin };
});

describe('capawesome/clipboard', () => {
  it('useClipboard exposes the plugin methods', async () => {
    const { result } = renderHook(() => useClipboard(), { wrapper: StrictModeWrapper });
    await expect(result.current.read()).resolves.toEqual({ type: 'TEXT', value: 'Hello World' });
    await act(() => result.current.write({ text: 'Hello World' }));
    expect(Clipboard.write).toHaveBeenCalledWith({ text: 'Hello World' });
  });
});
