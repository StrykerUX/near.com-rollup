import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * SENDING A SHIELDED ASSET
 * ==================================================================
 * Rebuilt off `_refs/rec-Confidential Send (able to send any assets to pay in
 * any assets confidentially).MP4`. Ten seconds, and the shortest of the five —
 * which is the point of it: sending a confidential asset is the same screen,
 * with the same three rows, as sending anything else. There is no separate
 * confidential mode to find.
 */

export const CRYPTO_BAL = 6675.99;
export const PERPS_BAL = 1053.89;
export const EARN_BAL = 2412.09;

export const NEAR_QTY = 3535.3148;
export const NEAR_USD = 6611.04;
/** what a ZEC costs, from the recording's own 1 ZEC → $801 */
export const ZEC_USD = 801;

export const TOKENS = [
  { sym: 'ZEC', name: 'Zcash', network: 'Zcash' },
  { sym: 'USDT', name: 'Tether USD', network: 'Ethereum' },
  { sym: 'USDC', name: 'USD Coin', network: 'Ethereum' },
  { sym: 'SOL', name: 'Solana', network: 'Solana' },
  { sym: 'BTC', name: 'Bitcoin', network: 'Bitcoin' },
  { sym: 'BTCL', name: 'Bitcoin (Legacy)', network: 'Bitcoin' },
];

export type CS = {
  screen: 'account' | 'send';
  token: string;
  network: string;
  amount: string;
  /** the exchange-credit notice, which only some routes raise */
  ack: boolean;
  over: 'none' | 'token';
  focus: 'amount' | null;
  pressed: string | null;
  tap: string | null;
};

export const initial: CS = {
  screen: 'account',
  token: 'NEAR',
  network: 'NEAR',
  amount: '',
  ack: false,
  over: 'none',
  focus: null,
  pressed: null,
  tap: null,
};

/** the notice belongs to the route it is true of, and to no other */
export const needsAck = (s: CS) => s.token === 'NEAR' && s.network === 'NEAR';
export const price = (sym: string) => (sym === 'ZEC' ? ZEC_USD : sym === 'NEAR' ? 1.87 : 1);
export const usdOf = (s: CS) => (Number(s.amount) || 0) * price(s.token);

export type CSAction =
  | 'toSend' | 'home' | 'picker' | 'pick' | 'ack' | 'key' | 'focus' | 'done';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 10);
};

export const actions: Record<CSAction, Act<CS>> = {
  toSend: (s) => (s.screen === 'send' ? null : { screen: 'send', focus: 'amount', tap: 'send' }),
  home: (s) => (s.screen === 'account' ? null : { screen: 'account', over: 'none', tap: 'home' }),

  picker: (s) =>
    s.screen === 'send' ? { over: s.over === 'token' ? 'none' : 'token', tap: 'token' } : null,
  /* the network follows the token: a shielded asset has exactly one chain it
     can be shielded on, and picking it separately would only be a way to get
     it wrong */
  pick: (s, v) => {
    if (s.over !== 'token') return null;
    const t = TOKENS.find((x) => x.sym === v);
    return t
      ? { token: t.sym, network: t.network, over: 'none', amount: '', focus: 'amount', tap: 'pick' }
      : { token: 'NEAR', network: 'NEAR', over: 'none', amount: '', focus: 'amount', tap: 'pick' };
  },

  ack: (s) => (needsAck(s) ? { ack: !s.ack, tap: 'ack' } : null),
  key: (s, d) => (s.screen === 'send' && d ? { amount: digits(s.amount, d), pressed: d } : null),
  focus: (s, v) => (s.screen === 'send' ? { focus: (v ?? null) as CS['focus'], pressed: null } : null),
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),
};
