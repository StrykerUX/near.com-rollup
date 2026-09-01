import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import {
  NEW_LEV, NEW_MARGIN, STOP_LOSS, TAKE_PROFIT, actions, initial, type BD, type BDAction,
} from './state';

/**
 * PERPS v5 — TEN SECONDS, AND THE BUDGET IS THE DESIGN
 * ==================================================================
 * v4 is the cut you put in front of a room: ninety seconds, eight moments, a
 * line of copy on each. This is the cut you put in a feed. It has ten seconds,
 * and ten seconds is not a shorter version of ninety — it is a different
 * problem, because the two things v4 spends most of its length on (a line of
 * copy per step, and a beat long enough for the eye to arrive) are the two
 * things that do not fit.
 *
 * THE ARITHMETIC, WHICH IS THE WHOLE CONSTRAINT
 * ---------------------------------------------
 * The deck plays every beat at `PACE` (1.25), so ten seconds of wall clock is
 * 8,000ms of AUTHORED beat time, outro included. That is the budget, it is
 * hard, and everything below is what it bought:
 *
 *   scene 1   2,400ms   the market, and a position already working
 *   scene 2   5,000ms   the second one, opened
 *   outro       600ms   the hold before the loop
 *   ────────────────
 *             8,000ms  ×1.25 = 10,000ms on screen
 *
 * `pnpm check:flows` asserts that sum, so a beat that grows by two hundred
 * milliseconds cannot quietly turn this into an eleven-second clip.
 *
 * TWO STEPS, NOT EIGHT
 * --------------------
 * v4's copy is one line per step. At eight steps in ten seconds each line gets
 * 1.2 seconds, which is under the floor for reading one — so the copy would be
 * present, unreadable, and moving, which is worse than absent. Two steps give
 * each line about five seconds, and the step is also what `Focus` and the dot
 * row are keyed to: three things that all get quieter for the same reason.
 *
 * NO CAMERA
 * ---------
 * `shot` is deliberately absent from both steps. A cutout that travels is
 * motion, and this cut already spends its entire length on motion that is
 * carrying meaning — a sheet arriving, digits landing, a figure travelling,
 * a card joining a list. Darkening the screen around one of them at this
 * tempo does not direct the eye, it competes with what it is pointing at.
 *
 * NO FILL, AND NO SETTLEMENT
 * --------------------------
 * v4 ends on the take profit being met. That climb is fifteen candles — 22.5
 * real seconds — so it cannot even start here. The ending is the order landing
 * and a second card joining the first, which is what "se setea la operación"
 * actually looks like.
 */

const type_ = (act: BDAction, chars: string, lead?: number, gap?: number) =>
  typing<BD, BDAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'live', name: 'Open', blurb: '' },
  { id: 'more', name: 'Again', blurb: '' },
];

const STEPS: Step<BD, BDAction>[] = [
  /* ---- scene 1 · 2,400ms ------------------------------------------------
     One beat, and nothing in the machine changes during it. Everything that
     moves here is continuous and belongs to the components that draw it: the
     candles roll and drift up, the quote and the P&L are written to the DOM
     off the chart's own last price, and the balance chip sits in the corner.
     A scripted beat in the middle of this would only interrupt it. */
  {
    id: 'live', ch: 'live',
    title: 'A position, already working',
    note: 'Long BTC at 20x, opened at $79,520 and $47.50 in front. The margin is posted, the liquidation is priced, and the balance in the corner is what is left to trade with.',
    callout: 'Long 20x · $120,000',
    beats: [{ ms: 2400 }],
  },

  /* ---- scene 2 · 5,000ms ------------------------------------------------
     The whole ticket in five seconds of script time. Every gap below was cut
     against one rule: a press and the screen it opens are two beats, and the
     first of the two never goes under the entrance it is waiting for. That is
     why the sheet openings (420 / 300 / 340) are the largest numbers here and
     the keystrokes (70–80) are the smallest — a digit landing is instant and
     a sheet arriving is not. */
  {
    id: 'open', ch: 'more',
    title: 'A second one, in five taps',
    note: '$5,000 of margin at twenty times, both exits set before you are in, and one press that carries the leverage, the order and the bracket together.',
    callout: '$5,000 → $100,000',
    beats: [
      /* the sheet */
      { ms: 420, do: 'openTicket', arg: 'long' },

      /* the size. Four digits at 80ms reads as typed rather than pasted, and
         it is the shortest run that still does — three would read as a
         glitch, and the first keystroke carries the field's own entrance. */
      ...type_('key', NEW_MARGIN, 280, 80),

      /* the leverage. Two stops rather than a sweep: the slider is not the
         feature, the figure answering it is, and `Count` needs a value change
         to travel to. 14 exists so that 20 is arrived at and not set. */
      { ms: 300, do: 'levSheet' },
      { ms: 100, do: 'levSet', arg: '14' },
      { ms: 140, do: 'levSet', arg: String(NEW_LEV) },
      { ms: 340, do: 'levSave' },

      /* both exits. One checkbox opens the pair already in dollars — see
         `prot` in state.ts for why the ⇄ is not in this cut. */
      { ms: 300, do: 'prot' },
      ...type_('key', TAKE_PROFIT, 220, 70),
      { ms: 130, do: 'focus', arg: 'sl' },
      ...type_('key', STOP_LOSS, 170, 70),

      /* signing, as a checklist and nothing else */
      { ms: 280, do: 'submit' },
      { ms: 150, do: 'ostep' },
      { ms: 150, do: 'ostep' },
      { ms: 190, do: 'ostep' },

      /* THE HOLD, AND IT IS THE POINT OF THE CUT.
         The ticket closes, the tab row counts up and a second card arrives
         above the first. One second is not long, and it is the longest single
         beat in the script for exactly that reason: everything before it was
         setting up a frame nobody would remember if it flashed. */
      { ms: 1030 },
    ],
  },
];

export const perpsV5Flow = buildFlow<BD, BDAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /* reduced motion gets the frame with two positions on it: the only one that
     shows both what the account had and what the cut did to it */
  restStep: 'open',
  outro: 600,
  anchor: {
    openTicket: 'open',
    levSheet: 'open',
    levSave: 'open',
    prot: 'open',
    submit: 'open',
  },
  /* No `target`. Nothing in this cut travels to a control or lights one — see
     the note about the camera above; the same argument retires the hand and
     the spotlight, and a map nothing reads is a map that will rot. */
  auto: (s) => (s.submitting ? { after: 320, do: 'ostep' } : null),
});
