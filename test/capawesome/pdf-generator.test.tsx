import { renderHook } from '@testing-library/react';

import { usePdfGenerator } from '../../src/capawesome/pdf-generator';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-pdf-generator', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.generateFromHtml = vi.fn(async () => ({ path: '/tmp/from-html.pdf' }));
  fake.plugin.generateFromUrl = vi.fn(async () => ({ path: '/tmp/from-url.pdf' }));
  return { PdfGenerator: fake.plugin };
});

describe('capawesome/pdf-generator', () => {
  it('usePdfGenerator exposes the plugin methods', async () => {
    const { result } = renderHook(() => usePdfGenerator(), { wrapper: StrictModeWrapper });
    await expect(result.current.generateFromHtml({ html: '<h1>Hi</h1>' })).resolves.toEqual({
      path: '/tmp/from-html.pdf',
    });
    await expect(
      result.current.generateFromUrl({ url: 'https://capawesome.io/' }),
    ).resolves.toEqual({ path: '/tmp/from-url.pdf' });
  });
});
