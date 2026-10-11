import type { ReactNode } from 'react';

/** Ported from frontend/src/pages/landing/sections/shared.tsx — same max-width/gutters as the rest of the product. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}
