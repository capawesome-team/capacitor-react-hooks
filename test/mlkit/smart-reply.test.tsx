import { SmartReply } from '@capacitor-mlkit/smart-reply';
import { renderHook } from '@testing-library/react';

import { useSmartReply } from '../../src/mlkit/smart-reply';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-mlkit/smart-reply', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.suggestReplies = vi.fn(async () => ({
    status: 'SUCCESS',
    suggestions: ['Sounds good!'],
  }));
  return { SmartReply: fake.plugin };
});

describe('mlkit/smart-reply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSmartReply exposes the plugin methods', async () => {
    const options = {
      messages: [
        { text: 'Are you coming?', timestamp: 1751990400000, isLocalUser: false, userId: 'user-1' },
      ],
    };
    const { result } = renderHook(() => useSmartReply(), { wrapper: StrictModeWrapper });

    await expect(result.current.suggestReplies(options)).resolves.toEqual({
      status: 'SUCCESS',
      suggestions: ['Sounds good!'],
    });
    expect(SmartReply.suggestReplies).toHaveBeenCalledExactlyOnceWith(options);
  });

  it('useSmartReply keeps the method identity stable across renders', () => {
    const { result, rerender } = renderHook(() => useSmartReply(), { wrapper: StrictModeWrapper });
    const { suggestReplies } = result.current;
    rerender();
    expect(result.current.suggestReplies).toBe(suggestReplies);
  });
});
