import type { Beat, Script } from './player';

/**
 * PERPS — size a long, get the stop loss wrong, fix it, open the position.
 *
 * The bad stop loss is deliberate: a form that only ever succeeds shows nothing
 * about the product, and "Stop loss must be below entry price" is the moment
 * this screen stops looking like a picture of an app.
 */
export type PerpsState = {
  screen: 'flat' | 'ticket' | 'submitting' | 'position';
  side: 'long' | 'short';
  amount: string;
  leverage: string;
  protect: boolean;
  tp: string;
  sl: string;
  /** which field the keypad is attached to */
  focus: 'amount' | 'tp' | 'sl' | null;
  /** lights one key, so a filled field reads as typed rather than pasted */
  pressed: string | null;
  /** index into the submit checklist */
  step: number;
  /**
   * Which control the flow just "pressed". Without it a state simply differs
   * between two frames and nothing connects them, which is how a slideshow of
   * screenshots reads.
   */
  tap: string | null;
};

const initial: PerpsState = {
  screen: 'flat',
  side: 'long',
  amount: '',
  leverage: '20x',
  protect: false,
  tp: '',
  sl: '',
  focus: null,
  pressed: null,
  step: 0,
  tap: null,
};

/** The entry the position opens at. The chart draws its line at this price. */
export const ENTRY = 79654;
export const SUBMIT_STEPS = ['Set leverage', 'Submit order'];

const beats: Beat<PerpsState>[] = [
  /* the market, as you find it */
  { ms: 2200, set: { screen: 'flat' } },
  /* sizing */
  /* A press and the screen it opens are TWO beats. Collapsed into one, the
     control that was tapped unmounts on the same frame it lights up — the
     press is never seen and the two screens read as unrelated slides. */
  { ms: 190, set: { tap: 'long' } },
  /* short and sharp: the only beat that says the amount was typed */
  { ms: 300, set: { screen: 'ticket', focus: 'amount', amount: '7', pressed: '7', tap: null } },
  { ms: 1200, set: { amount: '700', pressed: null, tap: null } },
  /* protection */
  { ms: 1700, set: { protect: true, focus: 'tp', tp: '82000', tap: 'protect' } },
  /* the stop loss that will not do */
  { ms: 2100, set: { focus: 'sl', sl: '799', tap: null } },
  { ms: 1500, set: { sl: '79980' } },
  /* submit */
  { ms: 280, set: { tap: 'open' } },
  { ms: 950, set: { screen: 'submitting', focus: null, step: 0, tap: null } },
  { ms: 1050, set: { step: 1 } },
  { ms: 700, set: { step: 2 } },
  /* and it holds here while the card leaves */
  { ms: 3800, set: { screen: 'position' } },
];

export const perpsScript: Script<PerpsState> = {
  initial,
  beats,
  /* the open position: the only frame with both the chart and the outcome */
  restFrame: beats.length - 1,
};

/** A stop loss above the entry is the error the real app raises. */
export const slInvalid = (sl: string) => sl !== '' && Number(sl) < 1000;
