import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import {
  AMOUNT, STOPS, SWAP_STEPS, TO, actions, initial, type SV, type SVAction,
} from './state';

/**
 * SWAP v5 — THE SHORT CUT
 * ==================================================================
 * The brief, in four lines:
 *
 *   the swap page, already loaded, Tether pre-filled from the home screen tap,
 *   0.25 entered, destination empty and waiting
 *   the destination picker opens, and a long list is scrolled
 *   the destination is picked and the quote fills in
 *   one press, a success state, and back to the top
 *
 * THE ARITHMETIC. The deck plays every beat at `PACE` (1.25), and
 * `pnpm check:flows` asserts the product, so a beat that grows cannot quietly
 * move the clip's length.
 *
 *   scene 1    2,300ms   a form that already knows half of what it needs
 *   scene 2    5,600ms   the list, and how long it is
 *   scene 3    2,900ms   the quote
 *   scene 4    5,400ms   one press
 *   outro      4,000ms   the same frame again, for the loop
 *   ─────────────────
 *             20,200ms  ×1.25 = 25,250ms on screen
 *
 * The header above said 3,300 for scene 1 and 26,500 for the total on the
 * first pass, which is what the assertion is for: four digits at 160ms with a
 * 420ms lead is 900, not 1,900. Nobody would have caught that by reading.
 *
 * IT IS PACED LIKE `/demo/perps-v5` AND NOT LIKE ITS OWN FIRST DRAFT. Every
 * number below is the one that cut arrived at after two rounds of being too
 * fast: keystrokes 160ms apart rather than 105, a 500ms rest after each value
 * lands, sheets given longer than the 390ms they take to arrive, and a hold on
 * the last frame that is the longest beat in the script. None of that was
 * guessed twice.
 *
 * FOUR STEPS, NOT ONE. The copy is not drawn on this route — the stage has no
 * headline — but the steps are what `check:flows` walks and what a reader of
 * this file needs to see the shape of the thing.
 */

const type_ = (act: SVAction, chars: string, lead?: number, gap?: number) =>
  typing<SV, SVAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'form', name: 'The form', blurb: '' },
  { id: 'list', name: 'The list', blurb: '' },
  { id: 'quote', name: 'The quote', blurb: '' },
  { id: 'send', name: 'One press', blurb: '' },
];

const STEPS: Step<SV, SVAction>[] = [
  /* ---- scene 1 · 2,300ms ---------------------------------------------- */
  {
    id: 'amount', ch: 'form',
    title: 'A form that already knows half of it',
    note: 'Tether is in the top field because the reader tapped it a screen ago, and the destination is the pair the app was last on. What is left is how much.',
    beats: [
      /* the opening frame: Tether in, ZEC already in the destination, nothing
         typed. It holds before anything moves, because what it is showing is a
         form that was filled in somewhere else. */
      { ms: 900 },
      ...type_('key', AMOUNT, 420, 160),
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
      { ms: 900, do: 'scroll', arg: String(STOPS[0]) },
      { ms: 1100, do: 'scroll', arg: String(STOPS[1]) },
      /* and on until the row it came for comes into view. It travels one way:
         the destination the form opened with is already valid, so this is not
         someone hunting for an answer, it is someone seeing what else there is
         on the way to a better one. */
      { ms: 1400, do: 'scroll', arg: String(STOPS[2]) },
      { ms: 1580 },
    ],
  },

  /* ---- scene 3 · 2,900ms ---------------------------------------------- */
  {
    id: 'quote', ch: 'quote',
    title: 'The quote fills itself in',
    note: 'One tap on the destination and every derived figure on the screen answers: the rate, the amount out, the least you can receive.',
    beats: [
      { ms: 700, do: 'pick', arg: TO },
      /* the rest is the whole scene: four figures land at once and the eye
         needs somewhere to put them down */
      { ms: 2200 },
    ],
  },

  /* ---- scene 4 · 5,400ms ----------------------------------------------
     `step` runs one past the last row so all three read as done before the
     success state replaces them — the fix /demo/perps-v5 needed and the
     reason is the same: a settlement whose last line is still spinning when
     the screen changes is a settlement nobody saw finish. */
  {
    id: 'send', ch: 'send',
    title: 'One press',
    note: 'Finding best price, executing, complete — and the Tether balance that was whole a moment ago.',
    beats: [
      { ms: 620, do: 'confirm' },
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
    picker: 'list',
    scroll: 'list',
    pick: 'quote',
    confirm: 'send',
    step: 'send',
  },
  /* a settlement is not waiting for anyone: while a reader holds the wheel it
     ticks through the same transitions the beats fire */
  auto: (s) => (s.submitting && !s.done ? { after: 620, do: 'step' } : null),
});

export { SWAP_STEPS };
