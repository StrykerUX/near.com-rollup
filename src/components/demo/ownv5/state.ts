import type { Act } from '@/components/stage/phone/flows/machine';
import { vaultOf } from '@/components/demo/earnv5/state';
import { PRICE } from '@/lib/prices';

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

/* ---- the prices, and they are one table for four chapters ------------ */

/**
 * THE PRICES LIVE IN `lib/prices.ts` and are re-exported here for the callers
 * that think of them as the wallet's. They are not this file's because putting
 * them here made an import cycle — see the note over there.
 */
export { PRICE };

export type Holding = {
  /** what a row is addressed by. NOT the symbol — the app has listed the same
      asset twice before now, once per network, and two rows answering to one
      symbol would open one sheet */
  id: string;
  sym: string;
  name: string;
  /** the issuer, for anything that is not the asset itself */
  by?: string;
  /**
   * the network it is held on, as a logo key in `public/logos/tokens`.
   * Only set where it DISTINGUISHES — a badge on a row nothing else shares is
   * a decoration.
   */
  chain?: string;
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
 * THE FIVE HOLDINGS, AND THEY ARE THE BRIEF'S AGAIN.
 *
 * This screen carried the RECORDING'S three for two passes — Tether and two
 * lots of USD Coin — because the wallet on film held those and a reader who has
 * seen the app spots an invented portfolio. That call has been reversed at the
 * client's direction: the brief asks for `0.75 BTC, 25,000 NEAR, 18,400 USDC,
 * 400 ZEC, 120 AAPL (Ondo)`, and that is what the tour is for.
 *
 * WHAT IT COSTS is the recording as the wallet's source. The old figures closed
 * to the cent against two frames — $6,699.90 confidential, $6,764.84 crypto —
 * and none of that survives. In exchange the tour finally shows the five things
 * the product is about instead of three stablecoins.
 *
 * ZCASH IS 40 AND THE BRIEF SAYS 400, and that is the one number moved. ZEC
 * closed at $797.02 on the day these prices were read, so four hundred of them
 * is $318,808 — two thirds of the wallet, with three quarters of a Bitcoin
 * reading as small change beside it. Forty lands it between the share and the
 * dollars and leaves the list ordered without anything crushing the rest.
 *
 * ORDERED BY VALUE, largest first, which is how the app's own Assets screen
 * lists them.
 */
export const HOLDINGS: Holding[] = [
  { id: 'btc', sym: 'BTC', name: 'Bitcoin', qty: 0.75, dp: 4, chg: '-1.80%', up: false, color: '#F7931A', ink: '#fff' },
  { id: 'near', sym: 'NEAR', name: 'Near', qty: 25000, dp: 4, chg: '-4.13%', up: false, color: '#00EC97', ink: '#000' },
  /* the only row with an issuer: a share is held THROUGH somebody, and Ondo is
     who tokenises this one */
  { id: 'aapl', sym: 'AAPL', name: 'Apple Inc', by: 'Ondo', qty: 120, dp: 0, chg: '+0.16%', up: true, color: '#fff', ink: '#000' },
  { id: 'zec', sym: 'ZEC', name: 'Zcash', qty: 40, dp: 4, chg: '+2.00%', up: true, color: '#F4B728', ink: '#000' },
  { id: 'usdc', sym: 'USDC', name: 'USD Coin', qty: 18400, dp: 4, chg: '-0.02%', up: false, color: '#2775CA', ink: '#fff' },
];

/**
 * THE OTHER TWO BALANCES ON THE HOME, AND THEY ARE THEIR OWN ACCOUNTS.
 *
 * Perps and Earn are not slices of the assets list — they are separate
 * balances, and only the home's total puts the three together. That is what
 * lets 20,000 NEAR be staked under Earn while the assets list still shows all
 * 25,000: they are not the same NEAR twice, they are two accounts.
 *
 * PERPS IS IMPORTED BY `/demo/perps-v5` RATHER THAN RETYPED THERE. That screen
 * carried its own `PERPS_BAL` of 11,428.61 while this one said 1,053.89 — two
 * figures for one account, on two faces of the same scroll. It is one number
 * now, and it is large enough to open the position the perps chapter opens:
 * $20,000 of margin against $6,000 already committed needs more than the
 * $5,428.61 that was free.
 */
export const PERPS_BAL = 28400;
/**
 * AND EARN'S, WHICH IS THE SUM OF WHAT THAT CHAPTER HOLDS: $8,650 in Gauntlet,
 * $3,240 in Taler and 20,000 NEAR staked at $1.84. Written out rather than
 * imported, because importing it would close the cycle this file spent two
 * passes opening — `earnv5/state.ts` already needs the wallet from here.
 */
export const EARN_BAL = 8650 + 3240 + 20000 * 1.84;

/** what a row is worth */
export const value = (h: Holding) => h.qty * (PRICE[h.sym] ?? 0);

/**
 * THE ASSETS SCREEN'S HEADLINE, AND THE HOME'S CRYPTO ROW.
 *
 * IT USED TO BE HALVES. The screen carried a Main / Confidential split across
 * the top, because the app used to hold two balances and most of this wallet
 * was in the private one. near.com is confidential BY DEFAULT now — the app's
 * own Assets screen has one total and no split — so there is one figure here
 * and the machinery that told them apart is gone.
 */
export const crypto = () => HOLDINGS.reduce((t, h) => t + value(h), 0);
/** the home's headline is the sum of its three accounts, always */
export const total = () => crypto() + PERPS_BAL + EARN_BAL;

/**
 * WHAT EARNS, AND AT WHAT RATE — the pill on the right of a row.
 *
 * The app puts an "Earn 6%" pill on any holding it has somewhere to put to
 * work. Here it is USD Coin, because the Earn tab's vaults take dollars.
 * BITCOIN, ZCASH, NEAR AND A TOKENISED SHARE GET NO PILL — NEAR has staking
 * rather than a vault, and the other three have nothing to be put into, so a
 * pill offering one would be the demo inventing a product.
 *
 * THE RATE IS IMPORTED, NOT TYPED. It is Gauntlet's, the same number the Earn
 * chapter prints two faces later, and two screens quoting one rate at each
 * other is exactly the pair that drifts.
 */
const EARNABLE = new Set(['USDC']);
/**
 * A FUNCTION RATHER THAN A TABLE, and for the same reason `usdcAvail` in the
 * earn chapter is one: the two files import each other, and a table built at
 * module scope makes each of them need the other finished before it can start.
 */
export const earnsOn = (sym: string) =>
  (EARNABLE.has(sym) ? vaultOf('gauntlet').apr.replace(/\.00%$/, '%') : undefined);

/* WITHOUT `MOVE TO MAIN`, which was an action for an app that had two
   balances. There is one now. */
export const ACTIONS = ['Swap', 'Send', 'Earn'] as const;

/**
 * THE ROWS ONE HOLDING'S SHEET ACTUALLY GETS.
 *
 * The sheet used to render all three for every asset, which put the screen at
 * odds with itself: the list gives Bitcoin no "Earn" pill — `earnsOn` says
 * there is nowhere to put it to work — and then its own sheet offered to Earn
 * it anyway. One of the two was inventing a product, and it was the sheet.
 *
 * So Earn is gated by the SAME predicate that draws the pill, rather than by a
 * second list that would have to be kept in step with the first. Swap and Send
 * are unconditional, because anything you hold can be swapped or sent.
 *
 * In practice this shows on Bitcoin, since `script.ts` opens that row and no
 * other; USD Coin is the one holding here with a vault behind it, so it is the
 * one whose sheet still has three rows.
 */
export const actionsFor = (sym: string) =>
  ACTIONS.filter((a) => a !== 'Earn' || earnsOn(sym) !== undefined);

export type OW = {
  screen: 'home' | 'assets';
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
  /**
   * WHICH CONTROL IS BEING HELD DOWN, and it is the only thing on a cursorless
   * screen that says why the next one arrived. Set by a beat and cleared by the
   * transition that follows it — see the note in 24-demo-app.css.
   */
  lit: string | null;
  tap: string | null;
};

export const initial: OW = {
  screen: 'home',
  acted: null,
  handoff: null,
  lit: null,
  tap: null,
};

/* ---- the transitions -------------------------------------------------- */

/* `bucket` is gone with the halves it switched between — see `crypto()`. */
export type OWAction = 'toAssets' | 'home' | 'actions' | 'closeSheet' | 'swap';

export const actions: Record<OWAction, Act<OW>> = {
  /* every transition that follows a lit beat puts the light out: the press is
     over the moment the thing it was pressing happens */
  toAssets: (s) => (s.screen === 'home' ? { screen: 'assets', lit: null, tap: 'crypto' } : null),
  home: (s) => (s.screen === 'assets' ? { screen: 'home', acted: null, lit: null, tap: 'home' } : null),

  actions: (s, v) => {
    if (s.screen !== 'assets' || !v || s.acted) return null;
    return HOLDINGS.some((h) => h.id === v) ? { acted: v, lit: null, tap: 'row:' + v } : null;
  },
  closeSheet: (s) => (s.acted ? { acted: null, tap: null } : null),

  /* the sheet's first row, and the end of this chapter */
  swap: (s) => (s.acted && !s.handoff ? { handoff: s.acted, lit: null, tap: 'swap' } : null),
};
