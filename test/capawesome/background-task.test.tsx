import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { renderHook } from '@testing-library/react';

import { useBackgroundTask } from '../../src/capawesome/background-task';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-background-task', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.beforeExit = vi.fn(async () => 'task-id');
  fake.plugin.finish = vi.fn(() => undefined);
  return { BackgroundTask: fake.plugin };
});

describe('capawesome/background-task', () => {
  it('useBackgroundTask exposes the plugin methods', async () => {
    const { result } = renderHook(() => useBackgroundTask(), { wrapper: StrictModeWrapper });
    const taskId = await result.current.beforeExit(() => undefined);
    expect(taskId).toBe('task-id');
    expect(result.current.finish({ taskId })).toBeUndefined();
    expect(BackgroundTask.finish).toHaveBeenCalledWith({ taskId: 'task-id' });
  });
});
