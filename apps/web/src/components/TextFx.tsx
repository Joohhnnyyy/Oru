import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { Fragment, useRef, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const DEVANAGARI = /[ऀ-ॿ]/;

/** Letters for Latin text; whole words for Devanagari so conjuncts and matras never split. */
function units(text: string): string[] {
  return DEVANAGARI.test(text) ? text.split(/(\s+)/) : [...text];
}

/**
 * Hover text effect: every letter rolls up and an identical twin rolls in from below,
 * staggered left to right. Put `roll-host` on the hovered parent (button or link).
 * The visible letters are hidden from screen readers; the full text is read once.
 */
export function RollText({ text }: { text: string }) {
  return (
    <span className="inline-flex whitespace-pre">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex whitespace-pre">
        {units(text).map((u, i) => (
          <span key={`${u}-${i}`} className="roll-char" style={{ '--i': i } as CSSProperties}>
            <span>{u}</span>
            <span>{u}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Heading text that rises word by word out of a mask the first time it scrolls into view.
 * Screen readers get the plain sentence.
 */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-top">
              <motion.span
                className="inline-block"
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: delay + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}

/**
 * Scroll-linked section transition: the panel opens from an inset rounded window to full
 * size as it scrolls up into view, while its content settles from a slight zoom.
 */
export function Unmask({ children, className = '', radius = 28 }: { children: ReactNode; className?: string; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] });
  const inset = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [16, 0]);
  const zoom = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.14, 1]);
  const clipPath = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round ${radius}px)`;
  return (
    <motion.div ref={ref} style={{ clipPath }} className={`overflow-hidden ${className}`}>
      <motion.div style={{ scale: zoom }} className="h-full w-full">
        {children}
      </motion.div>
    </motion.div>
  );
}
