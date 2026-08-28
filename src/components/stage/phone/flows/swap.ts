import type { Beat, Script } from './player';

/**
 * SWAP — the cross-chain path, and the three beats of settlement that make it
 * read as a route rather than a form submit.
 *
 * The pair is deliberately one you cannot do on a single chain: USDT on Tron
 * into NEAR. That is the claim the card's copy makes, so the demo makes it too.
 */
export type SwapState = {
  screen: 'form' | 'review' | 'settling' | 'done';
  sheet: 'none' | 'token';
  /** what the search field has been typed into */
  query: string;
  to: 'ZEC' | 'NEAR';
  /** index into the settlement checklist */
  step: number;
};

const initial: SwapState = {
  screen: 'form',
  sheet: 'none',
  query: '',
  to: 'ZEC',
  step: 0,
};

export const SETTLE_STEPS = ['Finding best price', 'Executing trade', 'Trade complete'];

const beats: Beat<SwapState>[] = [
  { w: 4, set: { screen: 'form', sheet: 'none' } },
  /* pick the destination */
  { w: 2, set: { sheet: 'token' } },
  { w: 2, set: { query: 'nea' } },
  { w: 3, set: { to: 'NEAR', sheet: 'none', query: '' } },
  /* confirm */
  { w: 3, set: { screen: 'review' } },
  /* settle. The middle beat is the long one — routing is where the time
     actually goes, and a checklist whose rows tick at equal speed reads as a
     progress bar with extra steps. */
  { w: 2, set: { screen: 'settling', step: 0 } },
  { w: 3, set: { step: 1 } },
  { w: 1, set: { step: 2 } },
  { w: 5, set: { screen: 'done', step: 3 } },
];

export const swapScript: Script<SwapState> = {
  initial,
  beats,
  /* the settled trade: both legs, the route and the outcome in one frame */
  restFrame: beats.length - 1,
};
