/**
 * THE CURTAIN — nine candles, two seconds, no JavaScript
 * =====================================================================
 * A short intro that covers the first ~2s of the page. It is not decoration
 * for its own sake: the five faces this page loads are declared
 * `font-display:swap` (01-fonts.css), so the display headline — the largest
 * thing on the page — visibly re-shapes when Montreal lands, and the stage
 * engine seeds itself a frame after boot and measures again on
 * `document.fonts.ready` (stage/engine.ts:787, :795). The first second is when
 * the page moves most without anyone asking it to. The curtain covers exactly
 * that window and hands it to the brand instead.
 *
 * IT IS A CURTAIN AND NOT A PROGRESS BAR, and the difference is worth being
 * plain about: the animation starts when the stylesheet is parsed and finishes
 * 2s later without ever asking whether the page is ready. An honest progress
 * indicator would have to wait on resources and could run past the 2.5s this
 * was budgeted for. The cost is real — time-to-content is ~2s longer on the
 * first visit of a session — and the session gate in `layout.tsx` is what
 * keeps that from being charged twice.
 *
 * WHY THIS IS HTML AND NOT THE CHART THE PAGE ALREADY OWNS. `ui/Chart.tsx` is
 * the only candlestick renderer in the repo, and none of it can be used here.
 * Not because the geometry is closured inside one effect (it is), but for a
 * reason no refactor would fix: it is a `<canvas>`, and a canvas paints only
 * after hydration. The page would paint first and the curtain would drop on
 * top of it — the exact defect this exists to prevent. So the candles are
 * server-rendered divs and the motion is keyframes, and this component ships
 * no client JavaScript at all.
 *
 * WHAT IS REUSED FROM THAT CHART is the only part that survives the change of
 * medium: the house proportions. `Chart.tsx:803-812` draws a 1px wick on a
 * half-pixel-snapped centre and a body 62% of the column slot. Both numbers
 * are in `32-splash.css`, so a candle here and a candle in the device are the
 * same object drawn twice.
 */

/* THE SERIES, AS A PRICE WALK. A candle's open is the previous candle's close,
   which is what makes it a series rather than nine independent bars — the same
   invariant `Chart.tsx:709` holds with `o = priceAt(k), c = priceAt(k+1)`.
   Nine candles because the stagger has 1.3s to fill (see the note on 130ms in
   the stylesheet) and nine is what reads as an advance at that tempo.

   THE TWO DOWN CANDLES ARE THE POINT. A monotonic rise reads as a bar chart
   growing; a pullback in the middle is what makes it read as a market. */
const WALK = [100, 104, 109, 107, 103, 111, 116, 121, 128, 134];

/* Wick reach past the body, [above, below], per candle. Hand-set rather than
   generated: `Chart.tsx:709` can afford a seeded PRNG because it draws 46
   candles a frame, and nine fixed numbers are both smaller and stable across
   builds — a curtain that shaped itself differently per deploy would be a
   detail nobody could review. */
const REACH: [number, number][] = [
  [2.5, 2.0], [3.0, 1.5], [2.0, 3.5], [1.5, 3.0], [2.5, 2.5],
  [3.5, 1.5], [2.0, 2.0], [2.5, 3.0], [4.0, 1.5],
];

type Candle = { o: number; c: number; h: number; l: number };

const CANDLES: Candle[] = WALK.slice(0, -1).map((o, i) => {
  const c = WALK[i + 1];
  const [up, down] = REACH[i];
  return { o, c, h: Math.max(o, c) + up, l: Math.min(o, c) - down };
});

/* The frame is the series' own extremes, so the chart fills its box exactly.
   No padding: `Chart.tsx:771` adds headroom because it pins a price chip to
   the top edge, and there is no chip here. */
const LO = Math.min(...CANDLES.map((k) => k.l));
const HI = Math.max(...CANDLES.map((k) => k.h));
const pc = (n: number) => `${+(n * 100).toFixed(3)}%`;

export function Splash() {
  return (
    /* aria-hidden and not one character of text inside it. It stays in the DOM
       for the life of the page — the exit is `visibility:hidden`, not an
       unmount — so anything readable in here would be read out on every visit
       for the sake of two seconds of decoration. It is also why the curtain
       cannot affect what a crawler sees: there is nothing in it to see, and
       nothing of the page's own content is inside it. */
    <div className="splash" aria-hidden="true">
      <div className="splashin">
        <div className="spchart">
          {CANDLES.map((k, i) => {
            const span = k.h - k.l;
            return (
              <i
                key={i}
                /* `dn` carries two things: the hollow body, and a
                   `transform-origin` of top instead of bottom. A down candle
                   that grows upward out of its low is the single detail that
                   gives away a chart drawn by someone who was thinking about
                   bars. */
                className={k.c >= k.o ? 'spc' : 'spc dn'}
                style={{
                  '--i': i,
                  '--wb': pc((k.l - LO) / (HI - LO)),
                  '--wh': pc(span / (HI - LO)),
                  /* the body's box is the wick's, so these two are fractions
                     of the candle rather than of the chart */
                  '--bb': pc((Math.min(k.o, k.c) - k.l) / span),
                  '--bh': pc(Math.abs(k.c - k.o) / span),
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {/* the same three nodes as the hero's eyebrow and the narrow tour's
            (MobileTour.tsx:71-75), so the marks cannot drift into a third
            version of themselves. The rule needs its own colour here — see
            the note in the stylesheet. */}
        {/* The Rollup first, matching the hero the curtain lifts onto — see
            the note on `.rollbrow` in stage/Lockup.tsx. The eyebrow is the one
            object that survives the fade, so an order that disagreed with the
            page underneath would read as the lockup rebuilding itself. */}
        <div className="spbrow">
          <span className="rolllock" />
          <span className="rule" />
          <span className="nearw" />
        </div>
      </div>
    </div>
  );
}
