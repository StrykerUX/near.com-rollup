import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * EARN, AND SPENDING WHAT IT EARNS
 * ==================================================================
 * Rebuilt off `_refs/rec-Earn + being able to send:pay from your earn
 * balance.MP4` at one frame per second. Two halves: putting a balance into a
 * vault, and then paying someone out of a vault without taking it out first.
 * The second half is the reason the first one matters.
 */

export const CRYPTO_BAL = 6698.54;
export const PERPS_BAL = 1053.89;

export type Vault = {
  id: 'gauntlet' | 'taler';
  name: string;
  tvl: string;
  apr: string;
  /** what this account already has in it, frame 0:06 */
  balance: number;
  promo?: boolean;
  desc: string;
};

export const VAULTS: Vault[] = [
  {
    id: 'gauntlet', name: 'Gauntlet USDC', tvl: '$432.92M', apr: '4.52%', balance: 1343.03,
    desc: 'This yield vault is curated by Gauntlet, and is built on Ethereum.',
  },
  {
    id: 'taler', name: 'Taler USDC', tvl: '$854.15K', apr: '5.80%', balance: 1046.51, promo: true,
    desc: 'This yield vault is provided by Taler, a NEAR ecosystem company, and managed by the TAU Labs team, and is built on Ethereum.',
  },
];

export const vaultOf = (id: string) => VAULTS.find((v) => v.id === id)!;

/** the wallet balance the deposit comes out of, frame 0:22 */
export const USDC_AVAIL = 22.555228;
export const FEES = [
  ['Deposit fee', 'Variable, up to 0.01%'],
  ['Withdrawal fee', 'Fixed, 0.05%'],
  ['Performance fee', '0% through Oct 31, 2026. Future rate to be announced.'],
] as const;
export const REFERENCE = 'CcX9D…FtYC';
export const DEPOSIT_STEPS = ['Confirm in wallet', 'Depositing', 'Deposited'];

/** what the second half sends, frame 1:52 */
export const ZEC_USD = 800.29;
export const NEAR_QTY = 3535.3148;
export const NEAR_USD = 6611.04;

export const TOKENS = [
  { sym: 'ZEC', name: 'Zcash', network: 'Zcash' },
  { sym: 'USDT', name: 'Tether USD', network: 'Ethereum' },
  { sym: 'USDC', name: 'USD Coin', network: 'Ethereum' },
  { sym: 'SOL', name: 'Solana', network: 'Solana' },
  { sym: 'BTC', name: 'Bitcoin', network: 'Bitcoin' },
];

export type EA = {
  screen: 'account' | 'earn' | 'send';
  tab: 'vaults' | 'staking';

  /* the vault sheet */
  open: 'gauntlet' | 'taler' | null;
  side: 'Deposit' | 'Withdraw';
  amount: string;
  step: number;
  deposited: boolean;

  /* the send */
  token: string;
  network: string;
  /** what pays for it: a wallet token, or a vault balance */
  pay: string;
  samount: string;
  /** the "I understand" on the exchange-credit warning */
  ack: boolean;

  over: 'none' | 'vault' | 'passkey' | 'token' | 'paywith';
  auth: 'ask' | 'signing' | 'done';
  focus: 'amount' | 'send' | null;
  pressed: string | null;
  tap: string | null;
};

export const initial: EA = {
  screen: 'account',
  tab: 'vaults',
  open: null,
  side: 'Deposit',
  amount: '',
  step: -1,
  deposited: false,
  token: 'NEAR',
  network: 'NEAR',
  pay: 'NEAR',
  samount: '',
  ack: false,
  over: 'none',
  auth: 'ask',
  focus: null,
  pressed: null,
  tap: null,
};

/* ---- derived ---------------------------------------------------------- */

/** a vault's balance, which grows by exactly what was deposited into it */
export const balanceOf = (s: EA, id: string) =>
  vaultOf(id).balance + (s.deposited && s.open === id ? Number(s.amount) : 0);

export const earnTotal = (s: EA) => VAULTS.reduce((t, v) => t + balanceOf(s, v.id), 0);

/**
 * The warning only belongs on the transfers it is true of. NEAR sent to the
 * NEAR network can land at an exchange that does not credit it; a shielded
 * Zcash transfer has a different problem and does not get this notice.
 */
export const needsAck = (s: EA) => s.token === 'NEAR' && s.network === 'NEAR';

export const payBalance = (s: EA) =>
  s.pay === 'NEAR' ? NEAR_USD : balanceOf(s, s.pay);
export const payLabel = (s: EA) => (s.pay === 'NEAR' ? 'NEAR' : vaultOf(s.pay).name);

export const sendUsd = (s: EA) => (Number(s.samount) || 0) * (s.token === 'ZEC' ? ZEC_USD : 1.87);

/**
 * The send cannot be reviewed without a recipient, and the recording never
 * picks one — which is why its button is grey in every frame of the last
 * thirty seconds. Keeping that honest is the point: the screen is showing what
 * it can pay WITH, not completing a payment.
 */
export const canReview = () => false;

export type EAAction =
  | 'toEarn' | 'home' | 'tab' | 'openVault' | 'closeVault' | 'side'
  | 'max' | 'key' | 'deposit' | 'step' | 'close'
  | 'toSend' | 'tokenPicker' | 'pickToken' | 'payPicker' | 'pickPay'
  | 'ack' | 'skey' | 'focus' | 'done';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 10);
};

/** the passkey is modal — see the same note in the swap machine */
const modal = (f: Act<EA>): Act<EA> => (s, v) => (s.over === 'passkey' ? null : f(s, v));

const table: Record<EAAction, Act<EA>> = {
  toEarn: (s) => (s.screen === 'account' ? { screen: 'earn', tap: 'earn' } : null),
  home: (s) => (s.screen === 'account' ? null : { screen: 'account', over: 'none', tap: 'home' }),
  tab: (s, v) => (s.tab === v ? null : { tab: (v as EA['tab']) ?? 'vaults', tap: 'tab' }),

  openVault: (s, v) =>
    s.screen === 'earn'
      ? { over: 'vault', open: (v as EA['open']) ?? 'taler', amount: '', step: -1, side: 'Deposit', tap: 'vault' }
      : null,
  /* a settling deposit has no way out until it says Deposited */
  closeVault: (s) =>
    s.over === 'vault' && (s.step < 0 || s.deposited) ? { over: 'none', tap: null } : null,
  side: (s, v) => (s.over === 'vault' && s.side !== v
    ? { side: (v as EA['side']) ?? 'Deposit', amount: '', tap: 'side' } : null),

  max: (s) => (s.over === 'vault' ? { amount: String(USDC_AVAIL), tap: 'max' } : null),
  key: (s, d) => (s.over === 'vault' && d ? { amount: digits(s.amount, d), pressed: d } : null),

  deposit: (s) =>
    s.over === 'vault' && Number(s.amount) > 0 && !s.deposited
      ? { over: 'passkey', auth: 'ask', step: -1, tap: 'deposit' }
      : null,
  step: (s) => {
    if (s.over === 'passkey') {
      if (s.auth === 'ask') return { auth: 'signing' };
      if (s.auth === 'signing') return { auth: 'done' };
      return { over: 'vault', step: 0 };
    }
    /* the index runs one PAST the last row, so that row can be ticked rather
       than left spinning forever — and the balance moves with that tick, not
       before it */
    if (s.step < 0 || s.step >= DEPOSIT_STEPS.length) return null;
    const step = s.step + 1;
    return step === DEPOSIT_STEPS.length ? { step, deposited: true } : { step };
  },
  close: (s) => (s.over === 'vault' && s.deposited ? { over: 'none', step: -1, tap: 'close' } : null),

  /* ---- paying out of a vault ---- */
  toSend: (s) => (s.screen === 'send' ? null : { screen: 'send', over: 'none', tap: 'send' }),
  tokenPicker: (s) =>
    s.screen === 'send' ? { over: s.over === 'token' ? 'none' : 'token', tap: 'token' } : null,
  pickToken: (s, v) => {
    if (s.over !== 'token') return null;
    const t = TOKENS.find((x) => x.sym === v);
    /* the network follows the token, because a token that could be on any
       network is a token you have not chosen yet */
    return t
      ? { token: t.sym, network: t.network, over: 'none', samount: '', tap: 'pick' }
      : { token: 'NEAR', network: 'NEAR', over: 'none', samount: '', tap: 'pick' };
  },
  payPicker: (s) =>
    s.screen === 'send' ? { over: s.over === 'paywith' ? 'none' : 'paywith', tap: 'pay' } : null,
  /**
   * THE FEATURE. A vault balance is offered in the same list as the wallet
   * tokens, so paying out of yield is a choice made in passing rather than a
   * withdrawal you have to plan.
   */
  pickPay: (s, v) => (s.over === 'paywith' ? { pay: v ?? 'NEAR', over: 'none', tap: 'pickpay' } : null),

  ack: (s) => (needsAck(s) ? { ack: !s.ack, tap: 'ack' } : null),
  skey: (s, d) => (s.screen === 'send' && d ? { samount: digits(s.samount, d), pressed: d } : null),
  focus: (s, v) => ({ focus: (v ?? null) as EA['focus'], pressed: null, tap: null }),
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),
};

const OPEN_UNDER_PASSKEY: EAAction[] = ['step'];

export const actions = Object.fromEntries(
  (Object.keys(table) as EAAction[]).map((k) => [
    k, OPEN_UNDER_PASSKEY.includes(k) ? table[k] : modal(table[k]),
  ]),
) as Record<EAAction, Act<EA>>;
