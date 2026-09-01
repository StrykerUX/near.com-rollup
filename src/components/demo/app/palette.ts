/**
 * THE APP'S PALETTE, STATED ONCE
 * ==================================================================
 * This screen is painted from two places that cannot share a value the normal
 * way: a stylesheet, and a `<canvas>`. Canvas has no cascade — `fillStyle`
 * takes a literal and will not resolve `var(--btc-up)` — so a palette written
 * in CSS has to be written a second time in JS for the candles, and the two
 * copies drift the first time anybody adjusts one of them.
 *
 * So the values live HERE, in the one file both consumers can import:
 *
 *   · `Phone.tsx` writes them onto the device as custom properties, which is
 *     what `24-demo-app.css` reads through `var(--btc-*)`
 *   · the same constants are handed to `<Chart>` as `up` / `down`
 *
 * It is the same construction the site already uses one level up — `@theme
 * inline` in `globals.css` re-exports the design tokens as Tailwind keys so
 * that `bg-near-green` and `var(--near-green)` cannot disagree. Same problem,
 * same answer: one declaration, two readers.
 *
 * The four values are the app's own, given as hex rather than derived. They are
 * NOT translucent, and that is the part worth noticing: the rest of this
 * stylesheet builds its containers out of `rgba(255,255,255,.0x)` over black,
 * which is a fine way to work until the ground stops being black. Over
 * `#202020` a 7% white lands on `#2E2E2E`, not on `#262626` — so every fill
 * that is a CONTAINER is now an opaque token, and translucency is kept for the
 * things that genuinely are overlays: borders, dim text, a chip inside a card.
 */
export const PALETTE = {
  /** the device, and anything that is not sitting on something else */
  bg: '#202020',
  /** containers: the back button, the wallet, a card, a sheet, a segmented track */
  card: '#262626',
  /** the market panel — the pair, the quote, the candles and their furniture */
  chart: '#0A0A0A',
  /** a candle that closed up, and every green the chart draws with it */
  up: '#03C076',
  /**
   * A candle that closed down. NOT part of the palette that was given — it is
   * the value the chart has always used, kept so the two sides of a market are
   * still one decision. If the app has its own red, this is the line to change.
   */
  down: '#E5484D',
} as const;

/**
 * The custom properties `24-demo-app.css` reads. Written as an inline style on
 * the device rather than declared in the stylesheet, because the stylesheet is
 * the consumer here and not the source — see the note above.
 */
export const PALETTE_VARS = {
  '--btc-bg': PALETTE.bg,
  '--btc-card': PALETTE.card,
  '--btc-chart': PALETTE.chart,
  '--btc-up': PALETTE.up,
  '--btc-down': PALETTE.down,
} as React.CSSProperties;
