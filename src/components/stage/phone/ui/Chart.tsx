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
 * The axis labels and the price chips. Canvas draws text with no stylesheet to
 * inherit from, so the scale the rest of the UI keeps has to be stated here or
 * the one place it is broken is the one place no audit of the CSS can see.
 */
const LABEL_PX = 14;
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
};

export function Chart({
  entry = null, side = null, live = true, paused = false, tp = null, sl = null,
  toward = null, readout,
}: ChartProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  /* The draw loop reads these every frame but must not re-subscribe when they
     change — mirroring them into a ref from an effect keeps the rAF stable and
     the render pure. */
  const props = useRef({ entry, side, readout, paused, tp, sl, toward });
  useEffect(() => {
    props.current = { entry, side, readout, paused, tp, sl, toward };
  }, [entry, side, readout, paused, tp, sl, toward]);

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
      const HELD = CANDLE_MS - 1;
      if (!aimNow) moved = 0;
      else moved += dt;
      const adv = (aimNow ? HELD + moved : Math.min(HELD, clock)) / CANDLE_MS;
      /* The live candle: its close travels from the previous close toward its
         own, so the body grows out of the last one instead of appearing. */
      const shift = reduce ? 0 : Math.floor(adv);
      const phase = reduce ? 1 : adv - shift;
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
        /* always CANDLES - 1: candle time is at zero on the frame the position
           opens, so the trade lands on the last candle of the held picture,
           every loop, on every machine */
        towardK = CANDLES - 1;
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
        towardFrom = BASE_PRICE + walk(towardK + RAMP_CANDLES) - WALK0;
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
      const priceAt = (k: number) => BASE_PRICE + walk(k) - WALK0 + offset(k);
      const bar = (k: number): Candle => {
        const r = rng(k * 2654435761);
        const o = priceAt(k);
        const c = priceAt(k + 1);
        const reach = 20 + r() * 40;
        return { o, c, h: Math.max(o, c) + r() * reach, l: Math.min(o, c) - r() * reach };
      };

      const view: Candle[] = [];
      for (let i = 0; i < CANDLES; i++) {
        const src = bar(i + shift);
        view.push(i === CANDLES - 1
          ? { ...src, c: src.o + (src.c - src.o) * phase,
              h: src.o + (src.h - src.o) * phase, l: src.o + (src.l - src.o) * phase }
          : src);
      }

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
      ctx.font = `${LABEL_PX}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const stepPx = 200;
      const first = Math.ceil(bot / stepPx) * stepPx;
      /* the two chips own their rows. A gridline label at the same height is a
         second price in the same place, and on a tall chart — where the lines
         are dense — one of them is always landing under a chip. */
      const chipRows = [y(view[view.length - 1].c)];
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
        ctx.strokeStyle = ctx.fillStyle = up ? '#26C281' : '#E5484D';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(cx) + 0.5, y(c.h));
        ctx.lineTo(Math.round(cx) + 0.5, y(c.l));
        ctx.stroke();
        const yo = y(c.o);
        const yc = y(c.c);
        ctx.fillRect(cx - body / 2, Math.min(yo, yc), body, Math.max(1, Math.abs(yc - yo)));
      });

      const last = view[view.length - 1].c;

      /* the header's quote, if this screen has one: same number, one source */
      const out = props.current.readout;
      if (out) {
        const open = view[0].o;
        const d = last - open;
        const pc = (d / open) * 100;
        if (out.price?.current) {
          out.price.current.textContent =
            '$' + last.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        }
        out.onTick?.(last);
        if (out.change?.current) {
          const el = out.change.current;
          el.textContent =
            (d >= 0 ? '+' : '\u2212') + '$' + Math.abs(d).toFixed(2)
            + '  ' + (d >= 0 ? '+' : '\u2212') + Math.abs(pc).toFixed(2) + '%';
          el.classList.toggle('up', d >= 0);
        }
      }

      /* the live price line and its chip, pinned to the right axis */
      const py = Math.round(y(last)) + 0.5;
      ctx.strokeStyle = 'rgba(38,194,129,.55)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w - AXIS_W + 2, py);
      ctx.stroke();
      ctx.setLineDash([]);
      chip(ctx, w, py, '$' + last.toFixed(1), '#26C281', '#04140E');

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
        const collides = Math.abs(by - y(view[view.length - 1].c)) < LABEL_PX + 6;
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
        if (!collides) chip(ctx, w, by, v.toLocaleString('en-US'), stroke, ink);
        ctx.restore();
      };

      /* the entry line, when a position is open. It draws OUT FROM ITS CHIP:
         the price is what the position is anchored to, so the line grows from
         the label leftward across the chart rather than switching on. */
      const e = props.current.entry;
      if (!e) entryAt = 0;
      else if (!entryAt) entryAt = clock;
      const a = Math.min(1, Math.max(0, (clock - entryAt) / 520));
      bracket(props.current.tp, '#26C281', '#04140E');
      bracket(props.current.sl, '#E5484D', '#1E0507');
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
        chip(ctx, w, ey, e.toLocaleString('en-US'), '#7AA7FF', '#04101F');
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
  text: string, bg: string, fg: string,
) {
  ctx.font = `${LABEL_PX}px ui-monospace, SFMono-Regular, Menlo, monospace`;
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
