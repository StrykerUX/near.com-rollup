import { buildFlow, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type OW, type OWAction } from './state';

/**
 * EVERYTHING YOU OWN — THE SHORT CUT
 * ==================================================================
 * The brief, in four lines:
 *
 *   the home screen, with Crypto, Perps and Earn
 *   click Crypto: the total at the top, the rows under it
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
 *   scene 1    1,300ms   the account, and what is in it
 *   scene 2    2,720ms   the five rows
 *   scene 3    2,100ms   a row opens
 *   scene 4    2,100ms   Swap, and the handoff
 *   outro      2,000ms   the same frame again, for the loop
 *   ─────────────────
 *             10,220ms  ×1.25 = 12,775ms on screen
 *
 * IT WAS 20,025 AND THAT WAS TOO LONG FOR WHERE IT LIVES. On its own route the
 * length costs nothing — a reader can watch it twice. On `/home-v2` it is one
 * of four chapters in a scroll a reader is MOVING through, and `W_REST` in
 * lib/schedule.ts is documented as identical for all four cards by
 * construction: there is no way to buy this chapter more dwell that does not
 * buy it for the other three and move the shipped page's composition with it.
 *
 * So the flow got shorter instead, and nothing was cut to do it — same four
 * gestures, same order. What went is dead hold: 1,100ms off the opening frame,
 * 1,200 off the list, 600 each off the sheet and the handoff, and half the
 * outro. Every rest that remains is one a value or a screen needs to be seen
 * landing, which is the only kind this family keeps.
 */

const CHAPTERS: Chapter[] = [
  { id: 'home', name: 'The account', blurb: '' },
  { id: 'assets', name: 'Everything in it', blurb: '' },
  { id: 'open', name: 'One row', blurb: '' },
  { id: 'hand', name: 'Swap', blurb: '' },
];

const STEPS: Step<OW, OWAction>[] = [
  /* ---- scene 1 · 1,300ms ----------------------------------------------
     One beat and nothing fires. The whole claim of this chapter is on screen
     already — three balances and a total that is their sum — so the first
     thing it does is let that be read. */
  {
    id: 'home', ch: 'home',
    title: 'One account, three balances',
    note: 'Crypto, perps and earn on one screen, and a total that is the sum of the three rows under it.',
    beats: [{ ms: 1300 }],
  },

  /* ---- scene 2 · 2,720ms ---------------------------------------------- */
  {
    id: 'assets', ch: 'assets',
    title: 'Every balance, itemised',
    note: 'Tether and USD Coin on two networks, each with its quantity, its dollar value and somewhere to earn — and the three of them sum to the confidential half above.',
    beats: [
      { ms: 620, do: 'toAssets' },
      /* still the longest hold in the cut, on the frame the chapter's headline
         is about. Five rows is more reading than any other screen in this
         family asks for, and it keeps the most time of the four. */
      { ms: 2100 },
    ],
  },

  /* ---- scene 3 · 2,100ms ---------------------------------------------- */
  {
    id: 'open', ch: 'open',
    title: 'Every row is a menu',
    note: 'Swap, send, earn or move it out of the confidential balance — from the row, without leaving the list.',
    beats: [
      { ms: 700, do: 'actions', arg: 'usdt' },
      { ms: 1400 },
    ],
  },

  /* ---- scene 4 · 2,100ms ----------------------------------------------
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
      { ms: 1400 },
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
  outro: 2000,
  anchor: {
    toAssets: 'assets',
    actions: 'open',
    swap: 'hand',
    home: 'home',
  },
});
