import type {
  RecordingErrorEvent,
  RecordingStoppedEvent,
} from '@capawesome-team/capacitor-audio-recorder';
import { AudioRecorder } from '@capawesome-team/capacitor-audio-recorder';

import { createMethodsHook, createPermissionsHook, usePluginListener } from '../../core';
import type { ListenerOptions } from '../../core';

/** Plugin methods plus `isPluginAvailable`. */
export const useAudioRecorder = createMethodsHook('AudioRecorder', AudioRecorder, [
  'cancelRecording',
  'getRecordingStatus',
  'pauseRecording',
  'resumeRecording',
  'startRecording',
  'stopRecording',
  'checkPermissions',
  'requestPermissions',
]);

/** Audio recording permission status with imperative `check` and `request`. */
export const useAudioRecorderPermissions = createPermissionsHook(AudioRecorder);

/**
 * Invokes `callback` whenever an error occurs during a recording. The recording
 * is cancelled in that case.
 *
 * Only available on iOS.
 */
export function useRecordingError(
  callback: (event: RecordingErrorEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AudioRecorder, 'recordingError', callback, options);
}

/**
 * Invokes `callback` whenever the recording is paused, for example when it is
 * interrupted by a phone call.
 */
export function useRecordingPaused(callback: () => void, options?: ListenerOptions): void {
  usePluginListener(AudioRecorder, 'recordingPaused', callback, options);
}

/**
 * Invokes `callback` whenever the recording is resumed, for example after an
 * audio session interruption ended.
 */
export function useRecordingResumed(callback: () => void, options?: ListenerOptions): void {
  usePluginListener(AudioRecorder, 'recordingResumed', callback, options);
}

/**
 * Invokes `callback` whenever the recording is stopped. Cancelled and paused
 * recordings as well as recording errors do not emit this event.
 */
export function useRecordingStopped(
  callback: (event: RecordingStoppedEvent) => void,
  options?: ListenerOptions,
): void {
  usePluginListener(AudioRecorder, 'recordingStopped', callback, options);
}
