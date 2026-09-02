import type { Act } from '@/components/stage/phone/flows/machine';
import { NEAR_PRICE } from '@/components/demo/swapv5/catalogue';
import { HOLDINGS } from '@/components/demo/ownv5/state';

/**
 * EARN — the figures and the machine
 * ==================================================================
 * The tour's fourth chapter: `Lockup.tsx` puts **"Earn on what you're not
 * using"** beside `data-face="3"`.
 *
 * REBUILT OFF `rec-Earn + being able to send:pay from your earn balance.MP4`
 * at one frame per second. Everything on the Vaults half is quoted from it —
 * the Beta badge, the subtitle, the body copy, the table's own column headers,
 * both vault rows, and the whole of Taler's sheet down to the fee wording.
 *
 * RE-READ AT 1–30s, TWO AND TWENTY FRAMES A SECOND, AND THE CHAPTER MOVED.
 * It used to open on the Earn page with no account of how anyone got there.
 * The recording opens on the ACCOUNT HOME and presses the Earn balance row —
 * which is the chapter's argument stated as a gesture: the yield is a room in
 * the account, not a separate product. The whole of 1–30s is now this cut:
 *
 *   1.0  the account home
 *   1.5  the Earn row lights for ~200ms
 *   1.75 the vaults
 *   4.45 the Taler row lights
 *   4.6  its sheet
 *   8.3  Use max — nobody types
 *   13.5 Deposit, and the checklist
 *   28   three ticks, a reference id, and Close
 *   30.5 back on the vaults, with Taler carrying the deposit
 *
 * WHAT THE RECORDING DOES NOT CONTAIN is the Staking tab's contents. It shows
 * the tab and never opens it. The tab is drawn because it is on film; the pane
 * behind it is the brief's, and this cut no longer visits it.
 */

/* ---- the page, quoted ------------------------------------------------- */

/** frame 0:02 — the header, its badge and the line under it */
export const TITLE = 'Earn';
export const BETA = 'Beta';
export const SUB = 'Put your idle assets to work.';
/** frame 0:02 — the paragraph above the table */
export const BLURB =
  'Earn yield by depositing into professionally managed vaults. As a general '
  + 'guide, the APR is considered reflective of the strategy risk level.';
/** the table's own column headers, frame 0:02 */
export const COLS = ['Vault', 'Balance'] as const;

export type Vault = {
  id: string;
  name: string;
  tvl: string;
  apr: string;
  /** what the row already holds, frame 0:02 */
  balance: number;
  /** the Promo chip only one of them carries */
  promo?: boolean;
  desc: string;
  apy: string;
  tvlFull: string;
  fees: readonly (readonly [string, string, boolean?])[];
};

export const VAULTS: Vault[] = [
  {
    id: 'gauntlet', name: 'Gauntlet USDC', tvl: '$432.92M', apr: '4.52%', balance: 1343.03,
    /**
     * NOT READ OFF THE RECORDING. It opens Taler's sheet and only Taler's, so
     * Gauntlet's disclosure was never on screen. These carry the SHAPE the
     * sheet takes, not figures anybody observed — the same call
     * `demo/earn/state.ts` made, and its note is worth reading.
     */
    desc: 'This yield vault is provided by Gauntlet, and is built on Ethereum.',
    apy: '4.52%', tvlFull: '$432,921,004',
    fees: [
      ['Deposit fee', 'Variable, up to 0.01%'],
      ['Withdrawal fee', 'Fixed, 0.05%'],
      ['Performance fee', '10% of yield earned'],
    ],
  },
  {
    id: 'taler', name: 'Taler USDC', tvl: '$854.15K', apr: '5.80%', balance: 1047.0, promo: true,
    /* every line below is quoted from frames 0:06 to 0:15 */
    desc: 'This yield vault is provided by Taler, a NEAR ecosystem company, and '
      + 'managed by the TAU Labs team, and is built on Ethereum.',
    apy: '5.80%', tvlFull: '$854,153',
    fees: [
      ['Deposit fee', 'Variable, up to 0.01%'],
      ['Withdrawal fee', 'Fixed, 0.05%'],
      ['Performance fee', '0% through Oct 31, 2026. Future rate to be announced.', true],
    ],
  },
];
export const vaultOf = (id: string) => VAULTS.find((v) => v.id === id)!;

/** the settlement's three rows, frame 0:16 */
export const STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];
/** frame 0:19 */
export const REFERENCE = 'CcX9D…FtYC';

/* ---- what is actually spent -------------------------------------------- */

/**
 * THE DEPOSIT IS THE WALLET'S OWN USD COIN, AND NOBODY TYPES IT.
 *
 * It was `15000` typed a digit at a time against an invented `USDC_AVAIL` of
 * 18,400 — the brief's figures, and a third wallet on a page that already has
 * one. The recording taps **Use max** on the smaller of the two USD Coin lots
 * the account chapter lists two faces earlier: 22.555228, `Available 22.55`,
 * and a field nobody touched.
 *
 * IT IS IMPORTED RATHER THAN RETYPED. `usdc-b` is the Ethereum lot on the
 * assets screen; if that row ever changes, this chapter spends the new figure
 * instead of quietly disagreeing with the screen a reader just came from.
 */
/**
 * IT IS A FUNCTION, NOT A CONSTANT, AND THAT IS THE IMPORT CYCLE TALKING.
 * The account chapter already imports this file for Taler's rate, so a
 * top-level read of `HOLDINGS` here makes two modules each need the other
 * finished before they can start. Reading the lot when somebody asks for it
 * costs nothing and the cycle stops being a cycle at load time.
 */
const lot = () => HOLDINGS.find((h) => h.id === 'usdc-b')!;

/** what the sheet says is available, to the decimal `Use max` puts in the field */
export const usdcAvail = () => lot().qty;
/** and what goes in, because Use max spends the lot */
export const deposited = () => usdcAvail();
/** which vault it goes into: the one whose sheet is actually on film */
export const INTO = 'taler';

/**
 * THE STAKING HALF IS THE BRIEF'S, AND NOTHING BEHIND IT IS OBSERVED.
 *
 * The recording shows the tab and never opens it, so the tab is drawn and this
 * cut does not go there. The pane is kept for a reader who has the wheel in
 * free mode — but it IS a claim about a product feature and this is the note.
 * If staking is not live, these three lines are the only thing to delete.
 */
export const STAKED_NEAR = 20000;
export const STAKE_APY = '9.2%';
export const stakeUsd = () => STAKED_NEAR * NEAR_PRICE;

/**
 * THERE ARE TWO TABS, AND THERE WAS A THIRD.
 *
 * `Positions` was the brief's last beat — "a positions view showing both" —
 * and no frame of any recording has such a screen or such a tab. The row reads
 * `Vaults  Staking`, twice, in two recordings. It is gone, and with it the two
 * scenes that existed only to visit it.
 */
export const TABS = ['vaults', 'staking'] as const;
export const TAB_NAMES: Record<(typeof TABS)[number], string> = {
  vaults: 'Vaults', staking: 'Staking',
};

export type EA = {
  /** the chapter opens on the account, the way the recording does */
  screen: 'home' | 'earn';
  tab: (typeof TABS)[number];
  /** which vault's sheet is up */
  open: string | null;
  side: 'deposit' | 'withdraw';
  amount: string;
  focus: 'amount' | null;
  pressed: string | null;

  /* settlement */
  submitting: boolean;
  step: number;
  /** every row ticked, and the sheet is holding its Close button */
  settled: boolean;
  /** the deposit has landed and the vault's balance carries it */
  earned: boolean;

  /** the control being held down — see the note in 24-demo-app.css */
  lit: string | null;
  tap: string | null;
};

export const initial: EA = {
  screen: 'home',
  tab: 'vaults',
  open: null,
  side: 'deposit',
  amount: '',
  focus: null,
  pressed: null,
  submitting: false,
  step: -1,
  settled: false,
  earned: false,
  lit: null,
  tap: null,
};

/* ---- derived ---------------------------------------------------------- */

/**
 * WHAT A VAULT HOLDS RIGHT NOW, and the deposit lands on the one it went into.
 *
 * $1,047 before and $1,069 after, which is the frame — and 1047 + 22.555228 is
 * 1069.555, so the row TRUNCATES its dollars rather than rounding them. The
 * same habit the account chapter's total has (see `crypto()` there) and the
 * swap screen's rate row. A rounding would print $1,070 and be one dollar off
 * in the only figure this chapter exists to move.
 */
export const balanceOf = (s: EA, v: Vault) =>
  v.balance + (s.earned && v.id === INTO ? deposited() : 0);
export const available = (s: EA) => usdcAvail() - (s.earned ? deposited() : 0);
export const ready = (s: EA) => Number(s.amount) > 0 && Number(s.amount) <= available(s);

/** what the primary button says, which is how the sheet reports itself */
export const cta = (s: EA) =>
  !(Number(s.amount) > 0) ? { label: 'Enter an amount', ok: false }
    : Number(s.amount) > available(s) ? { label: 'Insufficient balance', ok: false }
      : { label: s.side === 'deposit' ? 'Deposit' : 'Withdraw', ok: true };

/* ---- the transitions -------------------------------------------------- */

export type EAAction =
  | 'toEarn' | 'home'
  | 'tab' | 'openVault' | 'closeVault' | 'side'
  | 'focus' | 'key' | 'done' | 'max'
  | 'confirm' | 'step' | 'close';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

export const actions: Record<EAAction, Act<EA>> = {
  /**
   * THE EARN BALANCE ROW ON THE ACCOUNT HOME, which is where this chapter now
   * starts. Earn is not a tab in the bar — it is reached from the third row of
   * the Balances card, in both recordings — so this is the only way in.
   */
  toEarn: (s) => (s.screen === 'home' ? { screen: 'earn', lit: null, tap: 'earn' } : null),
  home: (s) => (s.screen === 'earn' && !s.open ? { screen: 'home', lit: null, tap: 'home' } : null),

  tab: (s, v) =>
    (s.screen !== 'earn' || s.tab === v || !v || s.open
      ? null
      : { tab: v as EA['tab'], lit: null, tap: 'tab:' + v }),

  openVault: (s, v) =>
    s.open || s.screen !== 'earn' || s.tab !== 'vaults' || !v || !VAULTS.some((x) => x.id === v)
      ? null
      : { open: v, side: 'deposit', amount: '', focus: null, lit: null, tap: 'vault:' + v },
  closeVault: (s) =>
    s.open && !s.submitting ? { open: null, amount: '', focus: null, tap: null } : null,
  side: (s, v) => (!s.open || s.side === v ? null : { side: (v as EA['side']) ?? 'deposit', amount: '', tap: 'side' }),

  focus: (s, v) => (s.open ? { focus: (v ?? null) as EA['focus'], pressed: null, tap: null } : null),
  key: (s, d) => {
    if (!s.open || !s.focus || !d || s.submitting) return null;
    return { amount: digits(s.amount, d), pressed: d, tap: null };
  },
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),
  /**
   * `USE MAX`, AND IT IS THE ONLY WAY AN AMOUNT GETS IN HERE NOW.
   *
   * The recording never touches a keypad: it taps Use max and 22.555228 is in
   * the field. Six decimals of somebody's own balance is not a figure anyone
   * types, and a demo that types it is a demo that did not watch what it was
   * copying. `key` stays for a reader who has the wheel.
   */
  max: (s) =>
    (s.open && !s.submitting && s.amount !== String(available(s))
      ? { amount: String(available(s)), lit: null, tap: 'max' }
      : null),

  confirm: (s) =>
    (s.submitting || !s.open || !ready(s)
      ? null
      : { submitting: true, step: 0, focus: null, lit: null, tap: 'deposit' }),
  /**
   * Runs one PAST the last row so every line reads as done while the sheet is
   * still up. Same shape as the other cuts, and fixed there for the same
   * reason: a settlement whose last line is still spinning when the screen
   * changes is a settlement nobody saw finish.
   *
   * IT NO LONGER CLOSES THE SHEET. The recording ticks all three, prints the
   * reference id, and then WAITS — the sheet holds a white `Close` until
   * somebody presses it. A settlement that dismisses itself is the app
   * deciding you have finished reading the receipt.
   */
  step: (s) => {
    if (!s.submitting) return null;
    if (s.step < STEPS.length) return { step: s.step + 1 };
    return s.settled ? null : { settled: true, tap: null };
  },

  /** and the button that is there when there is nothing left to tick */
  close: (s) =>
    (s.settled
      ? { open: null, submitting: false, settled: false, step: -1, amount: '', earned: true, lit: null, tap: 'close' }
      : null),
};
