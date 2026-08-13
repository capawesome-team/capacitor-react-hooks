import { PasswordAutofill } from '@capawesome/capacitor-password-autofill';
import { renderHook } from '@testing-library/react';

import { usePasswordAutofill } from '../../src/capawesome/password-autofill';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-password-autofill', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.savePassword = vi.fn(async () => undefined);
  return { PasswordAutofill: fake.plugin };
});

describe('capawesome/password-autofill', () => {
  it('usePasswordAutofill exposes savePassword bound to the plugin', async () => {
    const { result } = renderHook(() => usePasswordAutofill(), { wrapper: StrictModeWrapper });
    const options = { domain: 'example.com', password: 'secret', username: 'jane.doe' };
    await expect(result.current.savePassword(options)).resolves.toBeUndefined();
    expect(PasswordAutofill.savePassword).toHaveBeenCalledWith(options);
  });
});
