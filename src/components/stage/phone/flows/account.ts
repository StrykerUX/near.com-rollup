import type { Beat, Script } from './player';

/**
 * ACCOUNT → UNIVERSAL SEND.
 *
 * The beat that matters is `payWith` switching from a plain token balance to
 * the Earn vault. Spending straight out of a yield-earning deposit — no
 * unwinding, no moving funds out — is the sentence this card's copy already
 * makes, and this is the screen that shows it happening.
 */
export type AccountState = {
  screen: 'home' | 'send';
  amount: string;
  pressed: string | null;
  focus: boolean;
  /** which balance the send is funded from */
  payWith: 'NEAR' | 'vault';
  /** lights the row while the source is being changed */
  swapping: boolean;
};

const initial: AccountState = {
  screen: 'home',
  amount: '',
  pressed: null,
  focus: false,
  payWith: 'NEAR',
  swapping: false,
};

function type(digits: string, ms = 140): Beat<AccountState>[] {
  const out: Beat<AccountState>[] = [];
  let acc = '';
  for (const d of digits) {
    acc += d;
    out.push({ ms, set: { amount: acc, pressed: d } });
    out.push({ ms: 60, set: { pressed: null } });
  }
  return out;
}

const beats: Beat<AccountState>[] = [
  { ms: 1800, set: { screen: 'home' } },
  { ms: 900, set: { screen: 'send', focus: true } },
  ...type('100'),
  { ms: 1200 },
  /* the switch */
  { ms: 700, set: { swapping: true } },
  { ms: 1900, set: { payWith: 'vault', swapping: false, focus: false } },
  { ms: 2200 },
  { ms: 800, set: { screen: 'home', amount: '', payWith: 'NEAR' } },
];

export const accountScript: Script<AccountState> = {
  initial,
  beats,
  /* the send funded from the vault — the one frame that carries the claim */
  restFrame: beats.length - 2,
};
