import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import {
  NEW_LEV, NEW_MARGIN, STOP_LOSS, TAKE_PROFIT, actions, initial, type BD, type BDAction,
} from './state';

/**
 * PERPS v5 — THE SHORT CUT, AND THE BUDGET IS THE DESIGN
 * ==================================================================
 * v4 is the cut you put in front of a room: ninety seconds, eight moments, a
 * line of copy on each. This is the cut you put in a feed: thirteen seconds,
 * and thirteen is not a shorter ninety — it is a different problem, because the
 * two things v4 spends most of its length on (a line of copy per step, and a
 * beat long enough for the eye to arrive) are the two that do not fit.
 *
 * THE ARITHMETIC, WHICH IS THE WHOLE CONSTRAINT
 * ---------------------------------------------
 * The deck plays every beat at `PACE` (1.25), so the wall clock is the sum of
 * the beats times 1.25. `pnpm check:flows` asserts that product, so a beat that
 * grows by two hundred milliseconds cannot quietly move the clip's length.
 *
 *   scene 1    2,400ms   the market, and a position already working
 *   scene 2    7,500ms   the second one, opened
 *   outro        600ms   the hold before the loop
 *   ─────────────────
 *             10,500ms  ×1.25 = 13,125ms on screen
 *
 * IT WAS TEN SECONDS AND IT COULD NOT BE READ. Scene 2 ran at 5,000ms, and the
 * table that killed it is the time each screen got to exist before the next
 * control was pressed: a sheet takes ~260ms to arrive, and it was being pressed
 * over 115ms later. Nothing rested. Every state was landed on by the next one
 * while it was still arriving, which does not read as fast — it reads as
 * unresolved, because the eye never gets the beat of stillness it uses to
 * decide something finished happening.
 *
 * So scene 2 is that same sequence at 1.5x, and the multiplier is on the SHAPE
 * rather than on the gaps: every beat, every keystroke and every hold grew by
 * the same factor, so the rhythm the cut was authored with survives and only
 * its tempo changed. Scene 1 did not grow — it is one hold with nothing
 * scripted in it, and a rest does not become more restful by lasting longer.
 *
 * THREE OTHER DIALS MOVED WITH IT, or this would only be a slower slideshow:
 * the CSS tempo (`--dur` / `--dur-slow` in 24-demo-btc.css), the chart's
 * `candleMs`, and the `Count` durations on every figure that travels. A script
 * stretched on its own just makes a fast animation wait longer between jumps,
 * which is worse than either — the same trap `16-modes.css` documents for the
 * demo-mode PACE.
 *
 * TWO STEPS, NOT EIGHT
 * --------------------
 * v4's copy is one line per step. Eight steps across a cut this short gives
 * each line a second or so, which is under the floor for reading one — the copy
 * would be present, unreadable and moving, which is worse than absent. Two
 * steps give each line five seconds or more, and the step is also what `Focus`
 * and the dot row are keyed to: three things that get quieter for one reason.
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

  /* ---- scene 2 · 7,500ms ------------------------------------------------
     The whole ticket in seven and a half seconds of script time. Every gap is
     under one rule: a press and the screen it opens are two beats, and the
     first of the two has to outlast the entrance it is waiting for AND leave
     something over. That is why the sheet openings (630 / 450 / 510) are the
     largest numbers here and the keystrokes (105–120) are the smallest — a
     digit landing is instant and a sheet arriving is not, and what the 1.5x
     bought is the remainder: ~370ms of a sheet simply sitting there finished
     before anything touches it, where there used to be 115. */
  {
    id: 'open', ch: 'more',
    title: 'A second one, in five taps',
    note: '$5,000 of margin at twenty times, both exits set before you are in, and one press that carries the leverage, the order and the bracket together.',
    callout: '$5,000 → $100,000',
    beats: [
      /* the sheet */
      { ms: 630, do: 'openTicket', arg: 'long' },

      /* the size. Four digits at 120ms reads as typed rather than pasted; at
         the 80 this ran at first they arrived closer together than a thumb
         can move, which reads as pasted no matter how many of them there are. */
      ...type_('key', NEW_MARGIN, 420, 120),

      /* the leverage. Two stops rather than a sweep: the slider is not the
         feature, the figure answering it is, and `Count` needs a value change
         to travel to. 14 exists so that 20 is arrived at and not set. */
      { ms: 450, do: 'levSheet' },
      { ms: 150, do: 'levSet', arg: '14' },
      { ms: 210, do: 'levSet', arg: String(NEW_LEV) },
      { ms: 510, do: 'levSave' },

      /* both exits. One checkbox opens the pair already in dollars — see
         `prot` in state.ts for why the ⇄ is not in this cut. */
      { ms: 450, do: 'prot' },
      ...type_('key', TAKE_PROFIT, 330, 105),
      { ms: 195, do: 'focus', arg: 'sl' },
      ...type_('key', STOP_LOSS, 255, 105),

      /* signing, as a checklist and nothing else */
      { ms: 420, do: 'submit' },
      { ms: 225, do: 'ostep' },
      { ms: 225, do: 'ostep' },
      { ms: 285, do: 'ostep' },

      /* THE HOLD, AND IT IS THE POINT OF THE CUT.
         The ticket closes, the tab row counts up and a second card arrives
         above the first. Nearly two seconds on screen, and it is the longest
         single beat in the script for exactly that reason: everything before it was
         setting up a frame nobody would remember if it flashed. */
      { ms: 1545 },
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
