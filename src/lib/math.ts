/**
 * The easing vocabulary of the stage.
 *
 * These are ported verbatim from the original build. Every constant and
 * exponent here was tuned by eye against the real composition, so they are
 * data, not preference — swapping any of them for a named library easing
 * changes how the page feels.
 */

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** smoothstep between two edges */
export function sstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/** linear ramp between two edges — the honest version of sstep */
export const lin = (a: number, b: number, x: number) => clamp((x - a) / (b - a), 0, 1);

/** smoothstep on an already-normalised 0..1 input */
export const sm = (x: number) => x * x * (3 - 2 * x);

/**
 * The closing shrink. Smootherstep base — zero first AND second derivative at
 * the start, so the box truly gathers itself before moving — then a stretched
 * settle.
 */
export function easeShrink(t: number) {
  const g = t * t * t * (t * (6 * t - 15) + 10);
  return 1 - Math.pow(1 - g, 1.7);
}

/**
 * Every distinct blur radius is a fresh rasterisation. Snapping to 0.5px steps
 * cuts the number of them by an order of magnitude across a move and is not
 * visible at these radii — Safari feels the difference, Chrome doesn't care.
 */
export const qblur = (px: number) =>
  px < 0.25 ? 'none' : 'blur(' + (Math.round(px * 2) / 2) + 'px)';
