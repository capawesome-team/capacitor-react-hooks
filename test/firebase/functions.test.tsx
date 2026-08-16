import { FirebaseFunctions } from '@capacitor-firebase/functions';
import { renderHook } from '@testing-library/react';

import { useFirebaseFunctions } from '../../src/firebase/functions';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/functions', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.callByName = vi.fn(async () => ({ data: { greeting: 'Hello' } }));
  fake.plugin.callByUrl = vi.fn(async () => ({ data: { greeting: 'Hello' } }));
  return { FirebaseFunctions: fake.plugin };
});

describe('firebase/functions', () => {
  it('useFirebaseFunctions exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseFunctions(), { wrapper: StrictModeWrapper });

    await expect(
      result.current.callByName<{ name: string }, { greeting: string }>({
        name: 'greet',
        data: { name: 'Alan' },
      }),
    ).resolves.toEqual({ data: { greeting: 'Hello' } });
    expect(FirebaseFunctions.callByName).toHaveBeenCalledWith({
      name: 'greet',
      data: { name: 'Alan' },
    });
    await expect(
      result.current.callByUrl({ url: 'https://us-central1-capawesome.cloudfunctions.net/greet' }),
    ).resolves.toEqual({ data: { greeting: 'Hello' } });
  });
});
