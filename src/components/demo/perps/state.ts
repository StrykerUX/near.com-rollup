import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * PERPS, THE WHOLE ARC
 * ==================================================================
 * Rebuilt frame by frame off `_refs/rec-perps.MP4` — the account, the market,
 * funding the perps balance with a passkey, the ticket, both validation
 * errors, the order checklist, and the position that comes out of it.
 *
 * This is a SEPARATE machine from `flows/perps.ts`. That one is a 35-beat
 * story sized to a card on a scrolling page; this one is the app. Sharing a
 * state shape between them would have meant either crippling this page or
 * dragging four screens' worth of fields through a card that shows one.
 *
 * Every figure below is the one on screen in the recording. Where the app
 * shows a number it does not explain, the formula that reproduces it is here
 * with the frame it came from.
 */

/* ---- the figures the recording is built on -------------------------- */

/** Account home, before anything happens */
export const CRYPTO_BAL = 7811.5;
export const EARN_BAL = 2347.79;
export const PERPS_BAL_0 = 86.99;
/** what the perps balance becomes once the $1,000 lands */
export const PERPS_BAL_1 = 1086.99;

/** the near.com balance the funding is paid out of */
export const NEAR_AVAIL = 7682;
export const FUND_AMT = 1000;
/** the quote on the review sheet, frame 0:52 */
export const FUND_PAY_NEAR = 539.096;
export const FUND_SLIPPAGE = '0.50%';
export const FUND_ETA = '~22 sec';
export const FUND_STEPS = ['Processing send', 'Sending', 'Complete'];

/** the price the position opens at, frame 4:32 */
export const ENTRY = 79654;
/** the market's quote before any of this happens, frame 0:14 */
export const MARK_0 = 79525.5;

/**
 * Maintenance margin. Read straight off two frames of the leverage sheet:
 * at 10x the ticket estimates liquidation 7% below, at 20x it estimates 2% —
 * which is 1/lev − 0.03 both times. The position card in the recording quotes
 * a third figure (3.7%) for the same position; we use ONE formula everywhere,
 * because a demo that shows two liquidation prices for one position is a bug
 * a reader will find before they find the feature.
 */
export const MMR = 0.03;
export const liqPct = (lev: number) => 1 / lev - MMR;
export const liqPrice = (entry: number, lev: number, side: Side) =>
  side === 'long' ? entry * (1 - liqPct(lev)) : entry * (1 + liqPct(lev));

export const ORDER_STEPS = ['Set leverage', 'Submit order', 'Update TP/SL'];

export type Side = 'long' | 'short';
export type Unit = '$' | '%';

export type PD = {
  /** which of the app's screens is on */
  screen: 'account' | 'market' | 'fund' | 'funding';

  /* ---- account ---- */
  /** the perps line on the balances card; grows when the funding lands */
  perps: number;

  /* ---- funding ---- */
  fundAmt: string;
  /** which of the near.com balances pays for it */
  pay: 'NEAR' | 'USDC';
  /** the funding checklist */
  fstep: number;

  /* ---- market ---- */
  /** the My account panel, which is where Deposit lives */
  acct: boolean;
  tab: 'pos' | 'ord' | 'trd';

  /* ---- the ticket ---- */
  ticket: boolean;
  side: Side;
  otype: 'Market' | 'Limit';
  amount: string;
  limit: string;
  lev: number;
  /** the leverage sheet edits a draft; Save is what commits it */
  levDraft: number;
  /** "Add profit taker/stop loss" */
  prot: boolean;
  tp: string;
  sl: string;
  /**
   * ONE unit for both protection fields. The recording is unambiguous: tapping
   * the ⇄ on the take profit puts a `$` in front of the stop loss too. They
   * are two halves of one setting, and a demo that let them disagree would be
   * inventing a state the app cannot be in.
   */
  punit: Unit;

  focus: 'amount' | 'limit' | 'tp' | 'sl' | null;
  /** lights one key so a scripted entry reads as typed rather than pasted */
  pressed: string | null;
  /** what is stacked over the ticket */
  over: 'none' | 'lev' | 'otype' | 'review' | 'passkey';
  /** the passkey sheet's own three states */
  auth: 'ask' | 'signing' | 'done';

  /* ---- submission and the position ---- */
  /** the order checklist under the button */
  ostep: number;
  submitting: boolean;
  pos: null | { side: Side; lev: number; size: number; entry: number };
  /** the position bar on the market screen, expanded */
  posOpen: boolean;
  /** the row in the Positions list, expanded */
  rowOpen: boolean;

  /** which control was just pressed — without it two frames merely differ */
  tap: string | null;
};

export const initial: PD = {
  screen: 'account',
  perps: PERPS_BAL_0,
  fundAmt: '',
  pay: 'NEAR',
  fstep: 0,
  acct: false,
  tab: 'pos',
  ticket: false,
  side: 'long',
  otype: 'Market',
  amount: '',
  limit: '',
  lev: 10,
  levDraft: 10,
  prot: false,
  tp: '',
  sl: '',
  punit: '%',
  focus: null,
  pressed: null,
  over: 'none',
  auth: 'ask',
  ostep: -1,
  submitting: false,
  pos: null,
  posOpen: false,
  rowOpen: false,
  tap: null,
};

/* ---- derived, all of it ---------------------------------------------- */

/** margin already committed to open positions */
export const marginUsed = (s: PD) => (s.pos ? s.pos.size / s.pos.lev : 0);
/** the "Available to trade" line at the top of the ticket */
export const avail = (s: PD) => s.perps - marginUsed(s);
/** notional: the app multiplies the margin you type by the leverage */
export const notional = (s: PD) => (Number(s.amount) || 0) * s.lev;
export const btcSize = (s: PD) => notional(s) / ENTRY;

/**
 * The app writes $14K but $7,000 — it only abbreviates once the figure needs
 * five digits. Both spellings are in the recording, seconds apart.
 */
export const money = (v: number) =>
  v >= 10000
    ? '$' + Math.round(v / 1000).toLocaleString('en-US') + 'K'
    : '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });

/* ---- the guards, which are the screen's argument ---------------------- */

/**
 * A take profit sits ABOVE the entry on a long and below it on a short; a
 * stop loss is the mirror. Both errors are in the recording, and both are the
 * moment the ticket stops looking like a picture of a form.
 *
 * Only checked in $; a percentage is a distance, not a price.
 */
export const tpBad = (s: PD) =>
  s.prot && s.punit === '$' && s.tp !== ''
  && (s.side === 'long' ? Number(s.tp) <= ENTRY : Number(s.tp) >= ENTRY);
export const slBad = (s: PD) =>
  s.prot && s.punit === '$' && s.sl !== ''
  && (s.side === 'long' ? Number(s.sl) >= ENTRY : Number(s.sl) <= ENTRY);

/** what the primary button says, which is how the ticket reports itself */
export function cta(s: PD): { label: string; ok: boolean } {
  if (tpBad(s)) return { label: 'Review take profit', ok: false };
  if (slBad(s)) return { label: 'Review stop loss', ok: false };
  if (!(Number(s.amount) > 0)) return { label: 'Enter amount', ok: false };
  if (s.otype === 'Limit' && !(Number(s.limit) > 0)) return { label: 'Enter limit price', ok: false };
  return { label: s.side === 'long' ? 'Open long' : 'Open short', ok: true };
}

/* ---- the transitions -------------------------------------------------- */

export type PDAction =
  | 'openPerps' | 'home' | 'acct' | 'deposit' | 'closeFund'
  | 'fkey' | 'payPick' | 'fundReview' | 'fundSend' | 'authOk' | 'fstep'
  | 'openTicket' | 'closeTicket' | 'side' | 'otypeMenu' | 'otype'
  | 'focus' | 'key' | 'done'
  | 'levSheet' | 'levSet' | 'levSave'
  | 'prot' | 'unit'
  | 'submit' | 'ostep' | 'tab' | 'posOpen' | 'rowOpen' | 'closePos';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

export const actions: Record<PDAction, Act<PD>> = {
  /* ---- navigation ---- */
  openPerps: () => ({ screen: 'market', tap: 'perps' }),
  home: (s) => (s.screen === 'market' ? { screen: 'account', acct: false, tap: 'home' } : null),
  acct: (s) => (s.screen !== 'market' ? null : { acct: !s.acct, tap: 'acct' }),
  deposit: (s) => (s.acct ? { screen: 'fund', acct: false, tap: 'deposit' } : null),
  closeFund: (s) =>
    s.screen === 'fund' || s.screen === 'funding'
      ? { screen: 'market', fundAmt: '', focus: null, over: 'none', fstep: 0, tap: 'back' }
      : null,

  /* ---- funding ---- */
  fkey: (s, d) =>
    s.screen === 'fund' && d ? { fundAmt: digits(s.fundAmt, d), pressed: d, tap: null } : null,
  payPick: (s, v) => (s.screen === 'fund' ? { pay: (v as PD['pay']) ?? 'NEAR', tap: 'pay' } : null),
  /* the Review send sheet only opens on a real amount — the app's own rule,
     and the reason the button reads "Enter amount" until then */
  fundReview: (s) =>
    s.screen === 'fund' && Number(s.fundAmt) > 0
      ? { over: 'review', focus: null, tap: 'review' }
      : null,
  /* Send hands off to the passkey. Nothing moves until the passkey is done:
     that IS the feature this screen is showing. */
  fundSend: (s) => (s.over === 'review' ? { over: 'passkey', auth: 'ask', tap: 'send' } : null),
  authOk: (s) => (s.over !== 'passkey' ? null : { auth: 'signing', tap: 'passkey' }),
  /**
   * One transition ticks both checklists, because from the state's point of
   * view they are the same thing: a settlement advancing on its own.
   */
  fstep: (s) => {
    if (s.over === 'passkey' && s.auth !== 'done') return { auth: 'done', tap: null };
    if (s.over === 'passkey') return { over: 'none', screen: 'funding', fstep: 0, tap: null };
    if (s.screen !== 'funding') return null;
    /* fstep runs one past the last row: at 3 every row is ticked, which is the
       state the recording never reaches because the send took two minutes. */
    if (s.fstep >= FUND_STEPS.length) return null;
    const fstep = s.fstep + 1;
    /* the balance lands with the last tick, not before */
    return fstep === FUND_STEPS.length
      ? { fstep, perps: PERPS_BAL_1, tap: null }
      : { fstep, tap: null };
  },

  /* ---- the ticket ---- */
  openTicket: (s, v) =>
    s.screen !== 'market' || s.pos
      ? null
      : { ticket: true, side: (v as Side) ?? s.side, acct: false, focus: 'amount', tap: v ?? null },
  closeTicket: (s) =>
    s.ticket ? { ticket: false, focus: null, over: 'none', tap: null } : null,
  side: (s, v) => (s.side === v ? null : { side: (v as Side) ?? 'long', tap: v ?? null }),

  otypeMenu: (s) => (s.ticket ? { over: s.over === 'otype' ? 'none' : 'otype', tap: 'otype' } : null),
  /* Market ⇄ Limit is a real switch: Limit opens a price field and the ticket
     will not submit without one. A chip that changed a word and nothing else
     is the worst kind of control — it looks like it did something. */
  otype: (s, v) => {
    const otype = (v as PD['otype']) ?? 'Market';
    return otype === 'Limit'
      ? { otype, over: 'none', limit: '', focus: 'limit', tap: 'otype' }
      : { otype, over: 'none', limit: '', focus: 'amount', tap: 'otype' };
  },

  focus: (s, v) => {
    const f = (v ?? null) as PD['focus'];
    if (f === 'limit' && s.otype !== 'Limit') return null;
    if ((f === 'tp' || f === 'sl') && !s.prot) return null;
    return { focus: f, pressed: null, tap: null };
  },
  key: (s, d) => {
    if (!s.focus || !d) return null;
    return { [s.focus]: digits(s[s.focus], d), pressed: d, tap: null } as Partial<PD>;
  },
  /** the ✓ on the accessory bar — the app's real way out of a numeric field */
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),

  levSheet: (s) =>
    s.ticket ? { over: s.over === 'lev' ? 'none' : 'lev', levDraft: s.lev, focus: null, tap: 'lev' } : null,
  levSet: (s, v) => (s.over === 'lev' ? { levDraft: Math.max(1, Math.min(50, Number(v))) } : null),
  levSave: (s) => (s.over === 'lev' ? { lev: s.levDraft, over: 'none', tap: 'save' } : null),

  prot: (s) =>
    s.ticket
      ? { prot: !s.prot, tp: '', sl: '', punit: '%', focus: s.prot ? 'amount' : 'tp', tap: 'prot' }
      : null,
  /* the ⇄ swaps the unit AND empties both fields. That is what the app does,
     and it is right: 82000 means one thing as a price and nothing as a
     percent, so carrying the digits across would be carrying a lie. */
  unit: (s, v) => (s.prot
    ? { punit: s.punit === '$' ? '%' : '$', tp: '', sl: '', focus: (v ?? 'tp') as PD['focus'], tap: 'unit' }
    : null),

  /* ---- submitting ---- */
  /**
   * Submit does the WHOLE transition, not just the highlight. A version that
   * only lit the button and left the navigation to the next beat was a dead
   * end for anyone driving by hand.
   */
  submit: (s) =>
    s.ticket && cta(s).ok
      ? { submitting: true, ostep: -1, over: 'passkey', auth: 'ask', focus: null, tap: 'submit' }
      : null,
  ostep: (s) => {
    if (!s.submitting) return null;
    if (s.over === 'passkey') {
      if (s.auth === 'ask') return { auth: 'signing' };
      if (s.auth === 'signing') return { auth: 'done' };
      return { over: 'none', ostep: 0 };
    }
    if (s.ostep < ORDER_STEPS.length - 1) return { ostep: s.ostep + 1 };
    /* the order lands: the ticket empties, the position exists */
    return {
      submitting: false,
      ostep: -1,
      ticket: false,
      focus: null,
      amount: '',
      tp: '',
      sl: '',
      prot: false,
      punit: '%',
      pos: { side: s.side, lev: s.lev, size: notional(s), entry: ENTRY },
      tab: 'pos',
      tap: null,
    };
  },

  /* ---- living with a position ---- */
  tab: (s, v) => (s.tab === v ? null : { tab: v as PD['tab'], tap: 'tab' }),
  posOpen: (s) => (s.pos ? { posOpen: !s.posOpen, tap: 'posOpen' } : null),
  rowOpen: (s) => (s.pos ? { rowOpen: !s.rowOpen, tap: 'rowOpen' } : null),
  closePos: (s) =>
    s.pos ? { pos: null, posOpen: false, rowOpen: false, perps: PERPS_BAL_1, tap: 'closePos' } : null,
};
