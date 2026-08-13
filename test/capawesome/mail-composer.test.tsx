import { MailComposer } from '@capawesome/capacitor-mail-composer';
import { renderHook } from '@testing-library/react';

import { useMailComposer } from '../../src/capawesome/mail-composer';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-mail-composer', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.canComposeMail = vi.fn(async () => ({ canCompose: true }));
  fake.plugin.composeMail = vi.fn(async () => ({ status: 'sent' }));
  return { MailComposer: fake.plugin };
});

describe('capawesome/mail-composer', () => {
  it('useMailComposer exposes the plugin methods', async () => {
    const { result } = renderHook(() => useMailComposer(), { wrapper: StrictModeWrapper });
    await expect(result.current.canComposeMail()).resolves.toEqual({ canCompose: true });
    await expect(result.current.composeMail({ to: ['jane@example.com'] })).resolves.toEqual({
      status: 'sent',
    });
    expect(MailComposer.composeMail).toHaveBeenCalledWith({ to: ['jane@example.com'] });
  });
});
