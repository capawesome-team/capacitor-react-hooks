import { renderHook } from '@testing-library/react';

import { useAccessibilityPreferences } from '../../src/capawesome/accessibility-preferences';
import { StrictModeWrapper } from '../strict-mode';

const preferences = {
  fontScale: 1.5,
  isBoldTextEnabled: true,
  isHighContrastEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: true,
  isReduceTransparencyEnabled: null,
};

vi.mock('@capawesome/capacitor-accessibility-preferences', async () => {
  const { createFakePlugin } = await import('../harness');
  const fake = createFakePlugin();
  fake.plugin.getPreferences = vi.fn(async () => preferences);
  return { AccessibilityPreferences: fake.plugin };
});

describe('capawesome/accessibility-preferences', () => {
  it('useAccessibilityPreferences exposes the plugin methods', async () => {
    const { result } = renderHook(() => useAccessibilityPreferences(), {
      wrapper: StrictModeWrapper,
    });
    await expect(result.current.getPreferences()).resolves.toEqual(preferences);
  });
});
