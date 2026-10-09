import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { TRUCK } from '../content/media';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Rainbow road along the bottom edge that fills as you scroll, with the recycling truck
 * driving at its leading edge. Decorative only; hidden at the very top of the page.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const left = useTransform(progress, (v) => `calc(${(v * 100).toFixed(3)}% - ${(v * 64).toFixed(2)}px)`);
  // Show once the visitor has scrolled a little past the top of the hero.
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setShown(y > 160));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <motion.img
        src={TRUCK.side}
        alt=""
        width={64}
        height={30}
        style={{ left }}
        className="loader-bump absolute bottom-1.5 h-auto w-16 drop-shadow-[0_4px_6px_rgba(29,35,48,0.25)]"
      />
      <div className="h-1.5 bg-line/50">
        <motion.div style={{ scaleX: progress }} className="rainbow h-full origin-left" />
      </div>
    </div>
  );
}

/**
 * Moves its content a little slower than the page while it crosses the viewport,
 * so images inside rounded cards feel deeper. Oversized slightly to hide the edges.
 */
export function Parallax({ children, amount = 40, className = '' }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const shift = reduced ? 0 : amount;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-shift, shift]);
  return (
    <div ref={ref} className={`h-full w-full overflow-hidden ${className}`}>
      <motion.div style={{ y, scale: 1 + (shift * 2.5) / 1000 }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Heading block that slides up from a mask the first time it enters the viewport. */
export function RiseIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
