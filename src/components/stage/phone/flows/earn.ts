import type { Beat, Script } from './player';

/**
 * EARN — a vault, its fees, and a deposit that settles.
 *
 * The fee rows are the point of the vault sheet, not decoration: a yield number
 * with no fees under it is the thing every DeFi screenshot does and every
 * reader has learned to distrust.
 */
export type EarnState = {
  screen: 'list' | 'vault' | 'depositing' | 'done';
  tab: 'Vaults' | 'Staking';
  /** the deposit amount */
  amount: string;
  /** highlights the Use max chip on the beat it is pressed */
  maxed: boolean;
  step: number;
  /** which control the flow just pressed — see the note in perps.ts */
  tap: string | null;
};

const initial: EarnState = {
  screen: 'list',
  tab: 'Vaults',
  amount: '',
  maxed: false,
  step: 0,
  tap: null,
};

export const DEPOSIT_STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];
/** the wallet balance the Use max chip fills in */
export const AVAILABLE = '22.555228';

const beats: Beat<EarnState>[] = [
  { ms: 2600, set: { screen: 'list' } },
  { ms: 2600, set: { screen: 'vault', tap: 'vaultrow' } },
  /* Use max rather than a typed amount: it is one tap in the real app and the
     figure it produces is the honest one. */
  { ms: 420, set: { maxed: true, tap: 'max' } },
  { ms: 1800, set: { amount: AVAILABLE, maxed: false, tap: null } },
  /* A press and the screen it opens are TWO beats. Collapsed into one, the
     control that was tapped unmounts on the same frame it lights up — the
     press is never seen and the two screens read as unrelated slides. */
  { ms: 280, set: { tap: 'deposit' } },
  { ms: 950, set: { screen: 'depositing', step: 0, tap: null } },
  { ms: 1600, set: { step: 1 } },
  { ms: 800, set: { step: 2 } },
  { ms: 3000, set: { screen: 'done', step: 3 } },
];

export const earnScript: Script<EarnState> = {
  initial,
  beats,
  /* the vault sheet with an amount in it: the yield, the fees and the ask */
  restFrame: beats.findIndex((b) => b.set?.amount === AVAILABLE),
};
