import type { Act } from '@/components/stage/phone/flows/machine';
import { CATALOGUE, assetOf, type Asset } from './catalogue';
import { HOLDINGS, type Holding } from '@/components/demo/ownv5/state';

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
 * Tether in the top field because the reader tapped it on the home screen. Cutting
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
 * The screen does not open on an empty form — it opens on one that already
 * knows half of what it needs, because the reader answered that half by
 * tapping an asset a screen ago. IT IS TETHER BECAUSE THAT IS WHAT THE WALLET
 * HOLDS: the account chapter ends on the Tether row's Swap action, and a form
 * offering to spend a Bitcoin that is not in the assets list is the two
 * chapters contradicting each other on the same scroll.
 */
export const FROM = 'USDT';

/** the wallet's whole Tether position, to the decimal the frame prints */
export const FROM_BAL = 6635.616976;

/** what gets typed, digit by digit, into the amount field */
export const AMOUNT = '2500';

/**
 * WHERE IT ENDS UP, which is not where it starts.
 *
 * The screen opens with ZEC already in the destination — the app holds the last
 * pair rather than an empty field, and the reference frame shows exactly that.
 * The picker then does what this chapter is for: it opens over a destination
 * that is already valid, which is the honest version of the argument. A picker
 * you only ever see because the form cannot proceed without it is a required
 * step; one you open with a working answer already in the field is a choice,
 * and "swap anything, anywhere" is a claim about choice.
 */
export const START_TO = 'ZEC';
export const TO = 'NEAR';

/**
 * The spread the quote is shown net of. `demo/swap/state.ts` reads 0.50% off
 * its review sheet; the same number, because it is the same product and this
 * screen has no frame of its own to quote.
 */
export const SLIPPAGE = 0.005;

/** the settlement, read off `rec-Swap.MP4` */
export const SWAP_STEPS = ['Finding best price', 'Executing trade', 'Trade complete'];

/* ---- what is actually in the picker ---------------------------------- */

/**
 * THE PICKER IS NOT ONE LIST, and drawing it as one was the whole miss.
 *
 * The app opens it on the wallet: `Your tokens` first, with a dollar figure and
 * a quantity on each row, because the thing you are most likely to want is
 * something you already hold. Then an `All / RWA (Beta)` tab row, then
 * `More tokens` and the catalogue. A flat twenty-seven-row list says the app
 * has a lot of assets; this says the app knows which ones are yours.
 *
 * YOUR TOKENS IS THE ACCOUNT CHAPTER'S OWN WALLET, imported rather than
 * retyped. It is the same three holdings the assets screen lists two faces
 * earlier on the same scroll, and a picker quoting different quantities than
 * the screen the reader just came from is the kind of contradiction that only
 * ever gets noticed by the person you were trying to convince.
 */
const MINE = new Set(HOLDINGS.map((h) => h.sym));

/**
 * AND NEAR IS DELIBERATELY DOWN THE LIST.
 *
 * The catalogue's own order would put it third, one flick from the top, and a
 * picker that finds what it wants immediately has not shown you anything. The
 * point of this scene is that there is more every time you look, so the list
 * leads with the current destination and the assets a reader recognises, and
 * NEAR sits ninth — far enough that getting to it means passing eight coins
 * you did not come for, which is the argument.
 */
const HEAD_ORDER = ['ZEC', 'BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'DOGE', 'ADA', 'NEAR'];
const MORE: Asset[] = [
  ...HEAD_ORDER.map((sym) => CATALOGUE.find((a) => a.sym === sym)!),
  ...CATALOGUE.filter((a) => !MINE.has(a.sym) && !HEAD_ORDER.includes(a.sym)),
];

export type PickRow =
  | { kind: 'head'; text: string }
  | { kind: 'tabs' }
  | { kind: 'own'; h: Holding }
  | { kind: 'asset'; a: Asset };

/** each kind's height, and the scroll is computed from these rather than measured */
export const PICK_H: Record<PickRow['kind'], number> = { head: 34, tabs: 52, own: 58, asset: 54 };

export const PICK_ROWS: PickRow[] = [
  { kind: 'head', text: 'Your tokens' },
  ...HOLDINGS.map((h) => ({ kind: 'own', h }) as PickRow),
  { kind: 'tabs' },
  { kind: 'head', text: 'More tokens' },
  ...MORE.map((a) => ({ kind: 'asset', a }) as PickRow),
];

/** how far the track has travelled when row `i` is at the top */
export const pickOffset = (i: number) =>
  PICK_ROWS.slice(0, Math.max(0, i)).reduce((t, r) => t + PICK_H[r.kind], 0);

export const PICK_TOTAL = pickOffset(PICK_ROWS.length);

/**
 * HOW FAR THE PICKER TRAVELS, as indices into PICK_ROWS.
 *
 * Three stops rather than one glide: the eye reads one continuous move as one
 * fact, and three read as someone looking. Down past the wallet, into the
 * catalogue, and on until the row it came for comes into view — which with NEAR
 * ninth means eight other coins go past on the way. The first stop is 5 rather
 * than 0: the picker RESTS on `Your tokens` before it moves, because a wallet
 * section nobody sees is a wallet section that may as well not be there. `check:flows` walks these
 * as ordinary beats; that NEAR is actually on screen at the last one is checked
 * against the rendered device rather than against this file.
 */
export const STOPS = [5, 9, 12];

export type SV = {
  /** one screen, and it is the swap. Named so `check:flows` prints a walk. */
  screen: 'swap';

  from: string;
  /** never empty on this cut — it opens on the last pair, and the picker
      changes it rather than filling it */
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
  to: START_TO,
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

/* the source's own price, whatever the source is — it was hard-wired to the
   perps mark for as long as the source could only be Bitcoin */
export const fromPrice = () => assetOf(FROM).price ?? 1;
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
