import { Capacitor } from '@capacitor/core';
import { useEffect, useMemo, useState } from 'react';

/**
 * Reports whether the plugin is available on the current platform.
 * `undefined` during SSR and before the first client render.
 */
export function useIsPluginAvailable(pluginName: string): boolean | undefined {
  const [isAvailable, setIsAvailable] = useState<boolean>();
  useEffect(() => {
    setIsAvailable(Capacitor.isPluginAvailable(pluginName));
  }, [pluginName]);
  return isAvailable;
}

/**
 * Creates the uniform `useX()` entry hook for a plugin: a referentially stable
 * object with the listed plugin methods plus `isAvailable`.
 */
export function createMethodsHook<TPlugin, TKeys extends keyof TPlugin>(
  pluginName: string,
  plugin: TPlugin,
  methodNames: readonly TKeys[],
): () => Pick<TPlugin, TKeys> & { isAvailable: boolean | undefined } {
  return function useMethods() {
    const methods = useMemo(() => {
      const bound = {} as Pick<TPlugin, TKeys>;
      for (const name of methodNames) {
        const member = plugin[name];
        bound[name] =
          typeof member === 'function' ? (member.bind(plugin) as TPlugin[TKeys]) : member;
      }
      return bound;
    }, []);
    const isAvailable = useIsPluginAvailable(pluginName);
    return useMemo(() => ({ ...methods, isAvailable }), [methods, isAvailable]);
  };
}
