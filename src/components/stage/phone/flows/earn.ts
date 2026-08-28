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
  { w: 4, set: { screen: 'list' } },
  { w: 4, set: { screen: 'vault' } },
  /* Use max rather than a typed amount: it is one tap in the real app and the
     figure it produces is the honest one. */
  { w: 1, set: { maxed: true } },
  { w: 4, set: { amount: AVAILABLE, maxed: false } },
  { w: 2, set: { screen: 'depositing', step: 0 } },
  { w: 3, set: { step: 1 } },
  { w: 1, set: { step: 2 } },
  { w: 5, set: { screen: 'done', step: 3 } },
];

export const earnScript: Script<EarnState> = {
  initial,
  beats,
  /* the vault sheet with an amount in it: the yield, the fees and the ask */
  restFrame: 3,
};
