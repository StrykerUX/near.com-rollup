import { buildFlow, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type OW, type OWAction } from './state';

/**
 * EVERYTHING YOU OWN — THE SHORT CUT
 * ==================================================================
 * The brief, in four lines:
 *
 *   the home screen, with Crypto and stocks, Perps and Earn
 *   click Crypto and stocks: the total at the top, five rows under it
 *   tap BTC, tap Swap
 *   loop back to the home screen
 *
 * FEWER GESTURES THAN ANY OTHER CUT IN THIS FAMILY — four, against swap's
 * eleven and perps' twenty — and that is the shape of the argument rather than
 * a shortcut. The claim is that everything is already in one place, so the
 * screen's job is to be looked at, not worked. Most of the time here is spent
 * holding still on a list.
 *
 * THE ARITHMETIC. Beats play at `PACE` (1.25) and `pnpm check:flows` asserts
 * the product.
 *
 *   scene 1    2,400ms   the account, and what is in it
 *   scene 2    4,020ms   the five rows
 *   scene 3    2,900ms   a row opens
 *   scene 4    2,700ms   Swap, and the handoff
 *   outro      4,000ms   the same frame again, for the loop
 *   ─────────────────
 *             16,020ms  ×1.25 = 20,025ms on screen
 */

const CHAPTERS: Chapter[] = [
  { id: 'home', name: 'The account', blurb: '' },
  { id: 'assets', name: 'Everything in it', blurb: '' },
  { id: 'open', name: 'One row', blurb: '' },
  { id: 'hand', name: 'Swap', blurb: '' },
];

const STEPS: Step<OW, OWAction>[] = [
  /* ---- scene 1 · 2,400ms ----------------------------------------------
     One beat and nothing fires. The whole claim of this chapter is on screen
     already — three balances and a total that is their sum — so the first
     thing it does is let that be read. */
  {
    id: 'home', ch: 'home',
    title: 'One account, three balances',
    note: 'Crypto and stocks, perps and earn on one screen, and a total that is the sum of the three rows under it.',
    beats: [{ ms: 2400 }],
  },

  /* ---- scene 2 · 4,020ms ---------------------------------------------- */
  {
    id: 'assets', ch: 'assets',
    title: 'Five rows, sorted by value',
    note: 'Bitcoin, NEAR, dollars, Zcash and a tokenised share — the last of them issued by Ondo, and in the same list as the rest.',
    beats: [
      { ms: 620, do: 'toAssets' },
      /* the longest hold in the cut, on the frame the chapter's headline is
         about. Five rows is more reading than any other screen in this family
         asks for, and it is the point. */
      { ms: 3400 },
    ],
  },

  /* ---- scene 3 · 2,900ms ---------------------------------------------- */
  {
    id: 'open', ch: 'open',
    title: 'Every row is a menu',
    note: 'Swap, send, earn or move it out of the confidential balance — from the row, without leaving the list.',
    beats: [
      { ms: 700, do: 'actions', arg: 'BTC' },
      { ms: 2200 },
    ],
  },

  /* ---- scene 4 · 2,700ms ----------------------------------------------
     Where this chapter ends. `swap` does not navigate: the swap screen has its
     own headline in `Lockup.tsx` and is the next chapter's to tell. What this
     one hands over is the symbol, which is what `/demo/swap-v5` opens with
     already in its top field. */
  {
    id: 'hand', ch: 'hand',
    title: 'And out into a swap',
    note: 'Tapping Swap carries the asset with it, which is why the swap screen opens already knowing half of what it needs.',
    beats: [
      { ms: 700, do: 'swap' },
      { ms: 2000 },
    ],
  },
];

export const ownV5Flow = buildFlow<OW, OWAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /* reduced motion gets the five rows: the only frame that is the headline */
  restStep: 'assets',
  outro: 4000,
  anchor: {
    toAssets: 'assets',
    actions: 'open',
    swap: 'hand',
    home: 'home',
  },
});
