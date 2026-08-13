import { Camera } from '@capacitor/camera';

import { createMethodsHook, createPermissionsHook } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useCamera = createMethodsHook('Camera', Camera, [
  'takePhoto',
  'recordVideo',
  'playVideo',
  'chooseFromGallery',
  'editPhoto',
  'editURIPhoto',
  'pickLimitedLibraryPhotos',
  'getLimitedLibraryPhotos',
  'checkPermissions',
  'requestPermissions',
]);

/**
 * Camera and photo library permission status with imperative `check` and
 * `request`. Both `camera` and `photos` can be `'limited'` on iOS, which grants
 * access to a user-selected subset of the photo library.
 */
export const useCameraPermissions = createPermissionsHook(Camera);
