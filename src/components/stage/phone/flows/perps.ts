import type { Beat, Machine } from './machine';

/**
 * PERPS — size a long, get the stop loss wrong, fix it, open the position.
 *
 * The bad stop loss is deliberate: a form that only ever succeeds shows nothing
 * about the product, and "Stop loss must be below entry price" is the moment
 * this screen stops looking like a picture of an app. It is a real guard, so it
 * refuses the reader in free mode exactly as it refuses the script.
 */
export type PerpsState = {
  screen: 'flat' | 'ticket' | 'submitting' | 'position';
  side: 'long' | 'short';
  /** Market or Limit, off the segmented control's dropdown */
  otype: 'Market' | 'Limit';
  amount: string;
  leverage: number;
  protect: boolean;
  tp: string;
  sl: string;
  /** the price a Limit order rests at. Empty while the order type is Market. */
  limit: string;
  /** which field the keypad is attached to */
  focus: 'amount' | 'limit' | 'tp' | 'sl' | null;
  /** lights one key, so a scripted entry reads as typed rather than pasted */
  pressed: string | null;
  /** the leverage sheet, which is its own screen in the real app */
  sheet: 'none' | 'lev';
  /** which list is showing under the chart */
  tab: 'pos' | 'ord' | 'trd';
  /** index into the submit checklist */
  step: number;
  /**
   * Which control was just pressed. Without it a state simply differs between
   * two frames and nothing connects them, which is how a slideshow reads.
   */
  tap: string | null;
};

const initial: PerpsState = {
  screen: 'flat',
  side: 'long',
  otype: 'Market',
  amount: '',
  limit: '',
  leverage: 20,
  protect: false,
  tp: '',
  sl: '',
  focus: null,
  pressed: null,
  sheet: 'none',
  tab: 'pos',
  step: 0,
  tap: null,
};

/** The entry the position opens at. The chart draws its line at this price. */
export const ENTRY = 79654;
export const SUBMIT_STEPS = ['Set leverage', 'Submit order'];
export const AVAILABLE = 1087;

/**
 * The error the real app raises — and it depends on the side. A long is
 * stopped out BELOW its entry and a short ABOVE it, so the same number is a
 * mistake on one side and correct on the other. A reader can switch sides in
 * the interactive modes, which is exactly when a one-sided rule would start
 * refusing a perfectly good order.
 */
export const slInvalid = (s: PerpsState) => {
  if (!s.protect || s.sl === '') return false;
  return s.side === 'long' ? Number(s.sl) >= ENTRY : Number(s.sl) <= ENTRY;
};
/** a Limit order with no price on it is not an order */
export const ready = (s: PerpsState) =>
  Number(s.amount) > 0 && !slInvalid(s) && (s.otype === 'Market' || Number(s.limit) > 0);

export type PerpsAction =
  | 'side' | 'otype' | 'openTicket' | 'focus' | 'key' | 'clear'
  | 'levSheet' | 'lev' | 'protect' | 'submit' | 'step' | 'close' | 'tab' | 'back';

const actions: Machine<PerpsState, PerpsAction>['actions'] = {
  /* the market screen */
  side: (s, v) => ({ side: (v as 'long' | 'short') ?? 'long', tap: v ?? 'long' }),
  /* Market ⇄ Limit is a real switch, not a label: Limit opens a price field
     and the ticket will not submit until it has one. A chip that changed a
     word and nothing else would be the worst kind of control — it looks like
     it did something. */
  otype: (s, v) => {
    const otype = (v as 'Market' | 'Limit') ?? 'Market';
    if (otype === s.otype) return null;
    return otype === 'Limit'
      ? { otype, focus: 'limit', limit: '', tap: 'otype' }
      : { otype, limit: '', focus: 'amount', tap: 'otype' };
  },
  tab: (s, v) => (s.tab === v ? null : { tab: v as PerpsState['tab'], tap: 'tab' }),

  /* into the ticket */
  openTicket: (s, v) => ({
    screen: 'ticket',
    side: (v as 'long' | 'short') ?? s.side,
    focus: 'amount',
    tap: null,
  }),
  back: (s) =>
    s.screen === 'ticket' ? { screen: 'flat', focus: null, tap: null } : null,

  focus: (s, v) => {
    const f = (v ?? null) as PerpsState['focus'];
    if (f === 'limit' && s.otype !== 'Limit') return null;
    if ((f === 'tp' || f === 'sl') && !s.protect) return null;
    return { focus: f, pressed: null, tap: null };
  },

  /* the keypad. One transition for every digit — the script presses the same
     one the reader does, so a typed field and a scripted field are the same
     field with the same history. */
  key: (s, d) => {
    if (!s.focus || !d) return null;
    const cur = s[s.focus];
    if (d === '⌫') return { [s.focus]: cur.slice(0, -1), pressed: d };
    if (d === ',') return null;
    if (cur.length >= 9) return null;
    /* no leading zeros: the real field does not let you type "007" */
    const next = cur === '0' ? d : cur + d;
    return { [s.focus]: next, pressed: d };
  },
  clear: (s) => (s.focus ? { [s.focus]: '', pressed: null } : null),

  levSheet: (s) => ({ sheet: s.sheet === 'lev' ? 'none' : 'lev', tap: 'lev' }),
  lev: (s, v) => ({ leverage: Number(v) || s.leverage }),

  protect: (s) => ({
    protect: !s.protect,
    focus: !s.protect ? 'tp' : 'amount',
    tap: 'protect',
  }),

  /* The guard the whole screen is built around — and the WHOLE transition.
     It used to return `{ tap: 'open' }` and leave the navigation to the beat
     after it, which is fine for a script and a dead end for a reader: the
     button lit up and nothing happened. A press does what it says, in every
     mode; the beat that only lights the control is a `set`, above. */
  submit: (s) => (ready(s) ? { screen: 'submitting', focus: null, step: 0, tap: null } : null),
  /* one row of the checklist. The script fires it on its beats; with no script
     running, `auto` below fires it on a timer. */
  step: (s) => {
    if (s.screen !== 'submitting') return null;
    return s.step >= 2 ? { screen: 'position', step: 3 } : { step: s.step + 1 };
  },

  close: (s) =>
    s.screen === 'position'
      ? { ...initial, tab: 'trd', tap: 'close' }
      : null,
};

/**
 * The script. Every beat that changes something real does it through an action
 * above; `set` only carries what nobody can press — a checklist row advancing,
 * a highlight going out.
 *
 * A press and the screen it opens are TWO beats. Collapsed into one, the
 * control that was tapped unmounts on the same frame it lights up — the press
 * is never seen and the two screens read as unrelated slides.
 */
const beats: Beat<PerpsState, PerpsAction>[] = [
  /* the market, as you find it */
  { ms: 2600 },
  { ms: 240, do: 'side', arg: 'long' },
  { ms: 320, do: 'openTicket', arg: 'long' },
  /* sizing, one key at a time — the only beats that say it was typed */
  { ms: 260, do: 'key', arg: '7' },
  { ms: 210, do: 'key', arg: '0' },
  { ms: 210, do: 'key', arg: '0' },
  { ms: 1100, set: { pressed: null } },
  /* leverage, out of its own sheet */
  { ms: 380, do: 'levSheet' },
  { ms: 900, do: 'lev', arg: '20' },
  { ms: 700, do: 'levSheet', set: { tap: null } },
  /* protection */
  { ms: 1500, do: 'protect' },
  { ms: 240, do: 'key', arg: '8' },
  { ms: 170, do: 'key', arg: '2' },
  { ms: 170, do: 'key', arg: '0' },
  { ms: 170, do: 'key', arg: '0' },
  { ms: 900, do: 'key', arg: '0' },
  /* the stop loss that will not do: 79,990 is ABOVE the long's entry */
  { ms: 500, do: 'focus', arg: 'sl' },
  { ms: 240, do: 'key', arg: '7' },
  { ms: 170, do: 'key', arg: '9' },
  { ms: 170, do: 'key', arg: '9' },
  { ms: 170, do: 'key', arg: '9' },
  { ms: 1900, do: 'key', arg: '0', set: { pressed: null } },
  /* fixed: cleared back and re-typed UNDER the entry. It has to end up under
     $79,654 or the guard is still refusing — the script has to satisfy the
     same rule the reader does, which is the whole point of pressing the same
     transitions. */
  { ms: 300, do: 'key', arg: '⌫' },
  { ms: 190, do: 'key', arg: '⌫' },
  { ms: 190, do: 'key', arg: '⌫' },
  { ms: 190, do: 'key', arg: '⌫' },
  { ms: 220, do: 'key', arg: '8' },
  { ms: 170, do: 'key', arg: '5' },
  { ms: 170, do: 'key', arg: '0' },
  { ms: 1500, do: 'key', arg: '0', set: { pressed: null } },
  /* submit. The press and the screen it opens are TWO beats — collapsed into
     one, the control that was tapped unmounts on the same frame it lights up
     and the press is never seen. */
  { ms: 420, set: { tap: 'open' } },
  { ms: 700, do: 'submit' },
  { ms: 1300, do: 'step' },
  { ms: 900, do: 'step' },
  /* A beat's `ms` is the wait BEFORE it fires, so the hold on the OUTCOME
     belongs to `outro`, not to the beat that produces it. Getting this the
     wrong way round left the finished screen on for the outro alone while the
     screen before it sat there for four seconds doing nothing. */
  { ms: 900, do: 'step' },
];

/**
 * THE RAIL. What a reader may touch, and when.
 *
 * It is deliberately generous on the ticket — sizing, leverage, protection and
 * the keypad are the screen's whole argument — and closed during settlement,
 * where there is nothing to decide and an interruption would only break a
 * sequence the reader is waiting on.
 */
const guided = (s: PerpsState): PerpsAction[] => {
  if (s.screen === 'flat') return ['side', 'otype', 'openTicket', 'tab'];
  if (s.screen === 'ticket')
    return s.sheet === 'lev'
      ? ['lev', 'levSheet']
      : ['focus', 'key', 'levSheet', 'protect', 'submit', 'side', 'otype', 'back'];
  if (s.screen === 'position') return ['tab', 'close'];
  return [];
};

export const perps: Machine<PerpsState, PerpsAction> = {
  initial,
  actions,
  beats,
  guided,
  /* Where a gesture lands on the script. Sizing puts the playhead just after
     the amount is entered, so the demo picks up at protection rather than
     re-typing over the reader. */
  /* submit lands on the beat AFTER its own, so the script picks up at the
     first checklist row rather than re-submitting over the reader */
  anchor: { openTicket: 2, protect: 10, submit: 31 },
  auto: (s) => (s.screen === 'submitting' ? { after: 1200, do: 'step' } : null),
  /* the open position: the only frame with both the chart and the outcome */
  restFrame: beats.length - 1,
  /* the open position holds here while the card leaves */
  outro: 4600,
};
