// @vitest-environment node
// Importing any module of this package must be side-effect-free in a server
// environment: no browser API access at module scope.

describe('SSR safety', () => {
  it('imports the root entry without a DOM', async () => {
    const module = await import('../src/index');
    expect(typeof module.captureLaunchEvents).toBe('function');
  });

  it('imports plugin modules without a DOM', async () => {
    const module = await import('../src/capacitor/network');
    expect(typeof module.useNetworkStatus).toBe('function');
  });
});
