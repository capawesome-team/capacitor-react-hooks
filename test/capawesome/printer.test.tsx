import { Printer } from '@capawesome-team/capacitor-printer';
import { act, renderHook } from '@testing-library/react';

import { usePrinter } from '../../src/capawesome/printer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-printer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.printBase64 = vi.fn(async () => undefined);
  fake.plugin.printFile = vi.fn(async () => undefined);
  fake.plugin.printHtml = vi.fn(async () => undefined);
  fake.plugin.printPdf = vi.fn(async () => undefined);
  fake.plugin.printWebView = vi.fn(async () => undefined);
  return { Printer: fake.plugin };
});

describe('capawesome/printer', () => {
  it('usePrinter exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePrinter(), { wrapper: StrictModeWrapper });
    await act(() => result.current.printHtml({ html: '<p>Invoice</p>' }));
    expect(Printer.printHtml).toHaveBeenCalledWith({ html: '<p>Invoice</p>' });
    await expect(result.current.printWebView()).resolves.toBeUndefined();
    expect(typeof result.current.printBase64).toBe('function');
    expect(typeof result.current.printFile).toBe('function');
    expect(typeof result.current.printPdf).toBe('function');
  });
});
