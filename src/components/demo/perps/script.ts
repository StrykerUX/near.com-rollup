import { applyBeat, type Beat, type Machine } from '@/components/stage/phone/flows/machine';
import { actions, initial, type PD, type PDAction } from './state';

/**
 * THE SCRIPT, WRITTEN AS STEPS
 * ==================================================================
 * The page has to do two things with the same timeline: play it, and let a
 * reader jump around inside it. So the beats are not one flat list — they are
 * grouped into named steps, each of which says what feature it is showing.
 *
 * A step's FIRST beat is its entrance: seeking to a step applies that beat at
 * once and starts the clock after it. Which is why the leading `ms` on a first
 * beat is the pause the PREVIOUS step gets to hold for — it costs nothing when
 * a reader jumps straight here.
 */

export type Chapter = { id: string; name: string; blurb: string };

export type Step = {
  id: string;
  ch: string;
  /** what this step is called in the rail */
  title: string;
  /** what the app is doing, and which number moved */
  note: string;
  beats: Beat<PD, PDAction>[];
};

export const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: 'One screen for custody, perps and yield.' },
  { id: 'market', name: 'The market', blurb: 'Price, positions, and the state of your perps account.' },
  { id: 'fund', name: 'Funding', blurb: 'Moving balance from near.com into the perps account, signed with a passkey.' },
  { id: 'ticket', name: 'The ticket', blurb: 'Size, leverage and order type.' },
  { id: 'protect', name: 'Protection', blurb: 'Take profit and stop loss, and the rules the market imposes.' },
  { id: 'open', name: 'Opening', blurb: 'Sign it, and watch the order settle in parts.' },
  { id: 'position', name: 'The position', blurb: 'What stays alive once the order is done.' },
  { id: 'back', name: 'Back out', blurb: 'The same balance, seen from the account.' },
];

/** a digit run, typed rather than pasted */
const type_ = (act: PDAction, chars: string, lead = 900, gap = 165): Beat<PD, PDAction>[] =>
  chars.split('').map((c, i) => ({ ms: i === 0 ? lead : gap, do: act, arg: c }));

export const STEPS: Step[] = [
  /* ---- 1 · the account ----------------------------------------------- */
  {
    id: 'balances', ch: 'account',
    title: 'Balances on one card',
    note: 'Crypto $7,811.50, Perps $86.99 and Earn $2,347.79 live in the same account. The Perps row makes its own offer: up to 50x leverage.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'toperps', ch: 'account',
    title: 'Into Perps',
    note: 'The row is the door. No onboarding, no second app \u2014 the market opens on the account you already have.',
    beats: [{ ms: 3000, do: 'openPerps' }],
  },

  /* ---- 2 · the market ------------------------------------------------ */
  {
    id: 'chart', ch: 'market',
    title: 'BTC, price and candles',
    note: 'The pair and its picker up top, price and change under it, candles with the price axis on the right, timeframe below. Long and Short are the only things the screen asks for.',
    beats: [{ ms: 2900 }],
  },
  {
    id: 'tabs', ch: 'market',
    title: 'Positions \u00b7 Orders \u00b7 Trades',
    note: 'All three lists live under the chart. Trades already carries 26; Positions is empty, and says so in full rather than showing nothing.',
    beats: [
      { ms: 2600, do: 'tab', arg: 'trd' },
      { ms: 1900, do: 'tab', arg: 'ord' },
      { ms: 1700, do: 'tab', arg: 'pos' },
    ],
  },
  {
    id: 'myaccount', ch: 'market',
    title: 'My account',
    note: 'Total equity $86.99, unrealized PNL $0.00, margin in use $0.00, available $86.99. No trade is possible on that balance \u2014 which is what Deposit is for.',
    beats: [{ ms: 2300, do: 'acct' }],
  },

  /* ---- 3 · funding --------------------------------------------------- */
  {
    id: 'fund', ch: 'fund',
    title: 'Fund Perps Account',
    note: 'Moves USDC from your near.com account into the perps one. What pays for it need not be USDC: here NEAR pays, and the route converts on the way.',
    beats: [{ ms: 2700, do: 'deposit' }],
  },
  {
    id: 'amount', ch: 'fund',
    title: 'How much, and what pays',
    note: '$1,000 on the keypad, and the Pay NEAR row says where it comes from: $7,682 available.',
    beats: [...type_('fkey', '1000', 2000), { ms: 900 }],
  },
  {
    id: 'review', ch: 'fund',
    title: 'Review send',
    note: 'The sheet states the whole price before you sign: 1,000 USDC received, 0 NEAR in fees, 539.096 NEAR at most, 0.50% maximum slippage, about 22 seconds.',
    beats: [{ ms: 1700, do: 'fundReview' }],
  },
  {
    id: 'passkey', ch: 'fund',
    title: 'Sign with a passkey',
    note: 'No password and no seed phrase: Face ID against the passkey saved for near.com. Nothing moves until that signature comes back.',
    beats: [
      { ms: 3000, do: 'fundSend' },
      { ms: 1100, do: 'authOk' },
      { ms: 1300, do: 'fstep' },
      { ms: 900, do: 'fstep' },
    ],
  },
  {
    id: 'settle', ch: 'fund',
    title: 'Processing \u00b7 Sending \u00b7 Complete',
    note: 'The send settles in parts, and each part ticks itself off. When the last one closes, the perps balance goes from $86.99 to $1,086.99.',
    beats: [
      { ms: 1500, do: 'fstep' },
      { ms: 2100, do: 'fstep' },
      /* the third tick is the one that closes the list AND lands the balance:
         FUND_STEPS has three rows, so `fstep` runs to 3 */
      { ms: 2000, do: 'fstep' },
      { ms: 1900 },
    ],
  },

  /* ---- 4 · the ticket ------------------------------------------------ */
  {
    id: 'toticket', ch: 'ticket',
    title: 'Long or Short',
    note: 'Back on the market, with $1,087 available to trade. Whichever side you pick opens the same ticket with the sign reversed.',
    beats: [
      { ms: 2600, do: 'closeFund' },
      { ms: 2400, do: 'openTicket', arg: 'long' },
    ],
  },
  {
    id: 'size', ch: 'ticket',
    title: 'Size here is margin, not notional',
    note: '$700 of the $1,087. That number is what you put at risk; leverage decides what it turns into.',
    beats: [...type_('key', '700', 1700, 190), { ms: 1100, do: 'done' }],
  },
  {
    id: 'lev', ch: 'ticket',
    title: 'Leverage',
    note: 'The sheet moves 10x to 20x and the whole ticket recomputes: estimated trade value $7,000 to $14K, and estimated liquidation climbs from 7% below entry to 2%.',
    beats: [
      { ms: 1700, do: 'levSheet' },
      { ms: 1100, do: 'levSet', arg: '13' },
      { ms: 300, do: 'levSet', arg: '16' },
      { ms: 300, do: 'levSet', arg: '19' },
      { ms: 300, do: 'levSet', arg: '21' },
      { ms: 420, do: 'levSet', arg: '20' },
      { ms: 1500, do: 'levSave' },
    ],
  },
  {
    id: 'otype', ch: 'ticket',
    title: 'Market or Limit',
    note: 'The menu explains each in one line: at the current price, or at one you name. Limit opens a second field \u2014 and the ticket will not submit without it.',
    beats: [
      { ms: 2000, do: 'otypeMenu' },
      { ms: 3000, do: 'otypeMenu' },
    ],
  },

  /* ---- 5 · protection ------------------------------------------------ */
  {
    id: 'prot', ch: 'protect',
    title: 'Add profit taker / stop loss',
    note: 'One checkbox opens both fields. Both start as percentages \u2014 a distance from the entry, not a price.',
    beats: [{ ms: 2200, do: 'prot' }],
  },
  {
    id: 'unit', ch: 'protect',
    title: 'The \u21c4 swaps the unit',
    note: 'And empties both fields, which is right: 82000 means one thing as a price and nothing at all as a percentage.',
    beats: [...type_('key', '82000', 1500), { ms: 1600, do: 'unit', arg: 'tp' }],
  },
  {
    id: 'tperr', ch: 'protect',
    title: 'A take profit sits above the entry',
    note: 'At $2 the ticket refuses \u2014 \u201cTake profit must be above entry price\u201d \u2014 and the button stops saying Open long and starts saying Review take profit. Corrected to $82,000, it comes back.',
    beats: [
      { ms: 1300, do: 'key', arg: '2' },
      { ms: 2600, do: 'key', arg: '⌫' },
      ...type_('key', '82000', 700, 175),
    ],
  },
  {
    id: 'slerr', ch: 'protect',
    title: 'A stop loss sits below it',
    note: '$79,974 is above the $79,654 entry \u2014 the same rule, mirrored. At $78,200 the ticket accepts.',
    beats: [
      { ms: 1800, do: 'focus', arg: 'sl' },
      ...type_('key', '79974', 900),
      { ms: 2800, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      ...type_('key', '78200', 700, 180),
      { ms: 1200, do: 'done' },
    ],
  },

  /* ---- 6 · opening --------------------------------------------------- */
  {
    id: 'submit', ch: 'open',
    title: 'Open long',
    note: 'Another passkey. The order carries three things \u2014 the leverage, the order itself and the protections \u2014 and sends them as one signed intent.',
    beats: [
      { ms: 2400, do: 'submit' },
      { ms: 1200, do: 'ostep' },
      { ms: 1300, do: 'ostep' },
      { ms: 900, do: 'ostep' },
    ],
  },
  {
    id: 'checklist', ch: 'open',
    title: 'Set leverage \u00b7 Submit order \u00b7 Update TP/SL',
    note: 'The order settles in parts and the checklist marks them off in order. When the last one closes, the ticket empties and the position exists.',
    beats: [
      { ms: 1500, do: 'ostep' },
      { ms: 1500, do: 'ostep' },
      { ms: 1900, do: 'ostep' },
    ],
  },

  /* ---- 7 · the position ---------------------------------------------- */
  {
    id: 'entry', ch: 'position',
    title: 'The entry, drawn',
    note: 'The blue $79,654 line stays on the chart, and the position bar appears beneath it with Modify and Close within reach.',
    beats: [{ ms: 2800 }],
  },
  {
    id: 'detail', ch: 'position',
    title: 'Size, margin, liquidation',
    note: 'The bar unfolds: $14,000 of notional, 0.17576 BTC, $700 of margin, and the price at which the position closes itself.',
    beats: [{ ms: 2400, do: 'posOpen' }],
  },
  {
    id: 'orders', ch: 'position',
    title: 'Orders (2) and Trades (27)',
    note: 'The take profit and the stop loss are not settings: they are two live orders. And the opening trade is already in the history.',
    beats: [
      { ms: 2800, do: 'tab', arg: 'ord' },
      { ms: 2400, do: 'tab', arg: 'trd' },
      { ms: 2400, do: 'tab', arg: 'pos' },
      /* the detail folds away here, not at the top of the next step: a step's
         first beat is what a reader lands on, and landing on "the balance seen
         from the account" should BE the account */
      { ms: 1800, do: 'posOpen' },
    ],
  },

  /* ---- 8 · back out -------------------------------------------------- */
  {
    id: 'home', ch: 'back',
    title: 'The balance, from the account',
    note: 'The same card as the start: Perps no longer reads $86.99 but $1,086.99, with its unrealized P&L underneath.',
    beats: [{ ms: 1400, do: 'home' }],
  },
];

/* ---- flattening ------------------------------------------------------- */

export const BEATS: Beat<PD, PDAction>[] = STEPS.flatMap((s) => s.beats);

/** the beat index each step starts at */
export const STARTS: number[] = (() => {
  const out: number[] = [];
  let n = 0;
  for (const s of STEPS) {
    out.push(n);
    n += s.beats.length;
  }
  return out;
})();

/** which step a beat index belongs to */
export function stepOf(i: number) {
  if (i < 0) return 0;
  let k = 0;
  for (let j = 0; j < STARTS.length; j++) if (STARTS[j] <= i) k = j;
  return k;
}

/**
 * WHERE A READER'S GESTURE LANDS.
 *
 * Firing an anchored transition moves the playhead to that step, so the script
 * resumes from what the reader just did instead of yanking the screen back to
 * its own place. That single behaviour is the difference between a demo that
 * lets you touch it and one that fights you.
 */
const ANCHOR: Partial<Record<PDAction, string>> = {
  openPerps: 'toperps',
  acct: 'myaccount',
  deposit: 'fund',
  fundReview: 'review',
  fundSend: 'passkey',
  closeFund: 'toticket',
  openTicket: 'size',
  levSheet: 'lev',
  levSave: 'otype',
  otypeMenu: 'otype',
  prot: 'unit',
  unit: 'tperr',
  submit: 'checklist',
  posOpen: 'detail',
  home: 'home',
  closePos: 'home',
};

const stepIndex = (id: string) => STEPS.findIndex((s) => s.id === id);

export const anchor: Partial<Record<PDAction, number>> = Object.fromEntries(
  Object.entries(ANCHOR).map(([a, id]) => [a, STARTS[stepIndex(id)]]),
) as Partial<Record<PDAction, number>>;

/**
 * The machine, assembled. `guided` is deliberately wide open: this page's
 * whole promise is that you can touch it, and the anchors above are what keeps
 * that from breaking the story. The guards in `state.ts` are the only thing
 * that ever refuses.
 */
export const MACHINE: Machine<PD, PDAction> = {
  initial,
  actions,
  beats: BEATS,
  restFrame: STARTS[stepIndex('detail')],
  outro: 4200,
  guided: () => Object.keys(actions) as PDAction[],
  anchor,
  /* the two settlements tick on their own when no clock is running */
  auto: (s) => {
    if (s.screen === 'funding' && s.fstep < 3) return { after: 1500, do: 'fstep' };
    if (s.over === 'passkey' && s.auth !== 'done') return { after: 1100, do: s.submitting ? 'ostep' : 'fstep' };
    if (s.over === 'passkey' && s.auth === 'done') return { after: 700, do: s.submitting ? 'ostep' : 'fstep' };
    if (s.submitting && s.over === 'none') return { after: 1500, do: 'ostep' };
    return null;
  },
};

/** the state at a given beat index — the pure function the page rides */
export function frameAt(i: number): PD {
  let s = { ...initial };
  for (let k = 0; k <= i && k < BEATS.length; k++) s = applyBeat(MACHINE, s, BEATS[k]);
  return s;
}
