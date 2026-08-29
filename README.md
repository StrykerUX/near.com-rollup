# near.com × THE ROLLUP

A refactor of the single-file `nearcom-rollup-v03.html` build (v08 rollup) onto
Next.js 16 (App Router) + React 19 + Tailwind v4, with the WebGL gradient field
and the scroll-scrub sequence ported intact and GSAP driving the light zone.

```
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck
```

---

## What the page is

588vh of scroll with a 100vh sticky child. Inside it, a four-card product tour
(Perps → Account → Swap → Earn) whose whole composition is a **pure function of
scroll position**, closing into a plate that contracts into the light zone.

Behind all of it, a fullscreen fragment shader: fbm → domain warping → an OKLab
palette, paced by pointer activity and never by scroll.

---

## Layout

```
src/
  app/
    layout.tsx        <head>, the Kepler kit link, metadata
    page.tsx          nav · stage · quote band · light zone
    globals.css       Tailwind + the ported stylesheet, in order
  styles/
    01..13-*.css      the original stylesheet, split at its own banners
    14-refactor.css   the one rule the DOM-shuffle used to do imperatively
    15-demo.css       the rebuilt app screens
  lib/
    schedule.ts       THE STAGE SCHEDULE — band weights, scrubT, yForT, feel dials
    math.ts           the easing vocabulary
    tokens.ts         the swap screen's token set
    quotes.ts         the marquee's testimonials
    format.ts         en-US figure formatting
  gl/
    gradient.vert.ts  fullscreen triangle
    gradient.frag.ts  the field
    gradientField.ts  compile, uniforms, draw, the CTA ripple state
  stage/
    engine.ts         the scrub, the snap, the shrink, the paint
    domCache.ts       write-if-changed for style and custom properties
    bus.ts            the two slots where the engine reaches React state
  hooks/              useStageEngine · useReveal · useCtaContract ·
                      useKeplerProbe · useSqueezeItalics
  components/
    stage/            Stage · Hero · Lockup · StepDots · GradientField
    stage/phone/      the demo app: four looping screens + chrome
    stage/phone/ui/   Sheet · Keypad · ProgressList · Chart · Ticker · Enter
    stage/phone/flows/ the scripts, and the player that runs them
    light/            marquee · security · faq · final CTA · footer
    marks/            vector marks lifted verbatim
```

---

## The three decisions worth knowing

### 1. The stylesheet is verbatim, and its order is load-bearing

`src/styles/01..13` is the original stylesheet, split at its own section
banners. Those later blocks are a version history (v04 → v08) in which each pass
overrides the last, so **reordering the imports in `globals.css` changes the
page.** They are imported *unlayered*, which puts them above everything in
Tailwind's `@layer` cascade — preflight and stray utilities can never win
against a hand-tuned rule.

`@theme inline` in `globals.css` re-exports the design tokens as Tailwind theme
keys, so `bg-near-green` and `var(--near-green)` resolve to the same value by
construction and cannot drift.

### 2. The sequence is imperative, on purpose

`src/stage/engine.ts` is a direct port, not a rewrite into ScrollTrigger
timelines. Two reasons:

- The composition is a pure function of scroll. There is no queue, no per-move
  timer and no scroll hold; reverse is the same composition run backwards.
  React re-renders would be pure overhead on a function that runs every frame
  and touches ~40 elements.
- Every window, exponent and stagger in `paintCards` was tuned against the real
  composition. Nesting them inside a tween's ease **changes what they mean** —
  a "0.40 → 0.80" fade on an eased input actually runs from 16% to 41% of real
  time. The engine's own comments call this out; it is the bug the
  "windows on `tp`, not on the eased value" note is about.

React owns the markup and the demo-app state. The two meet at class names and
`data-face` attributes only, plus two module slots in `stage/bus.ts`.

**GSAP does own the light zone**: `ScrollTrigger.batch` drives the `.rv`
reveals, and a `gsap.to` on a proxy runs the final CTA's `--cta-t` contract with
`easeShrink` as its ease — that one has to be a tween, because `--cta-t` is an
unregistered custom property and would otherwise snap rather than interpolate.

### 3. Three things the original did at runtime are now authored

The single-file build shuffled the DOM at boot, because editing 200 lines of
markup by hand was riskier than a runtime move. All three are now written where
they belong:

| Original | Here |
|---|---|
| `reorderFaces()` rebuilt the deck to Perps-first | the faces are authored in display order; `data-face` still carries the original index, because the stylesheet selects on it |
| the nav brand was cloned into the lockup | `<NearMark />` is rendered in both |
| the offer and the quote were physically moved across the 1080px breakpoint | rendered in both slots, switched by the stylesheet (`14-refactor.css` is the missing half of that pair) |

A media-query listener that moves nodes has to re-run on every resize and
invalidates the engine's cached child lists. A breakpoint does not.

---

## The demo screens

The four screens inside the phone shell are rebuilt against the real near.com
app — recordings of Perps, Swap, Earn and Universal Send. Each one runs its own
looping flow on its own clock, and only while its card is the landed one on
stage.

| Card | Flow |
|---|---|
| Perps | Size a long, set a stop loss the form refuses, fix it, open the position. Live candle chart with an entry line. |
| Account | Universal Send, funded from the **Earn vault** — the sentence the copy makes, happening. |
| Swap | Token sheet with search, then `Finding best price → Executing trade → Trade complete`. |
| Earn | Vault list, the vault's fees, Use max, and a deposit that settles. |

### A flow is a script

`flows/player.ts` walks an ordered list of beats, each with a duration and a
patch. The state at any moment is `initial` plus every patch up to the current
beat — a pure function of elapsed time.

The flow keeps its OWN clock rather than being scrubbed by scroll. A screen that
only moves while the reader's wheel does is dead the moment they stop, and
stopping is exactly when they are looking at it.

**The beat index is the only thing that re-renders.** Everything continuous — the
candle chart, the ticking figures, a progress ring — runs on its own rAF inside
the component that draws it, exactly as the stage engine keeps its per-frame
work out of React.

`prefers-reduced-motion` gets one frame per card — the beat named `restFrame` —
and no loop.

### The four things that separate a screen that is running from a picture

The demo played correctly long before it felt alive. These are what closed the
gap, and they are all in `15-demo.css`:

**1 · States arrive, they do not appear.** `ui/Enter.tsx` takes a key that
changes with the screen and the loop pass, so React remounts it and the CSS
entrance plays *again* — without the key it fires once on mount and every state
after that snaps, which is what makes a scripted screen read as a slideshow. The
rise is 6px: enough to read as settling, small enough not to compete with the
card slide behind it.

**2 · Figures never sit perfectly still.** The single biggest tell of a mocked
screen is that every number on it is frozen. `ui/Ticker.tsx` walks a figure
around its resting value on deterministic value noise and flashes it green on a
rise, red on a fall, the way a tape does. The amplitudes are deliberately small;
the difference between "moves a little" and "does not move" is the whole point.
It writes to the DOM directly — four of these re-rendering their parents would
be four component trees rebuilt for a changing digit.

**3 · Controls answer a press.** A press and the screen it opens are **two
beats**. Collapsed into one, the control that was tapped unmounts on the same
frame it lights up: the press is never seen and the two screens read as
unrelated slides. Splitting them is what connects a cause to its effect.

**4 · The loop breathes out.** A loop that cuts from its last frame to its first
reads as a rewind. The finished screen dissolves over an outro hold, and the
next pass then arrives on the stagger from (1).

> The loop fade uses `filter: opacity()`, not `opacity`. The stage engine writes
> `opacity` and `transform` **inline** on every `.cswap > .face` on every frame
> it paints, so a class can never win against them and the fade would silently
> do nothing. `filter` is the one compositing property the engine does not
> touch. Do not "simplify" it back.

### Why the stop loss is wrong on purpose

The Perps flow types a stop loss above the entry price, `Open long` turns grey
and reads `Review stop loss`, and then it is corrected. A form that only ever
succeeds shows nothing about the product; the refusal is the moment the screen
stops looking like a picture of an app.

### The chart is canvas, not a charting library

At 320px inside a phone shell there is no crosshair to hit, no axis to zoom and
no dataset to stream. Everything a library buys costs ~45KB here and buys
nothing. The series is a seeded walk, so every reader sees the same chart and a
screenshot taken in CI matches one taken by hand. Only the last candle is live,
and it stops dead when its card leaves the stage.

### Two structural notes

**Sheets are portalled.** `.sheet` is `inset:0` on its positioned ancestor, and
a sheet that stops at the content area — leaving the header and the tab bar
showing — reads as a panel rather than a layer. The faces are inset inside
`.cswap`, so a sheet written where it belongs would do exactly that.
`ui/SheetSlot.tsx` keeps the JSX next to the flow that drives it and the DOM node
where the CSS needs it.

**Compaction is a container query, not a media query.** The shell is ~696px in a
desktop column and ~430px once the lockup stacks — about 309px of content under
the header and the tab bar. The phone is a column inside a grid, so its height
and the window's have never been the same number. `container-type: size` is safe
on `.morph` precisely because its height is an explicit value the stage engine
writes and its width comes from the grid: nothing about that box is derived from
its contents. Below 560px the keypad goes entirely — it is 150 of those 309px,
and the blinking caret already says "this is being typed" for free.

### Nothing here takes a pointer

The screens are a readout. There are no `:hover` or `:active` rules in
`15-demo.css` on purpose — a control that lights up under a cursor it will never
receive is a promise the tour does not keep. The `.tapped` animation is the flow
pressing its own buttons, not the reader pressing them. `.tokenmenu` in the
ported sheet is now unreferenced for the same reason; it is left in place
because those files are verbatim and their value is that they stay that way.

---

## Deliberate divergences from the original

A state-level diff across 14 scroll positions — every CSS variable, every card
and side-face transform, opacity, filter and clip-path — is **identical** to the
original except for the three items below, each of which is a bug fix.

**1. `syncInert` ran once and then never again.** It was called from
`paintHero`, which stops running the moment the hero recede settles — and with
no entry band the recede is settled from the first frame. So every card face was
left `inert`, *including the one on stage*, and the entire demo phone was
unclickable. It now runs at the end of `paintCards`, next to the
`pointerEvents` writes it mirrors.

**2. The italic squeeze measured the fallback serif.** Each scaleX'd italic gets
negative margins equal to the width the transform reclaimed. Keyed to
`document.fonts.ready`, that measurement is a race: the promise can resolve
while the Kepler kit's faces are still swapping in, and the margin then comes
out ~40% too wide — the comma-space before every italic disappears. It is now
driven by a `ResizeObserver` on the italics themselves, which is the honest
signal and cannot be raced. (Margins sit outside the observed box, so writing
one cannot re-trigger it.)

Relatedly, the Typekit `<link>` is **server-rendered into `<head>`**, not
injected from an effect. Injected, the fetch does not start until after
hydration and `document.fonts.ready` resolves before Kepler is even requested —
which is what made the squeeze lose its race in the first place. `media="print"`
is what keeps it non-render-blocking; as a plain stylesheet the kit cost
13,920ms to first paint against 704ms this way.

**3. `--peek` was ~19px stale.** The peek slice is derived from where the
Receive/Send row sits, which moves once the display face stops a line wrapping.
Measured only at boot, the value was wrong for the life of the page. It is
re-measured when the fonts land. (It has no visible effect in this build — the
hero band has zero weight, so `.herotype` is never shown — but a wrong number in
a layout constant is a trap for whoever restores that band.)

---

## Assets

The original inlined everything as data URIs. They are now real files:

- `public/fonts/` — PP Neue Montreal Book/Medium and Mono (woff2, self-hosted)
- `public/img/` — the Rollup wordmark, the 3D copper mark, the field's rollmark
- `public/logos/` — the marquee's brand marks

**Kepler Std is the one face that cannot be bundled.** It is licensed via Adobe
Fonts, whose terms require the kit's stylesheet and forbid self-hosting the
files. It therefore needs a network connection; offline, the stacks fall through
the `local()` chain to the embedded serif and the page still holds together.

---

## Tuning

Nearly every dial is in `src/lib/schedule.ts`:

- `W_REST` / `W_MOVE` / `W_SHRINK` — band weights, normalised. Raise one and the
  stage grows to pay for it rather than taking it out of its neighbours.
- `SCRUB_TAU` — the one feel dial. 0 tracks scroll exactly and steps with every
  wheel notch; 40 is a ~120ms settle; 130 reads as the UI easing into position
  after you have stopped.
- `SNAP_IDLE` / `SNAP_VMAX` / `SNAP_REACH` — when the snap is allowed to finish
  someone's thought. It only ever settles to the boundary *ahead* of the reader;
  rounding to nearest undoes their own input, which is the most irritating way a
  snap can fail.

`#stage { height: 588vh }` in `07-stage.css` and the weights above are a matched
pair. Change one without the other and the last trigger runs off the end of the
sticky.

---

## Placeholders to swap before ship

Carried over from the original, unchanged:

- **QUOTE** — the Robbie Klages quote in `Lockup.tsx` is placeholder copy, not
  said by him and not approved by The Rollup.
- **LEGAL** — the jurisdiction note's wording and its list are unapproved.
- **FEE / AUDIT / UTM** — no fee line, no audit link, and every CTA shares one
  `href`; add per-surface UTM to read them apart.
