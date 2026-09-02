'use client';
import { useEffect, useRef } from 'react';

/**
 * A FIGURE THAT GETS WRITTEN INTO A FIELD
 * ==================================================================
 * `Count` eases a number to its new value, which is right for a figure that
 * ANSWERED — a balance that moved, an estimate that recomputed. It is wrong for
 * the contents of an input, and on a ten-glyph figure it is worse than wrong:
 * easing `0` to `6635.616976` scrambles every digit at once for the length of
 * the trip, and what a reader sees is not a number arriving, it is noise.
 *
 * A field gets FILLED, one character at a time, left to right. That is what the
 * gesture did — the balance was tapped and the amount went in — and it is the
 * only version of it a reader can follow, because at any frame there is exactly
 * one new glyph to notice rather than ten changed ones.
 *
 * NOBODY IS TYPING. This is not a keypad and there is no caret: on a phone with
 * no keyboard on screen a blinking bar is a cursor belonging to an input nobody
 * is in. The writing is the app filling the field, which is what happened.
 *
 * Writes to the DOM on its own frame loop and never re-renders React — the same
 * split `Count` uses, and for the same reason.
 */
export function Typed({
  text, per = 55, className,
}: {
  text: string;
  /** milliseconds a glyph. 55 is ~600ms for an eleven-digit balance. */
  per?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (shown.current === text) { el.textContent = text; return; }

    /* A HIDDEN TAB HAS NO ANIMATION FRAMES, and this one clears the field
       before it fills it — so on a page in a background tab the amount would
       sit EMPTY until somebody looked at it. `Count` never had this exposure:
       React's own render leaves the final figure in the node and the trip only
       overwrites it. Same rule for reduced motion, which wants no trip at all. */
    if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = text;
      el.textContent = text;
      return;
    }

    /* FROM WHAT THE TWO STRINGS ALREADY AGREE ON. Retyping `6635.61697` to add
       a `6` would rewrite eleven glyphs to change one; the field only writes
       the part that is actually new. */
    let keep = 0;
    while (keep < text.length && keep < shown.current.length
           && text[keep] === shown.current[keep]) keep++;

    let raf = 0;
    let t0 = 0;
    const total = text.length - keep;
    el.textContent = text.slice(0, keep);

    raf = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      const n = Math.min(total, Math.floor((now - t0) / per) + 1);
      el.textContent = text.slice(0, keep + n);
      if (n < total) raf = requestAnimationFrame(step);
      else shown.current = text;
    });
    return () => cancelAnimationFrame(raf);
  }, [text, per]);

  return <span className={className} ref={ref}>{text}</span>;
}
