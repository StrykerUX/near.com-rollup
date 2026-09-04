# near.com × THE ROLLUP

A refactor of the single-file `nearcom-rollup-v03.html` build (v08 rollup) onto
Next.js 16 (App Router) + React 19 + Tailwind v4, with the scroll-scrub sequence
ported intact and GSAP driving the light zone.

**One route.** `/` is the whole site. It was twenty — the home page, two more
modes of it, a card-deck drawing of it, and a gallery of sixteen demo screens —
and the tour's four chapters are what survived of them.

```
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck
pnpm check:flows   # walks the four scripts: reachability, and clip lengths
```

---

## What changed in this pass

The page turns green, the tour gets a second composition for narrow frames, and
the repo loses everything that was not on the one route.

**The field is a gradient, and the shader is not drawn**

- `linear-gradient(150deg, #5EFAA7 0%, #5EFAA7 50%, #16B862 100%)` — solid
  through the first half of the axis, easing to the dark green in the lower
  right. Six stacked radials, a blur and a `scale(1.16)` went with it; the
  scale mattered, because 1.16 moves the 50% stop 8% out of frame.
- The WebGL canvas is **absent, not hidden**. `makeGradientField(null)` returns
  null and the whole GL block is behind `if (GL)`, so nothing runs. `gl/` is
  untouched and still imported: putting the canvas back is one line.
  → [The field is one gradient now](#the-field-is-one-gradient-now)
- Five layers of deliberate darkness came off with it — a `#02100C` base,
  `.gcss` at .80, `brightness(.58)` on the shader, two black corner vignettes
  and a `#1C4419` corner light. All five are stated in one place rather than
  deleted at source, because they are one decision.

**The type is `#1F1F1F`, at full, everywhere**

- No text on the page is faded. It was built as four strengths of one ink and
  the brief asked for one; size and weight carry the hierarchy.
- **Kepler is gone.** Every emphasised run is Montreal 300, upright — which
  took three compensations and two hooks with it, all of them there because the
  face was a serif. The page now makes **no third-party font request at all**,
  where it made two. → [Kepler comes off the page](#kepler-comes-off-the-page)

**The narrow frame is a different composition, not a squeezed one**

- Four ordinary sections — eyebrow, headline, device, copy. Nothing sticky,
  nothing scrubbed, no snap, no scroll-driven timeline, no observer picking a
  chapter. The device is **301px wide at 390** where the stacked lockup had it
  at 142. → [The narrow tour](#the-narrow-tour--four-sections-and-no-trick)
- The stage engine **does not run there at all**, and `PhoneShell` is not
  mounted: `display:none` does not stop a clock.

**The tour**

- **Swap and Earn open on their own screen.** Both scripts open on the account
  home, deliberately — it is the answer to where the screen came from — and the
  chapter directly above them is the account. `openAt` moves that establishing
  shot to pass two. → [A chapter can open late](#a-chapter-can-open-late)
- **Earn gets a seventh scene**, and it is the half the recording it is cut from
  is named for: back to the account, `Send`, and a `Pay with` picker that opens
  on **Your vaults**. A thousand dollars leaves the deposit without the deposit
  being closed. → [Spending the yield](#spending-the-yield)
- The perps position bar named the wrong market — it read `book[0]`, which is
  the ZEC long, under a Bitcoin chart.
- The swap picker scrolls **twice** instead of three times, at 620ms instead of
  380.

**Everywhere**

- Buttons get their own curve. They were already transitioning and still read
  as a cut: `--ease-out` is an expo that is 90% done in the first 55ms of its
  240. → [Why the buttons still felt hit](#why-the-buttons-still-felt-hit)
- Three separate rules were overriding `transition` on buttons, one of them to
  `none`.

---

## The pass before this one

> The `/demo/*` headings below were routes when this was written and are not
> any more — those four screens are the tour's four chapters now, reached by
> scrolling `/`. Everything else in this section is current: the five prices,
> the wallet, and every figure that is arithmetic on them.

Client feedback across all four chapters of the tour, and one wallet underneath
them. Every figure on every screen is now arithmetic on five prices read on
**2 September 2026** and written down once, in `lib/prices.ts`:

```
BTC $77,118.98 · ZEC $797.02 · NEAR $1.84 · AAPL $325.64 · USDC $1.00
```

**NEAR is the app's $1.84 and not the market's $1.90.** The reference screenshot
of the app's own Assets screen prints `1555.3148 NEAR` against `$2,861.78`,
which divides to 1.8400 exactly. Where the app and the market disagree the app
wins — the demo has to look like the product, not like a ticker. Gauntlet's rate
gets the same call: **6.00%**, the current 30-day APY, not the 4.52% an older
recording shows, because the app's own rows carry an `Earn 6%` pill.

**`/demo/own-v5` — the account**

- The **Main / Confidential split is gone**, and `bucket` and `Move to Main`
  with it. near.com is confidential by default now and its own Assets screen
  carries one total and no halves.
- The wallet is **the brief's five again** — 0.75 BTC, 25,000 NEAR, 120 AAPL
  (Ondo), 40 ZEC, 18,400 USDC — which reverses a documented decision to follow
  the recording's three. → [The wallet is the brief's, and what that
  cost](#the-wallet-is-the-briefs-and-what-that-cost)
- **Zcash is 40 where the brief says 400**, and it is the only quantity moved.

**`/demo/perps-v5` — the trade**

- The open position is **ZEC** and the ticket opens **BTC**. Both were Bitcoin,
  which made the chapter one trade done twice in a product whose claim is that
  you can trade anything from one account.
- **The screen does not change market for it** — the pair, the chart and the
  mark stay Bitcoin's. A position now knows its own symbol and its own mark, or
  the ZEC card would report a profit every time Bitcoin ticked. → [One account,
  two markets](#one-account-two-markets)
- $20,000 at 5x is the $100,000 trade, and the perps balance is **imported**
  from the account chapter: it was 11,428.61 here and 1,053.89 there.

**`/demo/swap-v5` — the swap**

- **0.25 BTC into ZEC** — $19,280 and 24.189 ZEC. Typed, because a quarter of a
  holding is a fraction and `Use max` is the wrong gesture for one.
- **The rate picks its own direction.** It was fixed at "one of what you are
  buying", which on this pair printed `1 USDC = 0.00001 BTC`. → [A rate is
  readable when the figure is whole](#a-rate-is-readable-when-the-figure-is-whole)
- The picker travels down the catalogue and **comes back to the top**, because
  the token this trade is for turned out to be one the account already holds.

**`/demo/earn-v5` — the yield**

- **Gauntlet**, the row at the top, and its sheet was never on film — the copy
  is researched rather than invented. 15,000 of 18,400 typed in.
- **The Staking tab is finally opened.** It has been on the row since the first
  pass and no recording ever presses it. → [The one screen with no frame behind
  it](#the-one-screen-with-no-frame-behind-it)

**Everywhere**

- The Apple mark joins the token set as the one silhouette drawn in black.
- Quantities lose their thousands separators and their padding zeroes to match
  the reference — and the trailing-zero trim is fixed: `/\.?0+$/` was turning
  `120 AAPL` into `12`.

## What the page is

**Two compositions of one tour**, and exactly one of them is ever rendered.

Above 1080px: 588vh of scroll with a 100vh sticky child, holding a four-chapter
product tour (Perps → Account → Swap → Earn) whose whole composition is a
**pure function of scroll position**, closing into a plate that contracts into
the light zone.

At 1080 and below: four ordinary sections in normal flow. Nothing sticky,
nothing scrubbed. `useNarrow` decides, and it decides in React rather than in
CSS for one reason — `display:none` does not unmount a component, stop a timer
or pause a canvas, and the wide composition runs a demo flow on its own clock.

Behind both, the field: a single 150deg gradient between the two greens. There
is a fullscreen fragment shader in `gl/` — fbm → domain warping → an OKLab
palette — and it is not currently drawn; see below.

---

## Layout

```
src/
  app/
    layout.tsx        metadata and <body>. No <head> of its own any more —
                      it carried the Adobe Fonts kit for Kepler
    page.tsx          the one route
    globals.css       Tailwind + the ported stylesheet, in order
  styles/
    01..13-*.css      the original stylesheet, split at its own banners
    14-refactor.css   the one rule the DOM-shuffle used to do imperatively
    15-demo.css       mostly dead: eight selectors of it still render
    16-modes.css      a fifth of what it was. `.can` is not a mode — the flow's
                      own guard writes it, and all four screens read it
    17-demo.css       `.pdev` itself lives here, so it stays
    24-demo-app.css   `.pdev.app` — the shared language every screen wears
    25-home-app.css   the gutted plate that holds the real device
    26..28-*.css      swap · own · earn, each scoped to its own class
    29-account-home.css  the home three chapters open on, `.pdev.app`
    30-mobile-tour.css   the narrow composition, top to bottom
    31-hero-green.css    the green theme: the field's five dark layers off,
                      and one ink at one strength
  lib/
    schedule.ts       THE STAGE SCHEDULE — band weights, scrubT, yForT, feel dials
    breakpoints.ts    1080, in the one place three files can read it
    math.ts           the easing vocabulary
    prices.ts         THE TOUR'S FIVE PRICES, once — every figure on every
                      screen is arithmetic on this table
    cards.tsx         the four chapters' copy, once, for both compositions
    tokens.ts · quotes.ts · format.ts
  gl/
    gradient.vert.ts  fullscreen triangle
    gradient.frag.ts  the field — compiled, not currently drawn
    gradientField.ts  compile, uniforms, draw, the CTA ripple state
  stage/
    engine.ts         the scrub, the snap, the shrink, the paint.
                      Refuses to start below 1080
    domCache.ts       write-if-changed for style and custom properties
    bus.ts            the two slots where the engine reaches React state
  hooks/              useStageEngine · useNarrow · useReveal ·
                      useCtaContract · useReducedMotion
  components/
    stage/            Stage · Hero · Lockup · StepDots · GradientField ·
                      MobileTour · NarrowChrome · QuoteBand
    stage/phone/      PhoneShell (one branch now) · AppDevice · the flow machine
    stage/phone/ui/   Chart · ProgressList · Enter · tap
    demo/perpsv5|ownv5|swapv5|earnv5/   the four chapters: Phone, script, state
    demo/shell/       flow · deck · Frame · Count · Typed
    demo/app/         AccountHome — one account, shared by three chapters
    light/            marquee · security · faq · final CTA · footer
    marks/            vector marks lifted verbatim
tools/
  check-flows.mjs     walks the four scripts headlessly: every state reachable,
                      and every clip the length its comment claims
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

## `/demo/*` — the five recordings, rebuilt *(the routes are gone; the screens are not)*

> **Read this section as history, and read it for the screens.** The sixteen
> `/demo/*` routes and the gallery that indexed them were deleted, along with
> `/home-v2`, `/guided` and `/live`. What went with them: the marketing re-cuts
> (v2, v3, v4), the pointing hand, the spotlight, the camera, the card-deck
> viewport and its four faces, and about eleven thousand lines.
>
> **The four v5 screens did not go.** They ARE the tour's four chapters —
> `AppDevice` imports `perpsv5`, `ownv5`, `swapv5` and `earnv5` and renders them
> inside the device on the home page — so everything below about how those
> screens are built, what is read off a frame and what is not, and why each
> figure is the figure it is, is current. Only the URLs are gone.
>
> Everything below about v1 through v4 is a record of decisions, not of code.
> It is kept because most of what those passes learned is why the v5 screens
> look the way they do — and because a repo that deletes the reasoning along
> with the code has to learn it twice.

Five routes that were not part of the composed page. `/` is a scrolling argument
with a phone in it; `/demo/*` was the app, at size, with the argument written
beside it. `/demo` indexed them.

| Route | Recording | Steps | What it shows |
|---|---|---|---|
| `/demo/perps` | 5m 41s | 24 | Fund with a passkey, build a ticket, hit both validation rules, open a position |
| `/demo/perps-v2` | the same, cut | 16 | The trade alone: $5,000 of margin into a $100,000 position, and back to the card |
| `/demo/perps-v3` | the same, quieter | 9 | Half the screen, no pointer: the control lights itself and the figures travel |
| `/demo/perps-v4` | the marketing cut | 8 | One line of copy at a time, and everything but the moment darkened |
| `/demo/perps-v5` | twenty-five seconds | 2 | A position already working, and a second one opened beside it — its own device, rebuilt against the app |
| `/demo/swap` | 1m 14s | 18 | A USDT balance swapped to NEAR across chains, then the yield chip on the next row |
| `/demo/earn` | 48s | 17 | Two vaults with their fees, a deposit, and paying someone out of a vault balance |
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

### Perps v2, and the one thing it does that v1 does not

`/demo/perps-v2` is the same machine as `/demo/perps` — same transitions, same
guards — starting from `initialFunded` and carrying the long version's steps 11
through 24: the ticket onwards. The long version has to earn its opening, and
establishing that the perps balance starts at $86.99 and that funding it is a
passkey away costs ten steps before anyone takes a position. That is the right
length for an argument and the wrong length for a demo of the trade.

Two figures differ, and both because the funding chapter is gone. The opening
balance is $5,428.61 rather than what that chapter lands on, so $5,000 of margin
at 20x is $100,000 of notional — a demo of a leveraged product whose example
trade is $14,000 is a demo of the form, not of the leverage. And the account
card's unrealized P&L, which had been pinned at the recording's +$5.10, is
applied as the rate that figure represents (0.0364% of notional) so a $100,000
position does not report the P&L of a $14,000 one.

It also shows one refusal rather than two. The take profit is typed wrong,
refused and corrected; the stop loss goes in once and is accepted. One refusal
on a screen is a lesson, two in a row is a queue.

The one addition is a `paused` prop on `Chart`. It is not `live`: `live`
switches the loop off for a card nobody is looking at, while `paused` keeps
drawing and stops the market's own clock, so the candles hold where they are
and resume from there rather than from the top.

```ts
/* the market's own clock, in milliseconds, which only advances on the
   frames it is allowed to */
if (!props.current.paused) clock += now - prev;
```

It is on for exactly one moment: while a take-profit or stop-loss field has the
keypad. Both rules are enforced against a **fixed** entry price, and a reader
typing 78,200 while the quote above it walks 400 points cannot tell whether the
refusal is about their number or about the market. Holding the price makes the
rule legible; letting it run makes it look arbitrary.

The device takes it as a prop rather than deciding for itself, so v1 keeps its
running market — by the time it reaches that step it has already spent four
chapters establishing that the price moves.

### The transitions, and the hand that makes them read

`/demo/perps-v2` is the one page that shows a *person* using the app rather
than an app using itself. Three pieces, and they only work together.

**A hand that reaches before it presses.** The machine already knew what
happens; a flow can now also declare where, by naming a control's `data-tap`:

```ts
target: (a, arg, s) => {
  case 'key':   return `key:${arg}`
  case 'ostep': return s.auth === 'ask' ? 'passkey' : null
}
```

The deck resolves the NEXT beat's target while the clock is still counting down
to it, so the pointer is already on the control when the state changes, and it
carries the one just pressed so the ripple lands where the press did. `ostep`
fires six times and only the first is a person pressing anything — a hand
hovering over a checklist that is ticking itself is a lie about who is doing
the work.

Two things this took. A closed sheet is translated down by its own height and
hidden but still laid out, so the keypad inside the ticket has a real rect four
hundred pixels below the phone; the hand chased it there once. And controls
move under it, so it re-reads on `transitionend` and `animationend` — exactly
when a control has finished moving — with a slow tick as the safety net.

**A tempo the hand can keep.** The original timings were written for a script
with nobody driving it: digits at 190ms, backspaces at 130ms, both faster than
a hand can travel. Typed digits are 300ms now, clearing is 200ms because nobody
reads what they delete, and `DWELL` is 200ms so the pointer still has time to
glide inside a digit's ~375ms. The 2600ms pause on the refusal stays: that one
is a person reading the error, which is the only reason the error is on screen.

**Things arrive instead of appearing.** One curve, one distance, three
durations, all behind `[data-motion]`:

```css
@keyframes drise { from { opacity: 0; translate: 0 9px } }
```

Every rule is an entrance, never an exit — React unmounts these the instant the
state changes, and what leaves is almost always behind what replaced it. Three
exceptions earned their machinery: the position bar arrives delayed by the
ticket's own slide, because landing under a sheet that is still leaving reads
as two events; the entry line draws out from its price chip rather than
switching on; and the keypad stays mounted and animates shut, because
unmounting it drops everything above it two hundred pixels in one frame.

`/demo/perps` keeps the plainer motion and no hand. It has four more chapters
to fill, and a screen that animates every list row for twenty-four steps
fidgets. Every other demo — swap, earn and both confidential flows — opts in.

### What the hand is not allowed to point at

Adding it to five pages turned the `target` map into the place where a flow has
to be honest about who is doing the work, and most of that is written as
`null`:

- **A settlement checklist.** Eleven of swap's beats are `step` and `vstep`
  advancing a spinner, and exactly one press hides among them. A hand hovering
  over a list that is ticking itself claims a finger caused it.
- **A refused control.** The confidential deposit picker lists the networks it
  will not take, greyed and without handlers, precisely so they can be read.
  `pickNet` resolves through the same guard the row is drawn with, so the
  pointer can never land on something that would not answer.
- **Typing that comes from a keyboard the mock does not draw.** The network
  search field carries no press of its own — it is a picture of a field. The
  hand goes off the glass for the run and comes back for the press after it.
- **An address being minted.** `issue` is Continue's answer, not a tap, and it
  also fires from `auto` with nobody at the screen.

### What the hand found

Pointing at a control is a claim that the control exists, so adding the hand
surfaced three places where a script did something no reader could:

- Universal Send opened from a beat while the account card's Receive and Send
  buttons were inert spans. They take handlers now, and two flows start from
  them.
- An amount was typed straight into a figure with no keypad on screen, so
  100 ZEC appeared to fill itself in.
- The shared passkey sheet reached the DOM with nothing to aim at, which had a
  flow stamping a tap id onto another component's markup after render.

### v3, and taking the pointer away

`/demo/perps-v3` is the same machine again, and it is defined by two
subtractions.

**Nothing travels.** A pointer is honest — it says a person is doing this — but
it is also a second thing to watch, and it arrives from wherever it was last.
When what you want is the reader's eye already ON the control at the moment it
changes, the control itself is the better instrument. `Spotlight` reads the same
`hand` the pointer does and writes two classes instead of drawing anything:
`.spot` on the control the next beat will press, `.hit` on the one it just
pressed. A field in error borrows the refusal's colour rather than wearing a
green ring over a red border, because stacking them says two things at once
about the same box.

**Half the screen.** Gone: the three lists under the chart, the Market/Limit
control, the keypad, and the liquidation row in the ticket. Each was carrying
something and each was carrying it somewhere else too — the lists are where a
trade LANDS and this page is about making one; the order type is a second story;
the pad spends two hundred pixels saying "this is being typed", which the caret
and the digits landing say for nothing; and liquidation matters most once you
are in, which is where it still appears. What is left is the price, the two
sides, the size, what leverage turns it into, the two rules, and the position.

The one thing v3 adds is `Count`. Every figure on these screens is derived, so
when leverage goes 10x to 20x four of them change in the same frame — correct,
and unreadable, because the eye gets no chance to see which moved. Easing them
there is what makes the causal link between the control that was touched and the
numbers that answered visible at all. It is why the ticket's two estimate rows
collapse into one line that travels: that trip is the leverage feature.

The chart gained a rule from this too. On a tall chart the gridlines are dense
enough that one of them always lands under the live price or the entry chip, so
a label at the same height as a chip is now skipped — a second price in the same
place is not an axis.

### v4, and the third thing built on one map

A flow declares where each transition lands — `target` names a control's
`data-tap`. That map has now driven three different things, and it is the same
map every time:

| | reads `target` as |
|---|---|
| `Hand` (v2) | a pointer that travels there before the beat presses it |
| `Spotlight` (v3) | a ring that lights on it where it already is |
| `Focus` (v4) | a cutout that darkens everything except it |

v4 is the cut you would put in front of a room. The phone is the only object on
the page, the copy is one line at a time beside it, and everything on screen
except the thing being talked about is darkened. Steps declare what they are
about (`shot`) and, when a figure is the point, what to hang on it (`callout`).
Every beat is longer than anywhere else: a move, a hold and a release is three
seconds of screen time on its own, and a cut that lands before the eye has
arrived is a cut nobody saw.

It borrows v3's device wholesale, because what v4 adds is not inside the phone.
It is how the phone is looked at.

### The camera that did not survive

v4's first build scaled the device: `Camera` transformed the whole phone so it
pushed in on whatever the step was about, up to 1.5x. It was rejected, and the
reason is worth keeping.

**Scale is a poor way to say "look here" when the thing being looked at is a
phone.** The screen grew, the bezel stopped reading as a bezel, and half of
every move was spent re-finding where you were. It read as a magnifier, not as
attention.

`Focus` does the same job with contrast instead. One box sits over the control,
casting a shadow deliberately larger than the screen; the frame clips it at the
bezel. The control is not lit — everything else is darkened, which is the same
emphasis and none of the disorientation. Nothing scales, nothing moves except
the cutout travelling between controls, and that trip is the only motion left in
the shot.

It was then dialled most of the way back down. The first version ringed the
cutout in green, dimmed everything else by seventy per cent, and ran on six of
the eight steps — strong enough to become the subject itself, and arriving so
often it stopped being an instruction and started being the house style. It is
now a dim with no ring at all, in two steps of falloff so the boundary reads as
a change in light rather than a cut, on **three** steps: a number being typed, a
figure travelling, a refusal appearing under a field. The other five are carried
by what the UI already does — a sheet arriving, a box ticking, a signature
rising.

Two things the camera taught us before it went, and both survive in the
replacement:

- **The frame has to be a separate element from anything transformed.**
  `overflow: hidden` clips a box's children against that box — but if the box
  is itself scaled, so is the clip. With both on one element, a 1.45x push-in
  GREW the phone instead of looking into it: the dim spilled a hundred pixels
  past the bezel and took the rounded corners with it.
- **A rect measured mid-slide is a rect of somewhere the control was leaving.**
  A sheet takes half a second to arrive and a closed one is laid out below the
  phone entirely, so the focus refuses any rect that is not on screen and keeps
  the last good one until the sheet lands.

### The chart, and the one scripted thing on it

Three changes turned the perps chart from a market into a demonstration.

**Calmer.** The walk ran ±840 with a fast third term and a candle every 2.4
seconds, which on a tall chart read as noise — a line busy enough that a rise
could happen inside it without being seen. The amplitudes are roughly halved,
every period is longer and a candle now takes 3.6 seconds.

**The brackets are drawn.** A demo whose point is that a position has a take
profit and a stop loss on it has to show them; an entry line on its own says
where you got in and nothing about where you get out. `Chart` takes `tp` and
`sl`, draws them in their own colours, and — importantly — joins them to the
price scale, so the chart frames all three instead of putting two off the top
and bottom. They live on the POSITION rather than the ticket, because the ticket
empties when the order lands and that is what makes it ready for the next one.

**The market is pointed at the take profit.** `toward` is the only scripted
thing on this chart, and it earns its place: a market that has to be watched
reaching a bracket inside one screen of a demo is not going to get there on its
own, and waiting for a random walk to oblige is not a demo, it is a wait.

Getting that right took two goes, and the first was wrong in a way worth
recording. It weighted the lift by a candle's position in the VISIBLE WINDOW,
which had two faults that were the same fault: the whole chart moved, and it
moved differently every frame — a bar lifted near the right edge sank back down
as the window scrolled it leftward, so history rewrote itself continuously. The
move belongs to the bars it happened in. `towardK` is now the absolute index of
the candle the trade opened on; anything before it is finished and is never
touched again.

Then the second half of the same problem. Adding the offset to a finished bar
moved that bar as a block, so during the climb each one sat a few hundred points
above the last with nothing joining them — a staircase of candles floating in
clear air. A candle opens where the one before it closed, and that has to
survive the lift, so the open takes this candle's offset and the close takes the
next one's. It is the same rule the seamless walk is built on, and checking it
is the same check: `close(k) − open(k+1)` is exactly zero across the boundary,
and the offset before the trade is exactly zero.

It is an offset rather than a blend toward the price, so once the climb is done
the market keeps its own shape around the new level instead of being pinned flat
to a number. A take profit is met and then traded through, which is what meeting
one looks like.

The climb runs over **nine** candles. At four the thousand points arrived in
bodies of ~370 and read as a spike — technically a rally, visually a gap with
wicks on it. Nine puts the steepest bar at ~180 against the walk's own ~40, and
the run has a shape: +48, +109, +151, +176, +183, +172, +143, +97, +34, then
small red bars as it settles above the level. It crosses the take profit on the
seventh. That costs sixteen seconds, which is why the candle rate came down to
1.8s with it and why the last step of every version holds longer — a climb that
finishes after the loop has restarted is a climb nobody saw.

The figures moved with it. The recording's $82,000 and $78,200 were an arbitrary
pair at 1.6:1; the brackets are now a thousand above the entry and five hundred
below it — **two to one**, the ratio the shape exists for, and close enough
together that a chart can hold all three and still show the candles moving
between them. At 20x that is +25% of margin against −12.5%, and the P&L reads
+$1,255.43 the moment the green line is met.

One detail from that moment: when the price meets a bracket, two chips want the
same row. The live quote is already printing that number — that is what touching
means — so the bracket keeps its line and gives up its label.

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

### v5, and what a short cut is actually short of

`/demo/perps-v5` is commissioned to a length, checked by `pnpm check:flows`. The
deck plays every beat at `PACE` (1.25), so the budget is **10,500ms of authored
beats, outro included → 24,575ms on screen**, and the assertion exists because
the length is not a number anywhere in the source — it is a sum of twenty-seven
beats, and every future edit to one moves it by exactly as much as nobody
notices.

**It was ten seconds and it could not be read**, which is the useful half of the
story. Ten was not too little *content* — the sequence is already the minimum
gesture set — it was too little rest. Measured, a sheet takes ~260ms to arrive
and was being pressed 115ms later; nothing on screen ever came to a stop. That
does not read as fast, it reads as unresolved, because the eye never gets the
beat of stillness it uses to decide something finished happening.

So scene 2 is the same sequence at 1.5x, and the multiplier is on the **shape**
rather than on the gaps: every beat, keystroke and hold grew by the same factor,
so the rhythm survives and only the tempo changed. Scene 1 did not grow — it is
one hold with nothing scripted in it, and a rest does not get more restful by
lasting longer. **Three other dials moved with it**, or the script would only be
waiting longer between the same fast animations — the trap `16-modes.css`
already documents for demo-mode PACE:

| dial | was | is |
|---|---|---|
| scene 2's beats | 5,000ms | 13,260ms |
| `--dur` / `--dur-slow` | 150 / 260 | 225 / 390 |
| the chart's `candleMs` | 1,500 | 5,000 |
| every `Count` that travels | 200–640 | 300–960 |
| keystrokes | 105ms | 160ms |
| rests after a value lands | none | 4 × 500ms |
| the ending | 1,545ms | 3,945ms |
| the outro | 600ms | 4,000ms |

`candleMs` buys something the others do not: a slower candle covers the same
ground in more time, so a quoted market crosses fewer ticks per second and
prints less often. It takes the readout from ~15 prints/s to ~11 without
touching `tick`. It is a prop rather than a change to the module constant
because `check:flows` multiplies that constant by the ramp's length to assert
v3 and v4 fill their take profit on the right frame.

A short cut is still short of the two things v4 spends most of its length on,
and each was given up rather than compressed:

**One line of copy per step becomes two lines total.** Eight steps across a cut
this short gives each line about a second, which is under the floor for reading
one — the copy would be present, unreadable and moving, which is worse than
absent. Two steps give each line five seconds or more. The step is also what the dots and `Focus`
are keyed to, so three things got quieter for one reason.

**`shot` is absent from both steps.** The cut already spends its whole length on
motion that carries meaning — a sheet arriving, digits landing, a figure
travelling, a card joining a list. At this tempo a cutout travelling between
controls does not direct the eye; it competes with what it is pointing at. The
hand and the spotlight go for the same reason, which is why v5 declares no
`target` at all: a map nothing reads is a map that will rot.

**The take profit never fills.** The climb is fifteen candles — thirty real
seconds at this candle rate — so it cannot even start. The ending is the order landing and a second
card joining the first.

### The one device that is a copy rather than an argument

v5 is the only flow that does not borrow v3's device, and the reason is that
v3's device is an *argument*: it removes half the screen on purpose, because
what it is showing is a trade and the lists under the chart are where a trade
lands. v5 claims the screen IS the app, so everything the other versions earned
the right to drop is back — the chrome, the time axis, the 1H row,
Positions/Orders/Trades with counts that move, Modify/Close, the position card,
`Est. trade value`. It is under the opposite rule: **where a reference frame and
a tidier idea disagree, the frame wins.**

**It renders no status bar at all** — no clock, no signal, no battery, and no
notch. It is the one block on the device that is not the product: 44px at the
top of a 766px screen spent simulating an operating system, in a cut whose whole
job is to show an app. The reference frames are crops and have none of it
either, and a frozen 11:02 is the one detail in a short loop that gives away
that nothing on screen is live.

The notch went last and is the interesting half. It is *device* chrome rather
than status chrome, so it survived the first pass — but a Dynamic Island with
nothing beside it is a phone bezel drawn inside a phone bezel, and `.pdev`
already carries the radius, the border and the shadow that say "this is a
device". It briefly took a `bare` prop on the shared `StatusBar` to keep the
notch and drop the indicators; when the notch went too the prop had no caller
left, and it was reverted — a shared component does not get to keep an option
nobody passes.

Sixteen of the 44 freed pixels went straight back as padding on the chrome row:
with nothing above it, that row sat against a 42px corner radius and the back
button tucked into the bezel's curve. A status bar buys that clearance for free
and nobody notices until it is gone. The other 28 split between the chart and
the list — and the list is the half that mattered. A card is 164px, so at the
179 it had before, exactly one fitted and the counter was the only thing saying
there were two positions. At 193 the second card's top edge shows below the
first, and the frame the whole cut is spent earning says it in the list as well
as in the tab.

Its wallet glyph is **Lucide's** (`wallet`, ISC), inlined rather than depended
on — the repo already keeps its icons as 24-grid paths, and a package for one
glyph is a tree to shake for two `d` attributes. The hand-drawn one it replaces
did not read as a wallet; it read as a card, or a database.

It is also the only surface in the repo set in **Figtree** — the face the real
app uses, SIL OFL 1.1, self-hosted in two subsets. The other twelve devices stay
in Montreal, which was an explicit decision (`b2c10ab`) about the site's voice;
this screen is not speaking in the site's voice. Everything is scoped to
`.pdev.app` in `24-demo-app.css`, and nothing in that file may leak.

**Two rows share one slot.** Long/Short and Modify/Close are drawn in the same
place, because the reference frames draw them in the same place and because both
at once is 142px of buttons that push the list the whole ending lands in off the
bottom of a 766px device. The switch is the book being full: while there is a
trade left to open the row offers to open one, and on the last frame it offers
the two things you can do with what you have.

### One account, two markets

The book opens with a position on it and the ticket opens another, and for two
passes **both were Bitcoin** — which made the chapter one trade done twice, in a
product whose whole claim is that you can trade anything from one account. The
open position is **ZEC** now and the ticket opens **BTC**.

**The screen does not change market for it.** The pair, the chart, the candles
and the mark are Bitcoin's throughout, which is what a perps app looks like when
you are watching one market and holding a position in another. No market picker
was added, because none was needed.

Two things had to learn about it. A `Position` carries its own `sym` and its own
`mark`, and `atFor` hands each one the price it should be measured against — the
ZEC card would otherwise report a profit every time Bitcoin ticked, since the
live quote is piped into every P&L on screen. And the chart is handed only the
entries **in its own market**: a ZEC entry at $795 drawn on a scale built around
$77,000 is either a mile under the floor or a scale that flattens every candle
trying to fit it.

The trade itself is **$20,000 at 5x** — the app multiplies the margin you type
by the leverage, so that is the $100,000 position, 1.29670 BTC. And the perps
balance is **imported from the account chapter**: this file said `11,428.61`
while the home said `1,053.89`, two figures for one account on two faces of the
same scroll, and neither of them covered $20,000 of margin against the $6,000
the ZEC position already holds. It is $28,400, which leaves $22,400 free.

### The chart learned three things from this

All three are opt-in props that default to what every other flow already does.

**`roll`** lets candle time run with nothing to reach. The hold (`9136204`) is
still the default and still load-bearing — it is what makes every loop of every
flow draw the identical chart. A cut whose first scene is the market moving
needs the opposite, and can have it safely for the same reason the hold was
safe: the series is a pure function of a candle's number, so a rolling window is
still deterministic. It just has to be re-mounted each pass — `key={deck.pass}`
on the `<Chart>` — or loop two opens on a different candle.

**`phase`** was the second attempt at "the market is climbing", and the first
attempt is the more useful half of the story. A linear drift, a few points per
candle, was built and thrown away: a slope big enough to see across a cut is
690 points across a 46-candle window, which swamps the walk's own shape and
closes **every** bar green. That is the exact failure `RAMP` has a long note
about — a ramp with wicks drawn on it. `phase` invents nothing instead: the walk
is 840 points of real market shape, so somewhere in it is a stretch that rises
gently and still closes a third of its bars red. 1,628 was found by searching
six thousand start points for a window whose low is a third of the way in and
whose high is the right-hand edge — the shape in the reference frames — with the
last third carrying 251 of its 306 points, still rising over the seven candles
the cut advances, and **eighteen of forty-six bars red**. The first phase chosen
scored well on everything except that shape and put its rally on the left, so
the opening frame of a cut whose first line is "already working" was a market
rolling over.

**`tick`** is the size of a print, and it is the fix for the one thing that made
this screen read as aggressive. Measured, before: the header repainted **49
times a second**, held each value for 20ms, and moved by an *identical* step
every time — because the live candle's close travels linearly across its
1,500ms:

```
$79,598.0 → .2 → .4 → .6 → .8 → 79,599.1 → .3 → .5 → .7
```

Nothing about that is a fast market. It moved 35 points in six seconds, four
hundredths of one per cent. It read as aggressive because a digit was being
repainted forty-nine times a second by a constant increment, and no screen a
person has ever traded on does that. **The instinct is to slow the market down,
and it is wrong twice over**: the market is already calm, and a slower linear
crawl repainted fifty times a second is more obviously a machine, not less.

So the quote is rounded to a tick and reprinted only when it crosses one. The
gate is the rounding itself — quantise the number and the writes stop on their
own, because writing the same string twice is a write that does not happen.
Measured, after:

| | before | after |
|---|---|---|
| price | 49 prints/s, 20ms hold | **15 prints/s, 67ms hold** |
| P&L | 52 prints/s, 19ms hold | **15 prints/s, 67ms hold** |
| frames that touch the DOM | 68% | **19%** |
| distance travelled | 35 pts / 6s | 35 pts / 6s — *unchanged* |

$0.50 is read off the reference frames, not chosen: every quote in them lands on
a half dollar — $79,567.5, $79,577.5, $79,585.5. (Those are the frames' own
prices; the mark this cut trades at is $77,118.98 now, from `lib/prices.ts`. The
half-dollar grid is what was read off them, not the level.) The rate now follows the market
rather than the frame rate, which is the property that matters: a fast market
crosses more ticks and prints more often, exactly as it should.

Two rules fall out of it. **It is the quote that ticks, not the market** — the
candles, the scale and every price the geometry is built from stay continuous,
because quantising those would stair-step a body 4px wide, and the point is a
calm number on a smooth chart rather than a coarse chart. And **write-if-changed
is the mechanism, not an optimisation**: assigning `textContent` a string it
already holds still tears the text node down and rebuilds it, so without the
guard the DOM would churn at 60Hz under a number that had not moved. It is the
rule `stage/domCache.ts` enforces one level up. It also makes the print
self-healing — a React re-render that resets the markup is corrected on the next
frame rather than held until the next crossing.

**`face`** tells the canvas which typeface to set its axis in. Canvas has no
stylesheet to inherit from, so a device whose UI is not in the default stack has
to say so, or its chart is the one panel still speaking in the old voice — and
it is the panel with the most numbers on it.

### One class naming two things, twice

Both visual bugs this device has shipped were the same bug, and neither was
visible in a diff:

- `.btk` was the chart-type icon *and* the order ticket. The icon's
  `width: 19px` collapsed the whole ticket to 27px.
- `.blev` was the leverage chip in the ticket *and* the leverage sheet. The
  chip — sized to its own text, with no width of its own — collapsed the entire
  sheet to 67px, so the Save button inside it rendered 35px wide instead of 318.

Neither typechecks as wrong, neither logs anything, and both look like a layout
that was simply designed badly. The scan that catches them is not "does this
class exist in another stylesheet" — that one passed both times, because this
file is scoped to `.pdev.app` and owns its whole namespace. It is **"is this
class used at two JSX sites that are two different objects"**, which finds them
in one pass over `Phone.tsx`. Worth running before adding a class here; a
device this dense reuses names by accident.

### The ending gets a third of the cut

Five things land in one frame when `land` fires: the sheet slides out, the tab
row counts up to (2)/(4)/(28), a second card arrives above the first, the entry
and its two exits draw themselves onto the chart, and Modify/Close takes the
slot Long/Short had. Two seconds was enough to *see* that and not enough to
*read* it, so the hold is now 3,945ms — the longest beat in the script by a
factor of four, on the frame the whole cut is spent earning.

The time is not dead. The chart keeps rolling through it, so the quote keeps
printing and the new position's P&L keeps answering — what the hold shows is a
bracket that was set and a trade that is working, which is the only reason to
set one. Measured: the price walks 46 distinct prints and the P&L goes
+$0.00 → +$58.44, opening at exactly zero because its entry *is* the mark.

**The `outro` is the same hold, written twice.** `useDeck` keeps the script's
last state for the final beat's `ms`, and then for `outro` more before it
resets — nothing on screen distinguishes them. At 4,000 authored the two
together run 9.9 seconds, forty per cent of the cut on one frame, which is a
deliberate ratio for something that loops: a viewer arriving mid-loop lands on
the answer rather than on the setup. If it wants shortening, the beat is the
lever and not the outro, which is the loop's own breathing room.

### Two bugs where the second position lands

**A book of positions had one entry line between them.** `entry` was a single
number, and that was a design mistake rather than a simplification: a screen
with two positions on it has two entries, and handing the chart only `book[0]`
meant the older one's line vanished the instant a second trade landed. What
reached the viewer was one blue line *moving* — which says the position changed
price, the opposite of what happened. It takes a list now, one line each,
newest first, and a bare number still works for every other flow.

Three lines and a quote cannot all print a label: at the end the two entries
and the live price sit within 16px of each other and a chip is 19px tall. So
labels are claimed in priority order — the market first, then whatever fits —
and a **line never gives way, only its label does**. Both entry prices are
spelled out on the position cards directly below either way.

**The entry line teleported instead of arriving.** `entryAt` — the clock the
line's 520ms draw-in is measured from — was latched the first time `entry` went
non-null and never touched again unless it went back to null. On a screen that
*opens* with a position on the book that is frame one, so when the second
position landed and the entry moved the fade was long finished and the line
simply jumped. A new trade's entry appearing and an old
one's line sliding to a new price look nothing alike, and the cut was drawing
the second while claiming the first. It now re-arrives whenever the entry is a
*different price*: measured, the line grows 0 → 73px over ~530ms.

**The entry chip was painting over the live quote.** It was the last label
drawn and the only one with no collision rule. An entry forty points off the
market is ten pixels off it on this scale and a chip is nineteen tall, so the
blue label was cutting the live price in half. It now gives up its label on
that row the way the brackets already do — the line stays, and the entry price
is spelled out in full on the position card directly below.

### Two cards, and the second one visible

The new position has always been unshifted onto the front of the book, so it
was already drawn above the old one — but the list had 193px for a 164px card,
so what reached the screen was one card and nine pixels of the next. Capping
the chart at 200px gives the list 226 and puts the second position's header row
— its dot, its side, its P&L — on screen underneath the first. That row is the
point of the frame: the cut spends twenty seconds opening a second position and
the list should say there are two.

### Plus signs are not candles

Held against a real BTC chart, the difference was not what it looked like it
was. **Density is not the problem** — the app's own chart draws about seven
pixels a candle, same as this one, and the reference was a desktop chart at a
different zoom. Two other things were:

**Every bar had a wick above and below.** `h` and `l` were each `r() * reach`,
two independent uniform draws, so every side of every bar averaged half a
reach — forever. That is the one shape a real chart rarely has: a bar that ran
up and closed at its high has *no* upper wick, and one long tail with nothing
opposite it is the commonest candle there is. `wickBias` is an exponent on that
draw; at 2.8 the mean wick is 26% of the reach and most of the mass sits near
nothing.

**Every body was the size of its neighbours.** `walk` is three sines, so its
increment changes smoothly and a row of evenly sized bodies is the other half
of why it read as generated. `jitter` is a per-candle wobble on the level, and
it is safe for a reason this series already guarantees: a candle's close *is*
the next candle's open, both being the series at the same index, so any
per-index offset preserves that chain exactly.

| | before | after |
|---|---|---|
| body, as a share of the candle | 42% | **59%** |
| near-dojis | 11 / 46 | **5 / 46** |
| bars with a wick on *both* sides | 26 / 46 | **10 / 46** |
| bars with one bare side | 9 / 46 | **27 / 46** |

They also made the quote **calmer** rather than costing anything, which was not
the plan: a wick is where the price *goes*, so biasing it toward nothing means
less ground covered. Median velocity 5 → 4 points a second and the print rate
18 → 14, even with the reach ceiling raised from 16 to 20.

Both are opt-in and default to the uniform draw every other flow has always
made. Worth adopting there too — the plus signs are on those charts as well —
but that changes four pictures and is its own decision.

### The quote, and three fixes that each undid the last

This number was worked on three times, and the sequence is the useful part.

**One · it was an odometer.** 49 prints a second, 20ms apart, every one the same
increment — because the live candle's close travelled linearly from open to
close. Rounding the quote to the app's own $0.50 tick and reprinting only on a
crossing took it to 15 prints/s at 67ms.

**Two · fixing the candles undid it.** Once bars formed properly they *visit*
their high and their low instead of lerping to the close, which is two to three
times the ground covered per bar. Back to 27 prints/s at 17ms — and worse than
the raw number suggests, because the price was now crossing 2–3 ticks *between
frames*. **At 60fps a $0.50 tick only filters below 30 points a second**, and
the median velocity was 37. Above that ceiling the quantisation does nothing at
all. The correct candle shape had been bought with a worse quote.

**Three · the missing word was *constant*.** Real quotes sit still and then
jump; they do not move quickly at an even rate. Slowing everything uniformly
gives a slower even rate — the same problem, quieter. Three dials, measured
separately, on a median velocity of 37 points/s:

| | median velocity | quiet at p90 |
|---|---|---|
| `reach` [20,60] → [6,16] | **12** | 67ms |
| `candleMs` 2,000 → 5,000 | 26 | 33ms |
| `tape` 0 → 0.9 | 26 *(p90 velocity 105)* | 33ms |
| all three | **8** | **100ms** |

`reach` is the strongest and it is not obvious why: a wick is not decoration,
it is where the price *goes*, and a bar walks that distance two or three times.
`tape` is the one that answers the actual complaint — it warps time inside each
leg of a bar's path, `w(x) = x − (a/2πk)·sin(2πkx)`, whose derivative swings
between 1−a and 1+a, so the price surges and very nearly stops three times per
leg. It is **monotone**, which is what makes it safe: `forming()` derives the
high and low from waypoints already passed, so any strictly increasing
reparametrisation of time leaves them untouched and the wicks still only grow.

Measured after: **18 prints/s, 43ms mean hold, quiet reaching 317ms** — and the
price moves half a dollar at a time again rather than a point and a half,
because it is back under the ceiling where the tick can do its job.

### `7` is not a take profit below the entry price

Typing 79867 goes `7 → 79 → 798 → 7986 → 79867`, and the first four are below
the entry. So the field turned red on the first keystroke and stayed red for
four of the five, with the button reading "Review take profit" — **525ms of the
screen accusing a reader of a mistake they were halfway through not making.**
The stop loss never showed it, because it is below the entry from its first
digit, and that coincidence is what kept it hidden.

The rule is no longer evaluated on the field that has the caret in it. Same
rule, checked once the reader has finished saying what they mean — which is
right in the real app too, not a demo concession. The button closes the hole
that opens: it reads the *ungated* rule for whether it fires and the gated one
for whether it accuses, so a half-typed value gets an ordinary disabled button
and never a red one. Measured across a full loop: **zero frames in error**, and
the only labels the button shows are "Enter amount" and "Open long".

### The third row of the checklist never finished

`ostep` ran to `ORDER_STEPS.length - 1` and landed the order in the same call,
so at ostep 2 the third row was *active* — spinning — and the next transition
closed the sheet out from under it. Two rows settled and the third vanished.

It now runs one step further, to `length`, where every row is done and the
sheet is still up; `land` is a separate transition that closes it 800ms later.
"The order is confirmed" and "the ticket is gone" are two moments and the point
was always to see the first. `demo/perps/state.ts` splits `receipt` from
`settle` for exactly this reason. Measured: **all three rows read as done for
about a second** before the sheet goes.

### The palette, and why it lives in TypeScript

Four values — `#202020` the ground, `#262626` a container, `#0A0A0A` the market
panel, `#03C076` a candle that closed up — and they are declared in
`perpsv5/palette.ts` rather than in the stylesheet, which is backwards until you
notice who the second reader is.

**Canvas has no cascade.** `fillStyle` takes a literal and will not resolve
`var(--btc-up)`, so a palette written in CSS has to be written again in JS for
the candles, and the two copies drift the first time anyone adjusts one. So the
values live in one module: `Phone.tsx` writes them onto the device as custom
properties for `24-demo-app.css` to read, and hands the same constants to
`<Chart up down>`. It is the construction `@theme inline` already uses one level
up in `globals.css`, for the same reason.

**`up` is not only the candle.** The live price line, the chip riding on it and
the take-profit bracket take the same green, dimmed with `globalAlpha` rather
than spelled out as a second hex — a chart whose candles and whose price chip
are two different greens six pixels apart reads as a mistake, and it is one.
Both props default to the values the chart has always drawn, so no existing
flow moves.

**An opaque palette breaks a translucent stylesheet.** Every container in this
file used to be `rgba(255,255,255,.0x)`, which is a fine way to build a grey
until the ground stops being black: over `#202020` a 7% white lands on `#2E2E2E`
and not on `#262626`. So every fill that is a *container* is now an opaque
token, and translucency is kept for what is genuinely an overlay — borders, dim
text, and a chip sitting inside a card that is already a token, where an opaque
fill over an identical fill would just be an invisible box.

**The tonal break replaced a divider.** `.bbook` used to be separated from the
market by an 8px light rule. `#0A0A0A` against `#202020` does that job, so the
rule is gone — the reference frames have no divider there either, they have
exactly this change in ground.

### Where v5 is deliberately not 1:1

Three, and all three are the repo's own rules winning over a frame:

- **The axis is less dense.** The reference labels every $100; at `LABEL_PX = 14`
  — the floor `5fe1387` set, and an accessibility decision rather than a taste
  one — labels that close would collide, so the step stays at $200.
- **`Est. trade value` is not abbreviated.** The app writes `$100K`; the ticket
  writes `$100,000`, because that figure travels from $50,000 as the leverage
  lands and `Count` cannot ease through an abbreviation. The position card,
  which does not travel, does write `$120K`.
- **The balance chip in the chrome is an addition.** Nothing in the frames shows
  what the account is worth on this screen. The cut opens on a position with
  $6,000 of margin posted against it, and "what is left" is what makes the
  second trade legible before the ticket is open.

Two figures also had to move, and the reasoning is in `perpsv5/state.ts`: the
reference ticket reads *Available to trade $1,087* and this cut types $5,000 of
margin into it, which that balance cannot pay for. The trade was not the thing
to change — $5,000 at 20x is the $100,000 position the cut is for. And the two
exits hang off the mark at 2:1 rather than off the frames' arbitrary
$82,000 / $78,200, for the same reason `demo/perps/state.ts` already gives.

## The account chapter — `demo/ownv5`, and what is in it

The tour's second chapter and the one the page's headline is about. Three
frames: the account home, the **Assets** screen behind its Crypto row, and the
sheet a row opens with Swap / Send / Earn on it. Built off
`rec-Everything you own + Swap screen.MP4` at one frame per second — the home
was already known from `rec-perps.MP4`, but what sat behind that chevron had
never been on film. What it holds and how it is split have both moved on since;
the frames are still where the screen's structure came from.

### The wallet is the brief's, and what that cost

Charlie's brief asks for five holdings — 0.75 BTC, 25,000 NEAR, 18,400 USDC,
400 ZEC, 120 AAPL (Ondo) — and the wallet on film holds Tether and two lots of
USD Coin. Both versions have shipped. The recording's three won the first call,
on the grounds that the chapter's job is to look like the product and a reader
who has seen the app spots an invented portfolio faster than they read a
headline. **That has been reversed at the client's direction**, and the reversal
is worth writing down because it is a trade either way.

What the brief's list buys is the illustration: *"Everything you own, one
screen"* is five different things now — a coin, a network token, a share, a
privacy coin and a dollar — instead of three stablecoin rows. What it costs is
the recording as the wallet's source. The old figures closed to the cent against
two frames, and that check is gone.

**Zcash is 40 and the brief says 400.** It is the only quantity moved, and the
price is why: ZEC closed at $797.02 on the day these prices were read, so four
hundred of them is $318,808 — two thirds of the wallet, with three quarters of a
Bitcoin reading as small change beside it. Forty lands it between the share and
the dollars and leaves the list ordered without anything crushing the rest. The
rows sum to **$193,196.84**, and the home's total is that plus two separate
accounts: $28,400 of perps and $48,690 of earn, **$270,286.83**.

### There is no Main and Confidential any more

The screen carried two halves across the top — `Main $64.95` and
`Confidential $6,675.32` — because the app used to hold two balances and most of
the wallet was in the private one. **near.com is confidential by default now**,
and its own Assets screen has one total and no split. So the halves are gone,
`bucket` went with them, and so did `Move to Main` from the row's action sheet:
it was the arrow back into an unshielded balance that no longer exists.

The arithmetic that used to be the proof this screen was read rather than
approximated went with it. The three rows summed to `$6,699.90`, which was the
Confidential half the frame printed, and the total truncated its cent the way
the frame did. All of that belonged to a wallet and a screen the product has
moved past, and it is in `ownv5/state.ts`'s history with its reasoning intact.

### A row is addressed by an `id`, not by its symbol

The app has listed the same asset twice before now, once per network, and two
rows answering to one symbol open one sheet between them and collide as React
keys. So `Holding` carries an `id` and the machine's guard, the taps and the
sheet's lookup all use it. This wallet has no duplicate in it; the `id` stays
because the next one might.

### The card language is a fill plus a hairline

Held against the real screen, the gap was structural rather than tonal. Every
grouped thing in this app is a rounded card with a **1px line** a couple of
dozen steps above its own fill, and that line does more of the work than the
fill does: against a `#262626` plate on a `#202020` ground — six steps — the
border is what actually draws the edge. These were fills with no line at all, so
the sections read as regions of the page rather than as cards sitting on it.
`--btc-edge` is that line, declared once, so the list and the home card cannot
drift apart. (Two of the numbers behind this were measured as a fraction of the
screen's width, off the Main/Confidential split — the split has since gone, and
the ratio it taught is what survives.)

**The container goes darker, not lighter, and that took a second pass.** Sitting
it a hair *above* the ground put it at ~`#252525` against blocks at `#262626` —
one shade apart, which is a difference that exists in the stylesheet and not on
the screen. Dropping it 25% toward black lands it at ~`#181818`: fourteen steps,
and the blocks read as blocks.

### The Earn pill, and a column that could not be reserved

The app puts an `Earn 6%` pill on any holding it has somewhere to put to work.
**One row carries one here**: USD Coin, because the Earn tab's vaults take
dollars. Bitcoin, Zcash, NEAR and a tokenised share get none — NEAR has staking
rather than a vault, and the other three have nothing to be put into, so a pill
offering one would be the demo inventing a product. The rate is **imported**
from `earnv5/state.ts` rather than typed, because two screens quoting one rate
at each other is exactly the pair that drifts.

Reserving the pill's width on every row is the tidier idea: the figures line up
whether or not a row earns. It was measured and it does not fit. The card is
294px inside its padding; a reserved slot plus its gap costs 92 of them, and
against a 34px mark and an 80px figure that leaves 62px for the name where
`USD Coin` needs 66 and `120 AAPL · Ondo` needs 105. Reserving truncates content
on every row to align one. Unreserved, the names sit whole on one line and only
the row that has to truncates its quantity.

### A chapter cannot be given more dwell on its own

`W_REST` in `lib/schedule.ts` carries the comment **"THE DWELL DIAL. Identical
for all four cards, by construction"** — so there is no way to buy this chapter
more scroll that does not buy it for the other three and move the shipped page's
composition with it. When it turned out to go by faster than its flow could tell
its story, the flow got shorter instead: 20,025ms → **12,775**, same four
gestures in the same order. What went was dead hold — 1,100ms off the opening
frame, 1,200 off the list, 600 each off the sheet and the handoff, half the
outro.

**And 1,300 of it came back, all to the opening frame.** The trim was right
about where the dead hold was and wrong about that one: 1,625ms on screen is a
glance at four figures, not a read of them, and the account home is the frame
the chapter's headline is making its claim about. It now sits level with the
assets frame — 620ms to arrive plus 2,100 to sit — because both are frames whose
whole job is to be looked at and they carry about the same amount of reading.
**14,400ms**, and `tools/check-flows.mjs` pins it.

## The swap chapter — `demo/swapv5`, the same device doing something else

The second screen in the app's own language, and the first proof that the
language is one. `.pdev.app` carries the face, the palette, the tempo, the
chrome, the caret, the primary button, the checklist and the sheet mechanics,
so `swapv5/Phone.tsx` draws only what is actually a swap and its stylesheet is
a third the length of perps'.

**That class was `.pdev.btc`.** It was fine while perps was the only screen
wearing it and a lie on the first screen with no BTC chart in it, so it was
renamed with the file — 142 selectors, mechanically, verified by re-measuring
perps-v5 afterwards. The palette moved with it, from `perpsv5/palette.ts` to
`demo/app/palette.ts`, because it was never perps'.

### The catalogue is the one thing not read off a frame, and it says so

`rec-Swap.MP4` shows the picker at 0:45 holding **five** tokens — ZEC, NEAR,
SOL, BTC, ETH — which is what `demo/swap/state.ts` carries, with the frame
number beside it. The brief asks for a long list, scrolled, showing at least
the top twenty-five. There is no frame of that.

What went in is not invention either: the largest assets by market
capitalisation, in that order, with the symbols, names and brand colours they
actually trade under. Every row is checkable against any exchange. What was
*chosen* rather than observed is only which assets near.com's picker offers and
in what order — and if the real list differs, `catalogue.ts` is the only file
that changes.

**Prices are only where they are needed.** A picker row shows a symbol and a
name; nothing on it is priced. Only the assets this cut actually quotes carry
one — and they carry it from `lib/prices.ts`, which is the same table the
account screen totals and the perps ticket sizes against. A per-file price is
how `tokens.ts` came to say $68,420.10 for Bitcoin while the perps screen marked
$79,567.50: two prices for one coin, on two faces of the same scroll.

**And that frugality had a bug in it.** The quoted pair used to be BTC/NEAR, so
`fromPrice()` was hard-wired to the perps mark and ZEC had no price at all. The
moment the resting pair changed, the form opened quoting a rate off a silent
`?? 1` fallback. `fromPrice` reads the source's own price whatever the source is
now. A fallback that gives the right answer for the wrong reason is the one that
breaks on the day you change something else.

### A rate is readable when the figure is whole

The rate row was fixed at **one of the thing you are buying**, in units of the
thing you are spending — `1 NEAR = 1.87669 USDT` — because the inverse on that
pair, `1 USDT = 0.53 NEAR`, is the same fact stated so nobody can hold it. The
rule was right and the reason was wrong. What makes a rate readable is not which
side it is quoted from; it is that the figure is a **whole number rather than a
fraction**.

On Bitcoin into Zcash the readable direction flips: `1 ZEC = 0.0103349 BTC` is
the fraction and `1 BTC = 96.7591 ZEC` is the price. On Bitcoin into a dollar
the old rule printed `1 USDC = 0.00001 BTC` — five decimals of nothing. It
quotes from whichever side lands above one now, which gives the frame's own
answer on the frame's own pair and a legible one everywhere else.

**And five decimals is not the same as five figures.** The frame's `1.87669` is
five decimals on a number just over one, which is also six significant figures;
on `0.0000129` those are not the same thing at all. The precision follows the
magnitude so the figure always carries about six figures, and it is *truncated* —
the frame's own 1.8766952 prints as 1.87669, which a rounding would have made
1.87670.

### The picker is not one list, and drawing it as one was the miss

The app opens it on the wallet: **`Your tokens`** first, with a dollar figure and
a quantity on each row, then an `All / RWA (Beta)` tab row, then `More tokens`
and the catalogue. A flat twenty-seven-row list says the app has a lot of
assets; this says the app knows which ones are yours.

**Those three rows are the account chapter's own `HOLDINGS`, imported rather
than retyped.** They are the same holdings the assets screen lists two faces
earlier on the same scroll, and a picker quoting different quantities than the
screen a reader just came from is the contradiction that only ever gets noticed
by the person you were trying to convince.

**The offset is computed, not multiplied.** Section headers and the tab row are
different heights from the rows, so `at × ROW` stopped being true the moment the
picker had sections. `pickOffset` sums the real heights and `PICK_H` is the one
place they are written down. The rail is still drawn rather than native: a
native scrollbar is the browser disagreeing with the phone about what a
scrollbar looks like, on a screen whose whole claim is that it is a copy.

### Making a list feel long is not the same as it being long

**Three stops, not one glide.** A single continuous move reads as one fact; three
read as someone looking. A 620ms transition — slower than the device's own
`--dur-slow`, because a list is heavy — does the travelling.

**NEAR is deliberately ninth.** The catalogue's own order puts it third, one
flick from the top, and a picker that finds what it wants immediately has not
shown you anything. Eight coins go past on the way now, which is the argument
the chapter is making.

**And the picker rests before it moves.** At 620ms the track started travelling
while the sheet was still arriving, so `Your tokens` went past unread — a wallet
section nobody sees may as well not be there. 1,200 now, and the first stop is
the `More tokens` header rather than the tab row it used to clip mid-height.
20,200 → **20,780** authored, 25,250 → **25,975** on screen.

### `.fixed` is a Tailwind utility

The source token's chip was `className="swtok fixed"`, and `.fixed` is
`position: fixed`. The chip left the flow and landed on top of the amount it was
meant to sit beside. The ported stylesheets outrank Tailwind — they are imported
unlayered — but only where they *set* the property, and nothing here set
`position`.

A modifier named after a utility is a rule you did not write and cannot see in
your own file. The scan that catches it is class names against Tailwind's bare
utilities (`fixed`, `absolute`, `static`, `block`, `flex`, `grid`, `hidden`,
`visible`, `border`, `container`, `transform`, …); run over every `className` in
`src/components`, it found exactly one.

### This screen has no back arrow

It was drawn as a pushed page — arrow, centred title, an action on the right —
and it is not one. **Swap is a tab:** it is reached from the bar at the bottom,
it is where you already are, and there is nothing behind it to go back to. So
the title drops out of the bar and becomes a heading on the page, the way every
other rooted screen in this app writes its name; the corner holds the one
control that is actually there, the confidential lock; and the tab bar this
screen never had sits under it, on Swap.

The reference also carries a blue notification badge beside the lock. That is a
count of something this demo does not have, so it is left out rather than
invented.

**No `You pay` / `You receive` labels.** The app does not write them: the field
on top is what leaves, the field under the arrow is what arrives, and the arrow
between them is the sentence. Two labels explaining an arrow is a form
apologising for itself. The token chips are tinted in the token's own colour
instead — **one pair of alphas** off `--tk` rather than a table of hand-picked
tints, because twenty-seven hand-picked tints is twenty-seven chances to get one
wrong and never look at it again.

**The form opens on a pair, not on a blank.** The source is Bitcoin because the
account chapter ends on the Bitcoin row's Swap action, and a form offering to
spend something that is not in the assets list is two chapters contradicting each
other on the same scroll. The destination opens on USD Coin because the app holds
the last pair, which makes the picker a *choice* rather than a required step.
"Swap anything, anywhere" is a claim about choice.

**And it spends a quarter, not the lot.** `0.25` of 0.75 BTC — $19,280, and
24.189 ZEC out. It is TYPED: the previous cut spent a whole Tether position and
got it into the field with one tap on the balance, because `6635.616976` is not
a figure anyone enters by hand. Four characters and a fraction of a holding is,
and `Use max` is the wrong gesture for a fraction.

**The picker goes looking and comes back.** Down past the wallet, into the
catalogue, and then back to the top — because Zcash is the fourth row of `Your
tokens` and the token this trade is for turned out to be one the account already
holds. It used to end nine rows down on NEAR, from a wallet that held no NEAR.
The list is still long, the reader still sees that it is long, and the answer was
in their own five the whole time.

## The earn chapter — `demo/earnv5`, the yield and the account it lives in

The tour's fourth chapter. It opens on the same `AccountHome` the other two open
on, presses the **Earn** balance — the third row of the card — and lands on the
vaults. Earn is not a tab in the bar and never was: it is a room in the account,
and the gesture says so.

### Gauntlet, and the sheet no frame has ever shown

The chapter deposits into **Gauntlet USDC**, the row at the top, at the client's
direction. `rec-Earn + being able to send:pay from your earn balance.MP4` opens
Taler's sheet and only Taler's, so **Gauntlet's disclosure has never been on
screen** — which puts unobserved copy at the centre of the chapter.

It is at least *researched* rather than invented, and here is the whole of it:
Gauntlet is a risk firm that has set parameters for onchain lending since 2020,
its USDC vault is curated on Morpho and runs on Ethereum, its 30-day APY is
**6.00%** (6.35% over 24 hours), and Morpho curators charge a performance fee on
yield — Gauntlet's is **15%**.

**The rate is the current one, not the frame's 4.52%.** The reference screenshot
of the app's own Assets screen carries an `Earn 6%` pill, so the app agrees with
the market and the older frame is stale. The TVL is still the frame's, because a
vault's size is a slow number and that one *was* observed.

**15,000 of 18,400 goes in**, which is the brief's figure and leaves 3,400 — a
decision rather than a sweep. It is typed: `Use max` was the right gesture while
this cut spent a whole 22.555228 lot, and it is the wrong one for a fraction.
The button is still drawn and still live for a reader who has the wheel.

### The one screen with no frame behind it

`Staking` has sat on the tab row since the first pass — it is in every frame of
the recording — and **the recording never presses it**. For two passes neither
did this cut, and the pane behind it was the brief's with a note saying so.

The reference for what is actually there is one line of a sidebar in a
screenshot of a different screen: **`Join NEAR@3.33, earn rewards`**. So the
rate is the app's own **3.33%** — not the market's 4.4–4.9%, the same call
NEAR's price gets — and the pane is *designed* rather than copied. This is the
note that says so.

**The stake is not a slice of the assets list.** Earn is its own account: the
assets screen shows all 25,000 NEAR and this stakes 20,000 on top of it, which
is two accounts rather than the same NEAR counted twice. Only the home's total
puts the three together. 20,000 NEAR at $1.84 is **$36,800**, and Earn holds
$48,690 before the deposit and $63,690 after.

### The settlement is a screen, and the sheet waits

Three rows tick — *Confirm in wallet · Depositing · Deposited* — under the
amount, with the reference id the app prints, and then it **stops**. The sheet
holds a white `Close` until something presses it; a settlement that dismisses
itself is the app deciding you have finished reading the receipt. Closing it
lands the deposit, and Gauntlet's row goes from **$8,650 to $23,650** on the
screen the reader started from, which is the only thing this chapter had to
prove.

## The home page — four chapters, four real screens

The page's own structure turned out to be the brief's. `Lockup.tsx` already
writes a headline per chapter and the engine already fades between them:

| | chapter | headline | screen |
|---|---|---|---|
| 0 | Perps | *Trade where the liquidity is…* | `/demo/perps-v5` |
| 1 | Account | **Everything you own, one screen** | `/demo/own-v5` |
| 2 | Swap | *Swap anything, anywhere* | `/demo/swap-v5` |
| 3 | Earn | *Earn on what you're not using* | `/demo/earn-v5` |

All four are the same files those routes run — not versions of them. Anything
fixed there is fixed here.

**The index comes from the engine, not the DOM.** `setActiveFace(curIdx)` is
computed from the schedule, so it keeps working on a route where the four-card
deck is not rendered at all. It publishes `-1` while a card is *moving* —
mid-transition neither card owns the frame — and `AppDevice` ignores that: the
plate is what slides, and a screen that blanked during the slide would be the
device reacting to a move that is not about it.

**That order is `CH_TITLES`, which is DISPLAY order.** The `data-face`
attributes on the copy column carry the original indices and are a different
numbering — 2, 0, 1, 3. Confusing the two puts the swap screen under the perps
headline, and it is the one mistake `AppDevice` can make.

**Each chapter mounts its own flow**, so arriving starts that flow from its
first beat rather than dropping a reader into a loop that has been running
unseen — and only one clock, one chart and one settlement are ever alive.

Verified by sweeping the 5,292px of stage: perps at 2%, account at 17%, swap at
32%, earn at 53%, each under its own headline, with `/home-v2` still mounting
all four faces in the plate at 348×696.

## The plate gives up and holds the real device

`demo/perpsv5/Phone.tsx` runs, unchanged, standing in the home page's room: its
gradient field, its lockup, its quote, its scroll, its light zone. Not a version
of that screen — the same file, the same `useDeck`, the same flow, the same
352 × 766. It had a route of its own once (`/demo/perps-v5`) and the route is
what went; the screen is the chapter.

**The choice this section was written about is gone.** `flows/deck.tsx` carried
it — a context, made at the page and consumed four levels down — because
`/home-v2` drew these chapters as a four-card deck and `/` drew them as the real
device. With that route deleted there is one drawing, `PhoneShell` has one
branch, and the prop that selected between them is not threaded through Site →
Stage → Lockup at all. The argument for a context over a prop chain still
stands; there is simply nothing left to choose.

### The first attempt was a rebuild, and that was the mistake

It compacted the screen into the tour's plate. `.cswap` gives 547px on a desktop
and 309 where the lockup stacks; the device lays out 763. Fitting it meant
dropping the chrome and the time axis, re-authoring the ticket as a composition
instead of a sheet, and hiding the position list on a short plate. All of that
is defensible work and none of it was the thing asked for. **The point of
putting this screen on this page is to look at that screen**, and a version
edited down to fit answers a question nobody had.

So the plate stops being a plate. `.morph` keeps its id and every transform the
engine writes to it — `--card-y` (the peek), `--card-s` (the plate shrink),
`--card-pk`, `--card-o` — so the entry, the recede and the fade all still happen
to it. What it gives up is being a *surface*: no glass, no blur, no border, no
halo, and no clip, because the device carries its own bezel and is taller than
the height the engine writes. The header, the tab bar and the three other faces
are not rendered. **The tour is one screen long on this deck**, which is the
trade and was accepted as one.

The engine tolerates that: `chromeTitleEl` is null-guarded, and nothing in it
dereferences a particular face, so an empty deck is a deck that paints nothing.

### The scale is the ladder 17-demo.css already has

Keyed to viewport height, with the same numbers, for the reason that file's own
note gives — the device is drawn at its own size and only shrinks when it cannot
fit. Same ladder means the device on this page and the device on
`/demo/perps-v5` are the same size at any window: 352 × 766 at 1440 × 900, and
0.87 of that on a 800px-tall one.

It is centred on the plate rather than pinned to its top. The engine writes
`.morph` a height sized for a four-card deck — 696 — and the device is 766
before scaling; anchored at the top it would hang 70px below the box the rest of
the composition is laid out around. Centred, it overhangs evenly and the plate's
height stops mattering, which is what it should do on a route with no cards in
it.

## Three versions of the same app *(retired)*

> `/guided` and `/live` are gone, and `ModeSwitch` with them. The site is one
> route. What follows is why the three existed and what each was for — worth
> keeping, because the machinery that made them possible is still here: a flow
> is a script over a state machine, and the machine never knew which mode was
> driving it. `.can` in `16-modes.css` is the surviving half, and it was never
> about modes at all — see the note in that file.

### The three, and what each was for

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

## The demo screens *(the card deck is retired)*

> The four-face viewport this section describes — one chrome, one tab bar, and
> `PerpsFace` / `AccountFace` / `SwapFace` / `EarnFace` sliding inside it — was
> only ever reachable from `/home-v2`, and went with that route. `PhoneShell`
> has one branch now and it holds the real device.
>
> The section stays because the argument in it is the reason the deck lost:
> `.cswap` gives 547px and the device lays out 763, so fitting the real screen
> into the plate meant dropping the chrome, the time axis and the ticket's
> sheet — a different screen wearing the same palette.

### What the deck was

The four screens inside the phone shell are rebuilt against the real near.com
app — recordings of Perps, Swap, Earn and Universal Send.

| Card | Flow |
|---|---|
| Perps | Size a long, set a stop loss the form refuses, fix it, open the position. Live candle chart with an entry line. Market/**Limit** with a resting price, a leverage sheet, and Positions/Orders/Trades. |
| Account | Universal Send — token and network, the amber notice you have to tick, and a **Pay with** sheet that offers a yield vault beside a wallet balance. The sentence the copy makes, happening. |
| Swap | Size chips, a token sheet you can type in, then `Finding best price → Executing trade → Trade complete`. |
| Earn | Reached from the account's Earn row. Vaults/Staking, two vaults with their rates and your balance in each, the vault's whole disclosure, Deposit/Withdraw, a typed amount, a settlement that waits to be dismissed, and the NEAR stake behind the second tab. |

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

## The field is one gradient now

The comp puts the tour on two greens: `#5EFAA7` lit through the upper left,
`#16B862` banked into the lower right. One declaration says it —
`linear-gradient(150deg, #5EFAA7 0%, #5EFAA7 50%, #16B862 100%)` — and that 50%
stop is the whole character of the page: it is more light than dark, and the
dark is a corner rather than a half.

**Retuning the palette moved almost nothing, and finding out why took a
measurement.** The old field was not a colour, it was six layers, each added
deliberately by an earlier pass with a note saying so:

| Layer | What it was |
|---|---|
| `.grad` | a `#02100C` base under everything |
| `.gcss` | six stacked radials, held at `.80` opacity over that base |
| `#gl` | `filter: saturate(.80) brightness(.58)` |
| `.grad::before` | two black corner vignettes and a diagonal wash to `.84` |
| `.grad::after` | a `#1C4419` corner light — a very dark green |
| the shader itself | two vignettes at 74% and 55%, and a cap holding `g` at 0.66 so the brightest stop was never reached |

All of them are background colours, which is what the change was about. They
are switched off in `31-hero-green.css` rather than deleted at source, because
the whole stack is one decision — a dark frame — and it is either on or off.

**The blur and the scale went with the radials, and the scale mattered.** They
existed to make a field built out of overlapping lobes read as one surface:
`blur(33px)` melted the seams and `scale(1.16)` pushed the soft edges the blur
left off the frame. A linear gradient has neither problem — and 1.16 moves the
50% stop 8% out of frame in both directions, so the one number the brief names
would not have landed where it says.

### And the shader is not drawn

Its whole contribution is organic noise, and noise is the one thing a clean
diagonal cannot survive. The canvas is **absent rather than hidden**, because
the engine already treats a missing one as "no field": `makeGradientField(null)`
returns null and the rAF loop, both observers and the shader compile are all
behind `if (GL)`. Hiding it in CSS would have left every one of those running to
draw something nobody can see.

`gl/` is untouched and still imported, and its palette is kept in step with the
gradient, so putting the canvas back is one line and not one line plus a colour
hunt.

---

## Kepler comes off the page

Every emphasised run — the display headlines, the closing plate, the light
zone's CTA — was Kepler Std Condensed Display Italic, the serif half of the v03
type law. All of it is Montreal 300 now, upright, at the size of the text it
sits in.

**Three compensations and two hooks went with it, and all five existed only
because the face was a different one:**

- `font-size: calc(89em/73)` — Kepler's x-height runs small beside Montreal, so
  italic runs were set 1.22× to match it optically. One family on both sides
  now, so 1em **is** the match.
- `line-height: .9` — there to stop that 1.22× inflating the line box.
- `scaleX(--it-x)` — Kepler Condensed is wider than this layout wanted, so
  italics were squeezed to .86 and `useSqueezeItalics` handed the width back as
  negative margins on a ResizeObserver. Token, transform and hook are gone.
- `.kepler` and the canvas probe that added it — it switched italics onto the
  condensed cut when the real family was installed locally.

The engine's `scaleX(var(--it-x))` tail had to come **out** rather than be left
to resolve to nothing: an unresolved `var()` invalidates the whole declaration,
which would have taken the hero's translate and scale with it and stopped the
recede entirely.

**The page now makes no third-party font request at all**, where it made two.
Kepler is licensed through Adobe Fonts and could not be self-hosted, so it came
with a kit stylesheet, a preconnect, a `noscript` copy and a component to flip
the link from `media="print"`; the local() chains behind it came with five
`@font-face` blocks, and the Source Serif substitute behind those was a runtime
fetch off jsDelivr. Measured on load: zero offsite requests.

---

## The narrow tour — four sections, and no trick

The wide composition is three columns changing around a device that stays put,
and the sticky is what buys that: co-presence. At 390px there is none to buy,
and the arithmetic says so:

> the device lays out 352 × 766. A phone is 390 × 844. Those are the **same
> shape** — 2.176 against 2.164 — so a device that is readable on a phone is the
> whole phone, with nothing left over for words.

Every version that tried to keep them on screen together paid for it out of the
device. The stacked lockup split the frame 48/52, which put `--k` at 0.40: a
142px-wide device, and because the scale is a `transform`, 12px interface type
rendering at **4.8px**. Not one price, ticker or balance row could be read, on
the page whose entire argument is the demo.

So this composition does not simulate co-presence. Four ordinary sections —
eyebrow, headline, device, copy — and the reader scrolls through them the way
they scroll through anything. The device is 301 × 654 at 390px and 334 × 728 at
430.

**What it costs** is the trick: a phone holding still while the world changes
around it is genuinely good, and it is gone here. **What it buys** is a device
twice the size, nothing ever drawn on top of anything, no feature newer than
`dvh`, and a document that reads top to bottom for a screen reader.

### Two things that are React decisions, not CSS ones

`display:none` does not unmount a component, stop a timer or pause a canvas.
Both of these would otherwise be stylesheet work:

- **`PhoneShell` is not mounted** below 1080. It runs a demo flow on its own
  clock; hidden behind a media query it would keep running one.
- **The stage engine does not start.** `useStageEngine(!narrow)` plus a guard
  inside `startStageEngine`, because the hook cannot know the viewport until
  after the first client render — and one commit is enough to compile a shader
  and take a WebGL context.

Each section mounts its own screen on an `IntersectionObserver` and drops it on
the way out, so at most two of the four flows ever run.

### And a token that is not reachable is silently dropped

`--hero-ink` is declared on `:root`. It was on `#stage` — which reads correctly
and quietly broke two rules: the nav and the fixed CTA bar are `position: fixed`
**outside** the stage, so `var(--hero-ink)` there resolved to nothing, the
declaration was dropped as invalid, and `color` fell back to inheritance. "Sign
in" kept its border (a literal) and lost its colour (the variable), which is
exactly the shape of that bug.

---

## A chapter can open late

Swap and Earn both open on the account home. That is deliberate and their notes
say why — Swap is a *tab* on your account and Earn is a *row* on it, not
separate apps — but it cannot be the first thing those chapters show, because
the chapter directly above them **is** the account. Scrolling from 02 to 03
landed on the screen just left behind, and the tour looked like it had not
advanced.

`openAt` names a step the **first pass** opens on. The loop still restarts at
-1, so a reader who stays gets the whole script and a reader who scrolls past
gets the screen the chapter is named for. By step id and not by beat index, for
the same reason `anchor` is: indices shift every time a step gains a keystroke,
and an anchor that drifted one beat left would still work, which is the worst
kind of bug. `frameAt` is the same pure function `seek()` uses, so an
opened-late flow is in exactly the state it would be in had it played the
skipped beats.

Measured: the swap form is up 250ms after the chapter mounts, and the account
comes back 20s in.

**The other two chapters need nothing**, and it is worth writing down which and
why. `check:flows` prints what each script visits: perps is `market` — it opens
on its own screen already — and own is `home → assets`, which opens on the
account because the account **is** its screen. "Everything you own, one screen"
showing you the one screen is not the same bug.

---

## Spending the yield

The aside beside the earn chapter reads *"Spend directly from a yield-earning
deposit — no unwinding, no moving funds out"*, and for four passes the chapter
only showed money going **in**: a row, two vaults, a disclosure, a deposit, a
receipt. The recording it is cut from is called `rec-Earn + being able to
send:pay from your earn balance` and scene 7 is the half the title names.

Read off `ScreenRecording_09-02-2026 22-01-47_1.MP4` at two frames a second:
back to the account, `Send`, and then the row that matters — the **`Pay with`**
picker, which opens on a section headed **Your vaults** with the Gauntlet
position in it, above the wallet. That is the whole argument, and the app makes
it as a line item in an ordinary token picker rather than as a claim. The scene
holds that sheet for 1,100ms before answering it: a picker opened and
immediately dismissed is a picker nobody read.

**Two departures from the clip, both deliberate.** It presses `Use max`, which
spends the position entire — 1.25526439 ZEC, six decimals of somebody's own
balance, which is what that button is for and not a figure anyone types. This
types a round thousand dollars and leaves the rest earning, which is the truer
version of the sentence: the deposit is not being closed, it is being spent
from. And the picker lists **our** wallet rather than the clip's, because
`AccountHome` is one component across three chapters and two of them disagreeing
about what the account holds is the failure this repo keeps catching.

`sendKey` is its own action rather than reusing `key`: that one writes `amount`,
which is the vault sheet's deposit field, and a chapter typing into the wrong
field would still typecheck and still animate.

The chapter is 34.3s now against perps' 24.6. It is the only one telling two
stories, and `check:flows` asserts the new total.

---

## Why the buttons still felt hit

They were already transitioning — `.btn` had carried `--tr-ui` all along — and
they still read as a hard cut. The curve is the reason: `--ease-out` is
`cubic-bezier(.16,1,.3,1)`, an expo-out that is **90% of the way there inside
the first 55ms** of its 240, with the remaining 185 moving almost nothing. On a
transform that is exactly right — it is what makes the cards and the arrow feel
flicked into place. On a colour there is no momentum to sell, so all the eye
gets is the jump and the tail is invisible.

Fills and labels come off that curve onto `--ease-soft`, an ordinary ease-out
that spends its time across the whole duration. **In is faster than out**, 200
against 420: pointing at a control should feel answered, and taking the pointer
away is not a decision anyone is waiting on, so the state dissolves rather than
snapping back.

### Three rules were overriding it, one of them to `none`

Finding them took going after a button that still cut:

- **`.btn-primary { transition: none }`** in `11-grid.css`, and it was
  deliberate — it belonged to an instant flip to translucent white. The green
  theme replaces that hover on every primary the page draws, so what was left
  was the timing without the effect. And because `.btn:hover` outranks
  `.btn-primary`, the **arrival** still eased while the **return** snapped. One
  direction soft and the other cut is worse than either.
- **`.nav .btn-ghost { transition: var(--tr-ui) }`** put Sign in back on the
  expo curve — a later rule at the same specificity as `.btn:hover`, so it won.
- **`.nav .btn-primary`** replaced the list with the four properties of its
  collapse, so the one control that never had a hover transition at all was the
  nav's own ask.

**The in/out pair is two whole lists, not a `transition-duration` override.**
Positional durations bind to whatever `transition-property` resolves to on the
element, and that nav button transitions eight properties — five durations
would have been repeated cyclically onto the wrong ones.

---

## Two build traps worth knowing

Both cost a debugging pass, and both look correct in the source.

**`translate` beside `transform` in one rule is silently dropped.** Lightning
CSS (Tailwind v4's minifier) downlevels the individual `translate` property into
`transform`, and within one rule the later `transform` then wins outright. The
step rail's hover label was centred with `top:50%; translate:0 -50%` alongside
an entrance's `transform:translateX(-6px)`; what shipped was the transform
alone, with the vertical centring simply gone, and every label sat 9px below its
ring. Centre with flex instead, and keep `transform` for one thing.

**A prefixed pair collapses to the last one.** Writing `backdrop-filter` and
then `-webkit-backdrop-filter` is the usual belt and braces; the two are folded
into one and the last is kept, so what shipped was the `-webkit-` form alone and
Chrome computed `none`. Declare unprefixed only — the minifier adds back
whatever the targets need.

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
- `public/img/` — `near-logo.png` and `rollup-logo.png`, the two supplied
  lockups the eyebrow is made of, and `isologo.svg`, near.com's own mark, which
  holds the field's top-right corner at `#00DC8D` and 25%. The isologo is
  **vector**: it is a flat two-tone shape drawn at up to 620px, which is the one
  case where the file is both smaller and sharper than the raster it replaced
  (1.4KB against 23). Its export baked 21% into all six paths; that was stripped,
  so the number the brief names lives in one place — `31-hero-green.css`.
  The superseded `nearlock.png`, `rolllock.png` and `isologo.png` are still in
  the directory and no longer referenced.
- `public/logos/` — the marquee's brand marks
- `public/logos/tokens/` — twenty-two marks. Twenty are the official
  full-colour SVGs from the near-intents asset set; `usdt.webp` is Tether's own
  artwork, which replaced an SVG whose `#377e61` disc was a duller green than
  the `#26A17B` the catalogue paints behind it; and `aapl.webp` is the one
  **share** in the set and the one mark drawn in black, so its chip's colour is
  the white it stands on. **Served as `<img>`, never inlined:** every
  file carries its own `<style>` block naming the same classes — `.st0` is
  `#fff` in Bitcoin and `#00ec97` in NEAR — so inlined into one document those
  rules are global, the last one parsed wins, and a picker showing twenty of
  them repaints most of them the wrong colour. An `<img>` gets its own document
  and the collision cannot happen.

**Every face is now self-hosted, and the page makes no third-party font
request.** Kepler Std was the one that could not be bundled — licensed via Adobe
Fonts, whose terms require the kit's stylesheet and forbid self-hosting the
files — and it is no longer used at all; see
[Kepler comes off the page](#kepler-comes-off-the-page).

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

`#stage { height: auto }` below 1080 — the narrow composition is as tall as its
own four sections and none of the above applies to it.

The demo phone has two of its own, in `demo/shell/deck.ts`:

- `PACE` — a multiplier on every beat, `1.25`. `check:flows` asserts the
  product, so a beat that grows cannot quietly move a clip's length.
- `IDLE_MS` — how long the script waits after a gesture before resuming. It is
  vestigial now that there is one mode and nothing takes a pointer, and it is
  kept because the machinery under it is what made three modes possible.

And the buttons have their own pair, in `12-motion.css`:

- `--dur-btn-in` / `--dur-btn-out` — 200 and 420. Arrival is brisk because
  pointing at a control should feel answered; the return is slower because it is
  not a decision anyone is waiting on.
- `--ease-soft` — an ordinary ease-out. **Not `--ease-out`**, which is an expo
  and correct only for transforms; see
  [Why the buttons still felt hit](#why-the-buttons-still-felt-hit).

---

## Placeholders to swap before ship

Carried over from the original, unchanged:

- **QUOTE** — the Robbie Klages quote in `lib/cards.tsx` is placeholder copy,
  not said by him and not approved by The Rollup. It is rendered by both
  compositions from that one array.
- **LEGAL** — the jurisdiction note's wording and its list are unapproved.
- **FEE / AUDIT / UTM** — no fee line, no audit link, and every CTA shares one
  `href`; add per-surface UTM to read them apart.
- **GAUNTLET'S DISCLOSURE** — the one vault sheet no recording ever opens. Its
  copy is researched rather than filmed, and two of its figures have already
  been corrected by the client (0.06% withdrawal, 7% performance). Treat the
  rest of that sheet as a best reading. Taler's numbers ARE filmed — frames
  0:06 to 0:15 — and its `0.05%` withdrawal fee is a coincidence of the two
  vaults, not a second instance of the same mistake.
- **A MONTREAL LIGHT CUT** — emphasis is declared at `font-weight: 300` and
  renders as 400. `public/fonts` carries Book and Medium only, and Montreal is
  a static family: a browser asked for 300 with nothing below 400 uses the Book.
  Drop a Light woff2 in and add its `@font-face` to `01-fonts.css`; nothing else
  changes.
