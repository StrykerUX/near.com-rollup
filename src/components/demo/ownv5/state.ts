import type { Act } from '@/components/stage/phone/flows/machine';
import { MARK } from '@/components/demo/perpsv5/state';
import { NEAR_PRICE } from '@/components/demo/swapv5/catalogue';
import { STAKE_APY, vaultOf } from '@/components/demo/earnv5/state';

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
 * ONE PRICE PER ASSET, IMPORTED WHERE ONE ALREADY EXISTS.
 *
 * Bitcoin comes from `/demo/perps-v5`'s mark and NEAR from the swap
 * recording's own arithmetic, because those screens can be seconds apart from
 * this one on the same page and two prices for one coin is not a thing a
 * product does. Zcash is `lib/tokens.ts`'s.
 */
export const PRICE: Record<string, number> = {
  BTC: MARK,
  NEAR: NEAR_PRICE,
  USDC: 1,
  ZEC: 503.24,
  /**
   * APPLE IS THE ONE PRICE NOBODY OBSERVED. There is no frame of a tokenised
   * equity anywhere in the five recordings — the picker has an `RWA (Beta)`
   * tab and the recording never opens it. $230 is a plausible figure for the
   * share, chosen so the row lands where the brief puts it, and it is the
   * single number on this screen that a reader could hold against reality and
   * find stale. If the real screen ever gets filmed, this is the line to fix.
   */
  AAPL: 230,
};

export type Holding = {
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
 * THE FIVE ROWS, AND TWO QUANTITIES THAT HAD TO MOVE.
 *
 * The brief asks for five holdings "sorted by value: 0.75 BTC, 25,000 NEAR,
 * 18,400 USDC, 400 ZEC, 120 AAPL". With real prices that list is not sorted by
 * value and cannot be: 400 ZEC is $201,296, which would make it the LARGEST
 * position rather than the fourth, and 120 AAPL is $27,600, which is third
 * rather than fifth. For 400 ZEC to sit fourth, Zcash would have to trade under
 * $46; for 120 AAPL to sit fifth, Apple would have to trade under $125.
 *
 * So the order is kept — it is what the brief is actually specifying, and it is
 * what the app's own screen does — and the two quantities that make it false
 * were changed:
 *
 *     0.75 BTC   $59,675.63      unchanged
 *   25,000 NEAR  $46,750.00      unchanged
 *   18,400 USDC  $18,400.00      unchanged
 *       30 ZEC   $15,097.20      was 400
 *       40 AAPL   $9,200.00      was 120
 *
 * A screen that claims to be sorted by value and is not is a bug a reader finds
 * before they find the feature. These are the two smallest edits that make the
 * claim true.
 */
export const HOLDINGS: Holding[] = [
  { sym: 'BTC', name: 'Bitcoin', qty: 0.75, dp: 4, chg: '+0.42%', up: true, color: '#F7931A', ink: '#fff' },
  { sym: 'NEAR', name: 'Near', qty: 25000, dp: 2, chg: '−1.74%', up: false, color: '#00EC97', ink: '#000' },
  { sym: 'USDC', name: 'USD Coin', qty: 18400, dp: 2, chg: '+0.00%', up: true, color: '#2775CA', ink: '#fff' },
  { sym: 'ZEC', name: 'Zcash', qty: 30, dp: 4, chg: '+3.10%', up: true, color: '#F4B728', ink: '#000' },
  /**
   * THE ONE ROW WITH NO FRAME BEHIND IT. The picker in the recording carries an
   * `RWA (Beta)` tab, so the app plainly holds real-world assets and plainly
   * treats them as a separate class — but the tab is never opened, so how a
   * tokenised share is drawn is not known. It is rendered as what it is: a
   * token row, with the issuer on the line the other rows use for the network.
   */
  /* Apple's brand black on a dark list is a chip you cannot see, so the chip
     takes the light grey half of the same palette and the dark ink with it. */
  { sym: 'AAPL', name: 'Apple', by: 'Ondo', qty: 40, dp: 2, chg: '+0.86%', up: true, color: '#F5F5F7', ink: '#1D1D1F' },
];

/** the Main half of the Assets header, frame 0:03 of both recordings */
export const MAIN_BAL = 64.95;
/** the other two rows of the home's balances card, frame 0:00 */
export const PERPS_BAL = 1053.89;
export const EARN_BAL = 2347.81;

/** what a row is worth */
export const value = (h: Holding) => h.qty * (PRICE[h.sym] ?? 0);
/** the confidential half, which is where the five holdings live */
export const confidential = () => HOLDINGS.reduce((t, h) => t + value(h), 0);
/** the Assets screen's headline, and the home's Crypto row */
export const crypto = () => confidential() + MAIN_BAL;
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
 * THE RATES ARE IMPORTED, NOT TYPED. They are the same two numbers the Earn
 * chapter prints four faces later — Taler's APR and the staking APY — and two
 * screens quoting one rate at each other is exactly the pair that drifts.
 */
export const EARNS: Record<string, string> = {
  USDC: vaultOf('taler').apr.replace(/0%$/, '%'),
  NEAR: STAKE_APY,
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
    return HOLDINGS.some((h) => h.sym === v) ? { acted: v, tap: 'row:' + v } : null;
  },
  closeSheet: (s) => (s.acted ? { acted: null, tap: null } : null),

  /* the sheet's first row, and the end of this chapter */
  swap: (s) => (s.acted && !s.handoff ? { handoff: s.acted, tap: 'swap' } : null),
};
