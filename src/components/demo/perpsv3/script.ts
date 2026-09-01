import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initialFunded, type PD, type PDAction } from '@/components/demo/perps/state';

/**
 * PERPS v3 — the same trade, with less on screen and nothing to follow
 * ==================================================================
 * Same machine as v2, same guards, same figures. Two things are different, and
 * both are subtractions.
 *
 * NO POINTER. v2 draws a hand that travels to a control before it presses it,
 * which is honest and is also a second thing to watch. v3 lights the control
 * instead — see `shell/Spotlight.tsx`. Nothing crosses the screen, so nothing
 * has to be followed, and the reader's eye is already on the control at the
 * moment it changes rather than arriving with the pointer.
 *
 * LESS ON SCREEN. The device drops the three lists under the chart, the
 * Market/Limit control, the keypad, and one of the two estimate rows. None of
 * them is the feature: the lists are where a trade LANDS and this page is about
 * making one; the order type is a second story; the pad costs two hundred
 * pixels to say "this is being typed", which the caret and the digits landing
 * already say for nothing. What is left is the price, the two sides, the size,
 * what leverage turns it into, the two rules, and the position.
 *
 * The tempo is slower throughout. With no pointer to keep up with, the pacing
 * is set by reading rather than by travel.
 */

const type_ = (act: PDAction, chars: string, lead?: number, gap?: number) =>
  typing<PD, PDAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'market', name: 'The market', blurb: 'A price, and the only two things you can do with it.' },
  { id: 'size', name: 'Size and leverage', blurb: 'What you risk, and what it turns into.' },
  { id: 'protect', name: 'Protection', blurb: 'Where you get out, either way.' },
  { id: 'open', name: 'The position', blurb: 'Signed, settled, and on the chart.' },
];

const STEPS: Step<PD, PDAction>[] = [
  {
    id: 'market', ch: 'market',
    title: 'BTC, and two buttons',
    note: 'The whole screen is a price and a decision. $5,429 sitting in the account, and nothing else asking for attention.',
    beats: [{ ms: 600 }],
  },
  {
    id: 'open', ch: 'market',
    title: 'Long',
    note: 'Either side opens the same ticket with the sign reversed. The market stays behind it, because the price is what the ticket is about.',
    beats: [{ ms: 3200, do: 'openTicket', arg: 'long' }],
  },

  {
    id: 'size', ch: 'size',
    title: '$5,000 of margin',
    note: 'The number you type is the number you can lose. Nothing else on this screen is money you have.',
    beats: [...type_('key', '5000', 2000, 340), { ms: 1600, do: 'done' }],
  },
  {
    id: 'lev', ch: 'size',
    title: '20x, and what it does to the figure',
    note: 'The slider moves once and the line under it travels: $50,000 to $100,000, 0.62771 BTC to 1.25543. That trip is the feature — the same $5,000, twice the position.',
    beats: [
      { ms: 2200, do: 'levSheet' },
      { ms: 1400, do: 'levSet', arg: '14' },
      { ms: 340, do: 'levSet', arg: '18' },
      { ms: 340, do: 'levSet', arg: '20' },
      { ms: 2000, do: 'levSave' },
    ],
  },

  {
    id: 'prot', ch: 'protect',
    title: 'Take profit and stop loss',
    note: 'One checkbox opens both. They arrive as a pair because they are one decision made twice — where to leave when it works, and where to leave when it does not.',
    beats: [{ ms: 2600, do: 'prot' }, { ms: 1400, do: 'unit', arg: 'tp' }],
  },
  {
    id: 'tp', ch: 'protect',
    title: 'Above the entry, or not at all',
    note: '$2 is refused: a take profit below the entry is an instruction to close at a loss. The button says which field to look at rather than just going grey.',
    beats: [
      { ms: 1800, do: 'key', arg: '2' },
      { ms: 3000, do: 'key', arg: '⌫' },
      ...type_('key', '80654', 1100, 340),
    ],
  },
  {
    id: 'sl', ch: 'protect',
    title: 'And below it for the other one',
    note: 'Five hundred under the $79,654 entry, against a thousand above it. Two to one — the trade has to be right half as often as it is wrong to be worth taking.',
    beats: [
      { ms: 2400, do: 'focus', arg: 'sl' },
      ...type_('key', '79154', 1400, 340),
      { ms: 1800, do: 'done' },
    ],
  },

  {
    id: 'sign', ch: 'open',
    title: 'One signature for three things',
    note: 'The leverage, the order and both protections go as a single signed intent. The checklist is the network answering, not a progress bar.',
    beats: [
      { ms: 2600, do: 'submit' },
      { ms: 1800, do: 'ostep' },
      { ms: 1500, do: 'ostep' },
      { ms: 1100, do: 'ostep' },
      { ms: 1700, do: 'ostep' },
      { ms: 1700, do: 'ostep' },
      { ms: 2100, do: 'ostep' },
    ],
  },
  {
    id: 'position', ch: 'open',
    title: 'Both brackets, and the market walking into one',
    note: 'Three lines now: the entry at $79,654, the stop below it and the take profit above. The market climbs into the green one, which is the whole of what a bracket is for.',
    beats: [{ ms: 2800 }, { ms: 2600, do: 'posOpen' }, { ms: 23500 }],
  },
];

export const perpsV3Flow = buildFlow<PD, PDAction>({
  initial: initialFunded,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'position',
  outro: 4600,
  anchor: {
    openTicket: 'size',
    levSheet: 'lev',
    levSave: 'prot',
    prot: 'tp',
    unit: 'tp',
    submit: 'sign',
    posOpen: 'position',
  },
  /**
   * WHICH CONTROL EACH TRANSITION LIGHTS.
   *
   * The same map v2 gives its pointer, read by `Spotlight` instead: the deck
   * resolves the next beat's control while the clock is still counting down to
   * it, so the control is already lit when it changes. Anything a person does
   * not press resolves to nothing — a glow on a checklist ticking itself would
   * claim someone caused it.
   */
  target: (a, arg, s) => {
    switch (a) {
      case 'openTicket': return `side:${arg}`;
      case 'key': return 'field';
      case 'done': return 'field';
      case 'focus': return 'field';
      case 'levSheet': return 'lev';
      case 'levSet': return 'levslider';
      case 'levSave': return 'save';
      case 'prot': return 'prot';
      case 'unit': return `unit:${arg ?? 'tp'}`;
      case 'submit': return 'submit';
      case 'ostep': return s.over === 'passkey' && s.auth === 'ask' ? 'passkey' : null;
      case 'posOpen': return 'posbar';
      default: return null;
    }
  },
  auto: (s) => {
    if (s.over === 'passkey') {
      return { after: s.auth === 'done' ? 800 : 1200, do: 'ostep' };
    }
    if (s.submitting && s.over === 'none') return { after: 1700, do: 'ostep' };
    return null;
  },
});
