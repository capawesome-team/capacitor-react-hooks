import { SpeechSynthesis } from '@capawesome-team/capacitor-speech-synthesis';
import { act, renderHook } from '@testing-library/react';

import {
  useSpeechSynthesis,
  useSpeechSynthesisBoundary,
  useSpeechSynthesisEnd,
} from '../../src/capawesome/speech-synthesis';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-speech-synthesis', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.cancel = vi.fn(async () => undefined);
  fake.plugin.getVoices = vi.fn(async () => ({ voices: [] }));
  fake.plugin.isAvailable = vi.fn(async () => ({ isAvailable: true }));
  fake.plugin.speak = vi.fn(async () => ({ utteranceId: 'utterance-1' }));
  return { SpeechSynthesis: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (SpeechSynthesis as unknown as { __fake: FakePlugin }).__fake;
const speak = vi.mocked(SpeechSynthesis.speak);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/speech-synthesis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSpeechSynthesisEnd delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSpeechSynthesisEnd(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('end', { utteranceId: 'utterance-1' }));
    expect(callback).toHaveBeenCalledExactlyOnceWith({ utteranceId: 'utterance-1' });

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('end')).toBe(0);
  });

  it('useSpeechSynthesisBoundary can be detached without unmounting', async () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useSpeechSynthesisBoundary(callback, { enabled }),
      { initialProps: { enabled: true }, wrapper: StrictModeWrapper },
    );
    await flushMicrotasks();
    expect(fake.listenerCount('boundary')).toBe(1);

    rerender({ enabled: false });
    await flushMicrotasks();
    expect(fake.listenerCount('boundary')).toBe(0);
  });

  it('useSpeechSynthesis exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSpeechSynthesis(), { wrapper: StrictModeWrapper });
    await expect(result.current.isAvailable()).resolves.toEqual({ isAvailable: true });
    await expect(result.current.getVoices()).resolves.toEqual({ voices: [] });

    await act(() => result.current.speak({ text: 'Hello' }));
    expect(speak).toHaveBeenCalledExactlyOnceWith({ text: 'Hello' });
  });
});
