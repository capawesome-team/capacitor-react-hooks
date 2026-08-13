import { SystemWebview } from '@capawesome/capacitor-system-webview';
import { renderHook } from '@testing-library/react';

import { useSystemWebview } from '../../src/capawesome/system-webview';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capawesome/capacitor-system-webview', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getInfo = vi.fn(async () => ({
    majorVersion: 126,
    packageName: 'com.google.android.webview',
    versionName: '126.0.6478.122',
  }));
  fake.plugin.isUpdateRequired = vi.fn(async () => ({ required: false }));
  fake.plugin.openAppStore = vi.fn(async () => undefined);
  return { SystemWebview: fake.plugin };
});

describe('capawesome/system-webview', () => {
  it('useSystemWebview exposes the plugin methods', async () => {
    const { result } = renderHook(() => useSystemWebview(), { wrapper: StrictModeWrapper });
    await expect(result.current.getInfo()).resolves.toEqual({
      majorVersion: 126,
      packageName: 'com.google.android.webview',
      versionName: '126.0.6478.122',
    });
    await expect(result.current.isUpdateRequired({ minMajorVersion: 105 })).resolves.toEqual({
      required: false,
    });
    await expect(result.current.openAppStore()).resolves.toBeUndefined();
    expect(SystemWebview.isUpdateRequired).toHaveBeenCalledWith({ minMajorVersion: 105 });
  });
});
