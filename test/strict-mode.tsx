import type { ReactElement, ReactNode } from 'react';
import { StrictMode } from 'react';

export const StrictModeWrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <StrictMode>{children}</StrictMode>
);
