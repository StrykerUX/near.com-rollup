import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * A ONE-TIME CONFIDENTIAL DEPOSIT ADDRESS
 * ==================================================================
 * Rebuilt off `_refs/rec-Confidential deposit.MP4` at one frame per second.
 *
 * The screen is unusual for this app and unusual for the genre: it is three
 * quarters warning. Two of its three rules are printed in red, the Continue
 * button is dead until you tick a box saying you have read them, and the
 * address it eventually hands you expires. That is the feature — a flow whose
 * failure mode is losing the money has to spend its first screen on that.
 */

export const CRYPTO_BAL = 6675.98;
export const PERPS_BAL = 1053.89;
export const EARN_BAL = 2412.06;

export type Rule = { tone: 'ok' | 'no'; text: string };

/** the three lines on the Important step, frame 0:04 */
export const RULES: Rule[] = [
  { tone: 'ok', text: 'Minimum deposit value $1 USD' },
  { tone: 'no', text: 'Do not send a test deposit first' },
  { tone: 'no', text: 'Do not reuse, save, whitelist, or share the address' },
];

export const ACK =
  'I understand this is a single-use address, and that I must send at least $1 USD in one transfer.';

export type Net = { name: string; note?: string; internal?: boolean };

/**
 * WHAT A NETWORK IS SUPPORTED FOR DEPENDS ON THE TOKEN.
 * Tron is unsupported for USDC and supported for USDT, and the recording
 * switches token specifically to show that. A single flat list would have
 * missed the only interesting thing on this screen.
 */
export const NETWORKS: Record<string, string[]> = {
  USDC: ['NEAR', 'Solana', 'Gnosis', 'Ethereum', 'Base', 'Arbitrum', 'Polygon', 'BNB Smart Chain'],
  USDT: ['NEAR', 'Tron', 'Solana', 'Gnosis', 'Ethereum', 'Arbitrum'],
};
/** everything the picker knows about, so it can say no by name */
export const ALL_NETWORKS = [
  'NEAR', 'Tron', 'Solana', 'Gnosis', 'Ethereum', 'Base', 'Arbitrum',
  'Polygon', 'BNB Smart Chain', 'Zcash',
];

export const TOKENS = ['ZEC', 'NEAR', 'USDT', 'USDC', 'SOL', 'BTC', 'ETH'];

/** the address the last step hands over, frame 0:33 */
export const ADDRESS = 'TUtbk…Jsra';
export const VALID_DAYS = 3;

export type CD = {
  screen: 'account' | 'receive';
  stage: 'important' | 'configure' | 'deposit';
  /** the box that unlocks Continue */
  ack: boolean;
  token: string;
  network: string | null;
  /** the network search, which is the only way to be told a network is refused */
  query: string;
  over: 'none' | 'token' | 'network';
  /** the QR takes a moment to be issued, and the recording shows the wait */
  issued: boolean;
  tap: string | null;
};

export const initial: CD = {
  screen: 'account',
  stage: 'important',
  ack: false,
  token: 'USDC',
  network: null,
  query: '',
  over: 'none',
  issued: false,
  tap: null,
};

/* ---- derived ---------------------------------------------------------- */

export const supported = (s: CD) => NETWORKS[s.token] ?? [];
export const unsupported = (s: CD) => ALL_NETWORKS.filter((n) => !supported(s).includes(n));
/** the minimum, which the recording states in dollars and not in tokens */
export const minimum = (s: CD) => (s.token === 'USDT' ? 2 : 2);
export const configured = (s: CD) => s.network !== null;

export type CDAction =
  | 'toReceive' | 'home' | 'ack' | 'continue' | 'back'
  | 'tokenPicker' | 'pickToken' | 'netPicker' | 'search' | 'pickNet' | 'issue' | 'again';

const table: Record<CDAction, Act<CD>> = {
  toReceive: (s) => (s.screen === 'account' ? { screen: 'receive', tap: 'receive' } : null),
  home: (s) => (s.screen === 'account' ? null : { screen: 'account', over: 'none', tap: 'home' }),

  /* the box is the whole gate, and it starts closed */
  ack: (s) => (s.stage === 'important' ? { ack: !s.ack, tap: 'ack' } : null),
  continue: (s) => {
    if (s.stage === 'important') return s.ack ? { stage: 'configure', tap: 'continue' } : null;
    if (s.stage === 'configure') {
      return configured(s) ? { stage: 'deposit', issued: false, tap: 'continue' } : null;
    }
    return null;
  },
  back: (s) => {
    if (s.stage === 'deposit') return { stage: 'configure', issued: false, tap: 'back' };
    if (s.stage === 'configure') return { stage: 'important', tap: 'back' };
    return null;
  },

  tokenPicker: (s) =>
    s.stage === 'configure' ? { over: s.over === 'token' ? 'none' : 'token', tap: 'token' } : null,
  /* changing the token invalidates the network, because what is supported
     changed underneath it — silently keeping Tron for USDC would be the one
     mistake this screen cannot afford */
  pickToken: (s, v) =>
    s.over === 'token'
      ? { token: v ?? 'USDC', network: null, over: 'none', query: '', tap: 'pick' }
      : null,

  netPicker: (s) =>
    s.stage === 'configure' ? { over: s.over === 'network' ? 'none' : 'network', query: '', tap: 'net' } : null,
  search: (s, v) => (s.over === 'network' ? { query: v ?? '', tap: null } : null),
  pickNet: (s, v) =>
    s.over === 'network' && v && supported(s).includes(v)
      ? { network: v, over: 'none', query: '', tap: 'picknet' }
      : null,

  /** the address is issued, not looked up; the wait is real and it is shown */
  issue: (s) => (s.stage === 'deposit' && !s.issued ? { issued: true, tap: null } : null),
  /** "Create a new address" — and the old one stays live, as the copy says */
  again: (s) => (s.stage === 'deposit' && s.issued ? { issued: false, tap: 'again' } : null),
};

export const actions = table;
