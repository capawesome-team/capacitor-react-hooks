import { GrafanaFaro } from '@capawesome/capacitor-grafana-faro';
import { renderHook } from '@testing-library/react';

import { useGrafanaFaro } from '../../src/capawesome/grafana-faro';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-grafana-faro', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.initialize = vi.fn(async () => undefined);
  fake.plugin.getSession = vi.fn(async () => ({ id: 'session-1' }));
  fake.plugin.getView = vi.fn(async () => ({ name: 'home' }));
  fake.plugin.pushEvent = vi.fn(async () => undefined);
  return { GrafanaFaro: fake.plugin };
});

describe('capawesome/grafana-faro', () => {
  it('useGrafanaFaro exposes the plugin methods', async () => {
    const { result } = renderHook(() => useGrafanaFaro(), { wrapper: StrictModeWrapper });
    await expect(result.current.getSession()).resolves.toEqual({ id: 'session-1' });
    await expect(result.current.getView()).resolves.toEqual({ name: 'home' });
    await result.current.pushEvent({ name: 'checkout' });
    expect(GrafanaFaro.pushEvent).toHaveBeenCalledWith({ name: 'checkout' });
  });
});
