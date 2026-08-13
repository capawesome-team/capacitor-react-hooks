import { Nodejs } from '@capawesome/capacitor-nodejs';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useNodejs,
  useNodejsIsReady,
  useNodejsMessage,
  useNodejsReady,
} from '../../src/capawesome/nodejs';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-nodejs', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.isReady = vi.fn(async () => ({ ready: false }));
  fake.plugin.send = vi.fn(async () => undefined);
  fake.plugin.start = vi.fn(async () => undefined);
  return { Nodejs: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Nodejs as unknown as { __fake: FakePlugin }).__fake;
const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/nodejs', () => {
  it('useNodejs exposes the plugin methods', async () => {
    const { result } = renderHook(() => useNodejs(), { wrapper: StrictModeWrapper });
    await expect(result.current.isReady()).resolves.toEqual({ ready: false });
    await expect(result.current.send({ eventName: 'ping' })).resolves.toBeUndefined();
    expect(Nodejs.send).toHaveBeenCalledWith({ eventName: 'ping' });
  });

  it('useNodejsIsReady seeds from isReady and follows the ready event', async () => {
    const { result } = renderHook(() => useNodejsIsReady(), { wrapper: StrictModeWrapper });
    await waitFor(() => expect(result.current).toBe(false));
    act(() => fake.emit('ready'));
    expect(result.current).toBe(true);
  });

  it('useNodejsMessage delivers messages and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useNodejsMessage(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    const event = { eventName: 'my-event', args: ['Hello from Node.js!'] };
    act(() => fake.emit('message', event));
    expect(callback).toHaveBeenCalledExactlyOnceWith(event);
    unmount();
    expect(fake.listenerCount('message')).toBe(0);
  });

  it('useNodejsReady delivers the ready event and cleans up', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useNodejsReady(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('ready'));
    expect(callback).toHaveBeenCalledOnce();
    unmount();
    expect(fake.listenerCount('ready')).toBe(0);
  });
});
