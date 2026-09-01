import type { Act } from '@/components/stage/phone/flows/machine';
import { BTC_PRICE, CATALOGUE, assetOf } from './catalogue';

/**
 * SWAP, THE SHORT CUT — the figures and the machine
 * ==================================================================
 * A FOURTH machine, and its own for the same reason `demo/perpsv5` needed one.
 * `demo/swap/state.ts` is the whole recording: three screens (account, assets,
 * swap), a confidential/main balance split, a token-actions sheet, and a vault
 * deposit running alongside the swap as a second story. It bakes `from: USDT`
 * into its initial state and derives its wallet from `START`.
 *
 * This cut is one screen and one gesture: the swap page, already loaded, with
 * BTC in the top field because the reader tapped it on the home screen. Cutting
 * the long machine down to that would have meant carrying four screens' worth
 * of fields through a flow that shows one.
 *
 * WHAT IT KEEPS is the shape every machine here keeps — named pure
 * transitions, guards that refuse, a `tap` that says which control was pressed
 * — so `pnpm check:flows` walks it exactly as it walks the other four.
 */

/* ---- the figures ------------------------------------------------------ */

/**
 * THE SOURCE IS ALREADY CHOSEN, and that is the first thing this screen says.
 *
 * The brief is explicit: BTC is pre-filled in the top field FROM THE HOME
 * SCREEN TAP. So the screen does not open on an empty form — it opens on a
 * form that already knows half of what it needs, because the reader answered
 * that half by tapping an asset a screen ago. The destination sits empty and
 * waiting, which is the only thing left to say.
 */
export const FROM = 'BTC';

/** what the wallet holds of it — 0.25 is a quarter of it, which is why it fits */
export const FROM_BAL = 0.75;

/** what gets typed, digit by digit, into the amount field */
export const AMOUNT = '0,25';

/**
 * WHERE IT LANDS. The recording swaps into NEAR and the brief does not name a
 * destination, so this takes the one the app's own recording chose.
 */
export const TO = 'NEAR';

/**
 * The spread the quote is shown net of. `demo/swap/state.ts` reads 0.50% off
 * its review sheet; the same number, because it is the same product and this
 * screen has no frame of its own to quote.
 */
export const SLIPPAGE = 0.005;

/** the settlement, read off `rec-Swap.MP4` */
export const SWAP_STEPS = ['Finding best price', 'Executing trade', 'Trade complete'];

/**
 * HOW FAR THE PICKER TRAVELS, as row indices.
 *
 * The brief asks for a long list, scrolled, showing at least the top
 * twenty-five. A single glide to the bottom would show that the list is long
 * and nothing else — the eye reads one continuous move as one fact. Three
 * stops read as someone looking: down, further, and back up to the row they
 * had already seen and wanted.
 */
export const STOPS = [9, 19, 3];

export type SV = {
  /** one screen, and it is the swap. Named so `check:flows` prints a walk. */
  screen: 'swap';

  from: string;
  /** empty and waiting — the whole point of the opening frame */
  to: string | null;
  amount: string;

  /** the destination picker */
  picker: boolean;
  /** which row the picker has scrolled to; 0 is the top */
  at: number;

  focus: 'amount' | null;
  pressed: string | null;

  /* settlement */
  submitting: boolean;
  step: number;
  done: boolean;

  tap: string | null;
};

export const initial: SV = {
  screen: 'swap',
  from: FROM,
  to: null,
  amount: '',
  picker: false,
  at: 0,
  focus: 'amount',
  pressed: null,
  submitting: false,
  step: -1,
  done: false,
  tap: null,
};

/* ---- derived, all of it ---------------------------------------------- */

export const fromPrice = () => BTC_PRICE;
export const toPrice = (s: SV) => (s.to ? assetOf(s.to).price ?? 1 : 0);

/** what the amount is worth, which is the only figure both sides agree on */
export const usd = (s: SV) => (Number(s.amount) || 0) * fromPrice();
/** and what that buys, before the spread */
export const out = (s: SV) => (s.to ? usd(s) / toPrice(s) : 0);
export const least = (s: SV) => out(s) * (1 - SLIPPAGE);
/** the rate row: one of the source in units of the destination */
export const rate = (s: SV) => (s.to ? fromPrice() / toPrice(s) : 0);

/**
 * WHAT THE PRIMARY BUTTON SAYS, which is how the form reports itself. Three
 * refusals in the order a reader meets them: nothing typed, nothing chosen,
 * more than the wallet holds.
 */
export function cta(s: SV): { label: string; ok: boolean } {
  if (!(Number(s.amount) > 0)) return { label: 'Enter amount', ok: false };
  if (!s.to) return { label: 'Select a token', ok: false };
  if (Number(s.amount) > FROM_BAL) return { label: 'Insufficient balance', ok: false };
  return { label: 'Review swap', ok: true };
}

/* ---- the transitions -------------------------------------------------- */

export type SVAction =
  | 'focus' | 'key' | 'done'
  | 'picker' | 'closePicker' | 'scroll' | 'pick'
  | 'confirm' | 'step';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

export const actions: Record<SVAction, Act<SV>> = {
  focus: (s, v) => (s.submitting ? null : { focus: (v ?? null) as SV['focus'], pressed: null, tap: null }),
  key: (s, d) => {
    if (!s.focus || !d || s.picker || s.submitting) return null;
    return { amount: digits(s.amount, d), pressed: d, tap: null };
  },
  /** the ✓ on the accessory bar — the app's real way out of a numeric field */
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),

  picker: (s) => (s.picker || s.submitting ? null : { picker: true, at: 0, focus: null, tap: 'to' }),
  closePicker: (s) => (s.picker ? { picker: false, tap: null } : null),
  /**
   * The list moves as a whole rather than a row at a time. A demo that steps a
   * highlight down twenty-five rows is showing a keyboard; a list that travels
   * is showing a list, which is what a reader is being asked to believe is
   * long.
   */
  scroll: (s, v) => {
    if (!s.picker) return null;
    const at = Math.max(0, Math.min(CATALOGUE.length - 1, Math.round(Number(v))));
    return Number.isFinite(at) && at !== s.at ? { at, tap: 'list' } : null;
  },
  pick: (s, v) => {
    if (!s.picker || !v || !CATALOGUE.some((a) => a.sym === v)) return null;
    /* picking the token you are spending is the one choice the picker refuses:
       a swap from a thing into itself is not a trade */
    if (v === s.from) return null;
    return { to: v, picker: false, at: 0, tap: 'pick:' + v };
  },

  confirm: (s) => (s.submitting || !cta(s).ok ? null : { submitting: true, step: 0, focus: null, tap: 'confirm' }),
  /**
   * THE CHECKLIST TICKS, AND STOPS WHEN THERE IS NOTHING LEFT TO TICK.
   *
   * Same shape as `/demo/perps-v5`'s `ostep`, and for the same reason it was
   * fixed there: it runs one PAST the last row so every row reads as done
   * while the sheet is still up. A settlement whose last line is still
   * spinning when the screen changes is a settlement nobody saw finish.
   */
  step: (s) => {
    if (!s.submitting) return null;
    if (s.step < SWAP_STEPS.length) return { step: s.step + 1 };
    return s.done ? null : { done: true, tap: null };
  },
};
