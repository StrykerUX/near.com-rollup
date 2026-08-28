/**
 * THE STAGE SCHEDULE
 * ------------------------------------------------------------------
 * One number in — scroll position through #stage, normalised 0..1 — and the
 * whole composition out. This module owns the mapping.
 *
 * The bands are written as WEIGHTS, not fractions, and normalised below. That
 * way one band can be retuned on its own: raise a weight and the stage grows
 * to pay for it, instead of the change being silently taken out of its
 * neighbours.
 *
 * The stage's CSS height (588vh) and these weights are a matched pair. Change
 * one and the last trigger runs off the end of the sticky.
 */

/** Perps, Account, Swap, Earn. */
export const N = 4;

/**
 * The phone is on screen from the first pixel, so there is no hero band and no
 * entry travel — the stage opens on Perps, landed. Both weights are kept at
 * zero rather than deleted so the band structure below stays readable and the
 * -1 ("nothing on stage") path is still reachable if they are ever restored.
 */
const W_HERO = 0;
const W_ENTRY = 0;
/** THE DWELL DIAL. Identical for all four cards, by construction. */
const W_REST = 8.0;
const W_MOVE = 14.0;
/** 50% more scroll to close the box than the cards get to change. */
const W_SHRINK = 15.0;

const W_TOT = W_HERO + W_ENTRY + N * W_REST + (N - 1) * W_MOVE + W_SHRINK;

export const SCH_HERO = W_HERO / W_TOT;
export const SCH_ENTRY = W_ENTRY / W_TOT;
export const SCH_REST = W_REST / W_TOT;
export const SCH_MOVE = W_MOVE / W_TOT;
export const SCH_CYC = SCH_REST + SCH_MOVE;
/** card 0 landed */
export const SCH_LAND0 = SCH_HERO + SCH_ENTRY;

/**
 * The shrink takes whatever the schedule has not already spent, so REST and
 * MOVE can be retuned without the tail silently going out of balance.
 */
export const SHRINK_TRIG = SCH_LAND0 + (N - 1) * SCH_CYC + SCH_REST;

/** the hero ramp finishes as card 0 lands */
export const entryEnd = () => SCH_LAND0;

/**
 * Stage progress -> t, the sequence position.
 *
 *   -1        hero, card 0 parked as the peek slice
 *   -1 .. 0   card 0 travelling up into the frame
 *    0        card 0 landed, and RESTING for the width of the read band
 *    1 .. N-1 one unit per card
 *
 * Past card 0's landing the stage is a repeating [rest][move] cycle, so every
 * card gets an identical beat to be looked at before the next one starts
 * arriving. No special cases, no discontinuity.
 */
export function scrubT(p: number) {
  if (SCH_ENTRY > 0) {
    if (p <= SCH_HERO) return -1;
    if (p < SCH_LAND0) return -1 + (p - SCH_HERO) / SCH_ENTRY;
  }
  const q = p - SCH_LAND0;
  const k = Math.floor(q / SCH_CYC);
  if (k >= N - 1) return N - 1; /* last card: its rest, then the shrink */
  const r = q - k * SCH_CYC;
  return r <= SCH_REST ? k : k + (r - SCH_REST) / SCH_MOVE;
}

/**
 * The inverse, for snap and step-rail targets. An integer t resolves to the
 * START of that card's rest band, so a snap hands the reader the whole dwell
 * rather than the tail of it.
 */
export function yForT(t: number, stage: HTMLElement) {
  let p: number;
  if (t <= -1) p = SCH_HERO;
  else if (t <= 0 && SCH_ENTRY > 0) p = SCH_HERO + (t + 1) * SCH_ENTRY;
  else if (t <= 0) p = 0;
  else {
    const k = Math.floor(t);
    const fr = t - k;
    p = SCH_LAND0 + k * SCH_CYC + (fr > 0 ? SCH_REST + fr * SCH_MOVE : 0);
  }
  return Math.round(stage.offsetTop + p * (stage.offsetHeight - window.innerHeight));
}

/* ---- feel dials ------------------------------------------------------- */

/**
 * TAU is the ONE feel dial for the stage — cards, shrink and hero recede all
 * ride this single filter.
 *   0    exact tracking, no easing (steps with every wheel notch)
 *   40   ~120ms settle. Below the threshold where it reads as its own
 *        animation, still enough to blend consecutive wheel notches.
 *   130  ~390ms settle. Silky, but it reads as the UI easing into position
 *        after you have stopped.
 */
export const SCRUB_TAU = 40;

/**
 * The card and its side type share ONE clock. Kept as a named constant because
 * `pos * TEXT_TAIL` is where a future split between them would go — at 1.0 it
 * is the identity, which is the whole point of the v05 rewrite.
 */
export const TEXT_TAIL = 1.0;

/** windows inside heroOut — line 1, then "onchain,", then "privately" */
export const HW_RANGE: [number, number][] = [
  [0.0, 0.42],
  [0.13, 0.58],
  [0.27, 0.98],
];

/** windows inside the plate clock — headline, italic, supporting line */
export const PW_RANGE: [number, number][] = [
  [0.04, 0.74],
  [0.13, 0.84],
  [0.26, 0.98],
];

/** the cover surge window, read off the raw scroll */
export const T_COVER: [number, number] = [0.07, 0.42];

/* ---- snap ------------------------------------------------------------- */

/**
 * MEASURED: at 170ms the settle fired DURING an active scroll run on a slow
 * frame budget and clawed back ~2800px of the user's scrolling. 170ms is a real
 * gap between wheel events once frames get long. 260ms still reads as immediate
 * and clears any realistic inter-event gap.
 */
export const SNAP_IDLE = 260;
/** px/ms — above this they are still travelling */
export const SNAP_VMAX = 0.42;
/** how far ahead we will finish a transition for them */
export const SNAP_REACH = 0.75;
/**
 * Chromium's behavior:'smooth' runs 300-400ms on its own ease-in-out curve,
 * with no way to shorten it and no reliable way to interrupt it. For a move
 * that only ever covers a fraction of one card, that reads as the page taking
 * over. This is the same move on our own clock.
 */
export const SNAP_MS = 180;

/* ---- phone chrome ----------------------------------------------------- */

/**
 * v06 reordered the deck to Perps-first. `data-face` attributes are NOT
 * renumbered — the demo-app wiring selects on them — so these index-keyed
 * arrays are what maps a DISPLAY index onto the chrome.
 */
export const CH_TITLES = ['Perps', 'Account', 'Swap', 'Earn'] as const;
/** display index -> tab index in (Home, Earn, Swap, Perps, Menu) */
export const CH_TAB = [3, 0, 2, 1];
/** display index of the frame the jurisdiction note belongs to */
export const DISC_FACE = 0;
