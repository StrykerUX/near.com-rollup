'use client';
import { useEffect, useRef, type RefObject } from 'react';

/**
 * THE CANDLE CHART
 * ==================================================================
 * Canvas, not a charting library. At 320px wide inside a phone shell there is
 * no crosshair to hit, no axis to zoom and no dataset to stream — everything
 * a library buys costs ~45KB here and buys nothing.
 *
 * The series is DETERMINISTIC: a seeded value-noise walk, so every reader sees
 * the same chart and a screenshot taken in CI matches one taken by hand. Only
 * the last candle is live; it forms over `CANDLE_MS` and then commits and a new
 * one opens, which is what makes the panel read as a market rather than a
 * picture of one.
 *
 * It runs on its own rAF and never re-renders React. The stage engine draws
 * ~40 elements a frame one level up; a chart that also went through React
 * would double that for no visual gain.
 */

const CANDLES = 46;
const CANDLE_MS = 1500;
/**
 * THE CLIMB, AS A LIST OF WHAT EACH CANDLE CONTRIBUTES.
 *
 * The move into a take profit is written out bar by bar rather than derived
 * from a curve, because every curve that was tried failed the same way. A
 * thousand points spread over N candles is ~1000/N per bar no matter what
 * shape carries them, and the walk's own noise is only ~40 — so any strictly
 * increasing ease, at any N, closes every single bar of the climb green. That
 * is not a rally, it is a ramp with wicks drawn on it, and no chart has ever
 * done it. Smoothstep, a damped sine over smoothstep, and a monotone staircase
 * were each measured over 500 start points; the best of them produced a red
 * bar in 44% of runs and only by making the green ones bigger.
 *
 * So the pullbacks are declared, not hoped for. These are relative weights,
 * normalised to sum to the whole move: the positive ones push, the two
 * negative ones give a little back. A bar with weight -0.55 closes ~55 points
 * below its open whatever the walk is doing, which is what makes the run read
 * as a market that had to work for it.
 *
 * Measured over the same 500 start points: the biggest body is +119 against
 * the +162 of the nine-candle smoothstep this replaces, the third-biggest is
 * +110 against +152 — those were the three bars that read as too long — the
 * median run has two red candles, every run has at least one, and no bar of
 * the climb ever closes below the price the trade opened at.
 *
 * Fifteen candles cost twenty-two seconds, which is why the candle rate came
 * down with them and why the final step of every version holds longer. A climb
 * that finishes after the loop has restarted is a climb nobody saw.
 */
const RAMP = [
  0.4, 0.8, 0.95, 1.05, /* the market takes a breath */ -0.55,
  0.55, 1.0, 1.1, 1.05, /* and another, higher up */ -0.55,
  0.65, 1.1, 0.95, 0.7, 0.4,
];
const RAMP_CANDLES = RAMP.length;
/** RAMP as a running fraction of the whole move, so `ramp(u)` is a lookup */
const RAMP_AT = RAMP.reduce<number[]>(
  (acc, w) => (acc.push(acc[acc.length - 1] + w / RAMP.reduce((a, b) => a + b, 0)), acc),
  [0],
);
/** how much of the move has happened at progress `u`, linear within a candle */
function ramp(u: number) {
  const t = Math.min(1, Math.max(0, u)) * RAMP_CANDLES;
  const i = Math.min(RAMP_CANDLES - 1, Math.floor(t));
  return RAMP_AT[i] + (RAMP_AT[i + 1] - RAMP_AT[i]) * (t - i);
}
/** the price the flow's copy quotes, so the two cannot drift */
export const BASE_PRICE = 79654;
/**
 * WHAT THE HELD CHART IS WORTH.
 *
 * `walk` is a sum of sines about zero, so without this the price the demo sits
 * on for its first eight steps was BASE_PRICE plus whatever the walk happened
 * to be at the last candle — a few hundred points off the entry the copy
 * quotes, the entry line, and the rule the stop loss is checked against. Four
 * places naming the same price and one of them disagreeing.
 *
 * Subtracting the walk at the candle the held picture closes on puts that
 * quote exactly on BASE_PRICE. The chart the reader looks at through the whole
 * setup reads $79,654, which is the number under it in the copy.
 */
const WALK0 = walk(CANDLES);

type Candle = { o: number; h: number; l: number; c: number };
/**
 * A finished bar plus the two things a finished bar does not record: WHEN in
 * its own hour the high and the low were touched. Nothing reads them once the
 * bar has closed — they exist only so the live one can be drawn forming.
 */
type Bar = Candle & { tHi: number; tLo: number };

/**
 * A BAR AS IT IS BEING MADE, WHICH IS NOT A BAR SCALED DOWN
 * ------------------------------------------------------------------
 * The live candle used to be the finished candle with every one of its four
 * prices eased out of the open together:
 *
 *     c = o + (c - o) * u,  h = o + (h - o) * u,  l = o + (l - o) * u
 *
 * which grows the upper wick and the lower wick AT THE SAME TIME, in both
 * directions, for the whole hour. No bar has ever done that, and it is the tell
 * that gives the whole chart away: a high is not a property a bar eases into,
 * it is the highest the price has BEEN.
 *
 * So the bar is drawn from its price path instead. A candle opens, the price
 * wanders, and at any moment:
 *
 *   · the BODY runs from the open to wherever the price is now
 *   · the HIGH is the running maximum of everywhere it has been
 *   · the LOW is the running minimum
 *
 * which means a wick only ever appears on the side the price actually went,
 * only ever grows, and never comes back. Early in the bar there is no wick at
 * all, because nothing has been visited yet — the bar opens as a doji, which is
 * what every bar on every chart does.
 *
 * The path is four waypoints joined by straight lines: open, the two extremes
 * in whichever order this bar visits them, close. It is deterministic, drawn
 * from the same seeded generator as the bar itself, so the chart is still
 * identical on every machine and every loop.
 */
function surge(x: number, a: number) {
  /* monotone by construction while a < 1: the derivative is 1 − a·cos(2πkx),
     which stays positive. Both ends are fixed — sin(2πk) is zero for whole k —
     so warping the time inside a leg cannot move the prices at either end of
     it, and cannot move the bar's high or its low. */
  if (a <= 0) return x;
  const w = 2 * Math.PI * TAPE_SURGES;
  return x - (a / w) * Math.sin(w * x);
}

function forming(b: Bar, u: number, tape: number): Candle {
  if (u >= 1) return { o: b.o, h: b.h, l: b.l, c: b.c };
  const pts: [number, number][] = [[0, b.o], [b.tHi, b.h], [b.tLo, b.l], [1, b.c]];
  pts.sort((x, y) => x[0] - y[0]);

  /* where the price is now, along a leg it does not cover evenly — see `tape` */
  let px = b.o;
  for (let i = 1; i < pts.length; i++) {
    const [t0, p0] = pts[i - 1];
    const [t1, p1] = pts[i];
    if (u <= t1) {
      px = p0 + (p1 - p0) * surge((u - t0) / (t1 - t0), tape);
      break;
    }
  }

  /* and the furthest it has been either way. The path is piecewise linear, so
     its extremes over [0, u] can only be at a waypoint already passed or at
     the point it has reached — there is nowhere else for a maximum to hide. */
  let h = Math.max(b.o, px);
  let l = Math.min(b.o, px);
  for (const [t, p] of pts) {
    if (t > u) break;
    h = Math.max(h, p);
    l = Math.min(l, p);
  }
  return { o: b.o, h, l, c: px };
}

/** mulberry32 — small, fast, and the same everywhere */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * THE PRICE IS A FUNCTION OF THE CANDLE'S NUMBER, NOT A LIST TO SCROLL
 * ------------------------------------------------------------------
 * This used to be a 46-entry array of a drifting random walk, and the view
 * scrolled through it with `data[(i + shift) % CANDLES]`. That wraps — and
 * the walk was 620 points higher at the end than at the start, so the moment
 * the window crossed the seam the chart FELL OFF A CLIFF and started climbing
 * again from the bottom. The candles either side of that seam were both
 * honest; the join between them was not.
 *
 * So there is no array and no seam. `walk(k)` is three sines at periods with
 * no common multiple: continuous by construction, bounded (±840), and never
 * visibly repeating. Candle k opens at walk(k) and closes at walk(k+1), which
 * means every candle's open IS the previous candle's close — the one property
 * the wrap destroyed.
 *
 * It also fixed something the drift was papering over. A permanently rising
 * chart was chosen so a long would read as being in profit; a market that only
 * goes up is a worse lie than a position that is sometimes down, and the
 * recordings show the P&L crossing zero repeatedly.
 *
 * CALMER THAN IT WAS. The first version ran ±840 with a fast third term, which
 * on a tall chart read as noise: a line busy enough that a reader could not see
 * a rise happening inside it. The amplitudes are roughly halved and every
 * period is longer, so the shape is still a market and the movement is still
 * two-sided, but a five-hundred-point climb is something you can watch rather
 * than something you have to find.
 */
function walk(k: number) {
  return (
    Math.sin(k * 0.045 + 1.7) * 250 +
    Math.sin(k * 0.109) * 140 +
    Math.sin(k * 0.263 + 0.4) * 48
  );
}

/**
 * A DETERMINISTIC WOBBLE ON ONE CANDLE'S LEVEL — see `jitter`.
 *
 * Its own seed stream, deliberately unrelated to the one `bar()` draws its
 * wicks from: if the same generator fed both, a candle with a big body would
 * always be a candle with a particular wick, and the eye finds that pattern
 * long before it can name it.
 */
function wobble(k: number, amount: number) {
  if (!amount) return 0;
  return (rng((k ^ 0x9e3779b9) * 2246822519)() - 0.5) * amount;
}

/**
 * The axis labels and the price chips. Canvas draws text with no stylesheet to
 * inherit from, so the scale the rest of the UI keeps has to be stated here or
 * the one place it is broken is the one place no audit of the CSS can see.
 */
const LABEL_PX = 14;
/** the default axis face: what twelve of the thirteen devices are set in */
const LABEL_FACE = 'ui-monospace, SFMono-Regular, Menlo, monospace';
/** the default pair of market colours: what twelve of the thirteen use */
const UP = '#26C281';
const DOWN = '#E5484D';
/** the ink a chip prints in, dark enough to sit on either side's fill */
const UP_INK = '#04140E';
const DOWN_INK = '#1E0507';
/** the default wick reach, in points past the body: what twelve of the thirteen use */
const REACH: [number, number] = [20, 60];
/** how many times the price surges and rests inside one leg of a bar's path */
const TAPE_SURGES = 3;
/**
 * How much of the right edge belongs to the price axis. It was a bare 54,
 * tuned by eye against 9px labels; at 14px "$80,200" is wider than that and
 * the candles ran under it. Derived now, so the next change to LABEL_PX moves
 * the gutter with it.
 */
const AXIS_W = Math.round(LABEL_PX * 4.6) + 8;

/* The bar itself is built inside the draw loop, in `bar()`. It has to be: a
   candle's open is the previous candle's close, and once a trade is open that
   chain runs through an offset the loop owns. Building it out here meant
   applying the offset to a finished bar, which moved it as a block and broke
   the chain — see the note beside `priceAt`. */

export type ChartProps = {
  /** draws the dashed entry line and its chip */
  entry?: number | null;
  /**
   * Where to WRITE the live quote, if the screen shows it in its own header.
   * The alternative — a second walk driving that figure — is how a header ends
   * up quoting a price the candles disagree with, which is exactly the kind of
   * detail that makes a mock read as a mock. Written straight to the DOM for
   * the same reason the rest of this file is: it changes every frame.
   */
  readout?: {
    price?: RefObject<HTMLElement | null>;
    change?: RefObject<HTMLElement | null>;
    /**
     * Called with the live price every frame, for figures this component has
     * no business computing — an open position's P&L, say. WRITE THE DOM from
     * it; a setState here would re-render the tree sixty times a second.
     */
    onTick?: (last: number) => void;
  };
  /** 'long' tints the entry chip; null hides the position marker */
  side?: 'long' | 'short' | null;
  /**
   * The two brackets, drawn as their own lines. A demo whose point is that a
   * position has a take profit and a stop loss on it has to SHOW them: an
   * entry line on its own says where you got in and nothing about where you
   * get out. They also join the price scale, so the chart frames all three
   * instead of putting two of them off the top and bottom.
   */
  tp?: number | null;
  sl?: number | null;
  /**
   * A price the series eases toward, and the only scripted thing on this
   * chart. A market that has to be watched reaching a take profit inside one
   * screen of a demo is not going to get there on its own, and waiting for a
   * random walk to oblige is not a demo, it is a wait. The ramp is weighted
   * toward the newest candles so the history is left alone and the right-hand
   * edge is what bends.
   */
  toward?: number | null;
  /**
   * HOLD THE MARKET STILL.
   *
   * Not the same as `live`. `live` switches the loop off for a card nobody is
   * looking at; `paused` keeps drawing and stops the CLOCK, so the candles
   * hold where they are and resume from there rather than from the top.
   *
   * It exists for one moment: typing a stop loss. The rule the ticket enforces
   * is against a fixed entry price, and a reader who types 78,200 while the
   * quote above it walks 400 points cannot tell whether the refusal is about
   * their number or about the market. Holding the price makes the rule
   * legible; letting it run makes it look arbitrary.
   */
  paused?: boolean;
  /**
   * The market only ticks while its card is on stage. Everything else on this
   * page is a function of scroll; the live candle is the one thing that is
   * genuinely continuous, so it is also the one thing that has to be switched
   * off when nobody is looking at it.
   */
  live?: boolean;
  /**
   * WHAT THE HELD PICTURE READS.
   *
   * The walk is anchored so the last candle of the held picture closes exactly
   * here — see WALK0. It defaults to the price every existing flow's copy
   * quotes, and exists because a screen rebuilt against a different set of
   * reference frames quotes a different one, and a chart that cannot be told
   * which is the fastest possible way to end up with two prices for one
   * market.
   */
  base?: number;
  /**
   * LET CANDLE TIME RUN WITH NOTHING TO REACH.
   *
   * Off by default, and that default is load-bearing: `9136204` stopped the
   * candles until a trade opened precisely so that every loop of every flow
   * draws the identical chart, and so the price a reader looks at in step 1 is
   * the price the copy under it quotes in step 8.
   *
   * A cut whose FIRST scene is the market moving needs the opposite, and can
   * have it for the same reason the hold was safe: the series is a pure
   * function of a candle's number, so a rolling window is still deterministic —
   * it just has to be re-mounted each pass (`key={deck.pass}`) for loop N to
   * open on the same candle as loop 1.
   */
  roll?: boolean;
  /**
   * WHICH STRETCH OF THE WALK THE WINDOW SITS ON.
   *
   * A cut whose first line is "the market is climbing" needs a climbing market,
   * and there are exactly two ways to get one. The first — add a slope, a few
   * points per candle — was built and thrown away, and it failed the way the
   * README already says every monotone lift fails: a slope large enough to see
   * across a short cut is 690 points over a 46-candle window, which swamps the
   * walk's own ±100 of shape and closes every bar green. That is not a rally.
   * It is a ramp with wicks drawn on it, and it is the same trap `RAMP` exists
   * to avoid.
   *
   * This is the second way, and it invents nothing: the walk is 840 points of
   * genuine market shape, bounded and never repeating, so somewhere in it is a
   * stretch that rises gently while still closing a third of its bars red.
   * `phase` is the candle number that stretch starts at. The picture is the
   * real series, moved to a better hour of the day.
   *
   * `walk` has no period, so a phase is not a rotation and two phases are two
   * different markets. Anchoring still holds: the held picture closes on
   * `base` at whatever phase it is given.
   */
  phase?: number;
  /**
   * The face the canvas sets its axis labels and price chips in. Canvas has no
   * stylesheet to inherit from, so a device whose UI is not in the default
   * stack has to say so or its chart is the one panel still speaking in the
   * old voice — and it is the panel with the most numbers on it.
   */
  face?: string;
  /**
   * THE SIZE OF A PRINT. Off by default; every existing flow quotes the raw
   * price at one decimal, sixty times a second.
   *
   * That default was measured on `/demo/perps-v5` and it is an ODOMETER, not
   * a quote. The header repainted 49 times a second, holding each value for
   * 20ms, and — because the live candle's close travels LINEARLY from the
   * previous close to its own — every one of those repaints was the same
   * increment as the last:
   *
   *     $79,598.0 → .2 → .4 → .6 → .8 → 79,599.1 → .3 → .5 → .7
   *
   * Nothing about that is a fast market. It moved 35 points in six seconds,
   * four hundredths of one per cent. It reads as aggressive because a digit is
   * being repainted forty-nine times a second by a constant step, and no
   * screen a person has ever traded on does that.
   *
   * So the quote is rounded to a tick and REPRINTED ONLY WHEN IT CROSSES ONE.
   * The gate is the rounding itself: quantise the number and the writes stop
   * on their own, because writing the same string twice is a write that does
   * not happen. That makes the prints discrete in value and irregular in time,
   * which is what a tape is — and it self-regulates, because a fast market
   * crosses more ticks and prints more often, exactly as it should.
   *
   * IT IS THE QUOTE THAT TICKS, NOT THE MARKET. The candles, the scale and
   * every price the geometry is built from stay continuous: quantising those
   * would stair-step a body that is 4px wide, and the point is a calm number
   * on a smooth chart rather than a coarse chart.
   */
  tick?: number;
  /**
   * THE TWO SIDES OF A MARKET, as one decision.
   *
   * These default to the greens and reds the chart has always drawn, so no
   * existing flow moves. A device painted from a different palette passes its
   * own — and it has to pass them HERE rather than restyle the canvas, because
   * canvas has no cascade: `fillStyle` takes a literal and will not resolve a
   * custom property.
   *
   * `up` is not only the candle. The live price line, the chip riding on it and
   * the take-profit bracket are all the same green, because they are all the
   * same claim about which way is good — a chart whose candles and whose price
   * chip are two different greens six pixels apart reads as a mistake, and it
   * is one. The dimmer variants are derived with `globalAlpha` rather than
   * spelled out, so there is one hex per side and not four.
   */
  up?: string;
  down?: string;
  /**
   * HOW FAR A WICK CAN REACH past the body, as [min, max] in points.
   *
   * The dominant dial on how fast the quote moves, and it took a measurement to
   * see why: a bar's wicks do not only make it taller, they are where the price
   * GOES. Correct candle formation walks open → high → low → close, so the
   * reach is travelled two or three times per bar, and every point of it is
   * points the header has to print.
   *
   * Measured on this cut: [20,60] puts the median velocity at 37 points a
   * second, [6,16] at 12. Nothing else here comes close to a 3x.
   */
  reach?: [number, number];
  /**
   * HOW A WICK IS DISTRIBUTED INSIDE ITS REACH, as an exponent on a 0..1 draw.
   * 1 is uniform, which is what this chart has always drawn and what makes
   * every candle a plus sign.
   *
   * Uniform means each side's wick averages HALF the reach — on every bar, on
   * both sides, forever. Real candles do not work that way: a bar that ran up
   * and closed at its high has no upper wick at all, and one long tail with
   * nothing opposite it is the commonest shape on any chart. Two independent
   * uniform draws produce the one shape that is actually rare.
   *
   * An exponent biases the draw toward zero — at 2.8 the mean wick is 26% of
   * the reach instead of 50%, and most of the mass sits near nothing. Measured
   * on this cut: candles with a noticeable wick on BOTH sides fall from 26 of
   * 46 to 10, and candles with one bare side rise from 9 to 27. The body goes
   * from 42% of the candle's height to 59%.
   */
  wickBias?: number;
  /**
   * PER-CANDLE VARIANCE IN THE BODY, in points. 0 is off.
   *
   * `walk` is three sines, so its increment from one candle to the next changes
   * smoothly — which means every body is about the size of its neighbours, and
   * a row of evenly sized bodies is the other half of why this chart reads as
   * generated. Real charts have a huge bar next to a tiny one.
   *
   * It is safe to add because of a property this series already has: a candle's
   * close IS the next candle's open, since both are `priceAt` of the same
   * index. Any per-index offset therefore preserves that chain exactly — the
   * bodies change size, and nothing comes unstuck.
   */
  jitter?: number;
  /**
   * HOW UNEVENLY THE PRICE COVERS ITS PATH. 0 is off, and off is what every
   * other flow has always had.
   *
   * A quote at a constant velocity is the thing that reads as a machine, and
   * quantising it does not help: at 60fps a $0.50 tick only starts filtering
   * below 30 points a second, and a straight line between two turning points
   * sits above that for hundreds of milliseconds at a time. Slowing it down
   * uniformly just gives a slower constant crawl.
   *
   * So the time inside each leg is warped: `w(x) = x − (a/2πk)·sin(2πkx)`,
   * whose derivative `1 − a·cos(2πkx)` swings between 1−a and 1+a. The price
   * accelerates and very nearly stops, k times per leg, which is what a tape
   * does — clusters of prints separated by quiet, rather than an even churn.
   *
   * IT IS MONOTONE, and that is the property that makes it safe: `forming()`
   * derives the high and the low from the waypoints already passed, so any
   * strictly increasing reparametrisation of time leaves them untouched. The
   * wicks still only grow. `a` must stay below 1 or the price would run
   * backwards and a high would have to be un-drawn.
   *
   * `w(0) = 0` and `w(1) = 1` for whole k, so every leg still starts and ends
   * exactly where the bar says it does.
   */
  tape?: number;
  /**
   * HOW LONG A CANDLE TAKES TO FORM, in milliseconds.
   *
   * The module constant is 1,500 and it is load-bearing for every flow that
   * runs a scripted climb: `check:flows` multiplies it by `RAMP.length` to
   * assert that the take profit fills on the frame the market reaches it, and
   * it reads that number out of this file. Changing the constant would move
   * two other routes' timing; passing a different one moves only the caller.
   *
   * Slower is calmer for two reasons and the second is not obvious. The live
   * candle forms over a longer window, so its body grows more gently — and
   * because the price crosses the same ground in more time, a QUOTED market
   * (see `tick`) crosses fewer ticks per second and prints less often. The
   * candle rate is the upstream dial on how busy the whole readout is.
   */
  candleMs?: number;
};

export function Chart({
  entry = null, side = null, live = true, paused = false, tp = null, sl = null,
  toward = null, readout, base = BASE_PRICE, roll = false, phase = 0, face = LABEL_FACE,
  tick = 0, up = UP, down = DOWN, candleMs = CANDLE_MS, reach = REACH, tape = 0,
  wickBias = 1, jitter = 0,
}: ChartProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  /* The draw loop reads these every frame but must not re-subscribe when they
     change — mirroring them into a ref from an effect keeps the rAF stable and
     the render pure. */
  const props = useRef({ entry, side, readout, paused, tp, sl, toward, base, roll, phase, face, tick, up, down, candleMs, reach, tape, wickBias, jitter });
  useEffect(() => {
    props.current = { entry, side, readout, paused, tp, sl, toward, base, roll, phase, face, tick, up, down, candleMs, reach, tape, wickBias, jitter };
  }, [entry, side, readout, paused, tp, sl, toward, base, roll, phase, face, tick, up, down,
      candleMs, reach, tape, wickBias, jitter]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    /* the market's own clock, in milliseconds, which only advances on the
       frames it is allowed to. It runs for as long as the card is on stage and
       is what the entry line's arrival is timed against. */
    let clock = 0;
    /* CANDLE TIME, WHICH IS NOT THE SAME THING.
       The chart used to derive its window straight from `clock`, so the candles
       marched forward for as long as anyone watched. Nothing about that was
       random — every price here is a pure function of a candle's number — but
       the flow loops and the clock does not, so each pass through the demo
       opened its trade on a different candle and drew a different chart: a
       1,069-point rally on the first loop, 828 on the second, 1,336 on the
       fourth. Same script, same second, different market.
       So candle time only runs while there is a position on. Before that the
       picture is held, which makes the chart the reader sees in step 1 the
       chart they are still looking at in step 8, and makes every loop identical
       to the first. */
    let moved = 0;
    let prev = 0;
    /* when the entry line first had a price to draw at, so it can arrive
       rather than appear — a line that is simply there in the next frame reads
       as a rendering artefact, not as a position that was just opened */
    let entryAt = 0;
    /* THE CANDLE THE TRADE OPENED ON, and the price the market was at when it
       did. Everything before this index is history and is never touched again;
       everything from it forward carries the move. */
    let towardK = -1;
    let towardFrom = 0;
    let w = 0;
    let h = 0;

    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const draw = (now: number) => {
      /* SCHEDULE FIRST, DRAW SECOND.
         `fit()` fails on any frame where the canvas measures zero — the frame
         right after a mount, before layout has run, is the common one. This
         used to return without asking for another frame, which did not skip a
         frame: it killed the loop for the life of the component, and the chart
         sat frozen on whatever it had last drawn while the header it feeds
         quoted a price from the server render. */
      if (live) raf = requestAnimationFrame(draw);
      if (!prev) prev = now;
      /* one delta, read once: `prev` is consumed by both clocks and the second
         reader used to get zero because the first had already moved it on */
      const dt = props.current.paused ? 0 : now - prev;
      prev = now;
      clock += dt;
      if (!fit()) return;

      const aimNow = props.current.toward ?? null;
      /* HELD, AND WHERE IT IS HELD.
         One tick short of a full candle, so the last bar of the held picture is
         drawn complete. Landing exactly on the boundary rolls the window over
         and starts the next candle at phase zero, which draws the right-hand
         edge as a flat dash — the picture would end on a bar that has not
         happened yet. */
      const cms = props.current.candleMs;
      const HELD = cms - 1;
      /* `roll` buys out of the hold, and only out of the hold: with it on,
         candle time is just the clock, which is what it was before the hold
         existed. Everything downstream — the ramp's anchor included — reads
         `shift`, so neither branch is a special case past this line. */
      const rolling = props.current.roll;
      if (!aimNow && !rolling) moved = 0;
      else moved += dt;
      const adv = (aimNow || rolling ? HELD + moved : Math.min(HELD, clock)) / cms;
      /* The live candle: its close travels from the previous close toward its
         own, so the body grows out of the last one instead of appearing. */
      const shift = reduce ? 0 : Math.floor(adv);
      const phase = reduce ? 1 : adv - shift;
      /**
       * THE MARKET WITHOUT THE TRADE IN IT: where candle k sits before any
       * scripted climb is added. Pulled out of `priceAt` because the ramp's
       * anchor needs the same number and used to spell it out a second time —
       * two copies of one formula, and the phase would have landed in exactly
       * one of them.
       */
      const ph = props.current.phase;
      const jit = props.current.jitter;
      /* the series the whole chart is built from: the walk, plus a per-candle
         wobble that only exists to stop every body being the size of its
         neighbours. With `jitter` at 0 this IS `walk`, to the bit. */
      const series = (k: number) => walk(k) + wobble(k, jit);
      /* the anchor travels with the phase AND with the wobble: it is the series
         at the candle the held picture closes on, so that candle still closes
         exactly on `base` however the two are set. */
      const w0 = ph === 0 && !jit ? WALK0 : series(CANDLES + ph);
      const level = (k: number) => props.current.base + series(k + ph) - w0;
      /* THE CLIMB, AND WHY IT IS AN OFFSET PER CANDLE AND NOT A BLEND.
         The first version weighted the lift by a candle's position in the
         VISIBLE WINDOW, which had two faults and they were the same fault: the
         whole chart moved, and it moved differently every frame. A bar drawn
         near the right edge was lifted almost fully; as the window scrolled,
         that same bar found itself further left, got a smaller weight and sank
         back down. History rewrote itself continuously.
         The move belongs to the bars it happened in. `towardK` is the absolute
         index of the candle the trade opened on — anything before it is
         finished and is never touched again, and anything from it forward
         carries an offset that eases in over RAMP_CANDLES.
         It is an OFFSET rather than a blend toward the price, so once the climb
         is done the market keeps its own shape around the new level instead of
         being pinned flat to a number. A take profit is met and then traded
         through, which is what meeting one looks like. */
      const aim = aimNow;
      if (!aim) towardK = -1;
      else if (towardK < 0) {
        /* THE RIGHTMOST CANDLE ON SCREEN, which is where a trade is opened by
           definition. Under the hold `shift` is always zero — candle time is
           at zero on the frame the position opens — so this is the same
           `CANDLES - 1` it has always been for every flow that holds. Written
           against `shift` rather than assuming it, because a rolling chart
           opens its trade several candles in and would otherwise anchor the
           climb to a bar that scrolled off the left edge. */
        towardK = shift + CANDLES - 1;
        /* THE LIFT IS MEASURED TO WHERE THE WALK WILL BE, NOT WHERE IT IS.
           Sized against the price at the open, the climb added exactly the
           right number of points and still missed: the walk kept drifting
           underneath it, and a run that opened while the walk was falling
           finished three hundred points short of the take profit. The line was
           reached in the arithmetic and not on the screen, which is the one
           thing this whole sequence exists to show. Anchored to the walk at the
           candle the climb ends on, the last bar closes on the take profit to
           the point, every time, and the visible move is still exactly the
           distance from the open to the line. */
        towardFrom = level(towardK + RAMP_CANDLES);
      }
      const offset = (k: number) => {
        if (!aim || towardK < 0 || k < towardK) return 0;
        return (aim - towardFrom) * ramp((k - towardK) / RAMP_CANDLES);
      };

      /* THE OFFSET GOES INTO THE PRICE, NOT ONTO THE CANDLE.
         Adding it to a finished bar moved that bar as a block, so during the
         climb each one sat a few hundred points above the last with nothing
         joining them — a staircase of candles floating in clear air. A candle
         opens where the one before it closed, and that has to survive the lift,
         so the open takes this candle's offset and the close takes the next
         one's. It is the same rule the seamless walk is built on. */
      const priceAt = (k: number) => level(k) + offset(k);
      const bar = (k: number): Bar => {
        const r = rng(k * 2654435761);
        const o = priceAt(k);
        const c = priceAt(k + 1);
        const [rMin, rMax] = props.current.reach;
        const reach = rMin + r() * (rMax - rMin);
        /* biased toward nothing — see `wickBias`. At 1 this is the uniform draw
           this chart has always made, which gives every bar half a reach of
           wick on both sides and turns the whole series into plus signs. */
        const bias = props.current.wickBias;
        const h = Math.max(o, c) + reach * Math.pow(r(), bias);
        const l = Math.min(o, c) - reach * Math.pow(r(), bias);
        /* WHEN the bar goes where it goes. Two windows that cannot overlap, so
           one extreme is always clearly before the other and the path never has
           to visit two prices at the same instant. The coin decides which side
           the bar runs to first, which is the difference between a candle that
           spiked and recovered and one that dipped and rallied.
           These draws come AFTER h and l on purpose: the generator is seeded per
           candle and consumed in order, so appending to the end leaves every
           price this chart has ever drawn exactly where it was. */
        const early = 0.15 + r() * 0.3;
        const late = 0.55 + r() * 0.3;
        const hiFirst = r() < 0.5;
        return { o, c, h, l, tHi: hiFirst ? early : late, tLo: hiFirst ? late : early };
      };

      const view: Candle[] = [];
      for (let i = 0; i < CANDLES; i++) {
        const src = bar(i + shift);
        view.push(i === CANDLES - 1 ? forming(src, phase, props.current.tape) : src);
      }

      const last = view[view.length - 1].c;
      /**
       * THE PRINTED QUOTE, which is not the same number as the market.
       *
       * `last` is where the market is; `quote` is what a screen is willing to
       * say it is. With no tick they are the same value and this is the
       * behaviour every other flow has always had. With one, the quote holds
       * still between crossings — and because every figure the READOUT shows is
       * derived from `quote` rather than from `last`, the whole header holds
       * with it. One walk, one price: the header, the change, the chip, the
       * line the chip rides on and any P&L a screen hangs off `onTick` are all
       * the same number, or the demo is quoting two markets.
       *
       * The GEOMETRY still uses `last`. Quantising the candles would stair-step
       * a body 4px wide, and the point of this is a calm number on a smooth
       * chart, not a coarse chart.
       */
      const tk = props.current.tick;
      const quote = tk > 0 ? Math.round(last / tk) * tk : last;

      /* THE BRACKETS JOIN THE SCALE. A take profit a thousand points above the
         market is off the top of a chart framed on the candles alone, and a
         line nobody can see is not a line that says a position is protected. */
      const marks = [props.current.tp, props.current.sl, props.current.entry]
        .filter((v): v is number => typeof v === 'number');
      const lo = Math.min(...view.map((c) => c.l), ...marks);
      const hi = Math.max(...view.map((c) => c.h), ...marks);
      /* More headroom above than below: the series ends at its high, and a
         price chip pinned to the top edge reads as clipped. */
      const pad = (hi - lo) * 0.12 || 1;
      const top = hi + pad * 1.5;
      const bot = lo - pad;
      const y = (v: number) => ((top - v) / (top - bot)) * h;

      ctx.clearRect(0, 0, w, h);

      /* gridlines on round hundreds, labelled at the right edge like the app */
      ctx.font = `${LABEL_PX}px ${props.current.face}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const stepPx = 200;
      const first = Math.ceil(bot / stepPx) * stepPx;
      /* the two chips own their rows. A gridline label at the same height is a
         second price in the same place, and on a tall chart — where the lines
         are dense — one of them is always landing under a chip. */
      const chipRows = [y(quote)];
      for (const v of marks) chipRows.push(y(v));
      for (let v = first; v < top; v += stepPx) {
        const gy = Math.round(y(v)) + 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,.055)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
        if (chipRows.some((cy) => Math.abs(cy - gy) < LABEL_PX + 6)) continue;
        ctx.fillStyle = 'rgba(255,255,255,.32)';
        ctx.fillText('$' + v.toLocaleString('en-US'), w - 4, gy - 6);
      }

      /* candles — the right ~54px is the price axis, kept clear */
      const plotW = w - AXIS_W;
      const cw = plotW / CANDLES;
      const body = Math.max(1.5, cw * 0.62);
      view.forEach((c, i) => {
        const cx = i * cw + cw / 2;
        const up = c.c >= c.o;
        ctx.strokeStyle = ctx.fillStyle = up ? props.current.up : props.current.down;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(cx) + 0.5, y(c.h));
        ctx.lineTo(Math.round(cx) + 0.5, y(c.l));
        ctx.stroke();
        const yo = y(c.o);
        const yc = y(c.c);
        ctx.fillRect(cx - body / 2, Math.min(yo, yc), body, Math.max(1, Math.abs(yc - yo)));
      });

      /* the header's quote, if this screen has one: same number, one source */
      const out = props.current.readout;
      if (out) {
        const open = view[0].o;
        const d = quote - open;
        const pc = (d / open) * 100;
        /* WRITE ONLY WHAT CHANGED. Assigning the same string to `textContent`
           still tears the text node down and builds it again, so on a ticked
           quote — which is the same string for eighty-odd milliseconds at a
           time — the guard is the whole saving. It is the rule `domCache.ts`
           exists to enforce one level up, and it is also what makes the print
           self-healing: a React re-render that resets the markup is corrected
           on the very next frame rather than held until the next crossing. */
        if (out.price?.current) {
          const el = out.price.current;
          const t = '$' + quote.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
          if (el.textContent !== t) el.textContent = t;
        }
        out.onTick?.(quote);
        if (out.change?.current) {
          const el = out.change.current;
          const t = (d >= 0 ? '+' : '\u2212') + '$' + Math.abs(d).toFixed(2)
            + '  ' + (d >= 0 ? '+' : '\u2212') + Math.abs(pc).toFixed(2) + '%';
          if (el.textContent !== t) el.textContent = t;
          el.classList.toggle('up', d >= 0);
        }
      }

      /* the live price line and its chip, pinned to the right axis. Drawn at
         the QUOTE, so the line is as still as the label riding on it — a line
         that crept while its own number sat frozen would be the two of them
         disagreeing about where the market is. */
      const py = Math.round(y(quote)) + 0.5;
      ctx.save();
      /* the same green as the candles, dimmed — one hex per side, so a palette
         change cannot leave the line behind the bars it belongs to */
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = props.current.up;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w - AXIS_W + 2, py);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      chip(ctx, w, py, '$' + quote.toFixed(1), props.current.up, UP_INK, props.current.face);

      /* THE BRACKETS. Drawn before the entry so the entry sits on top where
         they crowd, and in their own colours because the two are not the same
         instruction: one is where the trade is taken off at a profit, the
         other is where it is taken off at a loss. Solid-ish and thin, so they
         read as levels rather than as more market. */
      const bracket = (v: number | null | undefined, stroke: string, ink: string) => {
        if (typeof v !== 'number') return;
        const by = Math.round(y(v)) + 0.5;
        /* AT THE MOMENT OF TOUCHING, TWO CHIPS WANT THE SAME ROW. The live
           quote is already printing this number — that is what touching means —
           so the bracket keeps its line and gives up its label rather than
           stacking a second copy of the same price on top of the first. */
        const collides = Math.abs(by - y(quote)) < LABEL_PX + 6;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = stroke;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, by);
        ctx.lineTo(w - AXIS_W + 2, by);
        ctx.stroke();
        ctx.setLineDash([]);
        if (!collides) chip(ctx, w, by, v.toLocaleString('en-US'), stroke, ink, props.current.face);
        ctx.restore();
      };

      /* the entry line, when a position is open. It draws OUT FROM ITS CHIP:
         the price is what the position is anchored to, so the line grows from
         the label leftward across the chart rather than switching on. */
      const e = props.current.entry;
      if (!e) entryAt = 0;
      else if (!entryAt) entryAt = clock;
      const a = Math.min(1, Math.max(0, (clock - entryAt) / 520));
      bracket(props.current.tp, props.current.up, UP_INK);
      bracket(props.current.sl, props.current.down, DOWN_INK);
      if (e) {
        const ey = Math.round(y(e)) + 0.5;
        const right = w - AXIS_W + 2;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = 'rgba(120,170,255,.6)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(right * (1 - a), ey);
        ctx.lineTo(right, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        chip(ctx, w, ey, e.toLocaleString('en-US'), '#7AA7FF', '#04101F', props.current.face);
        ctx.restore();
      }

    };

    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => fit());
    ro.observe(cv);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    /* re-subscribing on `live` is the point: the loop stops dead when the card
       leaves and starts again from a fresh clock when it comes back */
  }, [live]);

  return <canvas className="pchart" ref={ref} aria-hidden="true" />;
}

/**
 * The small filled label the app pins against the price axis. It is placed by
 * its RIGHT edge, not its left: the width depends on the text and on
 * LABEL_PX, and a left offset guessed against one of those ran the widest
 * quotes off the canvas the moment the other changed.
 */
function chip(
  ctx: CanvasRenderingContext2D, right: number, y: number,
  text: string, bg: string, fg: string, face: string,
) {
  ctx.font = `${LABEL_PX}px ${face}`;
  const wdt = ctx.measureText(text).width + 8;
  const hgt = LABEL_PX + 5;
  ctx.fillStyle = bg;
  const r = 3;
  const x0 = right - wdt - 1;
  const y0 = y - hgt / 2;
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.arcTo(x0 + wdt, y0, x0 + wdt, y0 + hgt, r);
  ctx.arcTo(x0 + wdt, y0 + hgt, x0, y0 + hgt, r);
  ctx.arcTo(x0, y0 + hgt, x0, y0, r);
  ctx.arcTo(x0, y0, x0 + wdt, y0, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x0 + 4, y + 0.5);
}
