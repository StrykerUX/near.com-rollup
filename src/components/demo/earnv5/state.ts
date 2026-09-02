import type { Act } from '@/components/stage/phone/flows/machine';
import { NEAR_PRICE } from '@/components/demo/swapv5/catalogue';

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
 * WHAT THE RECORDING DOES NOT CONTAIN is the Staking tab's contents. It shows
 * the tab and never opens it: forty-eight frames, and the flow goes Vaults →
 * Taler's sheet → deposit → passkey → Universal Send. So the last two scenes
 * of this cut are the brief's, not the recording's, and they say so where they
 * are declared.
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

/* ---- the figures the brief sets --------------------------------------- */

/**
 * THE WALLET IS `/demo/own-v5`'s, NOT THE RECORDING'S.
 *
 * The recording deposits 22.555228 USDC because that is what its wallet held.
 * The brief asks for 15,000, so the balance had to be one that can pay for it —
 * and rather than invent a third figure, it is the USDC row from the account
 * screen two chapters earlier. 18,400 in, 15,000 into the vault, 3,400 left.
 * Same for the stake: the account holds 25,000 NEAR and 20,000 of it is
 * staked.
 */
export const USDC_AVAIL = 18400;
export const DEPOSIT = '15000';
/** which vault it goes into: the one whose sheet is actually on film */
export const INTO = 'taler';

/**
 * THE STAKING HALF IS THE BRIEF'S, AND NOTHING BEHIND IT IS OBSERVED.
 *
 * Forty-eight frames and the Staking tab is never opened. `demo/earn/` renders
 * an empty state there — *"Staking is not open yet. Network staking will show
 * up here."* — which is itself unattributed; no frame in any of the six
 * recordings shows that copy either.
 *
 * The brief asks for 20,000 NEAR already staked and accruing. That is built,
 * because a hole in the middle of a four-chapter tour is worse than a figure
 * with a note on it — but it IS a claim about a product feature and this is
 * the note. If staking is not live, this file is the only thing to delete.
 */
export const STAKED_NEAR = 20000;
export const STAKE_APY = '9.2%';
export const stakeUsd = () => STAKED_NEAR * NEAR_PRICE;

/**
 * AND THE POSITIONS TAB IS THE SAME. The brief's last beat is "positions view
 * showing both". There is no such view on film and no third tab in any frame —
 * the row reads `Vaults  Staking`. It is added because the brief ends on it,
 * and it is the second thing to delete if the real app has no such screen.
 */
export const POSITIONS_TAB = 'Positions';

export type EA = {
  screen: 'earn';
  tab: 'vaults' | 'staking' | 'positions';
  /** which vault's sheet is up */
  open: string | null;
  side: 'deposit' | 'withdraw';
  amount: string;
  focus: 'amount' | null;
  pressed: string | null;

  /* settlement */
  submitting: boolean;
  step: number;
  /** the deposit has landed and the vault's balance carries it */
  earned: boolean;

  tap: string | null;
};

export const initial: EA = {
  screen: 'earn',
  tab: 'vaults',
  open: null,
  side: 'deposit',
  amount: '',
  focus: null,
  pressed: null,
  submitting: false,
  step: -1,
  earned: false,
  tap: null,
};

/* ---- derived ---------------------------------------------------------- */

/** what a vault holds right now — the deposit lands on the one it went into */
export const balanceOf = (s: EA, v: Vault) =>
  v.balance + (s.earned && v.id === INTO ? Number(DEPOSIT) : 0);
export const available = (s: EA) => USDC_AVAIL - (s.earned ? Number(DEPOSIT) : 0);
export const ready = (s: EA) => Number(s.amount) > 0 && Number(s.amount) <= available(s);

/** what the primary button says, which is how the sheet reports itself */
export const cta = (s: EA) =>
  !(Number(s.amount) > 0) ? { label: 'Enter an amount', ok: false }
    : Number(s.amount) > available(s) ? { label: 'Insufficient balance', ok: false }
      : { label: s.side === 'deposit' ? 'Deposit' : 'Withdraw', ok: true };

/* ---- the transitions -------------------------------------------------- */

export type EAAction =
  | 'tab' | 'openVault' | 'closeVault' | 'side'
  | 'focus' | 'key' | 'done' | 'max'
  | 'confirm' | 'step';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

export const actions: Record<EAAction, Act<EA>> = {
  tab: (s, v) => (s.tab === v || !v || s.open ? null : { tab: v as EA['tab'], tap: 'tab:' + v }),

  openVault: (s, v) =>
    s.open || s.tab !== 'vaults' || !v || !VAULTS.some((x) => x.id === v)
      ? null
      : { open: v, side: 'deposit', amount: '', focus: 'amount', tap: 'vault:' + v },
  closeVault: (s) =>
    s.open && !s.submitting ? { open: null, amount: '', focus: null, tap: null } : null,
  side: (s, v) => (!s.open || s.side === v ? null : { side: (v as EA['side']) ?? 'deposit', amount: '', tap: 'side' }),

  focus: (s, v) => (s.open ? { focus: (v ?? null) as EA['focus'], pressed: null, tap: null } : null),
  key: (s, d) => {
    if (!s.open || !s.focus || !d || s.submitting) return null;
    return { amount: digits(s.amount, d), pressed: d, tap: null };
  },
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),
  max: (s) => (s.open && !s.submitting ? { amount: String(available(s)), tap: 'max' } : null),

  confirm: (s) => (s.submitting || !s.open || !ready(s) ? null : { submitting: true, step: 0, focus: null, tap: 'deposit' }),
  /**
   * Runs one PAST the last row so every line reads as done while the sheet is
   * still up, then closes it and lands the deposit. Same shape as the other
   * two cuts, and fixed there for the same reason.
   */
  step: (s) => {
    if (!s.submitting) return null;
    if (s.step < STEPS.length) return { step: s.step + 1 };
    return { submitting: false, step: -1, open: null, amount: '', earned: true, tap: null };
  },
};
