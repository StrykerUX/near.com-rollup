import { clamp } from '@/lib/math';

type Tweened = HTMLElement & { __nv?: number; __raf?: number };

/**
 * Numbers EASE to their new value instead of hard-swapping — ~380ms on the same
 * formatter and the same tabular-nums, so nothing reflows, only the digits roll.
 *
 * The first write is instant (no tween up from nothing on load), and
 * reduced-motion gets the old snap. Imperative by necessity: the elements this
 * drives are contentEditable, and re-rendering one while it holds the caret
 * clobbers the user's input mid-keystroke.
 */
export function setNum(
  el: HTMLElement | null,
  value: number,
  format: (v: number) => string,
  reduce = false,
) {
  if (!el) return;
  const e = el as Tweened;
  if (reduce || e.__nv === undefined || e.__nv === value) {
    e.__nv = value;
    e.textContent = format(value);
    return;
  }
  const from = e.__nv;
  const t0 = performance.now();
  e.__nv = value;
  if (e.__raf) cancelAnimationFrame(e.__raf);
  const step = (now: number) => {
    let k = clamp((now - t0) / 380, 0, 1);
    k = 1 - Math.pow(1 - k, 3);
    e.textContent = format(from + (value - from) * k);
    if (k < 1) e.__raf = requestAnimationFrame(step);
  };
  step(t0);
}

/** Tell the tween its base without animating — used when the user types. */
export function seedNum(el: HTMLElement | null, value: number) {
  if (el) (el as Tweened).__nv = value;
}
