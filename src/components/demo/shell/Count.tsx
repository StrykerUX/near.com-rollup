'use client';
import { useEffect, useRef } from 'react';

/**
 * A FIGURE THAT TRAVELS TO ITS NEW VALUE
 * ==================================================================
 * Every number on these screens is derived, so when leverage goes from 10x to
 * 20x four figures change in the same frame. Correct, and unreadable: the eye
 * gets no chance to see WHICH of them moved, so the screen reads as having been
 * replaced rather than as having recomputed.
 *
 * Easing them there is not decoration. It is what makes the causal link between
 * the control that was touched and the numbers that answered visible at all.
 *
 * Writes to the DOM on its own frame loop and never re-renders React — the same
 * split `Ticker` uses one level up, and for the same reason.
 */
export function Count({
  value, dp = 0, prefix = '', suffix = '', group = true, trim = false, trunc = false,
  ms = 520, className,
}: {
  value: number;
  dp?: number;
  prefix?: string;
  suffix?: string;
  group?: boolean;
  /**
   * Cut the extra decimals off rather than rounding them in.
   *
   * An amount field is not a calculator: the app prints `3535.799` for a figure
   * whose next digit is a 7, which a rounding would have shown as `3535.800`.
   * It is the same habit the account chapter's total has, documented at
   * `crypto()` there — and a demo that rounds where the app truncates is a demo
   * that is one digit off in exactly the number a reader would check.
   */
  trunc?: boolean;
  /**
   * Drop trailing zeros, and the point with them if nothing survives it.
   *
   * A QUANTITY OF A TOKEN IS NOT A PRICE. `$6,612.00` is right and
   * `3535.799000` is not — the app prints six decimals when there are six to
   * print and three when there are three, because the zeroes are claiming a
   * precision the figure does not have. `dp` stays the CEILING; this is what
   * happens underneath it.
   */
  trim?: boolean;
  /** how long the trip takes */
  ms?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  const fmt = (raw: number) => {
    const k = 10 ** dp;
    const v = trunc ? Math.trunc(raw * k) / k : raw;
    const body = group
      ? v.toLocaleString('en-US', {
          minimumFractionDigits: trim ? 0 : dp,
          maximumFractionDigits: dp,
        })
      : trim
        ? v.toFixed(dp).replace(/\.?0+$/, '')
        : v.toFixed(dp);
    return prefix + body + suffix;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    if (from === value) {
      el.textContent = fmt(value);
      return;
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = value;
      el.textContent = fmt(value);
      return;
    }

    let raf = 0;
    let t0 = 0;
    raf = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / ms);
      /* ease-out: a figure that decelerates into its value reads as arriving,
         where a linear one reads as a counter being spun */
      const e = 1 - Math.pow(1 - p, 3);
      shown.current = from + (value - from) * e;
      el.textContent = fmt(shown.current);
      if (p < 1) raf = requestAnimationFrame(step);
      else shown.current = value;
    });
    return () => cancelAnimationFrame(raf);
    /* `fmt` closes over the format props; they do not change for a given
       figure on these screens, and listing it would restart the trip on every
       parent render */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ms]);

  return <span className={className} ref={ref}>{fmt(value)}</span>;
}
