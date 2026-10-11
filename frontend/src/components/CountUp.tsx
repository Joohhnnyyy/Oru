import { useEffect, useState } from 'react';
import { useInViewOnce } from '../hooks/useInView';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/**
 * Counts up from 0 once, when first seen. Server HTML (and reduced motion) shows the final value.
 * Screen readers always get the final value; the animated digits are hidden from them.
 */
export function CountUp({ value }: { value: number }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (prefersReducedMotion() || value === 0) return;
    if (!inView) {
      setShown(0);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
