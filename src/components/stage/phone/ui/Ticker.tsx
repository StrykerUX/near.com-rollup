'use client';
import { useEffect, useRef } from 'react';

/**
 * A FIGURE THAT WILL NOT SIT STILL
 * ==================================================================
 * The single biggest reason a mocked app screen reads as a screenshot is that
 * every number on it is frozen. Real ones are never frozen: a price re-quotes,
 * an unrealized P&L breathes, a vault's TVL creeps. Nothing dramatic — the
 * amplitudes here are small on purpose — but the difference between "moves a
 * little" and "does not move" is the difference between a product and a poster.
 *
 * It writes to the DOM on its own interval and never re-renders React. That is
 * the same split the stage engine uses one level up, and it matters more here:
 * four of these on screen re-rendering their parents would be four component
 * trees rebuilt for a changing digit.
 */

export type TickerProps = {
  base: number;
  /** peak drift either side of `base` */
  amp: number;
  /** decimal places */
  dp?: number;
  prefix?: string;
  suffix?: string;
  /** thousands grouping — off for prices already quoted with them */
  group?: boolean;
  /** ms between re-quotes; the walk interpolates between them */
  every?: number;
  /** flash green on a rise and red on a fall, the way a tape does */
  flash?: boolean;
  /** only ticks while its card is on stage */
  live?: boolean;
  className?: string;
};

/** deterministic value noise, so the walk is smooth rather than jittery */
function noise(t: number, seed: number) {
  const a = Math.sin(t * 1.7 + seed) * 0.6;
  const b = Math.sin(t * 0.61 + seed * 2.3) * 0.3;
  const c = Math.sin(t * 3.3 + seed * 0.7) * 0.1;
  return a + b + c;
}

let seedCounter = 0;

export function Ticker({
  base, amp, dp = 2, prefix = '', suffix = '', group = true,
  every = 1400, flash = false, live = true, className,
}: TickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const seed = useRef(++seedCounter * 1.618);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmt = (v: number) =>
      prefix +
      (group
        ? v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
        : v.toFixed(dp)) +
      suffix;

    if (reduce || !live) {
      el.textContent = fmt(base);
      return;
    }

    let raf = 0;
    let t0 = 0;
    let shown = base;
    let target = base;
    let nextQuote = 0;

    raf = requestAnimationFrame(function step(now) {
      raf = requestAnimationFrame(step);
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      /* a new quote every `every` ms; between them the figure eases toward it,
         so the number travels rather than jumping */
      if (now - t0 >= nextQuote) {
        nextQuote += every;
        target = base + noise(t, seed.current) * amp;
      }
      const prev = shown;
      shown += (target - shown) * 0.08;
      const next = fmt(shown);
      if (el.textContent === next) return;
      el.textContent = next;
      if (flash) {
        el.classList.remove('tk-up', 'tk-dn');
        /* reading offsetWidth restarts the animation; without it a run of rises
           only flashes once */
        void el.offsetWidth;
        el.classList.add(shown >= prev ? 'tk-up' : 'tk-dn');
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [base, amp, dp, prefix, suffix, group, every, flash, live]);

  /* the server renders the resting value, so there is nothing to hydrate around */
  const initial =
    prefix +
    (group
      ? base.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
      : base.toFixed(dp)) +
    suffix;

  return <span className={className} ref={ref}>{initial}</span>;
}
