import type { Beat, Machine } from './machine';

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
  to: string;
  /** the percentage chip that sized the send */
  pct: 25 | 50 | 75 | 100;
  /** index into the settlement checklist */
  step: number;
  /** which control was just pressed — see the note in perps.ts */
  tap: string | null;
};

const initial: SwapState = {
  screen: 'form',
  sheet: 'none',
  query: '',
  to: 'ZEC',
  pct: 100,
  step: 0,
  tap: null,
};

export const SETTLE_STEPS = ['Finding best price', 'Executing trade', 'Trade complete'];
/** the USDT leg, before the percentage chip sizes it */
export const BALANCE = 6635.6169;

export type SwapAction = 'picker' | 'query' | 'pick' | 'pct' | 'review' | 'swap' | 'step' | 'again' | 'back';

const actions: Machine<SwapState, SwapAction>['actions'] = {
  picker: (s) => (s.screen === 'form' ? { sheet: 'token', query: '', tap: 'picker' } : null),
  back: (s) => (s.sheet === 'token' ? { sheet: 'none', query: '', tap: null } : null),
  /* the search field takes one character per press, the way a keyboard does */
  query: (s, c) =>
    c === '⌫'
      ? { query: s.query.slice(0, -1) }
      : { query: (s.query + (c ?? '')).slice(0, 12) },
  pick: (s, sym) =>
    sym && sym !== s.to ? { to: sym, sheet: 'none', query: '', tap: null } : null,
  pct: (s, v) => ({ pct: Number(v) as SwapState['pct'], tap: 'pct' + v }),
  review: (s) => (s.screen === 'form' ? { screen: 'review', tap: 'review' } : null),
  /* the whole transition, not just the highlight — see the note in perps.ts */
  swap: (s) => (s.screen === 'review' ? { screen: 'settling', step: 0, tap: null } : null),
  step: (s) => {
    if (s.screen !== 'settling') return null;
    return s.step >= 2 ? { screen: 'done', step: 3 } : { step: s.step + 1 };
  },
  again: (s) => (s.screen === 'done' ? { ...initial, tap: 'again' } : null),
};

const beats: Beat<SwapState, SwapAction>[] = [
  { ms: 2800 },
  /* pick the destination */
  { ms: 1100, do: 'picker' },
  { ms: 620, do: 'query', arg: 'n' },
  { ms: 300, do: 'query', arg: 'e' },
  { ms: 900, do: 'query', arg: 'a' },
  { ms: 1400, do: 'pick', arg: 'NEAR' },
  /* size it off the balance, the way the chips do */
  { ms: 1200, do: 'pct', arg: '100', set: { tap: null } },
  /* confirm */
  { ms: 2300, do: 'review' },
  /* A press and the screen it opens are TWO beats — see perps.ts. */
  { ms: 380, set: { tap: 'swap' } },
  { ms: 700, do: 'swap' },
  /* settle. The middle beat is the long one — routing is where the time
     actually goes, and a checklist whose rows tick at equal speed reads as a
     progress bar with extra steps. */
  { ms: 2400, do: 'step' },
  { ms: 900, do: 'step' },
  /* A beat's `ms` is the wait BEFORE it fires, so the hold on the OUTCOME
     belongs to `outro`, not to the beat that produces it. Getting this the
     wrong way round left the finished screen on for the outro alone while the
     screen before it sat there for four seconds doing nothing. */
  { ms: 900, do: 'step' },
];

/**
 * THE RAIL. The picker is the whole point of this screen, so it is open along
 * with every token in it; settlement is closed, because there is nothing there
 * to decide and cancelling a trade mid-route is not a thing this demo claims.
 */
const guided = (s: SwapState): SwapAction[] => {
  if (s.sheet === 'token') return ['query', 'pick', 'back'];
  if (s.screen === 'form') return ['picker', 'pct', 'review'];
  if (s.screen === 'review') return ['swap', 'picker'];
  if (s.screen === 'done') return ['again'];
  return [];
};

export const swap: Machine<SwapState, SwapAction> = {
  initial,
  actions,
  beats,
  guided,
  /* swap lands on the beat AFTER its own, so the script picks up at the first
     checklist row rather than re-submitting over the reader */
  anchor: { picker: 1, pick: 5, review: 7, swap: 9, again: 0 },
  auto: (s) => (s.screen === 'settling' ? { after: 1600, do: 'step' } : null),
  /* the settled trade: both legs, the route and the outcome in one frame */
  restFrame: beats.length - 1,
  /* the settled trade holds here while the card leaves */
  outro: 3800,
};
