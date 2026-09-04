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
export const FROM = 'BTC';

/** the wallet's whole Bitcoin position, from the account chapter's own list */
export const FROM_BAL = HOLDINGS.find((h) => h.sym === FROM)!.qty;

/**
 * A QUARTER OF IT, AND IT IS TYPED.
 *
 * The previous cut spent a whole Tether position and got it into the field with
 * one tap on the balance, because `6635.616976` is not a figure anyone enters
 * by hand. `0.25` is: it is four characters, it is a FRACTION of the holding
 * rather than all of it, and `Use max` is the wrong gesture for a fraction.
 * So the keypad is back for this one, and the field fills a glyph at a time
 * the way `Typed` fills it either way.
 */
export const AMOUNT = '0.25';

/**
 * WHERE IT ENDS UP, which is not where it starts.
 *
 * The screen opens with USD Coin already in the destination — the app holds the
 * last pair rather than an empty field, and the reference frame shows exactly
 * that. What the reader is here for is Zcash, which is nine rows down.
 * The picker then does what this chapter is for: it opens over a destination
 * that is already valid, which is the honest version of the argument. A picker
 * you only ever see because the form cannot proceed without it is a required
 * step; one you open with a working answer already in the field is a choice,
 * and "swap anything, anywhere" is a claim about choice.
 */
export const START_TO = 'USDC';
export const TO = 'ZEC';

/**
 * The spread the quote is shown net of. `demo/swap/state.ts` reads 0.50% off
 * its review sheet; the same number, because it is the same product and this
 * screen has no frame of its own to quote.
 */
export const SLIPPAGE = 0.005;

/**
 * THE RATE A TRADE EXECUTES AT, WHEN IT IS NOT THE PRICE THE DOLLARS USE.
 *
 * A quote fills at a spread, so the dollars in and the dollars out are not the
 * same figure — and the USDT/NEAR frame showed exactly that: $6,636 in and
 * $6,612 out, twenty-four dollars that could not exist while one price served
 * both sides. `quoteOf` still carries that idea and this table is where a
 * measured spread goes.
 *
 * IT IS EMPTY, AND THAT IS THE POINT. This cut swaps Bitcoin into Zcash and no
 * frame anywhere quotes that pair, so there is no spread to read — the two
 * dollar figures are equal, which is honest, and a number invented to make
 * them differ would be a spread pretending to have been observed.
 */
export const QUOTE: Record<string, number> = {};

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
 * AND NOTHING YOU ALREADY HOLD IS IN THE CATALOGUE TWICE.
 *
 * `Your tokens` is the wallet and `More tokens` is everything else, so the head
 * of the second list has to skip the five the first one has. It listed ZEC,
 * BTC and NEAR before now, from a wallet that held none of them.
 */
const HEAD_ORDER = ['ETH', 'XRP', 'SOL', 'BNB', 'DOGE', 'ADA', 'TRX', 'LINK', 'AVAX']
  .filter((sym) => !MINE.has(sym));
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
 * HOW FAR THE PICKER TRAVELS, as indices into PICK_ROWS — AND WHERE IT ENDS UP.
 *
 * Down past the wallet, into the catalogue, and then BACK TO THE TOP, because
 * the token this trade is for turned out to be one the account already holds.
 * Zcash is the fourth row of `Your tokens`, four rows from where the sheet
 * opened, and the scroll goes looking anyway — which is the truer version of
 * the argument this scene was always making. It used to end nine rows down on
 * NEAR, from a wallet that held no NEAR; now the list is long, the reader sees
 * that it is long, and the answer was in their own five the whole time.
 *
 * TWO STOPS, AND IT WAS THREE. `[5, 9, 0]` rested on the wallet, stepped into
 * the catalogue, then came home — three moves, and on screen they read as
 * three cuts rather than as one person scrolling. Each was short (266px, then
 * 198), each was over in 380ms, and the eye had barely started following one
 * before the next began.
 *
 * One move down and one move back is the same argument in the shape a thumb
 * actually makes: a flick, a look, and a flick back. It goes to 8 rather than
 * 9 so the `More tokens` heading lands at the top — the reader is not just
 * further down a list, they are in a different and much longer section of it,
 * which is the fact this scene exists to deliver. And the wallet is still
 * rested on: it is what the sheet OPENS on, held for the 1,200ms before
 * anything moves, so it no longer needs a stop of its own to be seen.
 *
 * The travel itself is 620ms now against 380 — see `.swlist` in
 * 26-demo-swap-v5.css. A longer list travelled in one go has to take longer,
 * or "smoother" just means the same jump with fewer of them.
 *
 * `check:flows` walks these as ordinary beats; that ZEC is actually on screen
 * at the last one is checked against the rendered device rather than against
 * this file.
 */
export const STOPS = [8, 0];

export type SV = {
  /**
   * TWO SCREENS, AND THE FIRST IS THE ACCOUNT.
   *
   * It was one — the swap page, already loaded — which is a chapter that opens
   * with no account of how anybody got there. The app reaches it from the tab
   * bar, so this cut does too: the home screen the other two chapters open on,
   * and a press on `Swap` down at the bottom. `Swap again` at the end returns
   * here, which is also what closes the loop.
   */
  screen: 'home' | 'swap';

  from: string;
  /** never empty on this cut — it opens on the last pair, and the picker
      changes it rather than filling it */
  to: string | null;
  amount: string;

  /** the destination picker */
  picker: boolean;
  /** the review sheet, between the form and the settlement */
  review: boolean;
  /** which row the picker has scrolled to; 0 is the top */
  at: number;

  focus: 'amount' | null;
  pressed: string | null;
  /** the control being held down — see the note in 24-demo-app.css */
  lit: string | null;

  /* settlement */
  submitting: boolean;
  step: number;
  done: boolean;

  tap: string | null;
};

export const initial: SV = {
  screen: 'home',
  from: FROM,
  to: START_TO,
  amount: '',
  picker: false,
  review: false,
  at: 0,
  focus: 'amount',
  pressed: null,
  lit: null,
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

/**
 * what this trade fills at. Falls back to spot for the pairs this cut has no
 * quote for — the resting USDT/ZEC opening frame is one of them, and a made-up
 * spread on a pair with no frame behind it is a number pretending to be read.
 */
export const quoteOf = (s: SV) => (s.to ? QUOTE[s.to] ?? toPrice(s) : 0);

/** what the amount is worth — at SPOT, which is what a dollar figure means */
export const usd = (s: SV) => (Number(s.amount) || 0) * fromPrice();
/** and what that buys, AT THE QUOTE, which is where the spread lives */
export const out = (s: SV) => (s.to ? usd(s) / quoteOf(s) : 0);
/** what those come back to at spot — the smaller of the two dollar figures */
export const outUsd = (s: SV) => out(s) * toPrice(s);
export const least = (s: SV) => out(s) * (1 - SLIPPAGE);
/**
 * THE RATE ROW, AND IT IS QUOTED IN WHICHEVER DIRECTION GIVES A NUMBER ≥ 1.
 *
 * It was fixed at "one of the thing you are BUYING, in units of the thing you
 * are spending" — `1 NEAR = 1.87669 USDT` — because on that pair the inverse,
 * `1 USDT = 0.53 NEAR`, is the same fact stated so nobody can hold it. The
 * rule was right and the reason was wrong: what makes a rate readable is not
 * which side it is quoted from, it is that the figure is a WHOLE NUMBER rather
 * than a fraction.
 *
 * On Bitcoin into Zcash the readable direction flips. `1 ZEC = 0.01033 BTC` is
 * the fraction and `1 BTC = 96.7649 ZEC` is the price — and on Bitcoin into a
 * dollar the old rule printed `1 USDC = 0.00001 BTC`, five decimals of nothing.
 * Quoting from whichever side lands above one gives the frame's own answer on
 * the frame's own pair and a legible one everywhere else.
 */
export const rateOf = (s: SV) => {
  const inv = s.to ? quoteOf(s) / fromPrice() : 0;
  return inv >= 1
    ? { one: s.to ?? '', per: s.from, n: inv }
    : { one: s.from, per: s.to ?? '', n: inv ? 1 / inv : 0 };
};



/**
 * WHAT THE WALLET HOLDS OF A SYMBOL — the right-hand side of a field's sub-row.
 *
 * Both fields print a balance there, and the destination's is usually ZERO:
 * `0 NEAR` under the amount you are about to receive is the app saying you do
 * not have any yet, which is the whole reason you are on this screen. The field
 * used to repeat the output amount there instead, which said nothing twice.
 *
 * The source's own figure is `FROM_BAL` rather than the holding's, because the
 * swap screen prints six decimals where the assets screen truncates to four —
 * see the note on `crypto()` in the account chapter, where the same frame
 * disagrees with itself.
 */
export const balOf = (sym: string | null) =>
  sym === FROM ? FROM_BAL : HOLDINGS.filter((h) => h.sym === sym).reduce((t, h) => t + h.qty, 0);

/**
 * WHAT THE PRIMARY BUTTON SAYS, which is how the form reports itself. Three
 * refusals in the order a reader meets them: nothing typed, nothing chosen,
 * more than the wallet holds.
 */
export function cta(s: SV): { label: string; ok: boolean } {
  if (!(Number(s.amount) > 0)) return { label: 'Enter amount', ok: false };
  if (!s.to) return { label: 'Select a token', ok: false };
  if (Number(s.amount) > FROM_BAL) return { label: 'Insufficient balance', ok: false };
  /* `Review trade`, which is what the button says on the frame. It was
     `Review swap` on a screen already titled Swap, above two fields whose
     whole subject is the swap — a button repeating the noun three readers
     have already met. */
  return { label: 'Review trade', ok: true };
}

/* ---- the transitions -------------------------------------------------- */

export type SVAction =
  | 'toSwap'
  | 'focus' | 'key' | 'max' | 'done'
  | 'picker' | 'closePicker' | 'scroll' | 'pick'
  | 'confirm' | 'closeReview' | 'swap' | 'step' | 'again';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

export const actions: Record<SVAction, Act<SV>> = {
  /** the bottom bar's Swap tab, which is how the app gets to this screen */
  toSwap: (s) => (s.screen === 'home' ? { screen: 'swap', lit: null, tap: 'tab:Swap' } : null),

  focus: (s, v) =>
    (s.screen !== 'swap' || s.submitting
      ? null
      : { focus: (v ?? null) as SV['focus'], pressed: null, tap: null }),
  key: (s, d) => {
    if (s.screen !== 'swap' || !s.focus || !d || s.picker || s.submitting) return null;
    return { amount: digits(s.amount, d), pressed: d, tap: null };
  },
  /**
   * THE BALANCE ON THE RIGHT OF THE SUB-ROW IS A CONTROL, and this is what it
   * does: it puts the whole position in the field.
   *
   * It is the gesture the frame implies. `6635.616976` is the balance printed
   * two inches to the right of it, to the same six decimals, and the reading
   * that has someone typing eleven characters to arrive at their own balance
   * exactly is not a reading, it is a demo that did not look at what it was
   * copying. One tap, and it is also shorter than the typing it replaces —
   * which is how scene one stayed at the 2,300ms `check:flows` has pinned.
   */
  max: (s) =>
    (s.screen !== 'swap' || s.submitting || s.picker || s.review || s.amount === AMOUNT
      ? null
      : { amount: AMOUNT, focus: null, pressed: null, lit: null, tap: 'max' }),

  /** the ✓ on the accessory bar — the app's real way out of a numeric field */
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),

  picker: (s) =>
    (s.screen !== 'swap' || s.picker || s.review || s.submitting
      ? null
      : { picker: true, at: 0, focus: null, lit: null, tap: 'to' }),
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
    return { to: v, picker: false, at: 0, lit: null, tap: 'pick:' + v };
  },

  /**
   * `REVIEW TRADE` REVIEWS THE TRADE. It used to submit it.
   *
   * The button said Review and then settled, which is the one thing a button
   * named after a confirmation step must not do — on a screen whose subject is
   * moving six and a half thousand dollars, the sheet between the form and the
   * settlement is not ceremony, it is where the figures are stated at the
   * precision the form rounds away.
   */
  confirm: (s) =>
    (s.screen !== 'swap' || s.submitting || s.review || !cta(s).ok
      ? null
      : { review: true, focus: null, lit: null, tap: 'confirm' }),
  closeReview: (s) => (s.review && !s.submitting ? { review: false, tap: null } : null),

  /** and the sheet's own button, which is the one that actually trades */
  swap: (s) =>
    (!s.review || s.submitting ? null : { review: false, submitting: true, step: 0, lit: null, tap: 'swap' }),
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

  /**
   * `SWAP AGAIN`, which is the only thing on the settled frame.
   *
   * The script never fires it — the flow's outro loops back on its own — but a
   * reader who has taken the wheel is looking at a button, and a button that
   * does nothing is worse than no button. It puts the screen back where it
   * started, which is what the label says.
   */
  again: (s) => (s.done ? { ...initial, tap: 'again' } : null),
};
