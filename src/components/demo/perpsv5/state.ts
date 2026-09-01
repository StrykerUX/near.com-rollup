import type { Act } from '@/components/stage/phone/flows/machine';

/**
 * PERPS, THE TEN-SECOND CUT — the figures and the machine
 * ==================================================================
 * A THIRD machine, alongside `flows/perps.ts` (a card on a scrolling page) and
 * `demo/perps/state.ts` (the whole arc, twenty-four steps). Not a fourth cut
 * of the second one, and the reason is a single number.
 *
 * `demo/perps/state.ts` bakes `ENTRY = 79654` into its two validation rules and
 * into every position it opens. This cut is rebuilt against a different set of
 * reference frames — the market is at $79,567.5 and there is ALREADY a position
 * on the book, opened at $79,520 — so it needs a different entry, and changing
 * that constant would move the ticket's rules, the chart's anchor and the copy
 * under four other routes. The versions that share a machine share it because
 * they are the same trade seen from different distances; this one is a
 * different trade.
 *
 * WHAT IT DELIBERATELY KEEPS is the shape: named pure transitions, guards that
 * refuse, a `tap` that says which control was pressed. The autoplay and the
 * reader still press the same transitions, so `pnpm check:flows` walks this
 * one exactly as it walks the others.
 *
 * WHAT IT DELIBERATELY DROPS is everything the long arc earns and thirteen
 * seconds cannot: the account screen, the funding chapter, the passkey, the Market ⇄
 * Limit switch, the ⇄ unit swap, and the take profit filling. A cut is allowed
 * to be shorter. It is not allowed to be a slideshow, which is why what is left
 * is still a machine and not a list of frames.
 */

/* ---- the market, read off the reference frames ------------------------ */

/**
 * The quote. It is also the chart's anchor (`base` on `<Chart>`) and the entry
 * the second position opens at, which is three things naming one number on
 * purpose: a demo whose header, whose candles and whose ticket disagree about
 * the price is a demo of nothing.
 */
export const MARK = 79567.5;

/**
 * WHICH STRETCH OF THE CHART'S WALK THIS CUT SITS ON.
 *
 * The chart's series is one continuous, non-repeating function of a candle's
 * number, so a phase is not a rotation — it is a different hour of the same
 * market. 1,628 was chosen by searching six thousand start points for the one
 * 46-candle window that is all four of these at once — and the fourth is the
 * one that took two passes to get right:
 *
 *   · its LOW is a third of the way in and its HIGH is the right-hand edge,
 *     which is the shape in the reference frames: a dip, a long chop, then a
 *     rally into the live price. The first phase chosen scored well on
 *     everything else and put its rally on the LEFT, so the opening frame of a
 *     cut whose first line is "already working" was a market rolling over.
 *   · the last third carries 251 of the window's 306 points, so the rally is
 *     a rally and not a tilt
 *   · it KEEPS rising over the six and a half candles the clip advances (+55),
 *     so the position in the corner gains while you watch rather than by luck
 *   · and it still closes EIGHTEEN of its forty-six bars red. This is the one
 *     that matters and the one a slope cannot buy: a window with two red bars
 *     is a ramp, and the chart already has a long note about why a ramp reads
 *     worse than a flat market.
 *
 * Re-run that search if the walk's amplitudes ever change; the number means
 * nothing on its own and everything against that particular series.
 */
export const PHASE = 1628;

/**
 * THE SIZE OF A PRINT, and it is read straight off the reference frames.
 *
 * Every quote in them lands on a half dollar — $79,567.5, $79,577.5, $79,585.5,
 * three frames minutes apart — so the app prints BTC in fifty-cent ticks. That
 * is not a detail worth copying for its own sake; it is the fix for the one
 * thing that made this screen read as aggressive.
 *
 * MEASURED, before: the header repainted 49 times a second, held each value for
 * 20ms, and moved by an identical step every time, because the live candle's
 * close travels linearly across its 1,500ms. Thirty-five points in six seconds —
 * four hundredths of a per cent — rendered as an odometer. The instinctive fix
 * is to slow the market down, and it is the wrong one twice over: the market is
 * already calm, and a slower linear crawl repainted fifty times a second is
 * more obviously a machine, not less.
 *
 * Rounding the QUOTE to a tick fixes it at the source. The number only changes
 * when the market crosses fifty cents, so the prints become discrete in value
 * and irregular in time — a tape — and the rate now follows the market instead
 * of the frame rate: a fast market crosses more ticks and prints more often,
 * which is exactly what it should do. See `tick` on <Chart>.
 */
export const TICK = 0.5;

/**
 * HOW LONG A CANDLE TAKES TO FORM HERE.
 *
 * The chart's own constant is 1,500 and stays there: `check:flows` multiplies
 * it by the ramp's length to assert that v3 and v4 fill their take profit on
 * the frame the market reaches it, so it is not a number this cut gets to move
 * for everybody.
 *
 * Five seconds a bar, which is slow for an hour and right for a cut: the price
 * covers the same ground in more time, so it moves at a lower velocity and a
 * QUOTED market crosses fewer ticks per second. It is the WEAKEST of the three
 * dials on its own — 37 points a second to 26 — and it earns its place only in
 * combination with REACH and TAPE.
 *
 * The clip advances 3.46 candles. Re-checked against `PHASE`: the window still
 * rises over it (+53.6 points), still puts its low a third of the way in and
 * its high at the right edge, and still closes eighteen of forty-six bars red.
 */
export const CANDLE_MS = 5000;

/**
 * HOW FAR A WICK REACHES, and it is the strongest dial on the quote.
 *
 * The chart's default is [20, 60] and this cut runs a quarter of it. The reason
 * only became visible after the candles were fixed to form properly: a bar's
 * reach is not decoration, it is where the price GOES — open → high → low →
 * close walks that distance two or three times per bar, and every point of it
 * is a point the header has to print. Measured on this cut, [20,60] puts the
 * median velocity at 37 points a second and [6,16] at 12. Nothing else here is
 * worth a third of that.
 */
export const REACH: [number, number] = [7, 20];

/**
 * TWO CORRECTIONS THAT MAKE THESE READ AS CANDLES AND NOT AS PLUS SIGNS.
 *
 * Held next to a real BTC chart the difference was not the density — the app's
 * own chart draws about seven pixels a candle, same as this one. It was that
 * every bar here had a wick above AND below, and every body was the size of its
 * neighbours. On a real chart the body dominates and most bars have one bare
 * side.
 *
 * `WICK_BIAS` is an exponent on the 0..1 draw that sizes each wick. Uniform
 * gives every side half a reach, on every bar, forever — the one shape that is
 * actually rare. At 2.8 the mean wick is 26% of the reach and most of the mass
 * is near nothing.
 *
 * `JITTER` is a per-candle wobble on the level, and it is safe because a
 * candle's close IS the next one's open — both are the series at the same
 * index, so any per-index offset preserves that chain exactly.
 *
 * Measured together on this window: the body goes from 42% of a candle's
 * height to 59%, near-dojis from 11 of 46 to 5, bars with a noticeable wick on
 * both sides from 26 to 10, and bars with one bare side from 9 to 27.
 *
 * They also made the quote CALMER rather than costing anything — a wick is
 * where the price goes, so biasing it toward nothing means less ground covered:
 * the median velocity fell from 5 points a second to 4 and the print rate from
 * 18 to 15, even with REACH's ceiling raised from 16 to 20.
 */
export const WICK_BIAS = 2.8;
export const JITTER = 16;

/**
 * THE QUOTE ARRIVES IN BURSTS, WHICH IS THE WHOLE POINT.
 *
 * Rounding the price to a tick fixed the odometer, and then correct candle
 * formation undid most of it: a bar that really visits its high and its low
 * covers two to three times the ground, and at 60fps a $0.50 tick only starts
 * filtering below 30 points a second. Above that the price crosses several
 * ticks between frames and the number changes on every one of them — measured
 * at 27 prints a second with 17ms between them, which is not a market, it is a
 * constant crawl.
 *
 * And CONSTANT is the word that matters. Real quotes sit still and then jump;
 * they do not move quickly at an even rate. Slowing everything down uniformly
 * gives a slower even rate, which is the same problem quieter.
 *
 * So the time inside each leg of a bar's path is warped — see `tape` on
 * <Chart>. At 0.9 the price runs between a tenth and nearly twice its average
 * speed, three times per leg. Measured with CANDLE_MS and REACH together: the
 * median velocity falls from 37 points a second to 8, and the quiet between
 * prints goes from 33ms to 100 at the ninetieth percentile. Clusters and
 * pauses, rather than an even churn.
 */
export const TAPE = 0.9;

/* ---- the position that is already on ---------------------------------- */

/**
 * IT OPENS ON A TRADE ALREADY WORKING, which is the whole reason this cut
 * exists. Every other version starts on an empty book and spends its first
 * third earning the right to have one; a cut this short does not have a third
 * to spend, and "here is an account with a live position in it" is a stronger
 * first frame than "here is an account".
 *
 * $79,520 against a mark of $79,567.5 puts it $47.50 in front — small, which
 * is right. A position opened at a price the market has already run a thousand
 * points past is not a position, it is a lottery ticket, and the figure it
 * would print is the only thing on the screen nobody would believe.
 */
export const OPEN_ENTRY = 79520;
export const OPEN_SIZE = 120000;
export const OPEN_LEV = 20;

/* ---- the trade this cut is about -------------------------------------- */

/** what gets typed into the amount field, digit by digit */
export const NEW_MARGIN = '5000';
/** where the leverage lands, and where the slider passes through on the way */
export const NEW_LEV = 20;

/**
 * THE TWO EXITS, SIZED TO THE MARKET THEY ARE SET IN.
 *
 * Three hundred above the entry and a hundred and fifty below it — two to one,
 * which is the whole point of setting a pair — and at 20x that is +7.5% and
 * −3.8% on the margin. A scalper's bracket, on a scalper's leverage.
 *
 * THEY WERE +1,000 / −500 AND THE CHART COULD NOT SHOW THEM. That pair was
 * chosen for its shape and never checked against the series it would be drawn
 * on: these candles cover 420 points across the whole visible hour, so a take
 * profit a thousand points away is not "the shape a trader would set", it is a
 * bracket that would never fill. Measured, drawing it forced the price scale to
 * 1,950 points and squeezed every candle into 22% of the chart's height.
 *
 * That is what the brackets were being left off the chart to avoid — and
 * leaving them off meant the one frame that is supposed to show a trade was
 * set showed a line moving 47 points and nothing else. The bracket was not the
 * problem. Its size was. At ±300/150 the scale is 839 points, the candles keep
 * half the height, and all three lines are on screen where a reader can see
 * that the exits sit either side of the entry.
 *
 * (The reference frames show $82,000 and $78,200 — an arbitrary pair that
 * happened to be on screen, at 1.6:1, and 2,400 points from a market that moves
 * 420 in an hour. `demo/perps/state.ts` walked away from them for a version of
 * the same reason.)
 */
export const TAKE_PROFIT = '79867';
export const STOP_LOSS = '79417';

/* ---- the account ------------------------------------------------------ */

/**
 * THE BALANCE IS DERIVED FROM THE TRADE, NOT COPIED OFF A FRAME.
 *
 * The reference ticket reads "Available to trade $1,087" — and this cut types
 * $5,000 of margin into it, which that balance cannot pay for. One of the two
 * numbers had to move and it was not going to be the trade: $5,000 at 20x is
 * the $100,000 position the whole cut is for, and a demo of a leveraged
 * product whose example is $1,087 is a demo of a form.
 *
 * So the perps balance is sized to cover both positions with room: $11,428.61,
 * less the $6,000 already committed to the open one, is the $5,428.61 the
 * ticket offers. It is not a figure off a frame and it does not pretend to be.
 */
export const PERPS_BAL = 11428.61;

/** maintenance margin — the same 1/lev − 0.03 the other two machines use */
export const MMR = 0.03;
export const liqPct = (lev: number) => 1 / lev - MMR;
export const liqPrice = (entry: number, lev: number, side: Side) =>
  side === 'long' ? entry * (1 - liqPct(lev)) : entry * (1 + liqPct(lev));

export const ORDER_STEPS = ['Set leverage', 'Submit order', 'Update TP/SL'];

/**
 * The counters on the three tabs. They are on screen in the reference frames
 * and they have to MOVE when the order lands, or the tab row is the one part
 * of the screen that did not notice the trade. Orders gains two, because a
 * bracket is two resting orders and not one.
 */
export const TRADES_0 = 27;
export const ORDERS_0 = 2;

export type Side = 'long' | 'short';

export type Position = {
  side: Side; lev: number; size: number; entry: number;
  tp: number | null; sl: number | null;
};

export const OPEN_POS: Position = {
  side: 'long', lev: OPEN_LEV, size: OPEN_SIZE, entry: OPEN_ENTRY, tp: null, sl: null,
};

export type BD = {
  /** there is one screen, and it is the market. Named so `check:flows` can
      print a walk, and so the shape matches the other two machines. */
  screen: 'market';

  /* ---- the ticket ---- */
  ticket: boolean;
  side: Side;
  amount: string;
  lev: number;
  /** the leverage sheet edits a draft; Save is what commits it */
  levDraft: number;
  /** "Add profit taker/stop loss" */
  prot: boolean;
  tp: string;
  sl: string;
  focus: 'amount' | 'tp' | 'sl' | null;
  /** lights one key so a scripted entry reads as typed rather than pasted */
  pressed: string | null;
  /** what is stacked over the ticket */
  over: 'none' | 'lev';

  /* ---- submitting ---- */
  ostep: number;
  submitting: boolean;

  /* ---- the book ---- */
  /**
   * NEWEST FIRST, which is why it is a list and not the single `pos` the other
   * machines carry. The point of the cut is that a second position joins a
   * first one; a field that can only hold one would have made the ending a
   * replacement, and a replacement is not what opening a trade does.
   */
  book: Position[];
  /** the position bar under the chart, expanded */
  posOpen: boolean;
  tab: 'pos' | 'ord' | 'trd';

  /** which control was just pressed — without it two frames merely differ */
  tap: string | null;
};

export const initial: BD = {
  screen: 'market',
  ticket: false,
  side: 'long',
  amount: '',
  lev: 10,
  levDraft: 10,
  prot: false,
  tp: '',
  sl: '',
  focus: null,
  pressed: null,
  over: 'none',
  ostep: -1,
  submitting: false,
  book: [OPEN_POS],
  posOpen: false,
  tab: 'pos',
  tap: null,
};

/* ---- derived, all of it ----------------------------------------------- */

/** margin committed to everything already on the book */
export const marginUsed = (s: BD) => s.book.reduce((t, p) => t + p.size / p.lev, 0);
/** the "Available to trade" line, and the chip in the chrome */
export const avail = (s: BD) => PERPS_BAL - marginUsed(s);
/** notional: the app multiplies the margin you type by the leverage */
export const notional = (s: BD) => (Number(s.amount) || 0) * s.lev;
export const btcSize = (s: BD) => notional(s) / MARK;

/** what a position is worth at a given price, and what that is on the margin */
export const pnl = (p: Position, at: number) =>
  (at - p.entry) * (p.size / p.entry) * (p.side === 'long' ? 1 : -1);
export const pnlPct = (p: Position, at: number) => (pnl(p, at) / (p.size / p.lev)) * 100;

/**
 * The app writes $14K but $7,000 — it only abbreviates once the figure needs
 * five digits. Both spellings are in the reference frames, seconds apart.
 */
export const money = (v: number) =>
  v >= 10000
    ? '$' + Math.round(v / 1000).toLocaleString('en-US') + 'K'
    : '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });

/* ---- the guards, which are the screen's argument ---------------------- */

/**
 * A take profit sits ABOVE the entry on a long and below it on a short; a stop
 * loss is the mirror. This cut never types a wrong one — there is no room in
 * room for a refusal and its correction, and half of that pair is worse
 * than neither — but the rules stay, because they are what makes the primary
 * button's label mean something and because a reader driving the screen by
 * hand can still walk into them.
 */
const tpWrong = (s: BD) =>
  s.prot && s.tp !== '' && (s.side === 'long' ? Number(s.tp) <= MARK : Number(s.tp) >= MARK);
const slWrong = (s: BD) =>
  s.prot && s.sl !== '' && (s.side === 'long' ? Number(s.sl) >= MARK : Number(s.sl) <= MARK);

/**
 * WHAT THE FIELD IS ALLOWED TO SAY ABOUT ITSELF — which is nothing, while the
 * caret is still in it.
 *
 * Typing 79867 goes 7 → 79 → 798 → 7986 → 79867, and the first four of those
 * are below the entry price. So the field turned red on the first keystroke and
 * stayed red for four of the five, with the button reading "Review take profit"
 * throughout: 525ms of the screen accusing a reader of a mistake they were
 * halfway through not making. The stop loss never showed it, because it is
 * below the entry from its first digit — the coincidence that kept this hidden.
 *
 * `7` is not a take profit below the entry. It is an unfinished number, and a
 * form that judges one is wrong in the real app too. Same rule, checked once
 * the reader has finished saying what they mean.
 */
export const tpBad = (s: BD) => tpWrong(s) && s.focus !== 'tp';
export const slBad = (s: BD) => slWrong(s) && s.focus !== 'sl';

/** what the primary button says, which is how the ticket reports itself */
export function cta(s: BD): { label: string; ok: boolean } {
  if (tpBad(s)) return { label: 'Review take profit', ok: false };
  if (slBad(s)) return { label: 'Review stop loss', ok: false };
  if (!(Number(s.amount) > 0)) return { label: 'Enter amount', ok: false };
  /**
   * WRONG BUT STILL BEING TYPED: grey, and silent.
   *
   * Gating the field's red on focus opens a hole unless the button closes it —
   * a reader could type `7` and press Open long, and the machine would hand
   * them a position whose take profit is below its own entry. So the CTA reads
   * the UNGATED rule for whether it FIRES and the gated one for whether it
   * ACCUSES. Mid-keystroke a reader sees an ordinary disabled button, which is
   * what an unfinished form should look like.
   */
  return {
    label: s.side === 'long' ? 'Open long' : 'Open short',
    ok: !tpWrong(s) && !slWrong(s),
  };
}

/* ---- the transitions -------------------------------------------------- */

export type BDAction =
  | 'openTicket' | 'closeTicket' | 'side'
  | 'focus' | 'key' | 'done'
  | 'levSheet' | 'levSet' | 'levSave'
  | 'prot'
  | 'submit' | 'ostep' | 'land'
  | 'tab' | 'posOpen';

const digits = (cur: string, d: string) => {
  if (d === '⌫') return cur.slice(0, -1);
  if (d === ',') return cur.includes('.') ? cur : cur === '' ? '0.' : cur + '.';
  return (cur + d).replace(/^0(?=\d)/, '').slice(0, 9);
};

/** the book holds two. A third is a state nothing on this screen can show. */
const MAX_POS = 2;

export const actions: Record<BDAction, Act<BD>> = {
  openTicket: (s, v) =>
    s.ticket || s.book.length >= MAX_POS
      ? null
      : { ticket: true, side: (v as Side) ?? s.side, focus: 'amount', tap: v ?? null },
  closeTicket: (s) => (s.ticket ? { ticket: false, focus: null, over: 'none', tap: null } : null),
  side: (s, v) => (!s.ticket || s.side === v ? null : { side: (v as Side) ?? 'long', tap: v ?? null }),

  focus: (s, v) => {
    if (!s.ticket) return null;
    const f = (v ?? null) as BD['focus'];
    if ((f === 'tp' || f === 'sl') && !s.prot) return null;
    return { focus: f, pressed: null, tap: null };
  },
  key: (s, d) => {
    if (!s.focus || !d) return null;
    return { [s.focus]: digits(s[s.focus], d), pressed: d, tap: null } as Partial<BD>;
  },
  /** the ✓ on the accessory bar — the app's real way out of a numeric field */
  done: (s) => (s.focus ? { focus: null, pressed: null, tap: null } : null),

  levSheet: (s) =>
    s.ticket ? { over: s.over === 'lev' ? 'none' : 'lev', levDraft: s.lev, focus: null, tap: 'lev' } : null,
  levSet: (s, v) =>
    s.over === 'lev' && Number.isFinite(Number(v))
      ? { levDraft: Math.max(1, Math.min(50, Math.round(Number(v)))) }
      : null,
  levSave: (s) => (s.over === 'lev' ? { lev: s.levDraft, over: 'none', focus: 'amount', tap: 'save' } : null),

  /**
   * ONE TOGGLE, AND IT OPENS THE PAIR IN DOLLARS.
   *
   * The long arc starts these fields in `%` and spends a beat on the ⇄ that
   * turns them into prices. The reference frames for this cut are already in
   * `$` — and more to the point, the ⇄ is a story about units and this is a
   * story about a bracket. A cut earns its length by dropping the second
   * story, not by playing it faster.
   */
  prot: (s) =>
    s.ticket ? { prot: !s.prot, tp: '', sl: '', focus: s.prot ? 'amount' : 'tp', tap: 'prot' } : null,

  /**
   * Submit does the WHOLE transition and goes straight to the checklist. The
   * long arc puts a passkey in front of it, because "one signature for all of
   * it" is a claim that needs its own screen to land; here it would be a
   * dialog that arrives and leaves inside six hundred milliseconds, which
   * teaches a viewer nothing and costs the ending its hold.
   */
  submit: (s) =>
    s.ticket && cta(s).ok
      ? { submitting: true, ostep: 0, over: 'none', focus: null, tap: 'submit' }
      : null,
  /**
   * THE CHECKLIST TICKS, AND STOPS WHEN THERE IS NOTHING LEFT TO TICK.
   *
   * It used to run to `length - 1` and then land the order in the same call —
   * so at ostep 2 the third row was ACTIVE, spinning, and the very next
   * transition closed the sheet out from under it. The third row never once
   * showed its check. A viewer watched two settle and the third vanish.
   *
   * It now runs one further. At `ORDER_STEPS.length` every row is `i < at`,
   * which is the done state, and the sheet is still up. Landing the order is
   * `land` — a separate transition, because "the order is confirmed" and "the
   * ticket is gone" are two moments and the whole point is to see the first.
   * `demo/perps/state.ts` splits `receipt` from `settle` for the same reason.
   */
  ostep: (s) => {
    if (!s.submitting) return null;
    return s.ostep < ORDER_STEPS.length ? { ostep: s.ostep + 1 } : null;
  },
  /** the order lands: the ticket empties, the position joins the book */
  land: (s) => {
    if (!s.submitting || s.ostep < ORDER_STEPS.length) return null;
    return {
      submitting: false,
      ostep: -1,
      ticket: false,
      focus: null,
      amount: '',
      tp: '',
      sl: '',
      prot: false,
      /* NEWEST FIRST. The card that just arrived is the one the entrance
         animation is on and the one the viewer is looking for. */
      book: [
        {
          side: s.side, lev: s.lev, size: notional(s), entry: MARK,
          tp: Number(s.tp) > 0 ? Number(s.tp) : null,
          sl: Number(s.sl) > 0 ? Number(s.sl) : null,
        },
        ...s.book,
      ],
      tab: 'pos',
      tap: null,
    };
  },

  tab: (s, v) => (s.tab === v || !v ? null : { tab: v as BD['tab'], tap: 'tab' }),
  posOpen: (s) => (s.book.length ? { posOpen: !s.posOpen, tap: 'posOpen' } : null),
};
