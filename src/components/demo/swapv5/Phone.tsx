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
  FROM_BAL, PICK_ROWS, PICK_TOTAL, SWAP_STEPS, cta, least, out, pickOffset, rate, usd,
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

/** lucide `chevron-down` (ISC) — every token pill carries one */
function Cv() {
  return (
    <svg className="bcv" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
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

  if (s.done) return <Done d={d} to={to} />;

  return (
    <div className="swform">
      {/* ---- the source, already chosen ---- */}
      {/* NO "You pay" / "You receive" LABELS. The app does not write them: the
          field on top is what leaves, the field under the arrow is what
          arrives, and the arrow between them is the sentence. Two labels
          explaining an arrow is a form apologising for itself. */}
      <div className="swfield">
        <div className="swrow">
          <span className={'swfin' + (s.focus === 'amount' ? ' on' : '')}
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
        <span className="swsub">
          <i>{usd(s) > 0 ? '$' + fmt(usd(s), 2) : '$0.00'}</i>
          <em>{fmt(FROM_BAL, 6)} {from.sym}</em>
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
          <span className="swfin quiet">
            {to && usd(s) > 0 ? <Count value={out(s)} dp={4} /> : <b className="off">0</b>}
          </span>
          <span className={'swtok' + (to ? ' picked' : ' empty') + live(open)}
                style={to ? tint(to.color) : undefined} {...press(open)} data-tap="to">
            {to ? <><Dot a={to} size={26} /><b>{to.sym}</b></> : <b>Select token</b>}
            <Cv />
          </span>
        </div>
        <span className="swsub">
          <i>{to && usd(s) > 0 ? '$' + fmt(usd(s), 2) : '$0.00'}</i>
          <em>{to ? `${usd(s) > 0 ? fmt(out(s), 4) : '0'} ${to.sym}` : '—'}</em>
        </span>
      </div>

      {/* ---- what the quote actually says ---- */}
      {to && usd(s) > 0 ? (
        <Enter k={`q${s.to}`} className="swquote">
          <div><dt>Rate</dt><dd>1 {s.from} = {fmt(rate(s), 2)} {to.sym}</dd></div>
          <div><dt>Least you receive</dt><dd>{fmt(least(s), 4)} {to.sym}</dd></div>
          <div><dt>Network</dt><dd>Best route, auto</dd></div>
        </Enter>
      ) : null}

      {s.submitting ? (
        <>
          <span className="bcta off"><i className="bspin" /></span>
          <div className="bochk"><ProgressList steps={SWAP_STEPS} at={s.step} /></div>
        </>
      ) : (
        <span className={'bcta' + (c.ok ? '' : ' off') + live(d.can('confirm'))}
              {...press(d.can('confirm'))} data-tap="confirm">{c.label}</span>
      )}
    </div>
  );
}

/* ---- the success state -------------------------------------------------- */

function Done({ d, to }: { d: Deck; to: Asset | null }) {
  const { s } = d;
  if (!to) return null;
  return (
    <Enter k={`d${d.pass}`} className="swdone">
      <span className="swtick" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
             strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      <b className="swdoneh">Swap complete</b>
      <span className="swdonev">{fmt(out(s), 4)} {to.sym}</span>
      <i className="swdonep">for {s.amount} {s.from}</i>

      <dl className="swdoned">
        <div><dt>Rate</dt><dd>1 {s.from} = {fmt(rate(s), 2)} {to.sym}</dd></div>
        <div><dt>Value</dt><dd>${fmt(usd(s), 2)}</dd></div>
      </dl>
    </Enter>
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
