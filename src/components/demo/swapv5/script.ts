import { buildFlow, type Chapter, type Step } from '@/components/demo/shell/flow';
import { STOPS, SWAP_STEPS, TO, actions, initial, type SV, type SVAction } from './state';

/**
 * SWAP v5 — THE SHORT CUT
 * ==================================================================
 * The brief, in four lines:
 *
 *   the swap page, already loaded, Tether pre-filled from the home screen tap,
 *   the whole position put in by a tap on the balance, destination already set
 *   the destination picker opens, and a long list is scrolled
 *   the destination is picked and the quote fills in
 *   the trade is reviewed at full precision, then swapped
 *   a success state, and back to the top
 *
 * THE ARITHMETIC. The deck plays every beat at `PACE` (1.25), and
 * `pnpm check:flows` asserts the product, so a beat that grows cannot quietly
 * move the clip's length.
 *
 *   scene 1    2,300ms   a form that already knows half of what it needs
 *   scene 2    4,220ms   the list, and how long it is
 *   scene 3    2,900ms   the quote
 *   scene 4    2,180ms   the review sheet
 *   scene 5    5,400ms   one press
 *   outro      4,000ms   the same frame again, for the loop
 *   ─────────────────
 *             21,000ms  ×1.25 = 26,250ms on screen
 *
 * SCENE 2 IS 1,960 SHORTER THAN IT WAS, and the clip is shorter by exactly
 * that: the dead hold between the list stopping and the row being pressed did
 * not move somewhere else, it went. 28,700 → 26,250.
 *
 * It also said 5,600 here for two passes while authoring 6,180, and the
 * assertion caught it the moment a new scene made somebody add the column up.
 * Same lesson as the 3,300 below: a total in a comment is a claim, and this is
 * the only file in the repo where a claim is checked.
 *
 * The header above said 3,300 for scene 1 and 26,500 for the total on the
 * first pass, which is what the assertion is for: four digits at 160ms with a
 * 420ms lead is 900, not 1,900. Nobody would have caught that by reading.
 *
 * SCENE 1 IS STILL 2,300 THOUGH THE GESTURE IN IT CHANGED. It used to type
 * `2500` a digit at a time; it now taps the balance, because the frame swaps
 * the whole Tether position and `6635.616976` is not a figure anyone enters by
 * hand. Eleven keystrokes at 160ms would have been 2,020 where four were 900 —
 * a second and an eighth of somebody typing their own balance at you — so the
 * 900 the typing had went to the tap and its landing, and the clip's length
 * did not move.
 *
 * IT IS PACED LIKE `/demo/perps-v5` AND NOT LIKE ITS OWN FIRST DRAFT. Every
 * number below is the one that cut arrived at after two rounds of being too
 * fast: a 500ms rest after each value lands, sheets given longer than the 390ms
 * they take to arrive, and a hold on the last frame that is the longest beat in
 * the script. None of that was guessed twice.
 *
 * FOUR STEPS, NOT ONE. The copy is not drawn on this route — the stage has no
 * headline — but the steps are what `check:flows` walks and what a reader of
 * this file needs to see the shape of the thing.
 */

const CHAPTERS: Chapter[] = [
  { id: 'form', name: 'The form', blurb: '' },
  { id: 'list', name: 'The list', blurb: '' },
  { id: 'quote', name: 'The quote', blurb: '' },
  { id: 'send', name: 'Review, and one press', blurb: '' },
];

const STEPS: Step<SV, SVAction>[] = [
  /* ---- scene 1 · 2,300ms ---------------------------------------------- */
  {
    id: 'amount', ch: 'form',
    title: 'A form that already knows half of it',
    note: 'Tether is in the top field because the reader tapped it a screen ago, and the destination is the pair the app was last on. What is left is how much — and the balance underneath is the answer.',
    beats: [
      /* the opening frame: Tether in, ZEC already in the destination, nothing
         entered. It holds before anything moves, because what it is showing is
         a form that was filled in somewhere else. */
      { ms: 700 },
      /* one tap on the balance, and the whole position is in the field */
      { ms: 200, set: { lit: 'max' } },
      { ms: 900, do: 'max' },
      { ms: 500 },
    ],
  },

  /* ---- scene 2 · 5,600ms ----------------------------------------------
     The list is the point of this scene and its length is the only thing it
     has to say, so it is given the most time of the four. Three stops rather
     than one glide: one continuous move reads as one fact, and what a reader
     should come away with is that there was more every time they looked. */
  {
    id: 'list', ch: 'list',
    title: 'Everything, and it keeps going',
    note: 'The picker opens on your own tokens, then the catalogue. NEAR is nine rows down, so getting to it means passing eight coins you did not come for — which is the argument.',
    beats: [
      /* IT RESTS BEFORE IT MOVES. At 620 the track started travelling while the
         sheet was still arriving, so `Your tokens` — the wallet the reader saw
         two faces ago, with the same three quantities — went past unread. */
      { ms: 1200, do: 'picker' },
      { ms: 680, do: 'scroll', arg: String(STOPS[0]) },
      { ms: 700, do: 'scroll', arg: String(STOPS[1]) },
      /* and on until the row it came for comes into view. It travels one way:
         the destination the form opened with is already valid, so this is not
         someone hunting for an answer, it is someone seeing what else there is
         on the way to a better one. */
      { ms: 820, do: 'scroll', arg: String(STOPS[2]) },
      /* AND THEN IT PRESSES, rather than sitting on the answer for two and a
         half seconds first. This beat was 2,780: 380 of travel and then 2,400
         of a list that had stopped, with NEAR on screen and nothing happening
         to it. It is 820 now — the travel, and 440 to see the row arrive — and
         the 1,960 it gave up came out of the clip rather than moving somewhere
         else in it. Nothing was cut: the same three stops, the same rest on the
         quote after the pick.

         At 620ms of travel against beats of 900/1100/1400 the list also spent
         longer stopped than moving, which read as three cuts rather than as
         somebody scrolling. The travel is 380 and the beats 680/700/820 — the
         move is the shorter half of each move-settle pair. */
      { ms: 820 },
    ],
  },

  /* ---- scene 3 · 2,900ms ---------------------------------------------- */
  {
    id: 'quote', ch: 'quote',
    title: 'The quote fills itself in',
    note: 'One tap on the destination and every derived figure on the screen answers: the rate, the amount out, the least you can receive.',
    beats: [
      { ms: 220, set: { lit: 'pick:' + TO } },
      { ms: 620, do: 'pick', arg: TO },
      /* the rest is the whole scene: four figures land at once and the eye
         needs somewhere to put them down */
      { ms: 2060 },
    ],
  },

  /* ---- scene 4 · 2,180ms ----------------------------------------------
     THE SHEET IS A SCENE, and it was nothing at all until now: `Review trade`
     used to settle the trade it named. It gets long enough to be read, because
     what it is for is the four decimals the form rounds away — `3535.799` in
     the box, `3,535.79972` here — and a sheet that flashes past has stated
     nothing. */
  {
    id: 'review', ch: 'send',
    title: 'The trade, at full precision',
    note: 'The form rounds to what fits in a box. The sheet does not: the same figures to five decimals, the rate, and the least you can receive — and only then a button that trades.',
    beats: [
      { ms: 200, set: { lit: 'confirm' } },
      { ms: 480, do: 'confirm' },
      { ms: 1500 },
    ],
  },

  /* ---- scene 5 · 5,400ms ----------------------------------------------
     `step` runs one past the last row so all three read as done before the
     success state replaces them — the fix /demo/perps-v5 needed and the
     reason is the same: a settlement whose last line is still spinning when
     the screen changes is a settlement nobody saw finish. */
  {
    id: 'send', ch: 'send',
    title: 'One press',
    note: 'Finding best price, executing, complete — and the Tether balance that was whole a moment ago.',
    beats: [
      { ms: 200, set: { lit: 'swap' } },
      { ms: 420, do: 'swap' },
      { ms: 620, do: 'step' },
      { ms: 620, do: 'step' },
      { ms: 700, do: 'step' },
      /* all three ticked, and then the success state */
      { ms: 900, do: 'step' },
      { ms: 1940 },
    ],
  },
];

export const swapV5Flow = buildFlow<SV, SVAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /* reduced motion gets the frame with the quote on it: the only one that
     shows both what was asked for and what it buys */
  restStep: 'quote',
  outro: 4000,
  anchor: {
    max: 'amount',
    picker: 'list',
    scroll: 'list',
    pick: 'quote',
    confirm: 'review',
    closeReview: 'quote',
    swap: 'send',
    step: 'send',
  },
  /* a settlement is not waiting for anyone: while a reader holds the wheel it
     ticks through the same transitions the beats fire */
  auto: (s) => (s.submitting && !s.done ? { after: 620, do: 'step' } : null),
});

export { SWAP_STEPS };
