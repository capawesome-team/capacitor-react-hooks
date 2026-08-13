import { renderHook, waitFor } from '@testing-library/react';

import { useCalendar, useCalendarPermissions } from '../../src/capacitor/calendar';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor/calendar', () => ({
  Calendar: {
    createEvent: vi.fn(async () => ({ id: 'event-1' })),
    createEventInteractively: vi.fn(async () => ({ id: 'event-1' })),
    modifyEvent: vi.fn(async () => undefined),
    findEvents: vi.fn(async () => ({ events: [] })),
    deleteEvent: vi.fn(async () => undefined),
    listCalendars: vi.fn(async () => ({ calendars: [{ id: 'calendar-1', title: 'Work' }] })),
    createCalendar: vi.fn(async () => ({ id: 'calendar-1' })),
    deleteCalendar: vi.fn(async () => undefined),
    openCalendar: vi.fn(async () => undefined),
    checkPermissions: vi.fn(async () => ({ readCalendar: 'granted', writeCalendar: 'prompt' })),
    requestPermissions: vi.fn(async () => ({ readCalendar: 'granted', writeCalendar: 'granted' })),
  },
}));

describe('capacitor/calendar', () => {
  it('useCalendar exposes the plugin methods', async () => {
    const { result } = renderHook(() => useCalendar(), { wrapper: StrictModeWrapper });
    await expect(result.current.listCalendars()).resolves.toEqual({
      calendars: [{ id: 'calendar-1', title: 'Work' }],
    });
  });

  it('useCalendarPermissions checks the permissions on mount', async () => {
    const { result } = renderHook(() => useCalendarPermissions(), { wrapper: StrictModeWrapper });
    await waitFor(() =>
      expect(result.current.status).toEqual({ readCalendar: 'granted', writeCalendar: 'prompt' }),
    );
  });
});
