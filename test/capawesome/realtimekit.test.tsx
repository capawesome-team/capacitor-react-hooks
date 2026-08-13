import { RealtimeKit } from '@capawesome/capacitor-realtimekit';
import { renderHook } from '@testing-library/react';

import { useRealtimeKit } from '../../src/capawesome/realtimekit';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-realtimekit', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.startMeeting = vi.fn(async () => undefined);
  return { RealtimeKit: fake.plugin };
});

describe('capawesome/realtimekit', () => {
  it('useRealtimeKit exposes the plugin methods', async () => {
    const { result } = renderHook(() => useRealtimeKit(), { wrapper: StrictModeWrapper });
    await result.current.initialize();
    expect(RealtimeKit.initialize).toHaveBeenCalled();
    await result.current.startMeeting({ authToken: 'token' });
    expect(RealtimeKit.startMeeting).toHaveBeenCalledWith({ authToken: 'token' });
  });
});
