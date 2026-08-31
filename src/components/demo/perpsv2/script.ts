import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import {
  FUND_STEPS, actions, initialFunded, type PD, type PDAction,
} from '@/components/demo/perps/state';

/**
 * PERPS v2 — the trade, and nothing else
 * ==================================================================
 * The same machine as `/demo/perps`, cut to four chapters.
 *
 * The long version earns its opening: it has to establish that the perps
 * balance starts at $86.99, that funding it is a passkey away, and that the
 * market has three lists under it. That is twenty-four steps before anyone
 * has taken a position, which is the right length for an argument and the
 * wrong length for a demo of the trade.
 *
 * v2 opens on the market with the money already there, and spends its whole
 * length on the four things that are actually the product: the two sides, the
 * size, the two rules, and the position that comes out of them.
 *
 * ONE THING IS DIFFERENT, and it is not a cut. While a protection field is
 * being typed into, the market is held still — see `holdPrice` in the device
 * and `paused` in `Chart`.
 */

const type_ = (act: PDAction, chars: string, lead?: number, gap?: number) =>
  typing<PD, PDAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'market', name: 'The perp screen', blurb: 'A price, two sides, and what you already have on.' },
  { id: 'ticket', name: 'Taking a position', blurb: 'The size you risk, and what leverage turns it into.' },
  { id: 'protect', name: 'Protection', blurb: 'Two rules — read against a price that has been held still.' },
  { id: 'position', name: 'The position', blurb: 'The same perp screen, with the trade on it.' },
];

const STEPS: Step<PD, PDAction>[] = [
  /* ---- 1 · the perp screen -------------------------------------------- */
  {
    id: 'market', ch: 'market',
    title: 'BTC, price and candles',
    note: 'The pair and its picker, the price and its change, candles with the axis on the right. Positions is empty and says so; Trades already carries 26.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'lists', ch: 'market',
    title: 'Positions · Orders · Trades',
    note: 'Three lists under one chart. They are where the trade you are about to make will land, which is why they are on screen before you make it.',
    beats: [
      { ms: 2800, do: 'tab', arg: 'trd' },
      { ms: 1900, do: 'tab', arg: 'ord' },
      { ms: 1700, do: 'tab', arg: 'pos' },
    ],
  },
  {
    id: 'sides', ch: 'market',
    title: 'Long or Short',
    note: 'The two buttons are the whole entry point. Either one opens the same ticket with the sign reversed — and $1,087 available to trade.',
    beats: [{ ms: 2400, do: 'openTicket', arg: 'long' }],
  },

  /* ---- 2 · taking a position ------------------------------------------ */
  {
    id: 'size', ch: 'ticket',
    title: 'Size here is margin, not notional',
    note: '$700 of the $1,087. That number is what you put at risk; leverage decides what it turns into.',
    beats: [...type_('key', '700', 1500, 300), { ms: 1300, do: 'done' }],
  },
  {
    id: 'lev', ch: 'ticket',
    title: 'Leverage, and everything it moves',
    note: 'The sheet takes 10x to 20x and the ticket recomputes: estimated trade value $7,000 to $14K, and estimated liquidation from 7% below entry to 2%.',
    beats: [
      { ms: 1700, do: 'levSheet' },
      { ms: 1000, do: 'levSet', arg: '13' },
      { ms: 280, do: 'levSet', arg: '17' },
      { ms: 280, do: 'levSet', arg: '21' },
      { ms: 320, do: 'levSet', arg: '20' },
      { ms: 1400, do: 'levSave' },
    ],
  },

  /* ---- 3 · protection, with the price held ---------------------------- */
  {
    id: 'prot', ch: 'protect',
    title: 'Add profit taker / stop loss',
    note: 'One checkbox opens both fields, and both start as percentages — a distance from the entry, not a price.',
    beats: [{ ms: 2200, do: 'prot' }],
  },
  {
    id: 'hold', ch: 'protect',
    title: 'The market stops moving',
    note: 'From here until the fields are done, the candles hold. Both rules are enforced against a fixed entry price, and a quote walking 400 points while you type makes a refusal look arbitrary instead of legible.',
    beats: [{ ms: 2400, do: 'focus', arg: 'tp' }, { ms: 2000 }],
  },
  {
    id: 'unit', ch: 'protect',
    title: 'The ⇄ swaps the unit',
    note: 'And empties both fields, which is right: 82000 means one thing as a price and nothing at all as a percentage.',
    beats: [...type_('key', '82000', 1300, 300), { ms: 1700, do: 'unit', arg: 'tp' }],
  },
  {
    id: 'tperr', ch: 'protect',
    title: 'A take profit sits above the entry',
    note: 'At $2 the ticket refuses — “Take profit must be above entry price” — and the button stops saying Open long and starts saying Review take profit. Corrected to $82,000, it comes back.',
    beats: [
      { ms: 1400, do: 'key', arg: '2' },
      /* the long pause is a person reading the refusal, which is the only
         reason the refusal is on the screen at all */
      { ms: 2600, do: 'key', arg: '⌫' },
      ...type_('key', '82000', 850, 300),
    ],
  },
  {
    id: 'slerr', ch: 'protect',
    title: 'A stop loss sits below it',
    note: '$79,974 is above the $79,654 entry — the same rule, mirrored. At $78,200 the ticket accepts and the market starts moving again.',
    beats: [
      { ms: 1800, do: 'focus', arg: 'sl' },
      ...type_('key', '79974', 1100, 300),
      { ms: 2800, do: 'key', arg: '⌫' },
      /* clearing is faster than typing — nobody reads what they are deleting */
      { ms: 200, do: 'key', arg: '⌫' },
      { ms: 200, do: 'key', arg: '⌫' },
      { ms: 200, do: 'key', arg: '⌫' },
      { ms: 200, do: 'key', arg: '⌫' },
      ...type_('key', '78200', 850, 300),
      { ms: 1300, do: 'done' },
    ],
  },

  /* ---- 4 · the position ----------------------------------------------- */
  {
    id: 'open', ch: 'position',
    title: 'Open long',
    note: 'A passkey. The order carries three things — the leverage, the order itself and the protections — and sends them as one signed intent.',
    beats: [
      { ms: 2200, do: 'submit' },
      /* the hand has to cross the whole screen to the passkey button */
      { ms: 1500, do: 'ostep' },
      { ms: 1300, do: 'ostep' },
      { ms: 900, do: 'ostep' },
      { ms: 1500, do: 'ostep' },
      { ms: 1500, do: 'ostep' },
      { ms: 1900, do: 'ostep' },
    ],
  },
  {
    id: 'entry', ch: 'position',
    title: 'The perp screen, with the position',
    note: 'The same screen it started on. The blue $79,654 line is on the chart, the position bar is under it with Modify and Close, and Positions is no longer empty.',
    beats: [{ ms: 2600 }],
  },
  {
    id: 'detail', ch: 'position',
    title: 'Size, margin, liquidation',
    note: '$14,000 of notional, 0.17576 BTC, $700 of margin, and the price the position closes itself at. Orders (2) is the take profit and the stop loss, now living as orders.',
    beats: [
      { ms: 2400, do: 'posOpen' },
      { ms: 2800, do: 'tab', arg: 'ord' },
      { ms: 2400, do: 'tab', arg: 'pos' },
    ],
  },
];

export const perpsV2Flow = buildFlow<PD, PDAction>({
  initial: initialFunded,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'detail',
  outro: 4200,
  anchor: {
    openTicket: 'size',
    levSheet: 'lev',
    levSave: 'prot',
    prot: 'hold',
    unit: 'tperr',
    submit: 'open',
    posOpen: 'detail',
  },
  /**
   * WHERE EACH TRANSITION IS PRESSED.
   *
   * The machine says what happens; this says where on the glass. The deck
   * resolves the NEXT beat's target while the clock is still counting down to
   * it, so the hand is already on the control when the state changes — which
   * is the whole difference between a screen using itself and a person using
   * it.
   */
  target: (a, arg, s) => {
    switch (a) {
      case 'key': return arg ? `key:${arg}` : null;
      case 'done': return 'done';
      case 'tab': return `tab:${arg}`;
      case 'openTicket': return `side:${arg}`;
      case 'side': return `seg:${arg}`;
      case 'focus': return arg ? `field:${arg}` : null;
      case 'unit': return `unit:${arg ?? 'tp'}`;
      case 'otypeMenu': return 'otype';
      case 'levSheet': return 'lev';
      case 'levSet': return 'levslider';
      case 'levSave': return 'save';
      case 'prot': return 'prot';
      case 'submit': return 'submit';
      /* six `ostep`s fire; only the first is a person pressing anything. The
         rest are the network coming back, and a hand hovering over a checklist
         that is ticking itself is a lie about who is doing the work. */
      case 'ostep': return s.over === 'passkey' && s.auth === 'ask' ? 'passkey' : null;
      case 'posOpen': return 'posbar';
      default: return null;
    }
  },
  auto: (s) => {
    if (s.screen === 'funding' && s.fstep < FUND_STEPS.length) return { after: 1500, do: 'fstep' };
    if (s.over === 'passkey') {
      return { after: s.auth === 'done' ? 700 : 1100, do: s.submitting ? 'ostep' : 'fstep' };
    }
    if (s.submitting && s.over === 'none') return { after: 1500, do: 'ostep' };
    return null;
  },
});
