import type { Act } from '@/components/stage/phone/flows/machine';
import { vaultOf } from '@/components/demo/earnv5/state';

/**
 * EVERYTHING YOU OWN — the figures and the machine
 * ==================================================================
 * The tour's second chapter, and the one the page's own headline is about:
 * `Lockup.tsx` sets **"Everything you own, one screen"** beside `data-face="0"`.
 *
 * REBUILT OFF `rec-Everything you own + Swap screen.MP4`, at one frame per
 * second. That recording is the reason this screen exists at all: the account
 * home was already built from `rec-perps.MP4`, but what sits behind the Crypto
 * row's chevron had never been on film. It is the **Assets** screen, and the
 * frames give all of it — the total, the Main/Confidential halves, the rows
 * with their quantity, their dollar value and their change, and the sheet a
 * row opens with Swap / Send / Earn / Move to Main on it.
 *
 * `demo/swap/` was built from the same screen and its figures agree to the
 * decimal, which is how we know the two recordings are the same session.
 */

/* ---- the prices, and there is one of each --------------------------- */

/**
 * TWO PRICES, BOTH OF THEM A DOLLAR.
 *
 * Everything in this wallet is dollar-pegged, so the row's dollar figure is its
 * quantity and nothing here can go stale. The five-asset version of this screen
 * needed Bitcoin's mark, NEAR's swap-recording price and a guess at Apple; none
 * of that survives, and neither do the imports it needed.
 */
export const PRICE: Record<string, number> = { USDT: 1, USDC: 1 };

export type Holding = {
  /** what a row is addressed by. NOT the symbol — the app lists USD Coin twice,
      once per network, and two rows answering to `USDC` would open one sheet */
  id: string;
  sym: string;
  name: string;
  /** the issuer, for anything that is not the asset itself */
  by?: string;
  qty: number;
  /** the quantity's own decimals, as the app prints them */
  dp: number;
  /** the 24h line the app puts under the dollar figure */
  chg: string;
  up: boolean;
  color: string;
  ink: string;
};

/**
 * THE THREE ROWS THE RECORDING ACTUALLY HOLDS.
 *
 * THIS REPLACES THE BRIEF'S FIVE, AND THAT WAS A CALL RATHER THAN A READING.
 * Charlie's brief asks for "0.75 BTC, 25,000 NEAR, 18,400 USDC, 400 ZEC, 120
 * AAPL"; the wallet on film holds Tether and two lots of USD Coin. Asked which
 * one this screen should be, the answer was the recording — the chapter's job
 * on the page is to look like the product, and a reader who has seen the app
 * spots an invented portfolio faster than they read a headline. What it costs
 * is the illustration: "Everything you own" is now three stablecoin rows, with
 * no Bitcoin and no tokenised share. If that trade is ever revisited, the
 * five-row version is in this file's history, quantities and reasoning intact.
 *
 * THE FIGURES ARE THE FRAMES'. Quantities to four decimals, values, changes and
 * both `USD Coin` rows — the app lists the same asset twice because it is held
 * on two networks, which is why a row needs an `id` that its symbol cannot be.
 *
 * AND THE ARITHMETIC CLOSES, which is the check that says these were read
 * correctly rather than approximately: the three rows sum to $6,699.90, which
 * is the Confidential half the frame prints, and $64.95 of Main on top of that
 * is the total it prints. Nothing here is tuned to make that land; it lands
 * because the recording is one session. The one cent that does not fall out of
 * it is explained at `crypto()` — the frame disagrees with itself there.
 */
export const HOLDINGS: Holding[] = [
  { id: 'usdt', sym: 'USDT', name: 'Tether USD', qty: 6635.6169, dp: 4, chg: '+0.01%', up: true, color: '#26A17B', ink: '#fff' },
  { id: 'usdc-a', sym: 'USDC', name: 'USD Coin', qty: 41.7234, dp: 4, chg: '+0.00%', up: true, color: '#2775CA', ink: '#fff' },
  { id: 'usdc-b', sym: 'USDC', name: 'USD Coin', qty: 22.5552, dp: 4, chg: '+0.00%', up: true, color: '#2775CA', ink: '#fff' },
];

/** the Main half of the Assets header, frame 0:03 of both recordings */
export const MAIN_BAL = 64.95;
/** the other two rows of the home's balances card, frame 0:00 */
export const PERPS_BAL = 1053.89;
export const EARN_BAL = 2347.81;

/** what a row is worth */
export const value = (h: Holding) => h.qty * (PRICE[h.sym] ?? 0);
/** the confidential half, which is where the three holdings live */
export const confidential = () => HOLDINGS.reduce((t, h) => t + value(h), 0);
/**
 * The Assets screen's headline, and the home's Crypto row.
 *
 * THE CENT IS TRUNCATED, NOT ROUNDED, AND THAT IS THE FRAME'S DOING. The three
 * rows and the Main half come to 6764.8455, which rounds up to $6,764.85; the
 * recording prints $6,764.84 while printing $6,699.90 for the confidential half
 * of the same sum. Both cannot be reached by one rounding rule — for the total
 * to round to .84 the half would have to print .89 — so the app is not using
 * one, and the quantity it shows is truncated too (`6635.6169 …`), which is
 * probably where the missing precision went.
 *
 * Given a frame that disagrees with itself, this reproduces the frame: the
 * halves round and this one truncates. It is the difference between a demo that
 * matches a screenshot and one that is a cent off in the largest figure on the
 * screen, which is the kind of thing a reader checks.
 */
export const crypto = () => Math.floor((confidential() + MAIN_BAL) * 100) / 100;
/** the home's headline is the sum of its three rows, always */
export const total = () => crypto() + PERPS_BAL + EARN_BAL;

/** what a row's sheet offers, frame 0:09 */
/**
 * WHAT EARNS, AND AT WHAT RATE — the pill on the right of a row.
 *
 * The app puts an "Earn 5.8%" pill on any holding it has somewhere to put to
 * work, and in the recording every row carries one because every holding in
 * that wallet is a stablecoin. Here two of five do: USDC has a vault and NEAR
 * has staking. BITCOIN, ZCASH AND A TOKENISED SHARE GET NO PILL, and that is
 * the app rather than an omission — there is nothing in the Earn tab to put
 * them in, so a pill offering one would be the demo inventing a product.
 *
 * THE RATE IS IMPORTED, NOT TYPED. It is Taler's APR, the same number the Earn
 * chapter prints two faces later, and two screens quoting one rate at each
 * other is exactly the pair that drifts.
 */
export const EARNS: Record<string, string> = {
  USDT: vaultOf('taler').apr.replace(/0%$/, '%'),
  USDC: vaultOf('taler').apr.replace(/0%$/, '%'),
};

export const ACTIONS = ['Swap', 'Send', 'Earn', 'Move to Main'] as const;

export type OW = {
  screen: 'home' | 'assets';
  /** the Assets header's two halves; most of this wallet is confidential */
  bucket: 'main' | 'conf';
  /** which row's actions sheet is up */
  acted: string | null;
  /**
   * THE HANDOFF, AND IT IS WHERE THIS FLOW ENDS.
   *
   * The brief stops at "tap on BTC, tap swap" and then loops. It does not go on
   * to the swap screen, because the swap screen is the NEXT chapter's job —
   * `Lockup.tsx` gives it its own headline. So the last thing this flow does is
   * press Swap and hand over; what it hands over is the symbol, which is
   * exactly what `/demo/swap-v5` opens with pre-filled.
   */
  handoff: string | null;
  tap: string | null;
};

export const initial: OW = {
  screen: 'home',
  bucket: 'conf',
  acted: null,
  handoff: null,
  tap: null,
};

/* ---- the transitions -------------------------------------------------- */

export type OWAction = 'toAssets' | 'home' | 'bucket' | 'actions' | 'closeSheet' | 'swap';

export const actions: Record<OWAction, Act<OW>> = {
  toAssets: (s) => (s.screen === 'home' ? { screen: 'assets', tap: 'crypto' } : null),
  home: (s) => (s.screen === 'assets' ? { screen: 'home', acted: null, tap: 'home' } : null),
  bucket: (s, v) =>
    s.screen !== 'assets' || s.bucket === v ? null : { bucket: (v as OW['bucket']) ?? 'conf', tap: 'bucket' },

  actions: (s, v) => {
    if (s.screen !== 'assets' || !v || s.acted) return null;
    return HOLDINGS.some((h) => h.id === v) ? { acted: v, tap: 'row:' + v } : null;
  },
  closeSheet: (s) => (s.acted ? { acted: null, tap: null } : null),

  /* the sheet's first row, and the end of this chapter */
  swap: (s) => (s.acted && !s.handoff ? { handoff: s.acted, tap: 'swap' } : null),
};
