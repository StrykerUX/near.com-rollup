import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * SWAP, AND THE YIELD CHIP NEXT TO IT
 * ==================================================================
 * Rebuilt off `_refs/rec-Swap.MP4` at one frame per second. The recording is
 * two flows that share a screen: swapping the whole USDT balance into NEAR,
 * and then putting a leftover USDC balance to work from the chip that sits on
 * its row the entire time.
 *
 * Every figure here is the one on screen in the recording.
 */

/* ---- the figures ------------------------------------------------------ */

export const PERPS_BAL = 1053.89;
export const EARN_BAL = 2347.81;
/** the two halves of the Assets header, frame 0:03 */
export const MAIN_BAL = 64.95;

export type Holding = {
  sym: string;
  name: string;
  qty: number;
  usd: number;
  chg: string;
  /** the quantity's own decimals, as the app prints them */
  dp: number;
  /** the Earn chip only appears on tokens a vault takes */
  yield?: string;
};

/** what the wallet holds before anything happens, frame 0:03 */
export const START: Holding[] = [
  /* the balance line prints six decimals, the row prints four — so the stored
     figure is the recording's full 6635.616976, not the rounded row label */
  { sym: 'USDT', name: 'Tether USD', qty: 6635.616976, usd: 6635.62, chg: '+0.01%', dp: 4, yield: '5.8%' },
  { sym: 'USDC', name: 'USD Coin', qty: 41.723488, usd: 41.72, chg: '+0.00%', dp: 4, yield: '5.8%' },
  { sym: 'USDC', name: 'USD Coin', qty: 22.555228, usd: 22.56, chg: '+0.00%', dp: 4, yield: '5.8%' },
];

/** what the USDT becomes, frame 1:05 */
export const NEAR_OUT: Holding = {
  sym: 'NEAR', name: 'Near', qty: 3535.3148, usd: 6611.04, chg: '−1.74%', dp: 4,
};

/**
 * USDT per NEAR. The recording prints 1.87669 in the rate row and 3535.799 in
 * the output field, which do not quite agree — 3535.799 implies 1.87681. We
 * take the rate that reproduces the amount, because the amount is the figure
 * the reader is being asked to accept.
 */
export const RATE = 1.87681;
export const SLIPPAGE = 0.005;

/**
 * Dollar prices, so no screen has to guess. The two stablecoins are a dollar;
 * NEAR is what the recording's own figures imply ($6,611.04 for 3,535.3148).
 */
const PRICE: Record<string, number> = { USDT: 1, USDC: 1, NEAR: 1.87 };
export const price = (sym: string) => PRICE[sym] ?? 1;

/** the vault behind the Earn chip, frame 1:52 */
export const VAULT = {
  name: 'Taler USDC',
  apy: '5.80%',
  tvl: '$854,153',
  fees: [
    ['Deposit fee', 'Variable, up to 0.01%'],
    ['Withdrawal fee', 'Fixed, 0.05%'],
    ['Performance fee', '0% through Oct 31, 2026. Future rate to be announced.'],
  ] as const,
};
export const REFERENCE = 'CFN&D…V8Y6';

export const SWAP_STEPS = ['Finding best price', 'Executing trade', 'Trade complete'];
export const EARN_STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];

/** the picker's own catalogue, frame 0:45 */
export const CATALOGUE = [
  { sym: 'ZEC', name: 'Zcash' },
  { sym: 'NEAR', name: 'Near' },
  { sym: 'SOL', name: 'Solana' },
  { sym: 'BTC', name: 'Bitcoin' },
  { sym: 'ETH', name: 'Ethereum' },
];

export type SW = {
  screen: 'account' | 'assets' | 'swap';
  /** the Assets header's two halves; most of this wallet is confidential */
  bucket: 'main' | 'conf';

  /* the swap */
  from: string;
  to: string;
  amount: string;
  /** the token search, which is the only way to reach a token off the list */
  query: string;

  /* layers */
  over: 'none' | 'actions' | 'picker' | 'review' | 'passkey' | 'vault';
  auth: 'ask' | 'signing' | 'done';
  /** which token row opened the actions sheet */
  acted: string | null;

  /* settlement */
  /**
   * Which flow is at the passkey. Both the swap and the vault deposit sign the
   * same way, and without this the settlement that resumes afterwards has to
   * be GUESSED from whichever amount happens to be filled in — which works
   * until the reader does both, and then the second signature ticks the first
   * flow's checklist.
   */
  signing: 'swap' | 'vault' | null;
  step: number;
  swapped: boolean;

  /* the vault deposit */
  vamount: string;
  vstep: number;
  earned: boolean;

  focus: 'amount' | 'vault' | null;
  pressed: string | null;
  tap: string | null;
};

export const initial: SW = {
  screen: 'account',
  bucket: 'conf',
  from: 'USDT',
  to: 'ZEC',
  amount: '',
  query: '',
  over: 'none',
  auth: 'ask',
  acted: null,
  signing: null,
  step: -1,
  swapped: false,
  vamount: '',
  vstep: -1,
  earned: false,
  focus: null,
  pressed: null,
  tap: null,
};

/* ---- derived ---------------------------------------------------------- */

/** what the wallet holds right now, which is the whole point of both flows */
export function holdings(s: SW): Holding[] {
  let out = [...START];
  if (s.swapped) out = [NEAR_OUT, out[1], out[2]];
  /* the deposited balance leaves the wallet for the vault */
  if (s.earned) out = out.filter((_, i) => i !== 1);
  return out;
}
export const confidential = (s: SW) => holdings(s).reduce((t, h) => t + h.usd, 0);
export const total = (s: SW) => confidential(s) + MAIN_BAL;

/** the balance of whichever token is being spent */
export const fromBal = (s: SW) => holdings(s).find((h) => h.sym === s.from)?.qty ?? 0;
/** the USDC row the Earn chip belongs to */
export const vaultBal = () => START[1].qty;

export const out = (s: SW) => (Number(s.amount) || 0) / RATE;
export const least = (s: SW) => out(s) * (1 - SLIPPAGE);
export const ready = (s: SW) => Number(s.amount) > 0 && Number(s.amount) <= fromBal(s);

export type SWAction =
  | 'toAssets' | 'home' | 'bucket'
  | 'actions' | 'closeSheet' | 'toSwap'
  | 'max' | 'key' | 'focus' | 'done'
  | 'picker' | 'search' | 'pick'
  | 'review' | 'swap' | 'authOk' | 'step' | 'again'
  | 'vault' | 'vmax' | 'vkey' | 'deposit' | 'vstep' | 'close';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 12);
};

/**
 * THE PASSKEY IS MODAL, AND THE MACHINE HAS TO SAY SO
 * ------------------------------------------------------------------
 * The sheet has no scrim to tap and no way back, which is right: a signature
 * request you can wander away from is a signature request that leaves the
 * thing it was signing half-done. Encoding that only in the markup left the
 * machine able to reach it — open the token picker from under the passkey and
 * `signing` was stranded with nothing left to advance it, which the headless
 * walk in `tools/check-flows.mjs` found before a browser ever could.
 */
const modal = (f: Act<SW>): Act<SW> => (s, v) => (s.over === 'passkey' ? null : f(s, v));

const table: Record<SWAction, Act<SW>> = {
  /* ---- getting to the tokens ---- */
  toAssets: (s) => (s.screen === 'account' ? { screen: 'assets', tap: 'crypto' } : null),
  home: (s) => (s.screen === 'account' ? null : { screen: 'account', over: 'none', tap: 'home' }),
  bucket: (s, v) => (s.bucket === v ? null : { bucket: (v as SW['bucket']) ?? 'conf', tap: 'bucket' }),

  /**
   * A token row is not a link to a token page — it opens the four things you
   * can do with that token. That is the recording's own shape, and it is why
   * Swap, Send and Earn never need their own entry points.
   */
  actions: (s, v) =>
    s.screen === 'assets' ? { over: 'actions', acted: v ?? s.from, tap: 'row' } : null,
  /* and a settling vault sheet has no way out either, until it says Deposited */
  closeSheet: (s) =>
    s.over === 'none' || (s.over === 'vault' && s.vstep >= 0 && !s.earned)
      ? null
      : { over: 'none', tap: null },

  toSwap: (s) =>
    s.over === 'actions'
      ? { screen: 'swap', from: s.acted ?? 'USDT', over: 'none', amount: '', tap: 'swap' }
      : null,

  /* ---- the amount ---- */
  max: (s) => (s.screen === 'swap' ? { amount: String(fromBal(s)), focus: null, tap: 'max' } : null),
  focus: (s, v) => (s.screen === 'swap' ? { focus: (v ?? null) as SW['focus'], tap: null } : null),
  key: (s, d) =>
    s.screen === 'swap' && d ? { amount: digits(s.amount, d), pressed: d, tap: null } : null,
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),

  /* ---- choosing what to buy ---- */
  picker: (s) =>
    s.screen === 'swap' ? { over: s.over === 'picker' ? 'none' : 'picker', query: '', tap: 'picker' } : null,
  /* The search is a real filter over a real catalogue. Typing two letters and
     having the list stay put is the fastest way to make a mock look painted. */
  search: (s, v) => (s.over === 'picker' ? { query: v ?? '', tap: null } : null),
  pick: (s, v) => (s.over === 'picker' ? { to: v ?? 'NEAR', over: 'none', query: '', tap: 'pick' } : null),

  /* ---- signing ---- */
  review: (s) => (s.screen === 'swap' && ready(s) ? { over: 'review', focus: null, tap: 'review' } : null),
  swap: (s) => (s.over === 'review' ? { over: 'passkey', auth: 'ask', signing: 'swap', tap: 'swap' } : null),
  authOk: (s) => (s.over !== 'passkey' ? null : { auth: 'signing', tap: 'passkey' }),
  /**
   * One transition drives the passkey and the checklist after it, because from
   * the state's point of view they are one thing: a settlement advancing.
   */
  step: (s) => {
    /* the passkey is part of the same settlement, so one transition drives
       both — including the first tap, so `auto` never has to reach for a
       different action to get the sheet moving */
    if (s.over === 'passkey' && s.signing === 'swap') {
      if (s.auth === 'ask') return { auth: 'signing' };
      if (s.auth === 'signing') return { auth: 'done' };
      return { over: 'none', signing: null, step: 0 };
    }
    /* the index runs one PAST the last row, so that row can be ticked rather
       than left spinning forever — and the balances move with that tick */
    if (s.step < 0 || s.step >= SWAP_STEPS.length) return null;
    const step = s.step + 1;
    return step === SWAP_STEPS.length ? { step, swapped: true } : { step };
  },
  again: (s) => (s.swapped
    ? { screen: 'assets', step: -1, amount: '', from: 'NEAR', to: 'ZEC', tap: 'again' }
    : null),

  /* ---- the chip on the row ---- */
  /**
   * The yield chip is the feature. It sits on the row for the whole recording,
   * and it turns a balance you were about to ignore into a deposit without
   * ever leaving the list.
   */
  vault: (s) =>
    s.screen === 'assets' && !s.earned ? { over: 'vault', vamount: '', vstep: -1, tap: 'chip' } : null,
  vmax: (s) => (s.over === 'vault' ? { vamount: String(vaultBal()), tap: 'vmax' } : null),
  vkey: (s, d) => (s.over === 'vault' && d ? { vamount: digits(s.vamount, d), pressed: d } : null),
  deposit: (s) =>
    s.over === 'vault' && Number(s.vamount) > 0
      ? { over: 'passkey', auth: 'ask', signing: 'vault', vstep: -1, tap: 'deposit' }
      : null,
  vstep: (s) => {
    if (s.over === 'passkey' && s.signing === 'vault') {
      if (s.auth === 'ask') return { auth: 'signing' };
      if (s.auth === 'signing') return { auth: 'done' };
      return { over: 'vault', signing: null, vstep: 0 };
    }
    if (s.vstep < 0 || s.vstep >= EARN_STEPS.length) return null;
    const vstep = s.vstep + 1;
    return vstep === EARN_STEPS.length ? { vstep, earned: true } : { vstep };
  },
  close: (s) => (s.over === 'vault' ? { over: 'none', vstep: -1, tap: 'close' } : null),
};

/* `step` and `vstep` ARE the passkey's own advance, and `authOk` is its
   button; everything else waits for it. */
const OPEN_UNDER_PASSKEY: SWAction[] = ['step', 'vstep', 'authOk'];

export const actions = Object.fromEntries(
  (Object.keys(table) as SWAction[]).map((k) => [
    k, OPEN_UNDER_PASSKEY.includes(k) ? table[k] : modal(table[k]),
  ]),
) as Record<SWAction, Act<SW>>;
