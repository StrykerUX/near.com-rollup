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

## `/demo/*` — the five recordings, rebuilt

Five routes that are not part of the composed page. `/` is a scrolling argument
with a phone in it; `/demo/*` is the app, at size, with the argument written
beside it. `/demo` indexes them.

| Route | Recording | Steps | What it shows |
|---|---|---|---|
| `/demo/perps` | 5m 41s | 24 | Fund with a passkey, build a ticket, hit both validation rules, open a position |
| `/demo/swap` | 1m 14s | 18 | A USDT balance swapped to NEAR across chains, then the yield chip on the next row |
| `/demo/earn` | 48s | 16 | Two vaults with their fees, a deposit, and paying someone out of a vault balance |
| `/demo/confidential-deposit` | 38s | 12 | Rules you must acknowledge, networks a token can arrive on, an address that expires |
| `/demo/confidential-send` | 10s | 8 | A shielded asset sent from the same screen and the same list as any other |

Each was read at **one frame per second** — the perps ticket at that rate is
where the take-profit error, the unit swap and the leverage recomputation came
from; a five-second sample had none of them.

### How a demo page is built

Four files per flow, and a shared shell:

```
shell/flow.ts     Chapter, Step, buildFlow — turns steps into a Machine
shell/deck.ts     useDeck — one state, three drivers (clock, rail, finger)
shell/Frame.tsx   the page, the rail, the transport, the device chrome
shell/Screens.tsx the account card, the passkey, Universal Send

<flow>/state.ts   the recording's figures, the derived ones, the transitions
<flow>/script.ts  chapters and steps; each step's beats
<flow>/Phone.tsx  the screens
```

Three things are true of all five.

**The rail is navigation, not a caption.** Every step is a button that seeks. A
step's beats are authored as a group and its FIRST beat is its entrance, so
clicking a step applies that beat immediately and starts the clock after it —
which is why the leading `ms` on a first beat costs a reader nothing.

**Touching the app takes the wheel.** Any control whose guard passes is live.
Firing an anchored transition moves the playhead to the step that transition
belongs to, so a gesture scrubs the script instead of forking it. Anchors are
declared by step id, not beat index:

```ts
anchor: { pickPay: 'amount', payPicker: 'paywith' }
```

Beat indices shift every time a step gains a keystroke, and an anchor that
silently drifted one beat left would be the worst kind of bug — it would still
work.

**Every figure is derived, once, from the recording.** `state.ts` holds what was
on screen and the formula that reproduces the rest:

```ts
/* Read straight off two frames of the leverage sheet: at 10x the ticket
   estimates liquidation 7% below, at 20x it estimates 2% — 1/lev − 0.03. */
export const MMR = 0.03;
```

The perps recording quotes a *third* liquidation figure (3.7%) on the position
card for the same position. We use one formula everywhere: a demo that shows two
liquidation prices for one position is a bug a reader finds before they find the
feature.

### What the headless walk caught

`pnpm check:flows` drives every machine with no browser: each scripted beat must
be allowed by its own guard, `restFrame` and every anchor must name a real beat,
and a breadth-first walk of free mode must find no refused `auto` and no dead
end. It found all of these before a browser could.

- **A self-refusing stop loss.** The perps script typed a corrected value that
  was still above the entry price, so `submit` refused itself and the script
  never reached the position.
- **The passkey was modal in the markup and not in the machine.** Opening the
  token picker from under it stranded `signing` with nothing left to advance the
  settlement. Both confidential-adjacent flows now wrap every other transition
  in a `modal()` guard.
- **A checklist that could not tick its last row.** `step` stopped at
  `length - 1`, so the final row span forever. The index now runs one past the
  last row, and the balance moves with that tick.
- **`auto` ran while the clock was paused.** Self-advancing states exist for when
  a reader holds the wheel; the condition also matched "paused", which made the
  pause button a lie — stop the script on a submitted order and the checklist
  finished anyway.

### And what the browser caught

- **A closed sheet was moved, not hidden.** `translate: 100%` shifts a sheet by
  its own height — enough for one sitting on the bottom edge, 90px short for the
  passkey dialog that floats above it, whose top then stayed on screen under
  every other screen.
- **A sheet that fades while it slides is transparent for the length of the
  slide**, and what showed through on the way out of a submitted ticket was a
  market that had already grown a position.
- **The header quoted its own price walk** while the candles ran another, so with
  a position open the entry line could sit below a price the position bar called
  a loss. `Chart` now takes an optional `readout` and writes the price, the
  change and (through `onTick`) the P&L to the DOM off the candles it draws.
- **A rule's text was split into grid cells.** `.drules li` is a two-column grid;
  a bare text run beside an `<i>` becomes a grid item of its own, so "Only send
  USDT on the Tron network" laid out as two overlapping fragments.

## Three versions of the same app

There are three routes. They are the same page, the same four screens and the
same state machines — only the driver behind the phone changes.

| Route | Mode | Who fires the transitions |
|---|---|---|
| `/` | **Demo** | The script, at 1.4× the authored duration. Nothing takes a pointer. |
| `/guided` | **Guided** | The script — until a reader touches a control the machine currently declares open. That pauses the clock and moves the playhead to what they just did. Left alone ~4.6s, the story picks itself back up. |
| `/live` | **Live** | Nobody but the reader. No clock at all. |

`ModeSwitch` (bottom right) links between them. They are routes rather than a
toggle so that a reader can send someone the one they mean.

### The one thing that makes three versions possible

A flow is a **machine**, not a slideshow: a set of named pure transitions, plus
a script that fires them in order.

```ts
type Machine<S, A> = {
  initial: S;
  actions: Record<A, (s: S, arg?: string) => Partial<S> | null>;
  beats:   { ms: number; do?: A; arg?: string; set?: Partial<S> }[];
  guided:  (s: S) => A[];              // the rail
  anchor?: Partial<Record<A, number>>; // where a gesture lands on the script
};
```

The autoplay and the reader press **the same transitions**. That is what keeps
the three modes from drifting apart, and it is why a screen the reader drove
into is a screen the script knows how to resume from. `set` is reserved for
things nobody can press — a checklist row advancing, a highlight going out.

A transition returning `null` is a refusal. `Open long` declines while the stop
loss is above the entry price in *all three modes*, because it is the same
guard; the same `null` also strips the control's button role, so a dead control
is also unfocusable and unannounced.

**The rail.** `guided(state)` lists what a reader may fire from here. It is
generous where the screen's argument lives — the whole order ticket, the token
picker, the vault's amount — and shut during settlement, where there is nothing
to decide and an interruption would only break a sequence they are waiting on.
That is the difference between "you may explore" and "you may break the story".

**The anchor.** After an anchored gesture the playhead *moves to it*. Without
that, the script would resume from its own place and immediately undo what the
reader just did — the single thing that makes a half-interactive demo feel like
it is fighting you. Tap **Short** on the flat screen and the demo picks up at
protection, sizing a short.

While the reader has the wheel, a pill rides over the tab bar: *you have the
wheel — resuming shortly*. A resume that is not announced reads as the screen
overriding you rather than waiting for you.

## The demo screens

The four screens inside the phone shell are rebuilt against the real near.com
app — recordings of Perps, Swap, Earn and Universal Send.

| Card | Flow |
|---|---|
| Perps | Size a long, set a stop loss the form refuses, fix it, open the position. Live candle chart with an entry line. Market/**Limit** with a resting price, a leverage sheet, and Positions/Orders/Trades. |
| Account | Universal Send — token and network, the amber notice you have to tick, and a **Pay with** sheet that offers a yield vault beside a wallet balance. The sentence the copy makes, happening. |
| Swap | Size chips, a token sheet you can type in, then `Finding best price → Executing trade → Trade complete`. |
| Earn | Vaults/Staking, two vaults, the vault's fees, Deposit/Withdraw, Use max, and a deposit that settles. |

### One state, three drivers

`flows/player.ts` holds the state and nothing else does. The clock and the
reader both reach it through the machine's transitions, so there is no second
copy of the truth to fall out of step.

The flow keeps its OWN clock rather than being scrubbed by scroll. A screen that
only moves while the reader's wheel does is dead the moment they stop, and
stopping is exactly when they are looking at it.

> **`cur` is the state; `view` is only its render mirror.** The clock carries a
> beat's leftover milliseconds in `cur.current.t`, and `view` only changes on a
> beat boundary. An innocent-looking `cur.current = view` on every render threw
> that remainder away, restarting the current beat's timer on every unrelated
> re-render — and on a screen that re-renders often enough, the script never
> reached its next beat at all. There is exactly one writer of that ref.

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

### Three compositions of one ticket, and why

The real app scrolls the order ticket. This one composes it, because there is no
scrollbar to inherit and no scroll position to restore between loops:

- **sizing** — a number is being typed into the top of the ticket. The
  protection toggle, the primary button and the estimates go; the keypad is over
  them and none of them is something you act on mid-entry.
- **protection** — the keypad is attached to take-profit or stop-loss. The side
  selector, the balance line and the amount are off the top, exactly as they are
  in the recording.
- **at rest** — the whole ticket, no pad.

The way out of the first two is the `✓` on the keypad's accessory bar, which is
what the real app uses and — with the primary button behind the pad — the only
way back to it.

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

### Making a control live without changing what it is

`15-demo.css` opens by saying it has no `:hover` rules on purpose — *a control
that lights up under a cursor it will never receive is a promise the tour does
not keep*. That is still true of the demo. Two of the three modes do receive the
cursor, so the promise is now conditional, and every rule that makes one lives
in `16-modes.css` scoped to `.can`.

`.can` is written by the machine, not by the mode: a control gets it when the
mode allows a pointer **and** the flow's own guard says yes right now. One
source of truth for whether a thing can be done; that file is its stylesheet
half.

**The tag never changes.** Every control is a `<span>` carrying a hand-tuned
class, and `ui/tap.ts` adds the button role, a tab stop, a click and the two
keys a button owes the keyboard. Swapping the tags to `<button>` would drag the
UA button box and the preflight reset onto exactly the controls whose boxes were
hardest to get right — that regression has already cost us once.

`press()` also calls `preventDefault` on **mousedown**. These controls sit inside
a sticky stage whose scroll position *is* the composition; letting a click move
focus makes the browser scroll the control into view and nudge the page a few
pixels on every single tap. Tab still reaches them and the focus ring still
shows.

The `.tapped` animation stays what it always was: the flow pressing its own
buttons.

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

The demo phone has two of its own, in `phone/flows/mode.tsx`:

- `PACE` — a per-mode multiplier on every beat. Demo is `1.4`. Stretching the
  beats **alone** would only make a fast animation wait longer between jumps,
  which is worse than either, so the entrances stretch with them under
  `.morph[data-mode="demo"]` in `16-modes.css`.
- `IDLE_MS` — how long guided waits after a gesture before resuming. `4600`:
  long enough to finish a thought, short enough that a card left alone always
  heals back into the demo.

---

## Placeholders to swap before ship

Carried over from the original, unchanged:

- **QUOTE** — the Robbie Klages quote in `Lockup.tsx` is placeholder copy, not
  said by him and not approved by The Rollup.
- **LEGAL** — the jurisdiction note's wording and its list are unapproved.
- **FEE / AUDIT / UTM** — no fee line, no audit link, and every CTA shares one
  `href`; add per-surface UTM to read them apart.
