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
const CANDLE_MS = 2400;
/** the price the flow's copy quotes, so the two cannot drift */
export const BASE_PRICE = 79654;

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
 */
function walk(k: number) {
  return (
    Math.sin(k * 0.083 + 1.7) * 420 +
    Math.sin(k * 0.21) * 300 +
    Math.sin(k * 0.53 + 0.4) * 120
  );
}

/** the wicks, keyed to the candle's own number so they never move once drawn */
function candle(k: number): Candle {
  const r = rng(k * 2654435761);
  const o = BASE_PRICE + walk(k);
  const c = BASE_PRICE + walk(k + 1);
  const reach = 34 + r() * 74;
  return {
    o,
    c,
    h: Math.max(o, c) + r() * reach,
    l: Math.min(o, c) - r() * reach,
  };
}

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
   * The market only ticks while its card is on stage. Everything else on this
   * page is a function of scroll; the live candle is the one thing that is
   * genuinely continuous, so it is also the one thing that has to be switched
   * off when nobody is looking at it.
   */
  live?: boolean;
};

export function Chart({ entry = null, side = null, live = true, readout }: ChartProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  /* The draw loop reads these every frame but must not re-subscribe when they
     change — mirroring them into a ref from an effect keeps the rAF stable and
     the render pure. */
  const props = useRef({ entry, side, readout });
  useEffect(() => {
    props.current = { entry, side, readout };
  }, [entry, side, readout]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t0 = 0;
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
      if (!t0) t0 = now;
      if (!fit()) return;

      /* The live candle: its close travels from the previous close toward its
         own, so the body grows out of the last one instead of appearing. */
      const phase = reduce ? 1 : ((now - t0) % CANDLE_MS) / CANDLE_MS;
      /* no modulo: the window walks forward for as long as anyone watches, and
         `walk` is what keeps the price in range rather than the array's end */
      const shift = reduce ? 0 : Math.floor((now - t0) / CANDLE_MS);
      const view: Candle[] = [];
      for (let i = 0; i < CANDLES; i++) {
        const src = candle(i + shift);
        view.push(i === CANDLES - 1
          ? { ...src, c: src.o + (src.c - src.o) * phase,
              h: src.o + (src.h - src.o) * phase, l: src.o + (src.l - src.o) * phase }
          : src);
      }

      const lo = Math.min(...view.map((c) => c.l));
      const hi = Math.max(...view.map((c) => c.h));
      /* More headroom above than below: the series ends at its high, and a
         price chip pinned to the top edge reads as clipped. */
      const pad = (hi - lo) * 0.12 || 1;
      const top = hi + pad * 1.9;
      const bot = lo - pad;
      const y = (v: number) => ((top - v) / (top - bot)) * h;

      ctx.clearRect(0, 0, w, h);

      /* gridlines on round hundreds, labelled at the right edge like the app */
      ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const stepPx = 200;
      const first = Math.ceil(bot / stepPx) * stepPx;
      for (let v = first; v < top; v += stepPx) {
        const gy = Math.round(y(v)) + 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,.055)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.32)';
        ctx.fillText('$' + v.toLocaleString('en-US'), w - 4, gy - 6);
      }

      /* candles — the right ~54px is the price axis, kept clear */
      const plotW = w - 54;
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
      ctx.lineTo(w - 52, py);
      ctx.stroke();
      ctx.setLineDash([]);
      chip(ctx, w - 50, py, '$' + last.toFixed(1), '#26C281', '#04140E');

      /* the entry line, when a position is open */
      const e = props.current.entry;
      if (e) {
        const ey = Math.round(y(e)) + 0.5;
        ctx.strokeStyle = 'rgba(120,170,255,.6)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, ey);
        ctx.lineTo(w - 52, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        chip(ctx, w - 50, ey, e.toLocaleString('en-US'), '#7AA7FF', '#04101F');
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

/** the small filled label the app pins against the price axis */
function chip(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  text: string, bg: string, fg: string,
) {
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
  const wdt = ctx.measureText(text).width + 8;
  const hgt = 13;
  ctx.fillStyle = bg;
  const r = 3;
  const x0 = x;
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
