import { FirebaseApp } from '@capacitor-firebase/app';
import { renderHook } from '@testing-library/react';

import { useFirebaseApp } from '../../src/firebase/app';
import { StrictModeWrapper } from '../strict-mode';

vi.mock('@capacitor-firebase/app', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getName = vi.fn(async () => ({ name: '[DEFAULT]' }));
  fake.plugin.getOptions = vi.fn(async () => ({
    apiKey: 'api-key',
    applicationId: 'application-id',
    databaseUrl: 'https://capawesome.firebaseio.com',
    gcmSenderId: 'gcm-sender-id',
    projectId: 'capawesome',
    storageBucket: 'capawesome.appspot.com',
  }));
  return { FirebaseApp: fake.plugin };
});

describe('firebase/app', () => {
  it('useFirebaseApp exposes the plugin methods', async () => {
    const { result } = renderHook(() => useFirebaseApp(), { wrapper: StrictModeWrapper });

    await expect(result.current.getName()).resolves.toEqual({ name: '[DEFAULT]' });
    expect(FirebaseApp.getName).toHaveBeenCalled();
    await expect(result.current.getOptions()).resolves.toEqual({
      apiKey: 'api-key',
      applicationId: 'application-id',
      databaseUrl: 'https://capawesome.firebaseio.com',
      gcmSenderId: 'gcm-sender-id',
      projectId: 'capawesome',
      storageBucket: 'capawesome.appspot.com',
    });
  });
});
