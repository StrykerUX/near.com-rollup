import type { Beat, Script } from './player';

/**
 * SWAP — the cross-chain path, and the three beats of settlement that make it
 * read as a route rather than a form submit.
 *
 * The pair is deliberately one you cannot do on a single chain: USDT on Tron
 * into NEAR. That is the claim the card's copy makes, so the demo has to make
 * it too.
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

/** typing the search, one letter at a time */
function typeQuery(word: string, ms = 150): Beat<SwapState>[] {
  const out: Beat<SwapState>[] = [];
  let acc = '';
  for (const ch of word) {
    acc += ch;
    out.push({ ms, set: { query: acc } });
  }
  return out;
}

const beats: Beat<SwapState>[] = [
  { ms: 1400, set: { screen: 'form', sheet: 'none' } },
  /* pick the destination */
  { ms: 700, set: { sheet: 'token' } },
  ...typeQuery('nea'),
  { ms: 800, set: { to: 'NEAR' } },
  { ms: 500, set: { sheet: 'none', query: '' } },
  { ms: 1500 },
  /* confirm */
  { ms: 2400, set: { screen: 'review' } },
  /* settle. The middle beat is the long one — routing is where the time
     actually goes, and a checklist whose rows tick at equal speed reads as a
     progress bar with extra steps. */
  { ms: 1300, set: { screen: 'settling', step: 0 } },
  { ms: 2100, set: { step: 1 } },
  { ms: 900, set: { step: 2 } },
  /* step 3 is past the last row: every one of them checked. Leaving it at 2
     holds a spinner on "Trade complete", which is the one row that cannot
     still be in progress. */
  { ms: 2600, set: { screen: 'done', step: 3 } },
  { ms: 700, set: { screen: 'form', to: 'ZEC', step: 0 } },
];

export const swapScript: Script<SwapState> = {
  initial,
  beats,
  /* the settled trade: both legs, the route and the outcome in one frame */
  restFrame: beats.length - 2,
};
