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
  /** which control the flow just pressed — see the note in perps.ts */
  tap: string | null;
};

const initial: AccountState = {
  screen: 'home',
  amount: '',
  pressed: null,
  focus: false,
  payWith: 'NEAR',
  swapping: false,
  tap: null,
};

const beats: Beat<AccountState>[] = [
  { ms: 3000, set: { screen: 'home' } },
  /* A press and the screen it opens are TWO beats. Collapsed into one, the
     control that was tapped unmounts on the same frame it lights up — the
     press is never seen and the two screens read as unrelated slides. */
  { ms: 210, set: { tap: 'send' } },
  /* short and sharp: the only beat that says the amount was typed */
  { ms: 320, set: { screen: 'send', focus: true, amount: '1', pressed: '1', tap: null } },
  { ms: 1600, set: { amount: '100', pressed: null, tap: null } },
  { ms: 620, set: { swapping: true, tap: 'paywith' } },
  { ms: 4200, set: { payWith: 'vault', swapping: false, focus: false, tap: null } },
];

export const accountScript: Script<AccountState> = {
  initial,
  beats,
  /* the send funded from the vault — the one frame that carries the claim */
  restFrame: beats.length - 1,
};
