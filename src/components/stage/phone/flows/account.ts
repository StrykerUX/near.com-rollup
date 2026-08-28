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
  /** lights the row while the source is changing */
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

const beats: Beat<AccountState>[] = [
  { w: 5, set: { screen: 'home' } },
  /* w:2 — see the note in perps.ts: below that this beat is narrower than one
     wheel notch and the typing is never seen */
  { w: 2, set: { screen: 'send', focus: true, amount: '1', pressed: '1' } },
  { w: 4, set: { amount: '100', pressed: null } },
  { w: 1, set: { swapping: true } },
  { w: 7, set: { payWith: 'vault', swapping: false, focus: false } },
];

export const accountScript: Script<AccountState> = {
  initial,
  beats,
  /* the send funded from the vault — the one frame that carries the claim */
  restFrame: beats.length - 1,
};
