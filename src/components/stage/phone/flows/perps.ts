import type { Beat, Script } from './player';

/**
 * PERPS — the longest flow, and the one the card's headline is about.
 *
 * Fund the account, size a long, set a stop loss badly, watch the CTA refuse
 * it, fix it, open the position. The bad stop loss is deliberate: a form that
 * only ever succeeds shows nothing about the product, and "Stop loss must be
 * below entry price" is the moment this screen stops looking like a picture.
 */
export type PerpsState = {
  screen: 'flat' | 'ticket' | 'submitting' | 'position';
  side: 'long' | 'short';
  amount: string;
  leverage: string;
  protect: boolean;
  tp: string;
  sl: string;
  /** which field the keypad is currently attached to */
  focus: 'amount' | 'tp' | 'sl' | null;
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

/**
 * One beat per keystroke: a key lights, then the digit lands. Typing a whole
 * number in a single beat reads as a paste, and the keypad might as well not
 * be on screen.
 */
function type(
  field: 'amount' | 'tp' | 'sl',
  digits: string,
  from = '',
  ms = 130,
): Beat<PerpsState>[] {
  const out: Beat<PerpsState>[] = [];
  let acc = from;
  for (const d of digits) {
    acc += d;
    out.push({ ms, set: { [field]: acc, pressed: d } as Partial<PerpsState> });
    out.push({ ms: 60, set: { pressed: null } });
  }
  return out;
}

const beats: Beat<PerpsState>[] = [
  /* the screen as you find it */
  { ms: 1100, set: { screen: 'flat' } },
  /* size the trade */
  { ms: 520, set: { screen: 'ticket', focus: 'amount' } },
  ...type('amount', '700'),
  { ms: 700 },
  /* leverage */
  { ms: 620, set: { leverage: '20x' } },
  /* opt into protection */
  { ms: 560, set: { protect: true, focus: 'tp' } },
  ...type('tp', '82000'),
  { ms: 520, set: { focus: 'sl' } },
  /* the stop loss that will not do */
  ...type('sl', '799'),
  { ms: 1500 },
  /* fix it */
  { ms: 420, set: { sl: '' } },
  ...type('sl', '79980'),
  { ms: 900, set: { focus: null } },
  /* submit */
  { ms: 900, set: { screen: 'submitting', step: 0 } },
  { ms: 1100, set: { step: 1 } },
  { ms: 800, set: { step: 2 } },
  /* live */
  { ms: 3600, set: { screen: 'position' } },
  { ms: 900, set: { screen: 'flat', amount: '', tp: '', sl: '', protect: false, step: 0 } },
];

export const perpsScript: Script<PerpsState> = {
  initial,
  beats,
  /* Reduced motion gets the open position: it is the only frame that shows
     both the chart and the outcome, and it holds still. */
  restFrame: beats.length - 2,
};

/** A stop loss above the entry is the error the real app raises. */
export const slInvalid = (sl: string) => sl !== '' && Number(sl) < 1000;
