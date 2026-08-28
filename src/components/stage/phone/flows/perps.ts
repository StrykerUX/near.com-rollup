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
};

/** The entry the position opens at. The chart draws its line at this price. */
export const ENTRY = 79654;
export const SUBMIT_STEPS = ['Set leverage', 'Submit order'];

const beats: Beat<PerpsState>[] = [
  /* the market, as you find it */
  { w: 4, set: { screen: 'flat' } },
  /* sizing */
  /* w:2, not 1 — a beat narrower than a wheel notch is a beat nobody sees,
     and this one is the only thing that says the amount was typed */
  { w: 2, set: { screen: 'ticket', focus: 'amount', amount: '7', pressed: '7' } },
  { w: 3, set: { amount: '700', pressed: null } },
  /* protection */
  { w: 3, set: { protect: true, focus: 'tp', tp: '82000' } },
  /* the stop loss that will not do */
  { w: 3, set: { focus: 'sl', sl: '799' } },
  { w: 3, set: { sl: '79980' } },
  /* submit */
  { w: 2, set: { screen: 'submitting', focus: null, step: 0 } },
  { w: 2, set: { step: 1 } },
  { w: 1, set: { step: 2 } },
  /* and it holds here while the card leaves */
  { w: 5, set: { screen: 'position' } },
];

export const perpsScript: Script<PerpsState> = {
  initial,
  beats,
  /* the open position: the only frame with both the chart and the outcome */
  restFrame: beats.length - 1,
};

/** A stop loss above the entry is the error the real app raises. */
export const slInvalid = (sl: string) => sl !== '' && Number(sl) < 1000;
