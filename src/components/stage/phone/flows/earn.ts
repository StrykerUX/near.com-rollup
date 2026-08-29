import type { Beat, Machine } from './machine';

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
  /** which vault the sheet is showing */
  vault: number;
  /** the sheet's own segmented control */
  side: 'Deposit' | 'Withdraw';
  amount: string;
  /** the keypad is attached once there is an amount field to fill */
  focus: boolean;
  pressed: string | null;
  /** highlights the Use max chip on the beat it is pressed */
  maxed: boolean;
  step: number;
  /** which control was just pressed — see the note in perps.ts */
  tap: string | null;
};

export const VAULTS = [
  { name: 'Gauntlet USDC', tvl: 4_320_920_000, tvlLabel: '$4.32B', apr: '4.52%', bal: '$1,343', promo: false },
  { name: 'Taler USDC', tvl: 854_153, tvlLabel: '$854.15K', apr: '5.80%', bal: '$1,047', promo: true },
];

const initial: EarnState = {
  screen: 'list',
  tab: 'Vaults',
  vault: 1,
  side: 'Deposit',
  amount: '',
  focus: false,
  pressed: null,
  maxed: false,
  step: 0,
  tap: null,
};

export const DEPOSIT_STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];
/** the wallet balance the Use max chip fills in */
export const AVAILABLE = '22.555228';

export type EarnAction = 'tab' | 'openVault' | 'close' | 'side' | 'focus' | 'blur' | 'key' | 'max' | 'deposit' | 'step';

const actions: Machine<EarnState, EarnAction>['actions'] = {
  /* Staking is a real tab in the app and it is empty here on purpose — an app
     that pretends every tab is finished is an app nobody believes. */
  tab: (s, v) => (s.tab === v ? null : { tab: v as EarnState['tab'], tap: 'tab' }),
  openVault: (s, v) =>
    s.screen === 'list' && s.tab === 'Vaults'
      ? { screen: 'vault', vault: Number(v ?? 1), tap: 'vaultrow' }
      : null,
  close: (s) =>
    s.screen === 'vault' || s.screen === 'done'
      ? { ...initial, tap: null }
      : null,
  side: (s, v) => (s.side === v ? null : { side: v as EarnState['side'], amount: '', tap: 'side' }),
  focus: (s) => (s.screen === 'vault' ? { focus: true, tap: null } : null),
  /* the ✓ on the keypad's accessory bar — see the note in account.ts */
  blur: (s) => (s.focus ? { focus: false, pressed: null } : null),
  key: (s, d) => {
    if (s.screen !== 'vault' || !d) return null;
    if (d === '⌫') return { amount: s.amount.slice(0, -1), pressed: d, maxed: false };
    if (d === ',') return s.amount.includes('.') ? null : { amount: (s.amount || '0') + '.', pressed: d };
    if (s.amount.length >= 10) return null;
    return { amount: s.amount === '0' ? d : s.amount + d, pressed: d, focus: true, maxed: false };
  },
  max: (s) => (s.screen === 'vault' ? { amount: AVAILABLE, maxed: true, tap: 'max' } : null),
  /* the whole transition, not just the highlight — see the note in perps.ts */
  deposit: (s) =>
    s.screen === 'vault' && Number(s.amount) > 0
      ? { screen: 'depositing', step: 0, focus: false, tap: null }
      : null,
  step: (s) => {
    if (s.screen !== 'depositing') return null;
    return s.step >= 2 ? { screen: 'done', step: 3 } : { step: s.step + 1 };
  },
};

const beats: Beat<EarnState, EarnAction>[] = [
  { ms: 3000 },
  { ms: 3000, do: 'openVault', arg: '1' },
  /* Use max rather than a typed amount: it is one tap in the real app and the
     figure it produces is the honest one. */
  { ms: 560, do: 'max' },
  { ms: 2400, set: { maxed: false, tap: null } },
  /* A press and the screen it opens are TWO beats — see perps.ts. */
  { ms: 380, set: { tap: 'deposit' } },
  { ms: 700, do: 'deposit' },
  { ms: 2000, do: 'step' },
  { ms: 1000, do: 'step' },
  /* A beat's `ms` is the wait BEFORE it fires, so the hold on the OUTCOME
     belongs to `outro`, not to the beat that produces it. Getting this the
     wrong way round left the finished screen on for the outro alone while the
     screen before it sat there for four seconds doing nothing. */
  { ms: 1000, do: 'step' },
];

/**
 * THE RAIL. The sheet is open for everything a deposit needs — the two vaults,
 * the two sides, the keypad, Use max — and shut once the deposit is in flight.
 */
const guided = (s: EarnState): EarnAction[] => {
  if (s.screen === 'list') return ['tab', 'openVault'];
  if (s.screen === 'vault') return ['side', 'focus', 'blur', 'key', 'max', 'deposit', 'close'];
  if (s.screen === 'done') return ['close'];
  return [];
};

export const earn: Machine<EarnState, EarnAction> = {
  initial,
  actions,
  beats,
  guided,
  anchor: { openVault: 1, max: 2, deposit: 5, close: 0 },
  auto: (s) => (s.screen === 'depositing' ? { after: 1500, do: 'step' } : null),
  /* the vault sheet with an amount in it: the yield, the fees and the ask */
  restFrame: 3,
  /* the settled deposit holds here while the card leaves */
  outro: 3800,
};
