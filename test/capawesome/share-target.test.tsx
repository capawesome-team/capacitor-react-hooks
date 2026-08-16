import { ShareTarget } from '@capawesome-team/capacitor-share-target';
import { act, renderHook } from '@testing-library/react';

import { useShareReceived } from '../../src/capawesome/share-target';
import { captureLaunchEvents } from '../../src/core';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-share-target', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  return { ShareTarget: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (ShareTarget as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());
const share = { title: 'Check this out!', texts: ['https://capacitorjs.com'] };

describe('capawesome/share-target', () => {
  it('useShareReceived delivers shares and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useShareReceived(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('shareReceived', share));
    expect(callback).toHaveBeenCalledExactlyOnceWith(share);

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('shareReceived')).toBe(0);
  });

  it('useShareReceived replays a share that launched the app', async () => {
    captureLaunchEvents([{ plugin: ShareTarget, event: 'shareReceived' }]);
    await flushMicrotasks();
    fake.emit('shareReceived', share);

    const callback = vi.fn();
    renderHook(() => useShareReceived(callback), { wrapper: StrictModeWrapper });
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledExactlyOnceWith(share);
  });
});
