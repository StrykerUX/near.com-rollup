import type { Beat, Script } from './player';

/**
 * EARN — a vault, its fees, and a deposit that settles.
 *
 * The fee rows are the point of the vault sheet, not decoration: a yield
 * number with no fees under it is the thing every DeFi screenshot does and
 * every reader has learned to distrust.
 */
export type EarnState = {
  screen: 'list' | 'vault' | 'depositing' | 'done';
  tab: 'Vaults' | 'Staking';
  /** the deposit amount, as typed */
  amount: string;
  /** highlights the Use max chip on the beat it is pressed */
  maxed: boolean;
  step: number;
};

const initial: EarnState = {
  screen: 'list',
  tab: 'Vaults',
  amount: '',
  maxed: false,
  step: 0,
};

export const DEPOSIT_STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];
/** the wallet balance the Use max chip fills in */
export const AVAILABLE = '22.555228';

const beats: Beat<EarnState>[] = [
  { ms: 1600, set: { screen: 'list' } },
  { ms: 900, set: { screen: 'vault' } },
  { ms: 1500 },
  /* Use max rather than a typed amount: it is one tap in the real app and the
     figure it produces is the honest one. */
  { ms: 420, set: { maxed: true } },
  { ms: 900, set: { amount: AVAILABLE, maxed: false } },
  { ms: 1100 },
  { ms: 1000, set: { screen: 'depositing', step: 0 } },
  { ms: 1600, set: { step: 1 } },
  { ms: 1100, set: { step: 2 } },
  /* past the last row: "Deposited" takes its check rather than holding a
     spinner behind the Close button */
  { ms: 2400, set: { screen: 'done', step: 3 } },
  { ms: 800, set: { screen: 'list', amount: '', step: 0 } },
];

export const earnScript: Script<EarnState> = {
  initial,
  beats,
  /* the vault sheet with an amount in it: the yield, the fees and the ask */
  restFrame: 5,
};
