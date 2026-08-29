import type { Beat, Machine } from './machine';

/**
 * ACCOUNT → UNIVERSAL SEND.
 *
 * The beat that matters is `payWith` switching from a plain token balance to
 * the Earn vault. Spending straight out of a yield-earning deposit — no
 * unwinding, no moving funds out — is the sentence this card's copy already
 * makes, and this is the screen that shows it happening.
 */
export type AccountState = {
  screen: 'home' | 'send' | 'review' | 'sending' | 'sent';
  /** what is being sent, and where */
  token: string;
  network: string;
  amount: string;
  pressed: string | null;
  focus: boolean;
  /** which balance the send is funded from */
  payWith: 'NEAR' | 'vault';
  /** the amber notice the real app raises on exchange-bound transfers */
  ack: boolean;
  /** the token sheet, opened off the Token row */
  sheet: 'none' | 'token' | 'pay';
  /** lights the row while the source is changing */
  swapping: boolean;
  /** index into the sending checklist */
  step: number;
  /** which control was just pressed — see the note in perps.ts */
  tap: string | null;
};

const initial: AccountState = {
  screen: 'home',
  token: 'ZEC',
  network: 'Zcash',
  amount: '',
  pressed: null,
  focus: false,
  payWith: 'NEAR',
  ack: false,
  sheet: 'none',
  swapping: false,
  step: 0,
  tap: null,
};

export const SEND_STEPS = ['Confirm in wallet', 'Routing payment', 'Delivered'];

/** token → the network the app defaults it to */
export const NETWORKS: Record<string, string> = {
  ZEC: 'Zcash', NEAR: 'NEAR', USDT: 'Tron', USDC: 'Solana', BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana',
};

export type AccountAction =
  | 'send' | 'receive' | 'back' | 'picker' | 'pick' | 'payPicker' | 'pay'
  | 'focus' | 'blur' | 'key' | 'max' | 'ack' | 'review' | 'confirm' | 'step' | 'again';

const actions: Machine<AccountState, AccountAction>['actions'] = {
  /* the whole transition, not just the highlight — see the note in perps.ts */
  send: (s) => (s.screen === 'home' ? { screen: 'send', focus: true, tap: null } : null),
  /* Receive is a real button on this screen and it goes nowhere here. Better a
     control that says so than one that silently does nothing. */
  receive: () => null,
  back: (s) =>
    s.sheet !== 'none'
      ? { sheet: 'none', tap: null }
      : s.screen === 'send'
        ? { ...initial }
        : null,

  picker: (s) => (s.screen === 'send' ? { sheet: 'token', tap: 'token' } : null),
  pick: (s, sym) =>
    sym ? { token: sym, network: NETWORKS[sym] ?? sym, sheet: 'none', amount: '', tap: null } : null,

  payPicker: (s) => (s.screen === 'send' ? { sheet: 'pay', tap: 'paywith' } : null),
  pay: (s, v) => ({ payWith: v as AccountState['payWith'], sheet: 'none', swapping: false, tap: null }),

  focus: (s) => (s.screen === 'send' ? { focus: true } : null),
  /* the ✓ on the keypad's accessory bar. The send's own button is behind the
     pad while the pad is up, so this is the only way back to it. */
  blur: (s) => (s.focus ? { focus: false, pressed: null } : null),
  key: (s, d) => {
    if (s.screen !== 'send' || !d) return null;
    if (d === '⌫') return { amount: s.amount.slice(0, -1), pressed: d };
    if (d === ',') return s.amount.includes('.') ? null : { amount: (s.amount || '0') + '.', pressed: d };
    if (s.amount.length >= 9) return null;
    return { amount: s.amount === '0' ? d : s.amount + d, pressed: d, focus: true };
  },
  max: (s) => (s.screen === 'send' ? { amount: '100', focus: true, tap: 'max' } : null),
  ack: (s) => ({ ack: !s.ack, tap: 'ack' }),
  /* the guard: an amount, and the notice acknowledged */
  review: (s) =>
    s.screen === 'send' && Number(s.amount) > 0 && s.ack
      ? { screen: 'review', focus: false, tap: null }
      : null,
  confirm: (s) => (s.screen === 'review' ? { screen: 'sending', step: 0, tap: 'confirm' } : null),
  step: (s) => {
    if (s.screen !== 'sending') return null;
    return s.step >= 2 ? { screen: 'sent', step: 3 } : { step: s.step + 1 };
  },
  again: (s) => (s.screen === 'sent' ? { ...initial } : null),
};

const beats: Beat<AccountState, AccountAction>[] = [
  { ms: 3400 },
  { ms: 280, set: { tap: 'send' } },
  { ms: 420, do: 'send' },
  /* one key at a time: the only beats that say the amount was typed */
  { ms: 320, do: 'key', arg: '1' },
  { ms: 230, do: 'key', arg: '0' },
  { ms: 1500, do: 'key', arg: '0', set: { pressed: null } },
  /* acknowledge the notice, the way the real screen makes you */
  { ms: 1400, do: 'ack' },
  /* and the beat the card is about: fund it out of the vault */
  { ms: 900, do: 'payPicker' },
  { ms: 1500, set: { swapping: true } },
  { ms: 2600, do: 'pay', arg: 'vault', set: { focus: false } },
  /* then it actually sends, out of the vault, without unwinding it */
  { ms: 1700, set: { tap: 'review' } },
  { ms: 600, do: 'review' },
  { ms: 1900, do: 'confirm' },
  { ms: 1800, do: 'step' },
  { ms: 900, do: 'step' },
  /* A beat's `ms` is the wait BEFORE it fires, so the hold on the OUTCOME
     belongs to `outro`, not to the beat that produces it. Getting this the
     wrong way round left the finished screen on for the outro alone while the
     screen before it sat there for four seconds doing nothing. */
  { ms: 900, do: 'step' },
];

/**
 * THE RAIL. Home offers the one door that leads somewhere; the send form is
 * open all the way down, because "pay with anything you own" is a claim you
 * have to be able to try rather than watch.
 */
const guided = (s: AccountState): AccountAction[] => {
  if (s.screen === 'home') return ['send', 'receive'];
  if (s.sheet === 'token') return ['pick', 'back'];
  if (s.sheet === 'pay') return ['pay', 'back'];
  if (s.screen === 'review') return ['confirm', 'back'];
  if (s.screen === 'sent') return ['again'];
  if (s.screen === 'sending') return [];
  return ['picker', 'payPicker', 'focus', 'blur', 'key', 'max', 'ack', 'review', 'back'];
};

export const account: Machine<AccountState, AccountAction> = {
  initial,
  actions,
  beats,
  guided,
  anchor: { send: 2, ack: 6, payPicker: 7, pay: 9, review: 11, confirm: 12 },
  auto: (s) => (s.screen === 'sending' ? { after: 1500, do: 'step' } : null),
  /* the delivered send holds here while the card leaves */
  outro: 3600,
  /* the send funded from the vault — the one frame that carries the claim */
  restFrame: 9,
};
