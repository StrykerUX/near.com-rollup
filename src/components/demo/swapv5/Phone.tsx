'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Count } from '@/components/demo/shell/Count';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import { Dot } from '@/components/demo/app/Dot';
import { CATALOGUE, type Asset } from './catalogue';
import { value } from '@/components/demo/ownv5/state';
import {
  FROM_BAL, PICK_ROWS, PICK_TOTAL, SLIPPAGE, SWAP_STEPS, balOf, cta, invRate, least, out,
  outUsd, pickOffset, quoteOf, usd,
  type PickRow, type SV, type SVAction,
} from './state';

type Deck = GenericDeck<SV, SVAction>;

/**
 * SWAP v5 — THE DEVICE
 * ==================================================================
 * The same device as `/demo/perps-v5`: `.pdev.app` carries the face, the
 * palette, the tempo, the chrome, the fields, the sheets and the CTA, so this
 * file only draws what is actually a swap. That class was `.pdev.btc` while
 * perps was the only screen wearing it — a name that would have been a lie
 * here, on the first screen with no BTC chart in it.
 *
 * WHAT IS NEW is the picker, and it is new because nothing else in this repo
 * has had to make a list feel long. Everything else — the amount field, the
 * checklist, the primary button, the sheet mechanics — is the shared vocabulary
 * doing its job.
 */

/**
 * The token pill's fill and edge, from the token's own brand colour.
 *
 * Two numbers rather than a per-token pair in the catalogue: at 18% and 34% of
 * a saturated brand colour, every one of the twenty-seven lands somewhere
 * readable on this ground, and a table of hand-picked tints is twenty-seven
 * chances to get one wrong and never look at it again.
 */
const tint = (c: string) => ({ '--tk': c }) as React.CSSProperties;

/**
 * A QUANTITY OF A TOKEN, WHICH IS NOT A FIGURE IN DOLLARS.
 *
 * `6635.616976 USDT` — no thousands separator, and no decimals at all when
 * there are none to show. The app groups its DOLLAR figures and leaves its
 * token quantities alone, which is the right way round: a comma is a reading
 * aid for money, and on a balance you might paste into a field it is a
 * character that does not belong there. `0.000000 ZEC` is the same mistake in
 * the other direction — six zeroes claiming a precision about nothing.
 */
const qty = (n: number, dp = 6) => (n ? n.toFixed(dp).replace(/\.?0+$/, '') : '0');

/**
 * HOW BIG THE AMOUNT IS ALLOWED TO BE, WHICH DEPENDS ON HOW LONG IT IS.
 *
 * `2500` and `6635.616976` are the same control holding figures of four and
 * eleven glyphs, and at one size the long one arrives touching the token pill
 * — which is where this landed the moment the screen started swapping a whole
 * position instead of a round number. The app shrinks the type instead, and so
 * does every other amount field with a chip beside it.
 *
 * The number is handed to CSS rather than the size: `--len` is the glyph count
 * and `26-demo-swap-v5.css` does the arithmetic, because the width it has to
 * fit into is a fact about the stylesheet's box and not about this component.
 */
const fit = (text: string) => ({ '--len': text.length }) as React.CSSProperties;

/**
 * THE RATE, TRUNCATED TO FIVE DECIMALS, WHICH IS WHAT THE FRAME DOES.
 *
 * The frame's own two amounts imply 1.8766952, and it prints `1.87669` — a
 * rounding would have given 1.87670. The account chapter met the same thing in
 * its largest figure and reproduced it there for the same reason (see
 * `crypto()` in `ownv5/state.ts`): given a screen that truncates, a demo that
 * rounds is a demo that is one digit off in the number a reader would check.
 */
/** what the destination field prints — three decimals, cut rather than rounded */
const fieldOut = (s: SV) => {
  const v = Math.trunc(out(s) * 1e3) / 1e3;
  return v ? v.toFixed(3).replace(/\.?0+$/, '') : '0';
};

/** a figure with its extra decimals CUT rather than rounded — see `Settle` */
const cut = (n: number, dp: number) => {
  const k = 10 ** dp;
  return (Math.trunc(n * k) / k).toFixed(dp).replace(/\.?0+$/, '');
};

const rateStr = (n: number, dp = 5) => {
  const k = 10 ** dp;
  return (Math.trunc(n * k) / k).toFixed(dp).replace(/\.?0+$/, '');
};

/** lucide `chevron-down` (ISC) — every token pill carries one */
function Cv() {
  return (
    <svg className="bcv" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** lucide `arrow-down-up` (ISC) — the app's fiat/token flip, drawn and inert */
function Flip() {
  return (
    <svg className="swflip" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 16 4 4 4-4" /><path d="M7 20V4" />
      <path d="m21 8-4-4-4 4" /><path d="M17 4v16" />
    </svg>
  );
}

/** lucide `circle-help` (ISC) — the app hangs one off the rows that need a word */
function Help() {
  return (
    <svg className="swqh" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  );
}

/** lucide `sliders-horizontal` (ISC) — the tolerance pill is a control, and says so */
function Sliders() {
  return (
    <svg className="swsl" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 5H3" /><path d="M21 5h-7" /><circle cx="12" cy="5" r="2" />
      <path d="M6 12H3" /><path d="M21 12h-11" /><circle cx="8" cy="12" r="2" />
      <path d="M14 19H3" /><path d="M21 19h-3" /><circle cx="16" cy="19" r="2" />
    </svg>
  );
}

export function Phone({ d }: { d: Deck }) {
  return (
    <div className="pdev app swp" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <Chrome />
      <div className="pdview">
        <Heading />
        <Swap d={d} />
      </div>
      <Tabs on="Swap" />
      <Picker d={d} />
      <Review d={d} />
    </div>
  );
}

/* ---- the chrome -------------------------------------------------------- */

/**
 * THIS SCREEN HAS NO BACK ARROW, and that is the whole shape of it.
 *
 * It was drawn as a pushed page — arrow, centred title, an action on the right
 * — and it is not one. Swap is a TAB: it is reached from the bar at the bottom,
 * it is where you already are, and there is nothing behind it to go back to.
 * So the title drops out of the bar and becomes a heading on the page, the way
 * every other rooted screen in this app writes its name.
 *
 * What is in the corner is the confidential lock, and it is the only control
 * up there. The reference also carries a blue notification badge beside it;
 * that is a count of something this demo does not have and would be inventing.
 */
function Chrome() {
  return (
    <div className="swtop">
      <span className="swlock" aria-hidden="true">
        {/* lucide `lock-keyhole` with a tick — the app draws it green, which on
            a screen whose whole argument is confidentiality is not decoration */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
             strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="10.5" width="17" height="11" rx="2.6" />
          <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
          <path d="m9.6 16.1 1.8 1.8 3.4-3.4" />
        </svg>
      </span>
    </div>
  );
}

/** the page's own name, where a rooted screen puts it */
function Heading() {
  return (
    <div className="swhead">
      <b>Swap</b>
      {/* lucide `circle-help` (ISC) — the app puts one beside the heading */}
      <svg className="swhelp" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
      </svg>
    </div>
  );
}

/* ---- the form ---------------------------------------------------------- */

function Swap({ d }: { d: Deck }) {
  const { s } = d;
  const c = cta(s);
  const from = CATALOGUE.find((a) => a.sym === s.from)!;
  const to = s.to ? CATALOGUE.find((a) => a.sym === s.to)! : null;
  const open = d.can('picker');

  /* THE SETTLEMENT IS ITS OWN SCREEN, and it used to be a checklist bolted
     under the form. The app clears the fields away the moment the trade is in
     flight: what is on screen is the trade, and a form you can no longer edit
     is furniture around it. Same frame settling and settled — only the ticks
     and the button underneath change. */
  if (s.submitting || s.done) return <Settle d={d} from={from} to={to} />;

  return (
    <div className="swform">
      {/* ---- the source, already chosen ---- */}
      {/* NO "You pay" / "You receive" LABELS. The app does not write them: the
          field on top is what leaves, the field under the arrow is what
          arrives, and the arrow between them is the sentence. Two labels
          explaining an arrow is a form apologising for itself. */}
      <div className="swfield">
        <div className="swrow">
          {/* NO FOCUS RING HERE, AND THAT IS THE DIFFERENCE BETWEEN THE TWO
              KINDS OF FIELD. `/demo/perps-v5`'s amount is a bordered input, so
              being in it brightens the border — `.bfin.on`, eased at `--dur`.
              This one is a bare figure on a card, and the app marks it with the
              caret alone. The class was here and the stylesheet never drew it,
              which is a focus state that exists only in the JSX. */}
          <span className="swfin" style={fit(s.amount || '0')}
                data-tap={s.focus === 'amount' ? 'field' : undefined}>
            <b>{s.amount || '0'}</b>
            {s.focus === 'amount' ? <i className="bcaret" /> : null}
          </span>
          {/* THE TOKEN IS NOT A PICKER HERE. The reader chose it on the home
              screen by tapping the asset, which is the whole reason this form
              opens half-filled; offering to change it would be offering to
              undo the gesture that got them here.

              `given`, and it was `fixed` for one commit. `.fixed` is a TAILWIND
              UTILITY — `position: fixed` — so the chip left the flow and landed
              on top of the amount it was supposed to sit beside. The ported
              stylesheets outrank Tailwind because they are imported unlayered,
              but only where they SET the property, and nothing here set
              `position`. A modifier named after a utility is a rule you did not
              write and cannot see. */}
          {/* A TINTED PILL IN THE TOKEN'S OWN COLOUR, which is what the app
              draws — the chip is how you know at a glance which way round the
              pair is, and two identical grey pills make you read to find out.
              The chevron is drawn and inert: the reader chose this by tapping
              an asset a screen ago, and offering to undo that gesture is not
              what this cut is about. */}
          <span className="swtok given" style={tint(from.color)}>
            <Dot a={from} size={26} /><b>{from.sym}</b><Cv />
          </span>
        </div>
        {/* THE SUB-ROW IS TWO DIFFERENT FACTS, and it used to be one fact twice.
            On the left, what the amount is worth — IN WHOLE DOLLARS, which is
            what the app prints: cents on a figure that is already a converted
            approximation are two digits of false precision. Beside it the
            fiat/token flip, drawn and inert, because it is the control that
            explains why that side is a dollar figure at all.

            ON THE RIGHT, THE BALANCE — AND IT IS THE ONE CONTROL IN THIS ROW
            THAT DOES SOMETHING. Tapping it puts the whole position in the field,
            which is how `6635.616976` gets there: it is this figure, to the same
            six decimals, and nobody arrives at their own balance by typing. */}
        <span className="swsub">
          {/* IT TRAVELS, like every derived figure on `/demo/perps-v5`. The
              balance tap fills the field and four numbers answer in the same
              frame; without the trip the eye cannot tell which of them moved
              because of it. 780ms is that cut's duration for a derived
              estimate. */}
          <i><Count value={usd(s)} dp={0} prefix="$" ms={780} /><Flip /></i>
          <em className={'swmax' + live(d.can('max'))} {...press(d.can('max'))} data-tap="max">
            {qty(FROM_BAL)} {from.sym}
          </em>
        </span>
      </div>

      {/* the swap arrow, which is chrome rather than a control on this cut */}
      <span className="swarrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
        </svg>
      </span>

      {/* ---- the destination, empty and waiting ---- */}
      <div className="swfield">
        <div className="swrow">
          {/* NO THOUSANDS SEPARATOR in the amount fields. The app writes
              `3535.799`, and it is right to: this is the contents of an input,
              which is a thing you could have typed, and nobody types a comma. */}
          <span className="swfin quiet" style={fit(fieldOut(s))}>
            {to && usd(s) > 0
              ? <Count value={out(s)} dp={3} group={false} trim trunc />
              : <b className="off">0</b>}
          </span>
          <span className={'swtok' + (to ? ' picked' : ' empty') + live(open)}
                style={to ? tint(to.color) : undefined} {...press(open)} data-tap="to">
            {to ? <><Dot a={to} size={26} /><b>{to.sym}</b></> : <b>Select token</b>}
            <Cv />
          </span>
        </div>
        {/* and the same two facts here — the value, and the balance. The right
            side used to repeat the output amount that is already six times the
            size directly above it; what belongs there is `0 NEAR`, the app
            saying you do not hold any yet, which is the reason for the screen. */}
        <span className="swsub">
          {/* AND IT IS THE SMALLER FIGURE. `$6,636` goes in and `$6,612` comes
              out, because the trade fills at the quote and the dollars are read
              at spot — see `QUOTE` in state.ts. The two used to be the same
              number twice, which is a swap screen with no spread in it. */}
          <i><Count value={outUsd(s)} dp={0} prefix="$" ms={780} /></i>
          <em>{to ? `${qty(balOf(to.sym))} ${to.sym}` : '—'}</em>
        </span>
      </div>

      {/* ---- and then the button, which is the next thing under the pair ----

          THE ORDER WAS WRONG, and it is the whole shape of this screen.

          The quote used to sit between the fields and a button pinned to the
          floor, so the terms were an obstacle you read on the way to acting and
          the button was somewhere else entirely. The app puts `Review trade`
          DIRECTLY UNDER THE SECOND FIELD — you have said what you want, here is
          the way to do it — and hangs the terms UNDERNEATH, where they are
          available to anyone who wants them and in nobody's way.

          Nothing is pinned to the floor any more. On a form this short a button
          at the bottom of the frame is a button belonging to the screen rather
          than to the pair above it. */}
      <span className={'bcta' + (c.ok ? '' : ' off') + live(d.can('confirm'))}
            {...press(d.can('confirm'))} data-tap="confirm">{c.label}</span>

      {/* ---- what the quote actually says, under it ----

          IT IS NOT A CARD. The app writes these as three plain rows on the page
          — no fill, no hairline — because a boxed panel reads as a second thing
          on the screen, and this is a footnote to the thing above it.

          `Exchange rate` IS QUOTED THE OTHER WAY ROUND: one of what you are
          buying, in units of what you are spending. `1 NEAR = 1.87 USDT` is a
          price a reader can hold; `1 USDT = 0.53 NEAR` is the same fact stated
          so that nobody can.

          `Network — Best route, auto` is gone. It was a row this cut had no
          frame for, and the frame's third row is `Max slippage`, which is a
          control rather than a caption.

 */}
      {to ? (
        <Enter k={`q${s.to}`} className="swquote">
          <div>
            <dt>Exchange rate</dt>
            <dd>1 {to.sym} = {rateStr(invRate(s))} {s.from}</dd>
          </div>
          <div>
            <dt>Max slippage <Help /></dt>
            <dd><i className="swslip">{fmt(SLIPPAGE * 100, 2)}% <Sliders /></i></dd>
          </div>
          <div>
            <dt>Receive at least <Help /></dt>
            {/* the terms sit inside `Enter`, keyed on the destination — so a
                new token REMOUNTS this and the figure prints rather than
                travelling from the old token's quantity to the new one's,
                which would be a trip between two different units */}
            <dd><Count value={least(s)} dp={6} group={false} trim ms={780} /> {to.sym}</dd>
          </div>
        </Enter>
      ) : null}
    </div>
  );
}

/* ---- the settlement, which is a screen and not a footer ---------------- */

/**
 * WHAT IS ON SCREEN WHILE THE TRADE GOES THROUGH, AND AFTER.
 *
 * ONE FRAME FOR BOTH. The app does not draw a settling state and then a
 * different success state — it draws the trade, ticks the three rows as they
 * land, and puts a button underneath when there is nothing left to tick. The
 * old version had a checklist bolted under the form and then swapped the whole
 * screen for a green disc and the words "Swap complete", which is two screens
 * doing the job of one and neither of them the app's.
 *
 * FOUR DECIMALS AND NO SEPARATOR, which is a third format for the same two
 * figures and all three are the frames'. The field upstairs is an input
 * (`3535.799`, three, cut). The review sheet is a statement being authorised
 * (`3,535.79972`, five, grouped). This is a receipt (`3535.7997`, four, plain)
 * — and it is cut rather than rounded like the rest of them, or 6635.616976
 * would read as 6635.6170.
 */
function Settle({ d, from, to }: { d: Deck; from: Asset; to: Asset | null }) {
  const { s } = d;
  const again = d.can('again');
  if (!to) return null;

  return (
    <Enter k={`s${d.pass}`} className="swset">
      <div className="swsetcard">
        <Leg a={from} amount={cut(Number(s.amount) || 0, 4)} usd={usd(s)} />
        <Arrow />
        <Leg a={to} amount={cut(out(s), 4)} usd={outUsd(s)} />
        <div className="swsetchk"><ProgressList steps={SWAP_STEPS} at={s.step} /></div>
      </div>

      {/* THE BUTTON ONLY EXISTS WHEN THERE IS SOMETHING TO PRESS. While the
          rows are still ticking there is nothing to do, and a disabled pill
          holding the space is a control telling you to wait — the checklist
          already says that, better. */}
      {s.done ? (
        <span className={'bcta swagain' + live(again)} {...press(again)} data-tap="again">
          {/* lucide `undo-2` (ISC) */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
          Swap again
        </span>
      ) : null}
    </Enter>
  );
}

/* ---- the review sheet --------------------------------------------------- */

/**
 * WHAT `REVIEW TRADE` OPENS, AND FOR A WHILE IT OPENED NOTHING.
 *
 * The button reviewed nothing and settled immediately, which on a screen about
 * to move six and a half thousand dollars is the one shortcut it cannot take.
 * The sheet is where the trade is stated at FULL PRECISION — the form rounds
 * `3535.799` into an input box and this says `3,535.79972`, which is the same
 * figure with the four digits the form had no room for.
 *
 * THE FIGURES ARE GROUPED HERE AND NOT IN THE FORM, and that is the app being
 * right twice. Upstairs they are the contents of an input — a thing you could
 * have typed, and nobody types a comma. Down here they are a statement of a
 * fact, and a seven-figure fact wants its separator.
 */
function Review({ d }: { d: Deck }) {
  const { s } = d;
  const to = s.to ? CATALOGUE.find((a) => a.sym === s.to)! : null;
  const from = CATALOGUE.find((a) => a.sym === s.from)!;
  const close = d.can('closeReview');
  const go = d.can('swap');
  if (!to) return null;

  return (
    <Layer open={s.review} onScrim={close}>
      <div className="dsheet swrev">
        <div className="swrevh">
          <b>Review trade</b>
          <span className={'swrevx' + live(close)} {...press(close)} data-tap="closeReview">
            {/* lucide `x` (ISC) */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </span>
        </div>

        <Leg a={from} amount={fmt(Number(s.amount) || 0, 5)} usd={usd(s)} />
        {/* the same arrow the form draws, without the notch — there are no two
            boxes to join down here, only an order to read the rows in */}
        <Arrow />
        <Leg a={to} amount={fmt(out(s), 5)} usd={outUsd(s)} />

        {/* the same three terms as the form, above a rule rather than under a
            button — and `Max slippage` loses its pill, because down here it is
            a figure being stated and not a control being offered */}
        <div className="swrevd">
          <div>
            <dt>Exchange rate</dt>
            <dd>1 {to.sym} = {rateStr(quoteOf(s))} {s.from}</dd>
          </div>
          <div><dt>Max slippage</dt><dd>{fmt(SLIPPAGE * 100, 2)}%</dd></div>
          <div><dt>Receive at least</dt><dd>{qty(least(s))} {to.sym}</dd></div>
        </div>

        <span className={'bcta' + live(go)} {...press(go)} data-tap="swap">Swap</span>
      </div>
    </Layer>
  );
}

/** the down arrow both the sheet and the settlement draw between their legs */
function Arrow() {
  return (
    <span className="swrevar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
      </svg>
    </span>
  );
}

/** one side of the trade: the mark, the amount, the dollars to none */
function Leg({ a, amount, usd: v }: { a: Asset; amount: string; usd: number }) {
  return (
    <div className="swrevleg">
      <Dot a={a} size={54} />
      <span className="swrevt">
        <b>{amount} {a.sym}</b>
        <i>${fmt(v, 0)}</i>
      </span>
    </div>
  );
}

/* ---- the picker, and the only new idea on this screen ------------------- */

/**
 * THE LIST HAS TO FEEL LONG, which is a different job from being long.
 *
 * `s.at` is an index into `PICK_ROWS` and the track is translated by the
 * cumulative height above it, with a CSS transition doing the travel. Three
 * stops rather than one glide — a single continuous move reads as one fact, and
 * what a reader should come away with is that there was more every time they
 * looked.
 *
 * THE OFFSET IS COMPUTED, NOT MEASURED. Section headers and the tab row are
 * different heights from the rows, so an index times one row height stopped
 * being true the moment the picker got sections; `pickOffset` sums the actual
 * heights, and `PICK_H` is the one place they are written down.
 *
 * The scrollbar is drawn rather than native. A native one would be the browser
 * disagreeing with the phone about what a scrollbar looks like, on a screen
 * whose whole claim is that it is a copy of an app.
 */
function Picker({ d }: { d: Deck }) {
  const { s } = d;
  const y = pickOffset(s.at);
  const frac = Math.min(1, y / Math.max(1, PICK_TOTAL - 320));

  return (
    <Layer open={s.picker} onScrim={d.can('closePicker')}>
      <div className="dsheet swpick">
        <span className="dgrab" />
        <b className="swpickh">Select token</b>

        {/* the app's search field. It is drawn and not wired: nothing in this
            cut types into it, and a caret blinking in a box nobody uses reads
            as a control that is broken rather than one that is there. */}
        <div className="swsearch" aria-hidden="true">
          {/* lucide `search` (ISC) */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <em>Search tokens</em>
        </div>

        <div className="swlistwrap">
          <div className="swlist" style={{ transform: `translateY(${-y}px)` }}>
            {PICK_ROWS.map((r, i) => <PickRowView r={r} d={d} key={i} />)}
          </div>
          {/* the rail, drawn — see the note above */}
          <span className="swrail" aria-hidden="true">
            <i style={{ top: `${frac * 100}%`, translate: `0 -${frac * 100}%` }} />
          </span>
        </div>
      </div>
    </Layer>
  );
}

function PickRowView({ r, d }: { r: PickRow; d: Deck }) {
  if (r.kind === 'head') return <span className="swsec">{r.text}</span>;

  /* All / RWA, and the Beta badge is the app's own. RWA is where a tokenised
     share would live; the recording never opens it, so neither does this. */
  if (r.kind === 'tabs') {
    return (
      <span className="swcat">
        <i className="on">All</i>
        <i>RWA<b className="swbeta">Beta</b></i>
      </span>
    );
  }

  if (r.kind === 'own') {
    const pick = d.can('pick', r.h.sym);
    return (
      <span className={'switem own' + live(pick)} {...press(pick)} data-tap={'pick:' + r.h.sym}>
        <Chip a={r.h} chain={r.h.chain} />
        <span className="switemt"><b>{r.h.sym}</b><em>{r.h.name}</em></span>
        {/* the figure and the quantity, which is the whole reason this section
            is separate: these are holdings, not entries in a catalogue */}
        <span className="switemv">
          <b>${fmt(value(r.h), 2)}</b><i>{fmt(r.h.qty, 4)}</i>
        </span>
      </span>
    );
  }

  const pick = d.can('pick', r.a.sym);
  return (
    <span className={'switem' + live(pick)} {...press(pick)} data-tap={'pick:' + r.a.sym}>
      <Chip a={r.a} />
      <span className="switemt"><b>{r.a.sym}</b><em>{r.a.name}</em></span>
    </span>
  );
}

/**
 * A token disc with an optional NETWORK BADGE on its corner.
 *
 * The wallet holds USD Coin twice, and on a list showing symbol and name the
 * two rows are identical — the badge is the only thing on screen that says one
 * is on Solana and the other on Ethereum, which is why the app draws it and why
 * two rows that look like a duplicate are not one.
 */
function Chip({ a, chain }: { a: { sym: string; color: string; ink: string }; chain?: string }) {
  return (
    <span className="swchip">
      <Dot a={a} size={34} />
      {chain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="swnet" src={`/logos/tokens/${chain}.svg`} alt="" width={15} height={15} />
      ) : null}
    </span>
  );
}
