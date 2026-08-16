import { Calendar } from '@capawesome-team/capacitor-calendar';
import { act, renderHook, waitFor } from '@testing-library/react';

import {
  useCalendar,
  useCalendarChange,
  useCalendarPermissions,
} from '../../src/capawesome/calendar';
import type { FakePlugin } from '../harness';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome-team/capacitor-calendar', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getCalendars = vi.fn(async () => ({ calendars: [{ id: '1', title: 'Work' }] }));
  fake.plugin.createEvent = vi.fn(async () => ({ id: 'event-1' }));
  fake.plugin.checkPermissions = vi.fn(async () => ({
    readCalendar: 'prompt',
    writeCalendar: 'prompt',
  }));
  fake.plugin.requestPermissions = vi.fn(async () => ({
    readCalendar: 'granted',
    writeCalendar: 'granted',
  }));
  return { Calendar: Object.assign(fake.plugin, { __fake: fake }) };
});

const fake = (Calendar as unknown as { __fake: FakePlugin }).__fake;
const requestPermissions = vi.mocked(Calendar.requestPermissions);

const flushMicrotasks = () => act(() => Promise.resolve());

describe('capawesome/calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCalendarChange delivers events and detaches on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useCalendarChange(callback), {
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    act(() => fake.emit('calendarChange'));
    expect(callback).toHaveBeenCalledOnce();

    unmount();
    await flushMicrotasks();
    expect(fake.listenerCount('calendarChange')).toBe(0);
  });

  it('useCalendarChange detaches while disabled', async () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useCalendarChange(callback, { enabled }), {
      initialProps: { enabled: true },
      wrapper: StrictModeWrapper,
    });
    await flushMicrotasks();
    expect(fake.listenerCount('calendarChange')).toBe(1);

    rerender({ enabled: false });
    await flushMicrotasks();
    expect(fake.listenerCount('calendarChange')).toBe(0);
    act(() => fake.emit('calendarChange'));
    expect(callback).not.toHaveBeenCalled();
  });

  it('useCalendarPermissions checks on mount and forwards the requested permissions', async () => {
    const { result } = renderHook(() => useCalendarPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() =>
      expect(result.current.status).toEqual({ readCalendar: 'prompt', writeCalendar: 'prompt' }),
    );

    await act(() => result.current.request({ permissions: ['writeCalendar'] }));
    expect(requestPermissions).toHaveBeenCalledExactlyOnceWith({ permissions: ['writeCalendar'] });
    expect(result.current.status).toEqual({
      readCalendar: 'granted',
      writeCalendar: 'granted',
    });
  });

  it('useCalendar exposes getCalendars', async () => {
    const { result } = renderHook(() => useCalendar(), { wrapper: StrictModeWrapper });
    await expect(result.current.getCalendars()).resolves.toEqual({
      calendars: [{ id: '1', title: 'Work' }],
    });
  });
});
